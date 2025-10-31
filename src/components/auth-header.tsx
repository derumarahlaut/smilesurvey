"use client";

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Shield } from 'lucide-react';
import Link from 'next/link';

export function AuthHeader() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-gray-900">SmileSurvey</h1>
          <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
            {user?.role === 'admin' ? (
              <><Shield className="w-3 h-3 mr-1" /> Admin</>
            ) : (
              <><User className="w-3 h-3 mr-1" /> Operator</>
            )}
          </Badge>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Selamat datang, <span className="font-medium">{user?.name}</span>
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                {user?.username}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAdmin() && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users">
                      <Settings className="w-4 h-4 mr-2" />
                      Kelola Pengguna
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}