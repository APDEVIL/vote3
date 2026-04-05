import { VoterSidebar } from "@/components/layout/vote-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function VoterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <VoterSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}