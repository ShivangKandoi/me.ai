'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Type, Calculator, GitGraph, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const MathComponent = dynamic(() => import('mathjax-react').then(mod => mod.MathComponent), {
  loading: () => <div className="loading loading-spinner loading-md"></div>,
  ssr: false
});

const ReactFlow = dynamic(() => import('reactflow'), {
  loading: () => <div className="loading loading-spinner loading-md"></div>,
  ssr: false
});

type BlockType = 'text' | 'math' | 'table' | 'flowchart';

interface Block {
  id: string;
  type: BlockType;
  content: any;
}

interface PageEditorProps {
  initialBlocks?: Block[];
  onSave?: (blocks: Block[]) => void;
}

export const PageEditor = ({ initialBlocks = [], onSave }: PageEditorProps) => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [title, setTitle] = useState('Untitled');

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: '',
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id ? { ...block, content } : block
      )
    );
  };

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case 'text':
        return (
          <Textarea
            className="min-h-[100px] w-full"
            value={block.content}
            onChange={(e) => updateBlock(block.id, e.target.value)}
            placeholder="Type something..."
          />
        );
      case 'math':
        return (
          <div className="space-y-4">
            <Textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              placeholder="Enter LaTeX..."
            />
            {block.content && (
              <Card>
                <CardContent className="p-4">
                  <MathComponent tex={block.content} />
                </CardContent>
              </Card>
            )}
          </div>
        );
      case 'flowchart':
        return (
          <Card className="h-[400px]">
            <CardContent className="p-0">
              <ReactFlow
                nodes={block.content.nodes || []}
                edges={block.content.edges || []}
                onNodesChange={(changes) =>
                  updateBlock(block.id, {
                    ...block.content,
                    nodes: changes,
                  })
                }
                onEdgesChange={(changes) =>
                  updateBlock(block.id, {
                    ...block.content,
                    edges: changes,
                  })
                }
              />
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-4xl font-bold w-full mb-8 bg-transparent border-none focus:border-none"
        placeholder="Untitled"
      />

      <div className="space-y-4">
        {blocks.map((block) => (
          <Card key={block.id}>
            <CardContent className="p-4">
              {renderBlock(block)}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-20 right-4 flex flex-col gap-2">
        <Button
          onClick={() => addBlock('text')}
          variant="outline"
          size="icon"
          className="rounded-full"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => addBlock('math')}
          variant="outline"
          size="icon"
          className="rounded-full"
        >
          <Calculator className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => addBlock('flowchart')}
          variant="outline"
          size="icon"
          className="rounded-full"
        >
          <GitGraph className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}; 