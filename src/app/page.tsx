'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { PageEditor } from '@/components/PageEditor';
import { cn } from '@/lib/utils';

export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-base-100">
      <Sidebar 
        className="print:hidden"
        isCollapsed={isCollapsed}
        onCollapsedChange={setIsCollapsed}
      />
      <main className={cn(
        "transition-all duration-300",
        isCollapsed ? "ml-0" : "ml-64"
      )}>
        <PageEditor isCollapsed={isCollapsed} />
      </main>
    </div>
  );
}
