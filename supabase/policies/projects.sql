-- Enable RLS on projects table
alter table projects enable row level security;

-- Read policy: Users can only select their own projects
create policy "read-own-projects"
on projects for select
to authenticated
using (
  user_id = auth.uid()
  -- OR EXISTS (
  --   select 1 from project_members m
  --   where m.project_id = projects.id and m.user_id = auth.uid()
  -- )
);

-- Write policy: Users can only insert, update, delete their own projects
create policy "write-own-projects"
on projects for insert, update, delete
to authenticated
with check (user_id = auth.uid());

-- Note: This assumes the projects table has a user_id column
-- that references the authenticated user's ID (auth.uid())
-- 
-- For future collaboration features, you might want to add:
-- - project_members table for shared projects
-- - Additional policies for project sharing
-- - Policies for public/private project visibility
