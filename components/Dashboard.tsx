"use client";

import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";

interface DashboardProps {
  credits?: number;
  avatarUrl?: string | null;
  userName?: string | null;
}

export default function Dashboard({ credits = 0, avatarUrl, userName }: DashboardProps) {
  return (
    <div className="flex h-screen flex-col bg-white">
      <Header credits={credits} avatarUrl={avatarUrl} userName={userName} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {/* Área principal - contenido va aquí */}
        </main>
      </div>
    </div>
  );
}
