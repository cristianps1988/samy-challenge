"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthProvider";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navLink = (href: string, label: string) => {
    const isActive = pathname?.startsWith(href);
    return (
      <Link
        href={href}
        className={`relative text-sm font-medium transition-colors duration-200 pb-0.5 ${
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
        <span
          className={`absolute -bottom-[17px] left-0 right-0 h-[2px] bg-amber-500 transition-transform duration-200 origin-left ${
            isActive ? "scale-x-100" : "scale-x-0"
          }`}
        />
      </Link>
    );
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-6">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-display text-base font-bold tracking-tight select-none">
              Portal
            </span>
            <div className="flex items-center gap-6">
              {navLink("/users", "Users")}
              {navLink("/posts", "Posts")}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Logout"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
