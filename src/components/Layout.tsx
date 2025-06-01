import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  pages: Array<{
    id: string;
    title: string;
    path: string;
  }>;
}

export const Layout = ({ children, pages }: LayoutProps) => {
  return (
    <div className="flex h-screen">
      <Sidebar pages={pages} />
      <main className="flex-1 overflow-auto bg-base-100">
        <div className="container mx-auto p-4">
          {children}
        </div>
      </main>
    </div>
  );
}; 