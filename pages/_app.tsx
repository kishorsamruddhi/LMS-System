import { useState } from 'react';
import type { AppProps } from 'next/app';
import { AppProvider } from '@/components/providers/app-provider';
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Inter } from "next/font/google";
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AppProvider>
      <div className={inter.className}>
        <div className="flex min-h-screen relative">
          <Sidebar 
            className="w-64" 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          <div className="flex-1 flex flex-col min-h-screen">
            <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className="flex-1 pb-16 md:pb-0 overflow-x-hidden">
              <Component {...pageProps} />
            </main>
          </div>
        </div>
      </div>
    </AppProvider>
  );
}