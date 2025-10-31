'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, BarChart3, Users, UserCog, Lightbulb } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Form Input',
    icon: <Home className="w-4 h-4" />,
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    href: '/master',
    label: 'Data Pasien',
    icon: <Users className="w-4 h-4" />,
  },
  {
    href: '/admin/users',
    label: 'Kelola Pengguna',
    icon: <UserCog className="w-4 h-4" />,
    adminOnly: true,
  },
];

export function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const filteredItems = navigationItems.filter(item => {
    if (item.adminOnly && (!isAuthenticated || user?.role !== 'admin')) {
      return false;
    }
    return true;
  });

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px]">
        <SheetHeader>
          <SheetTitle className="text-left">SmileSurvey</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-2 mt-6">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

// Desktop Navigation Component
export function DesktopNavigation() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const filteredItems = navigationItems.filter(item => {
    if (item.adminOnly && (!isAuthenticated || user?.role !== 'admin')) {
      return false;
    }
    return true;
  });

  return (
    <nav className="hidden md:flex items-center space-x-6">
      {filteredItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}