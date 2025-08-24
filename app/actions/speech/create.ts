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
import { experimental_generateSpeech as generateSpeech } from 'ai';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

type GenerateSpeechActionProps = {
  text: string;
  modelId: string;
  nodeId: string;
  projectId: string;
  instructions?: string;
  voice?: string;
};

export const generateSpeechAction = async ({
  text,
  nodeId,
  modelId,
  projectId,
  instructions,
  voice,
}: GenerateSpeechActionProps): Promise<
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

    const slug = resolveReplicateSlug(modelId, "minimax/speech-02-turbo");
    
    if (!slug) {
      throw new Error('Invalid model key');
    }

    // Call the Replicate API
    const response = await fetch(`http://localhost:3000/api/audio/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        modelKey: modelId,
        input: { voice },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate audio');
    }

    const result = await response.json();
    
    if (!result.ok) {
      throw new Error(result.error || 'Audio generation failed');
    }

    const audioUrl = result.data.urls[0];

    let downloadUrl: { publicUrl: string };
    
    // In development mode, use the Replicate URL directly
    if (isDev) {
      console.log('[generateSpeechAction] Dev mode: using Replicate URL directly');
      downloadUrl = { publicUrl: audioUrl };
    } else {
      // Download the audio from Replicate and upload to Supabase
      const audioResponse = await fetch(audioUrl);
      const audioBuffer = await audioResponse.arrayBuffer();
      const audioBlob = new Blob([audioBuffer]);

      const userId = 'user' in user ? user.user.id : user.id;
      const blob = await client.storage
        .from('files')
        .upload(`${userId}/${nanoid()}.mp3`, audioBlob, {
          contentType: 'audio/mp3',
        });

      if (blob.error) {
        throw new Error(blob.error.message);
      }

      const { data: downloadUrlData } = client.storage
        .from('files')
        .getPublicUrl(blob.data.path);
      downloadUrl = downloadUrlData;
    }

    // Create the node data
    const newData = {
      updatedAt: new Date().toISOString(),
      generated: {
        url: downloadUrl.publicUrl,
        type: 'audio/mp3',
      },
    };

    // In development mode, skip database operations
    if (isDev) {
      console.log('[generateSpeechAction] Dev mode: skipping database update');
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
