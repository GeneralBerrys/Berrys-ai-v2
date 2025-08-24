import { nanoid } from 'nanoid';
import { createClient } from './supabase/client';
import { isDev } from './isDev';

export const uploadFile = async (
  file: File,
  bucket: 'avatars' | 'files' | 'screenshots',
  filename?: string
) => {
  console.log('[uploadFile] Function called with isDev:', isDev);
  console.log('[uploadFile] File:', file.name, file.type);
  
  // In development mode, create an object URL for immediate display
  if (isDev) {
    console.log('[uploadFile] Dev mode: creating object URL');
    const objectUrl = URL.createObjectURL(file);
    console.log('[uploadFile] Created blob URL:', objectUrl);
    return {
      url: objectUrl,
      type: file.type,
    };
  }

  const client = createClient();
  const { data } = await client.auth.getUser();
  const extension = file.name.split('.').pop();

  if (!data?.user) {
    throw new Error('You need to be logged in to upload a file!');
  }

  const name = filename ?? `${nanoid()}.${extension}`;

  const blob = await client.storage
    .from(bucket)
    .upload(`${data.user.id}/${name}`, file, {
      contentType: file.type,
      upsert: bucket === 'screenshots',
    });

  if (blob.error) {
    throw new Error(blob.error.message);
  }

  const { data: downloadUrl } = client.storage
    .from(bucket)
    .getPublicUrl(blob.data.path);

  return {
    url: downloadUrl.publicUrl,
    type: file.type,
  };
};
