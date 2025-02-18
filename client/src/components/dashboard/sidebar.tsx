import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  PlusCircle,
  MessagesSquare,
  LogOut,
  Settings,
  Users,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/new-order", label: "New Order", icon: PlusCircle },
    { href: "/support", label: "Support", icon: MessagesSquare },
  ];

  if (user?.role === "admin") {
    menuItems.push(
      { href: "/users", label: "Users", icon: Users },
      { href: "/settings", label: "Settings", icon: Settings }
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-sidebar-foreground mb-6">
            ClippingPath Manager
          </h2>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a 
                  className="flex items-center gap-2 px-3 py-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <p className="font-medium text-sidebar-foreground">{user?.username}</p>
              <p className="text-sm text-sidebar-foreground/60 capitalize">{user?.role}</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}
