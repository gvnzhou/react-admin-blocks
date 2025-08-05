import { Button } from '@/shared/components/ui/button';
import { cn } from '@/utils/cn';
import { Home, LogOut, X } from 'lucide-react';

export type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type SidebarProps = {
  navigation: NavigationItem[];
  activePath: string;
  onNavigate: (href: string) => void;
  onLogout: () => void;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
};

const Sidebar = ({
  navigation,
  activePath,
  onNavigate,
  onLogout,
  sidebarOpen,
  onCloseSidebar,
}: SidebarProps) => (
  <>
    {/* Mobile sidebar overlay */}
    {sidebarOpen && (
      <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onCloseSidebar} />
    )}
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card border-r border-border transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      {/* Sidebar header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">Admin</span>
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onCloseSidebar}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = activePath === item.href;
          return (
            <Button
              key={item.name}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3 h-10',
                isActive && 'bg-secondary text-secondary-foreground',
              )}
              onClick={() => onNavigate(item.href)}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Button>
          );
        })}
      </nav>
      {/* Sidebar footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  </>
);

export default Sidebar;
