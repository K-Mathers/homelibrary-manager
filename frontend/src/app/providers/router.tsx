import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from '@/widgets/sidebar';
import { CatalogPage } from '@/pages/catalog';
import { ReadingJournalPage } from '@/pages/reading-journal';
import { StatsPage } from '@/pages/stats';

const AppLayout: React.FC = () => {
  return (
    <div className="flex w-full h-full overflow-hidden bg-[#0e0e11] text-[#f2f0eb]">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/catalog" replace />,
      },
      {
        path: 'catalog',
        element: <CatalogPage />,
      },
      {
        path: 'journal',
        element: <ReadingJournalPage />,
      },
      {
        path: 'stats',
        element: <StatsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/catalog" replace />,
      },
    ],
  },
]);

