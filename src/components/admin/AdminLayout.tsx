import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, Menu, LogOut } from 'lucide-react';
import { clearToken } from '@/lib/cfApi';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import logoLustosa from '@/assets/logo-lustosa.jpg';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin/products', label: 'Produtos', icon: Package },
];
function LogoutButton({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    clearToken();
    onNavigate?.();
    navigate('/admin/login');
  };
  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors w-full"
    >
      <LogOut className="w-5 h-5" />
      Sair
    </button>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-3" onClick={onNavigate}>
          <div className="w-12 h-12 rounded-lg overflow-hidden shadow-md">
            <img src={logoLustosa} alt="Lustosa Sports" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-primary">Lustosa Sports</h1>
            <p className="text-xs text-sidebar-foreground/60">Administração</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <LogoutButton onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border">
        <Sidebar />
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src={logoLustosa} alt="Lustosa Sports" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-primary">Lustosa Sports</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border">
              <Sidebar onNavigate={() => {}} />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
