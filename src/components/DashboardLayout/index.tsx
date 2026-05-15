"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Calculator,
  Shuffle,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; 

export default function DashboardLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (pathname.startsWith("/hitung_parameter")) {
      setOpenMenu("hitung");
    } else if (pathname.startsWith("/transformasi")) {
      setOpenMenu("transformasi");
    }
  }, [pathname]);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white">
      {/* HEADER */}
      <div className="flex items-center justify-between h-16 bg-gradient-to-r from-blue-900 to-emerald-500 text-white px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
          <Link className="font-semibold" href="/">
            TransDatum
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm opacity-90">
                Hi, {user.name}
              </span>
              <div className="w-8 h-8 rounded-full bg-white text-blue-700 flex items-center justify-center text-sm font-semibold">
                {user.name[0].toUpperCase()}
              </div>
              <button
                onClick={logout}
                className="ml-2 text-xs bg-white text-blue-900 px-2 py-1 rounded hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="text-sm bg-white text-blue-900 px-3 py-1 rounded"
            >
              Login
            </button>
          )}
        </div>
      </div>
      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        <div className="md:hidden
  fixed
  bottom-6
  left-1/2
  -translate-x-1/2
  z-50">
          <Drawer>
    <DrawerTrigger asChild>

      <button
        className="
        bg-white/90
        backdrop-blur
        shadow-lg
        border
        rounded-full

        px-5 py-2

        flex
        flex-col
        items-center

        active:scale-95
      "
      >
        <ChevronUp
          size={20}
          className="text-gray-600"
        />

        <span className="
        text-[10px]
        text-gray-500
        ">
          Menu
        </span>

      </button>

    </DrawerTrigger>
          <DrawerContent
  className="
  rounded-t-3xl
  max-h-[75vh]
"
>

  <VisuallyHidden>
    <DrawerTitle>
      Menu Dashboard
    </DrawerTitle>
  </VisuallyHidden>

  <div className="p-6">

    {user && (
      <div className="
      p-3
      rounded-xl
      bg-gray-100
      mb-4
      font-semibold
      ">
        Hi, {user.name}
      </div>
    )}

    <Accordion
      type="single"
      collapsible
    >

      <AccordionItem value="hitung">

        <AccordionTrigger>

          <div className="
          flex items-center gap-3
          ">

            <Calculator size={18}/>

            Hitung Parameter

          </div>

        </AccordionTrigger>

        <AccordionContent>

          <div className="
          ml-8
          space-y-3
          ">

            <Link
              href="/hitung_parameter/input"
            >
              <div className="py-2">
                Input
              </div>
            </Link>

            <Link
              href="/hitung_parameter/analysis"
            >
              <div className="py-2">
                Analysis
              </div>
            </Link>

          </div>

        </AccordionContent>

      </AccordionItem>

    </Accordion>


    <Link href="/transformasi">

      <div className="
      flex items-center
      gap-3
      py-4
      border-b
      ">

        <Shuffle size={18}/>

        Transformasi Datum

      </div>

    </Link>


    <Link href="/parameter_saya">

      <div className="
      flex items-center
      gap-3
      py-4
      ">

        <List size={18}/>

        Parameter Saya

      </div>

    </Link>

  </div>

</DrawerContent>
        </Drawer>
</div>
        {/* SIDEBAR */}
        <aside
          className={`hidden md:block bg-gray-200 border-r border-gray-300 text-gray-800 transition-all duration-300 ease-in-out h-full
          ${sidebarOpen ? "w-64" : "w-16"}`}
        >
          {sidebarOpen && (
            <div className="px-4 py-4 border-b border-gray-300 font-semibold text-sm">
              {user ? user.name : "Guest"}
            </div>
          )}

          <div className="flex items-center justify-end p-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded hover:bg-gradient-to-r hover:from-blue-100 hover:to-emerald-100 transition"
            >
              {sidebarOpen ? (
                <ChevronLeft size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </button>
          </div>

          <nav className="px-2 space-y-1">
            <div>
              <MenuItem
                icon={<Calculator size={18} />}
                label="Hitung Parameter"
                sidebarOpen={sidebarOpen}
                isOpen={openMenu === "hitung"}
                onClick={() => toggleMenu("hitung")}
                hasSub
              />

              {sidebarOpen && openMenu === "hitung" && (
                <div className="ml-6 text-sm space-y-1">
                  <SubItem label="Input" href="/hitung_parameter/input" />
                  <SubItem label="Analysis" href="/hitung_parameter/analysis" />
                </div>
              )}
            </div>

            <NavItem
              icon={<Shuffle size={18} />}
              label="Transformasi Datum"
              href="/transformasi"
              sidebarOpen={sidebarOpen}
            />
            <NavItem
              icon={<List size={18} />}
              label="Parameter Saya"
              href="/parameter_saya"
              sidebarOpen={sidebarOpen}
            />
          </nav>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 p-6 pb-28 md:pb-6 bg-white overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

/* MAIN MENU */
function MenuItem({
  icon,
  label,
  sidebarOpen,
  isOpen,
  onClick,
  hasSub,
}: {
  icon: React.ReactNode;
  label: string;
  sidebarOpen: boolean;
  isOpen?: boolean;
  onClick?: () => void;
  hasSub?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-3 py-2 rounded-lg transition cursor-pointer hover:bg-gradient-to-r hover:from-blue-400 hover:to-emerald-200"
    >
      <div className="flex items-center gap-3">
        <div className="text-gray-900">{icon}</div>
        {sidebarOpen && (
          <span className="text-sm font-medium">{label}</span>
        )}
      </div>

      {sidebarOpen && hasSub && (
        <div className="text-gray-900">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      )}
    </div>
  );
}

/* SUB MENU */
function SubItem({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <div
        className={`px-3 py-2 rounded-lg cursor-pointer transition ${
          isActive
            ? "bg-gradient-to-r from-blue-700 to-emerald-300 text-white border-l-4 border-emerald-500"
            : "text-gray-900 hover:bg-gradient-to-r hover:from-blue-400 hover:to-emerald-200"
        }`}
      >
        {label}
      </div>
    </Link>
  );
}

/* MENU TANPA SUB */
function NavItem({
  icon,
  label,
  href,
  sidebarOpen,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  sidebarOpen: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
          isActive
            ? "bg-gradient-to-r from-blue-700 to-emerald-300 text-white border-l-4 border-emerald-500"
            : "text-gray-900 hover:bg-gradient-to-r hover:from-blue-400 hover:to-emerald-200"
        }`}
      >
        <div className={isActive ? "text-white" : "text-gray-900"}>
          {icon}
        </div>

        {sidebarOpen && (
          <span className="text-sm font-medium">{label}</span>
        )}
      </div>
    </Link>
  );
}