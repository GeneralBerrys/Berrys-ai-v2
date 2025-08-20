import 'server-only';
import { createProjectAction } from '@/app/actions/project/create';
import { currentUser, currentUserProfile } from '@/lib/auth';
import { database } from '@/lib/database';
import { getRedis } from '@/lib/redis';
import { projects } from '@/schema';
import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Berrys',
  description: 'Create and share AI workflows',
};

export const maxDuration = 300; // 5 minutes (Vercel Hobby plan limit)

async function getProjectsSafe() {
  try {
    const user = await currentUser();

    if (!user) {
      return { redirect: '/sign-in' as const };
    }

    const profile = await currentUserProfile();

    if (!profile?.onboardedAt) {
      return { redirect: '/welcome' as const };
    }

    // Check if database is available
    if (!database) {
      console.error('[projects] Database not initialized');
      return { redirect: '/auth/error?message=Database not available' as const };
    }

    // Initialize Redis client (optional, never throw if missing)
    const redis = getRedis();
    
    // Optional Redis caching and metrics
    if (redis) {
      try {
        // Increment projects page load counter
        await redis.incr(`projects:page_loads:${profile.id}`);
        
        // Set expiry for counter (24 hours)
        await redis.expire(`projects:page_loads:${profile.id}`, 86400);
        
        // Try to get cached project for user
        const cachedProjectId = await redis.get(`user:${profile.id}:last_project`);
        if (cachedProjectId) {
          console.log(`[projects] Found cached project ID: ${cachedProjectId}`);
        }
      } catch (redisError) {
        // Redis operations failed, but continue normally
        console.warn('[projects] Redis operation failed:', redisError);
      }
    }

    // Set a timeout for database operations
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database timeout')), 10000); // 10 second timeout
    });

    const dbOperation = async () => {
      let project = await database!.query.projects.findFirst({
        where: eq(projects.userId, profile.id),
      });

      if (!project) {
        const newProject = await createProjectAction('Untitled Project');

        if ('error' in newProject) {
          throw new Error(newProject.error);
        }

        const newFetchedProject = await database!.query.projects.findFirst({
          where: eq(projects.id, newProject.id),
        });

        if (!newFetchedProject) {
          throw new Error('Failed to create project');
        }

        project = newFetchedProject;
      }

      // Optional Redis caching of the found/created project
      if (redis && project) {
        try {
          // Cache the user's last accessed project
          await redis.set(`user:${profile.id}:last_project`, project.id);
          await redis.expire(`user:${profile.id}:last_project`, 3600); // 1 hour expiry
        } catch (redisError) {
          // Redis caching failed, but continue normally
          console.warn('[projects] Redis caching failed:', redisError);
        }
      }

      return project;
    };

    const project = await Promise.race([dbOperation(), timeoutPromise]);
    return { project };
  } catch (e: any) {
    console.error('[projects] load failed:', {
      message: e?.message,
      code: e?.code,
      stack: e?.stack,
      name: e?.name,
    });
    throw e;
  }
}

const Projects = async () => {
  const result = await getProjectsSafe();
  
  if ('redirect' in result) {
    return redirect(result.redirect as string);
  }
  
  redirect(`/projects/${(result.project as any).id}`);
};

export default Projects;
