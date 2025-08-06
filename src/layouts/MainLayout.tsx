import { useMemo, useState } from 'react';

import { LayoutDashboard, Settings, Shield, Users } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { permissionRoutes } from '@/router/permissionConfig';
import { Header, Sidebar, type NavigationItem as SidebarNavigationItem } from '@/shared/components';
import { useLogout, usePermissions } from '@/shared/hooks';

// Icon mapping for menu items
const iconMap = {
  dashboard: LayoutDashboard,
  users: Users,
  shield: Shield,
  settings: Settings,
} as const;

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const { getAccessibleMenuItems } = usePermissions();

  // Generate navigation items from permission config
  const navigation: SidebarNavigationItem[] = useMemo(() => {
    const accessibleRoutes = getAccessibleMenuItems(permissionRoutes);

    return accessibleRoutes
      .filter((route) => route.menuTitle && !route.hideInMenu)
      .map((route) => ({
        name: route.menuTitle!,
        href: route.path!,
        icon: route.menuIcon ? iconMap[route.menuIcon as keyof typeof iconMap] : LayoutDashboard,
      }))
      .sort((a, b) => {
        const routeA = permissionRoutes.find((r) => r.path === a.href);
        const routeB = permissionRoutes.find((r) => r.path === b.href);
        return (routeA?.menuOrder || 999) - (routeB?.menuOrder || 999);
      });
  }, [getAccessibleMenuItems]);

  const handleNavigation = (href: string) => {
    navigate(href);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleOpenSidebar = () => setSidebarOpen(true);
  const handleCloseSidebar = () => setSidebarOpen(false);

  const currentTitle =
    navigation.find((item) => item.href === location.pathname)?.name || 'Dashboard';

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
