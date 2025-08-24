'use server';

import { currentUser } from '@/lib/auth';
import { database } from '@/lib/database';
import { parseError } from '@/lib/error/parse';
import { projects } from '@/schema';
import { and, eq } from 'drizzle-orm';
import { isDev } from '@/lib/isDev';

export const updateProjectAction = async (
  projectId: string,
  data: Partial<typeof projects.$inferInsert>
): Promise<
  | {
      success: true;
    }
  | {
      error: string;
    }
> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('You need to be logged in to update a project!');
    }

    // In development mode, skip database operations
    if (isDev) {
      console.log('[updateProjectAction] Dev mode: skipping database update');
      return { success: true };
    }

    if (!database) {
      throw new Error('Database not initialized');
    }

    const project = await database
      .update(projects)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));

    if (!project) {
      throw new Error('Project not found');
    }

    return { success: true };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
