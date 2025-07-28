import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
} from "lucide-react";
import Sidebar, { type NavigationItem as SidebarNavigationItem } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const navigation: SidebarNavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (href: string) => {
    navigate(href);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const handleOpenSidebar = () => setSidebarOpen(true);
  const handleCloseSidebar = () => setSidebarOpen(false);

  const currentTitle = navigation.find(item => item.href === location.pathname)?.name || "Dashboard";

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        navigation={navigation}
        activePath={location.pathname}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={handleCloseSidebar}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={currentTitle} onOpenSidebar={handleOpenSidebar} />
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
