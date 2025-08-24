'use server';

import { getSubscribedUser } from '@/lib/auth';
import { database } from '@/lib/database';
import { parseError } from '@/lib/error/parse';
import { resolveReplicateSlug } from '@/lib/models/replicate-registry';
import { trackCreditUsage } from '@/lib/stripe';
import { isDev } from '@/lib/isDev';
import { createSupabaseServer } from '@/lib/supabase/server';
import { projects } from '@/schema';
import type { Edge, Node, Viewport } from '@xyflow/react';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

type GenerateVideoActionProps = {
  modelId: string;
  prompt: string;
  images: {
    url: string;
    type: string;
  }[];
  nodeId: string;
  projectId: string;
};

export const generateVideoAction = async ({
  modelId,
  prompt,
  images,
  nodeId,
  projectId,
}: GenerateVideoActionProps): Promise<
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
    const slug = resolveReplicateSlug(modelId, "bytedance/seedance-1-lite");
    
    if (!slug) {
      throw new Error('Invalid model key');
    }

    // Handle image URL for development mode
    let imageUrl = images.at(0)?.url;
    if (isDev && imageUrl && imageUrl.startsWith('http://localhost:3000/')) {
      console.log('[generateVideoAction] Dev mode: converting localhost image to base64');
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        imageUrl = `data:${blob.type};base64,${base64}`;
      } catch (error) {
        console.error('[generateVideoAction] Failed to convert image to base64:', error);
        // If we can't convert the image, skip it
        imageUrl = undefined;
      }
    }

    // Call the Replicate API
    const response = await fetch(`http://localhost:3000/api/video/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        modelKey: modelId,
        input: { 
          image: imageUrl,
          duration: 5,
          aspect_ratio: '16:9'
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate video');
    }

    const result = await response.json();
    
    if (!result.ok) {
      throw new Error(result.error || 'Video generation failed');
    }

    const videoUrl = result.data.urls[0];

    let finalUrl: string;
    
    // In development mode, use the Replicate URL directly
    if (isDev) {
      console.log('[generateVideoAction] Dev mode: using Replicate URL directly');
      finalUrl = videoUrl;
    } else {
      // Download the video from Replicate and upload to Supabase
      const videoResponse = await fetch(videoUrl);
      const arrayBuffer = await videoResponse.arrayBuffer();

      const userId = 'user' in user ? user.user.id : user.id;
      const blob = await client.storage
        .from('files')
        .upload(`${userId}/${nanoid()}.mp4`, arrayBuffer, {
          contentType: 'video/mp4',
        });

      if (blob.error) {
        throw new Error(blob.error.message);
      }

      const { data: supabaseDownloadUrl } = client.storage
        .from('files')
        .getPublicUrl(blob.data.path);

      finalUrl = supabaseDownloadUrl.publicUrl;
    }

    // Create the node data
    const newData = {
      updatedAt: new Date().toISOString(),
      generated: {
        url: finalUrl,
        type: 'video/mp4',
      },
    };

    // In development mode, skip database operations
    if (isDev) {
      console.log('[generateVideoAction] Dev mode: skipping database update');
    } else {
      if (!database) {
        throw new Error('Database not initialized');
      }

      const project = await database.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });

      if (!project) {
        throw new Error('Project not found');
      }

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
