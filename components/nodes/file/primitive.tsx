import { NodeLayout } from '@/components/nodes/layout';
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/kibo-ui/dropzone';
import { handleError } from '@/lib/error/handle';
import { uploadFile } from '@/lib/upload';
import { isDev } from '@/lib/isDev';
import { useReactFlow } from '@xyflow/react';
import { FileIcon, Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import type { FileNodeProps } from '.';

type FilePrimitiveProps = FileNodeProps & {
  title: string;
};

const FilePreview = ({
  name,
  type,
  url,
}: { name: string; type: string; url: string }) => (
  <div className="flex items-center gap-2 p-2">
    <FileIcon className="size-4" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{name}</p>
      <p className="text-xs text-muted-foreground">{type}</p>
    </div>
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-primary hover:underline"
    >
      View
    </a>
  </div>
);

export const FilePrimitive = ({
  data,
  id,
  type,
  title,
}: FilePrimitiveProps) => {
  const { updateNodeData } = useReactFlow();
  const [files, setFiles] = useState<File[] | undefined>();
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = async (files: File[]) => {
    if (isUploading) {
      return;
    }

    try {
      if (!files.length) {
        throw new Error('No file selected');
      }

      setIsUploading(true);
      setFiles(files);
      const [file] = files;

      const { url, type } = await uploadFile(file, 'files');

      updateNodeData(id, {
        content: {
          url,
          name: file.name,
          type,
        },
      });
    } catch (error) {
      handleError('Error uploading file', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <NodeLayout id={id} data={data} type={type} title={title}>
      <div className="p-4">
        {data.content ? (
          <FilePreview {...data.content} />
        ) : (
          <Dropzone
            maxSize={1024 * 1024 * 10}
            minSize={1024}
            maxFiles={1}
            multiple={false}
            onDrop={handleDrop}
            src={files}
            onError={console.error}
            className="rounded-none border-none bg-transparent shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
          >
            <DropzoneEmptyState />
            <DropzoneContent>
              {files && files.length > 0 && (
                <div className="relative">
                  <FilePreview
                    name={files[0].name}
                    type={files[0].type}
                    url={URL.createObjectURL(files[0])}
                  />
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/50">
                    <Loader2Icon className="size-12 animate-spin text-white" />
                  </div>
                </div>
              )}
            </DropzoneContent>
          </Dropzone>
        )}
      </div>
    </NodeLayout>
  );
};
