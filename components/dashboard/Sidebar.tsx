"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Layers,
  Shirt,
  UserX,
  Image,
  Flag,
  Award,
  Wand2,
  Pencil,
  Sun,
  Package,
  Megaphone,
  X,
  LucideIcon,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
}

interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
  expanded?: boolean;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const initialSections: SidebarSection[] = [
  {
    id: "indumentaria",
    title: "Indumentaria",
    expanded: true,
    items: [
      { id: "prendas-separadas", label: "Prendas separadas", href: "/prendas-separadas", icon: Layers },
      { id: "prenda-unica", label: "Prenda única", href: "/prenda-unica", icon: Shirt },
      { id: "sin-modelo", label: "Sin modelo", href: "/sin-modelo", icon: UserX },
    ],
  },
  {
    id: "contenido",
    title: "Contenido",
    expanded: false,
    items: [
      { id: "thumbnails", label: "Thumbnails", href: "/thumbnails", icon: Image, comingSoon: true },
      { id: "banners", label: "Banners", href: "/banners", icon: Flag, comingSoon: true },
      { id: "logos", label: "Logos", href: "/logos", icon: Award, comingSoon: true },
    ],
  },
  {
    id: "edicion",
    title: "Edición",
    expanded: false,
    items: [
      { id: "efectos", label: "Efectos", href: "/efectos", icon: Wand2, comingSoon: true },
      { id: "edicion-libre", label: "Edición libre", href: "/edicion-libre", icon: Pencil, comingSoon: true },
      { id: "iluminacion", label: "Iluminación", href: "/iluminacion", icon: Sun, comingSoon: true },
    ],
  },
  {
    id: "productos",
    title: "Productos",
    expanded: false,
    items: [
      { id: "mejorar-producto", label: "Mejorar producto", href: "/mejorar-producto", icon: Package, comingSoon: true },
      { id: "crear-anuncio", label: "Crear anuncio", href: "/crear-anuncio", icon: Megaphone, comingSoon: true },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [sections, setSections] = useState<SidebarSection[]>(initialSections);
  const pathname = usePathname();

  const toggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, expanded: !section.expanded }
          : section
      )
    );
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const sidebarContent = (
    <nav className="p-3">
      {sections.map((section) => (
        <div key={section.id} className="mb-4">
          <button
            onClick={() => toggleSection(section.id)}
            className="flex w-full items-center justify-between text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            {section.title}
            {section.expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>

          {section.expanded && (
            <div className="mt-2 space-y-1.5 pl-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;

                if (item.comingSoon) {
                  return (
                    <div
                      key={item.id}
                      className="flex w-full items-center justify-between rounded px-1 py-1.5 text-sm text-gray-300 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-gray-300" />
                        {item.label}
                      </div>
                      <span className="text-[10px] text-gray-300">Próximamente</span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex w-full cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? "text-gray-900" : "text-gray-400"}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-200 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-3">
          <span className="text-xs font-medium text-gray-500">Herramientas</span>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 border-r border-gray-200 bg-white">
        <div className="flex items-center border-b border-gray-200 p-3">
          <span className="text-xs text-gray-500">Herramientas</span>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
