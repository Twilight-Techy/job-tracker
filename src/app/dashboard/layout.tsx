import { ReactNode } from "react";
import { getUserFromReq } from "@/lib/auth-helpers";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getUserFromReq();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      
      <main className="flex-1 overflow-x-hidden p-6 md:p-10 w-full max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
