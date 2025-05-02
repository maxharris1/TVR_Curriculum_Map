
import React from 'react';
import Dashboard from '@/components/Dashboard';
import Header from '@/components/Header';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto py-6 px-4">
        <Dashboard />
      </main>
      
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Transfr Data Explorer. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
