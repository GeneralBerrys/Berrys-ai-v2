import { Canvas } from '@/components/canvas';
import { type Edge, type Node, ReactFlowProvider } from '@xyflow/react';

const nodes: Node[] = [
  {
    id: 'file-1',
    type: 'file',
    position: { x: 0, y: 0 },
    data: {
      content: {
        url: 'https://example.com/document.pdf',
        type: 'application/pdf',
        name: 'document.pdf',
      },
    },
    origin: [0, 0.5],
  },
  {
    id: 'text-1',
    type: 'text',
    position: { x: 600, y: 100 },
    data: {
      generated: {
        text: "This is a summary of the uploaded document. The file contains important information that has been processed and analyzed by AI.",
        sources: [],
      },
      instructions: 'Summarize the document content.',
    },
    origin: [0, 0.5],
  },
];

const edges: Edge[] = [
  {
    id: 'edge-1',
    source: 'file-1',
    target: 'text-1',
    type: 'animated',
  },
];

export const CodeDemo = () => (
  <ReactFlowProvider>
    <Canvas
      nodes={nodes}
      edges={edges}
      panOnScroll={false}
      zoomOnScroll={false}
      preventScrolling={false}
      fitViewOptions={{
        minZoom: 0,
      }}
    />
  </ReactFlowProvider>
);
