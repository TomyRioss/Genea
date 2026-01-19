"use client";

import Link from "next/link";
import { Crown, History, LogOut, Menu, MessageCircle, Plus, Sparkles, Wallet } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HeaderProps {
  credits?: number;
  avatarUrl?: string | null;
  userName?: string | null;
  hasActiveSubscription?: boolean;
  onLogout?: () => void;
  onMenuClick?: () => void;
}

export default function Header({
  credits = 0,
  avatarUrl,
  userName,
  hasActiveSubscription = false,
  onLogout,
  onMenuClick,
}: HeaderProps) {
  const initials = userName?.charAt(0).toUpperCase() || "U";

  return (
    <header className="flex h-14 md:h-16 items-center justify-between border-b border-gray-200 bg-white px-3 md:px-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="p-2 text-gray-600 hover:text-gray-900 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-xl md:text-2xl font-normal tracking-tight text-gray-900">GENEA</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 md:gap-2 rounded-full bg-gray-200 px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-medium text-gray-900 transition-colors hover:bg-gray-300">
              <Wallet className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">{credits} Créditos</span>
              <span className="sm:hidden">{credits}</span>
              <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-56 p-4">
            <p className="text-sm text-gray-700 mb-3">Recarga más créditos, contactanos</p>
            <button
              onClick={() => window.open("https://wa.me/5491134083140?text=" + encodeURIComponent("Hola, quiero recargar créditos"), "_blank")}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <MessageCircle className="h-4 w-4" />
              Contactanos
            </button>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button className="h-9 w-9 md:h-10 md:w-10 overflow-hidden rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-700 text-sm md:text-base font-medium text-white">
                  {initials}
                </div>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 p-2">
            <div className="flex flex-col">
              <Link
                href="/historial"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <History className="h-4 w-4" />
                Historial
              </Link>
              <Link
                href={hasActiveSubscription ? "/mi-suscripcion" : "/planes"}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {hasActiveSubscription ? (
                  <>
                    <Crown className="h-4 w-4" />
                    Mi suscripción
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Planes
                  </>
                )}
              </Link>
              <button
                onClick={onLogout}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
