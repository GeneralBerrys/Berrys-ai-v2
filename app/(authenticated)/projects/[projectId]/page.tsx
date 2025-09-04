import { Canvas } from '@/components/canvas';
import { Controls } from '@/components/controls';
import { Reasoning } from '@/components/reasoning';
import { SaveIndicator } from '@/components/save-indicator';
import { Toolbar } from '@/components/toolbar';
import { TopLeft } from '@/components/top-left';
import { TopRight } from '@/components/top-right';
import { currentUserProfile } from '@/lib/auth';
import { database } from '@/lib/database';
import { getRedis } from '@/lib/redis';
import { ProjectProvider } from '@/providers/project';
import { projects } from '@/schema';
import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { isDev } from '@/lib/isDev';

export const metadata: Metadata = {
  title: 'Berrys',
  description: 'Create and share AI workflows',
};

export const maxDuration = 300; // 5 minutes (Vercel Hobby plan limit)

type ProjectProps = {
  params: Promise<{
    projectId: string;
  }>;
};

const Project = async ({ params }: ProjectProps) => {
  const { projectId } = await params;
  
  // Dev mode: return mock project immediately
  if (isDev || process.env.NODE_ENV === 'development') {
    console.log(`[project:${projectId}] Dev mode: returning mock project`);
    const mockProject = {
      id: projectId,
      name: 'Dev Project',
      userId: 'dev-user-123',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      content: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
      transcriptionModel: 'whisper-1',
      visionModel: 'gpt-4o',
      image: null,
      members: [],
      demoProject: false,
      welcomeProject: false,
    };

    return (
      <div className="flex h-screen w-screen items-stretch overflow-hidden">
        <div className="relative flex-1">
          <ProjectProvider data={mockProject}>
            <Canvas>
              <Controls />
              <Toolbar />
              <SaveIndicator />
            </Canvas>
          </ProjectProvider>
          <Suspense fallback={null}>
            <TopLeft id={projectId} />
          </Suspense>
          <Suspense fallback={null}>
            <TopRight id={projectId} />
          </Suspense>
        </div>
        <Reasoning />
      </div>
    );
  }

  const profile = await currentUserProfile();

  if (!profile) {
    return null;
  }

  if (!profile.onboardedAt) {
    return redirect('/welcome');
  }

  if (!database) {
    throw new Error('Database not initialized');
  }

  // Initialize Redis client (optional, never throw if missing)
  const redis = getRedis();
  
  // Optional Redis metrics and caching
  if (redis) {
    try {
      // Track project access
      await redis.incr(`project:${projectId}:views`);
      await redis.expire(`project:${projectId}:views`, 86400); // 24 hours
      
      // Track user's project access
      await redis.incr(`user:${profile.id}:project_views`);
      await redis.expire(`user:${profile.id}:project_views`, 86400); // 24 hours
      
      // Set user's last accessed project
      await redis.set(`user:${profile.id}:last_project`, projectId);
      await redis.expire(`user:${profile.id}:last_project`, 3600); // 1 hour
      
      // Track recent project activity
      const timestamp = Date.now();
      await redis.set(`project:${projectId}:last_accessed`, timestamp.toString());
      await redis.expire(`project:${projectId}:last_accessed`, 604800); // 7 days
    } catch (redisError) {
      // Redis operations failed, but continue normally
      console.warn(`[project:${projectId}] Redis operation failed:`, redisError);
    }
  }

  const project = await database.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="flex h-screen w-screen items-stretch overflow-hidden">
      <div className="relative flex-1">
        <ProjectProvider data={project}>
          <Canvas>
            <Controls />
            <Toolbar />
            <SaveIndicator />
          </Canvas>
        </ProjectProvider>
        <Suspense fallback={null}>
          <TopLeft id={projectId} />
        </Suspense>
        <Suspense fallback={null}>
          <TopRight id={projectId} />
        </Suspense>
      </div>
      <Reasoning />
    </div>
  );
};

export default Project;
