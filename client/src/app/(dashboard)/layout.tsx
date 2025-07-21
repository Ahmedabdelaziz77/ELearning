"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Loading from "@/components/Loading";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [courseId, setCourseId] = useState<string | null>(null);
  const { user, isLoaded } = useUser();
  if (!isLoaded) return <Loading />;
  if (!user) return <div>Please signin to access this page</div>;
  return (
    <SidebarProvider>
      <div className="dashboard">
        <AppSidebar />
        <div className="dashboard__content">
          <div className={cn("dashboard__main", "h-screen")}>
            <Navbar isCoursePage={false} />
            <main className="dashboard__body">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
