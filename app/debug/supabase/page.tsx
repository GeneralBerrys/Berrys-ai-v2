import { createSupabaseServer } from '@/lib/supabase/server';

export default async function SupabaseDebugPage() {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Debug</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">User</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        {error && (
          <div>
            <h2 className="text-lg font-semibold text-red-600">Error</h2>
            <pre className="bg-red-50 p-4 rounded text-sm text-red-800">
              {error.message}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
