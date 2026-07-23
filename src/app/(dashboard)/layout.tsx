import { Navigation } from './_components/Navigation';
import { MonthProvider } from '@/shared/context/MonthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MonthProvider>
      <div className="flex flex-col min-h-screen bg-transparent">
        <Navigation />
        
        {/* 
          El Navbar ocupa la parte superior. 
          En mobile, damos padding bottom (pb-20) para el Bottom Nav. 
        */}
        <main className="flex-1 pb-20 md:pb-0 relative min-w-0">
          <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </MonthProvider>
  );
}
