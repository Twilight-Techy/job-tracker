"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  SquaresFour, 
  FileText, 
  Gear, 
  List, 
  X, 
  UserCircle,
  SignOut,
  Moon,
  Sun,
  Brain,
  Robot
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = authClient.useSession();

  const currentUser = user || session?.user;

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/signin");
          router.refresh();
        },
      },
    });
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: SquaresFour },
    { name: "Resumes", href: "/dashboard/resumes", icon: FileText },
    { name: "Master Context", href: "/dashboard/profile", icon: Brain },
    { name: "MCP & Integrations", href: "/dashboard/mcp", icon: Robot },
    { name: "Settings & API", href: "/dashboard/settings", icon: Gear },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background border-r border-border p-4 shadow-sm w-64 md:w-full">
      <div className="flex items-center justify-between md:justify-center mb-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">J</span>
          </div>
          <span className="font-bold text-xl tracking-tight hidden md:block">JobTracker</span>
        </Link>
        <button className="md:hidden p-2 text-muted-foreground" onClick={toggleSidebar}>
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Icon size={20} weight={isActive ? "fill" : "regular"} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : (currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : <UserCircle size={24} />)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser?.name || currentUser?.email?.split('@')[0] || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="cursor-pointer">
              {theme === 'dark' ? <Sun className="mr-2" size={16} /> : <Moon className="mr-2" size={16} />}
              <span>Toggle Theme</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
              <SignOut className="mr-2" size={16} />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header & Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background z-20 sticky top-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">J</span>
          </div>
          <span className="font-bold text-xl tracking-tight">JobTracker</span>
        </Link>
        <button onClick={toggleSidebar} className="p-2 text-foreground">
          <List size={24} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 z-10">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
