import { Button } from '@/shared/components/ui/button';
import { Menu, Search } from 'lucide-react';

export type HeaderProps = {
  title: string;
  onOpenSidebar: () => void;
};

const Header = ({ title, onOpenSidebar }: HeaderProps) => (
  <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-6">
    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar}>
      <Menu className="h-4 w-4" />
    </Button>
    <div className="flex-1 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Search className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 ml-4">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">A</span>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
