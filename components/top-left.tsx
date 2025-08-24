import { currentUser } from '@/lib/auth';
import { database } from '@/lib/database';
import { projects } from '@/schema';
import { eq } from 'drizzle-orm';
import { ProjectSelector } from './project-selector';
import { ProjectSettings } from './project-settings';
import { isDev } from '@/lib/isDev';

type TopLeftProps = {
  id: string;
};

export const TopLeft = async ({ id }: TopLeftProps) => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  // Dev mode: return mock project selector
  if (isDev || process.env.NODE_ENV === 'development') {
    const mockProjects = [
      {
        id: 'dev-project-123',
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
      }
    ];

    const currentProject = mockProjects.find((project) => project.id === id);

    if (!currentProject) {
      return null;
    }

    return (
      <div className="absolute top-16 right-0 left-0 z-[50] m-4 flex items-center gap-2 sm:top-0 sm:right-auto">
        <div className="flex flex-1 items-center rounded-full border bg-card/90 p-1 drop-shadow-xs backdrop-blur-sm">
          <ProjectSelector
            projects={mockProjects}
            currentProject={currentProject.id}
          />
        </div>
        <div className="flex shrink-0 items-center rounded-full border bg-card/90 p-1 drop-shadow-xs backdrop-blur-sm">
          <ProjectSettings data={currentProject} />
        </div>
      </div>
    );
  }

  if (!database) {
    return null;
  }

  const allProjects = await database.query.projects.findMany({
    where: eq(projects.userId, user.id),
  });

  if (!allProjects.length) {
    return null;
  }

  const currentProject = allProjects.find((project) => project.id === id);

  if (!currentProject) {
    return null;
  }

  return (
    <div className="absolute top-16 right-0 left-0 z-[50] m-4 flex items-center gap-2 sm:top-0 sm:right-auto">
      <div className="flex flex-1 items-center rounded-full border bg-card/90 p-1 drop-shadow-xs backdrop-blur-sm">
        <ProjectSelector
          projects={allProjects}
          currentProject={currentProject.id}
        />
      </div>
      <div className="flex shrink-0 items-center rounded-full border bg-card/90 p-1 drop-shadow-xs backdrop-blur-sm">
        <ProjectSettings data={currentProject} />
      </div>
    </div>
  );
};
