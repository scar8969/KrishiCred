import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopAppBar } from './TopAppBar';
import { BottomNav } from './BottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopAppBar showNavLinks={false} />
      <main className="pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
