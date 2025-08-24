'use server';

import { getSubscribedUser } from '@/lib/auth';
import { database } from '@/lib/database';
import { parseError } from '@/lib/error/parse';
import { resolveReplicateSlug } from '@/lib/models/replicate-registry';
import { visionModels } from '@/lib/models/vision';
import { isDev } from '@/lib/isDev';
import { trackCreditUsage } from '@/lib/stripe';
import { createSupabaseServer } from '@/lib/supabase/server';
import { projects } from '@/schema';
import type { Edge, Node, Viewport } from '@xyflow/react';
import {
  type Experimental_GenerateImageResult,
  experimental_generateImage as generateImage,
} from 'ai';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import OpenAI from 'openai';

type GenerateImageActionProps = {
  prompt: string;
  nodeId: string;
  projectId: string;
  modelId: string;
  instructions?: string;
  size?: string;
};

const generateGptImage1Image = async ({
  instructions,
  prompt,
  size,
}: {
  instructions?: string;
  prompt: string;
  size?: string;
}) => {
  const openai = new OpenAI();
  const response = await openai.images.generate({
    model: 'gpt-image-1',
    prompt: [
      'Generate an image based on the following instructions and context.',
      '---',
      'Instructions:',
      instructions ?? 'None.',
      '---',
      'Context:',
      prompt,
    ].join('\n'),
    size: size as never | undefined,
    moderation: 'low',
    quality: 'high',
    output_format: 'png',
  });

  const json = response.data?.at(0)?.b64_json;

  if (!json) {
    throw new Error('No response JSON found');
  }

  if (!response.usage) {
    throw new Error('No usage found');
  }

  const image: Experimental_GenerateImageResult['image'] = {
    base64: json,
    uint8Array: Buffer.from(json, 'base64'),
    mimeType: 'image/png',
  };

  return {
    image,
    usage: {
      textInput: response.usage?.input_tokens_details.text_tokens,
      imageInput: response.usage?.input_tokens_details.image_tokens,
      output: response.usage?.output_tokens,
    },
  };
};

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

export const generateImageAction = async ({
  prompt,
  modelId,
  instructions,
  nodeId,
  projectId,
  size,
}: GenerateImageActionProps): Promise<
  | {
      nodeData: object;
    }
  | {
      error: string;
    }
> => {
  try {
    const client = await createSupabaseServer();
    const user = await getSubscribedUser();
    const slug = resolveReplicateSlug(modelId, "black-forest-labs/flux-schnell");
    
    if (!slug) {
      throw new Error('Invalid model key');
    }

    // Call the Replicate API
    const replicateResponse = await fetch(`http://localhost:3000/api/image/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: [
          'Generate an image based on the following instructions and context.',
          '---',
          'Instructions:',
          instructions ?? 'None.',
          '---',
          'Context:',
          prompt,
        ].join('\n'),
        modelKey: modelId,
        options: { size },
      }),
    });

    if (!replicateResponse.ok) {
      throw new Error('Failed to generate image');
    }

    const result = await replicateResponse.json();
    
    if (!result.ok) {
      throw new Error(result.error || 'Image generation failed');
    }

    const imageUrl = result.data.urls[0];

    let url: string;
    
    // In development mode, use the Replicate URL directly
    if (isDev) {
      console.log('[generateImageAction] Dev mode: using Replicate URL directly');
      url = imageUrl;
    } else {
      // Download the image from Replicate and upload to Supabase
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const imageBlob = new Blob([imageBuffer]);
      
      const extension = 'png'; // Replicate typically returns PNG
      const name = `${nanoid()}.${extension}`;

      const userId = 'user' in user ? user.user.id : user.id;
      const blob = await client.storage
        .from('files')
        .upload(`${userId}/${name}`, imageBlob, {
          contentType: 'image/png',
        });

      if (blob.error) {
        throw new Error(blob.error.message);
      }

      const { data: downloadUrl } = client.storage
        .from('files')
        .getPublicUrl(blob.data.path);

      url = downloadUrl.publicUrl;
    }

    let project: any = null;
    
    // In development mode, skip database operations
    if (isDev) {
      console.log('[generateImageAction] Dev mode: skipping database query');
    } else {
      if (!database) {
        throw new Error('Database not initialized');
      }

      project = await database.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });

      if (!project) {
        throw new Error('Project not found');
      }
    }

    let description = 'Generated image';
    
    // In development mode, skip vision model and database operations
    if (isDev) {
      console.log('[generateImageAction] Dev mode: skipping vision model and database operations');
    } else {
      const visionModel = visionModels[project.visionModel];

      if (!visionModel) {
        throw new Error('Vision model not found');
      }

      const openai = new OpenAI();
      const response = await openai.chat.completions.create({
        model: visionModel.providers[0].model.modelId,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe this image.' },
              {
                type: 'image_url',
                image_url: {
                  url,
                },
              },
            ],
          },
        ],
      });

      description = response.choices.at(0)?.message.content || 'Generated image';
    }

    // Create the node data
    const newData = {
      updatedAt: new Date().toISOString(),
      generated: {
        url: url,
        type: 'image/png',
      },
      description,
    };

    // In development mode, skip database operations
    if (isDev) {
      console.log('[generateImageAction] Dev mode: skipping database update');
    } else {
      const content = project.content as {
        nodes: Node[];
        edges: Edge[];
        viewport: Viewport;
      };

      const existingNode = content.nodes.find((n) => n.id === nodeId);

      if (!existingNode) {
        throw new Error('Node not found');
      }

      const updatedNodes = content.nodes.map((existingNode) => {
        if (existingNode.id === nodeId) {
          return {
            ...existingNode,
            data: newData,
          };
        }

        return existingNode;
      });

      if (database) {
        await database
          .update(projects)
          .set({ content: { ...content, nodes: updatedNodes } })
          .where(eq(projects.id, projectId));
      }
    }

    return {
      nodeData: newData,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
