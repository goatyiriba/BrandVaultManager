import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User } from "@shared/schema";
import { Palette, Bell, User as UserIcon, Settings, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";

interface AppHeaderProps {
  user: User | null;
}

export default function AppHeader({ user }: AppHeaderProps) {
  const { logoutMutation } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", active: location === "/" },
    { name: "Projects", href: "/projects", active: location.startsWith("/projects") },
    { name: "Team", href: "/team", active: location === "/team" },
    { name: "Export", href: "/export", active: location === "/export" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-material sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-medium text-gray-900">BrandVault</h1>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a className={`font-medium transition-colors ${
                    item.active ? "text-primary" : "text-gray-500 hover:text-gray-700"
                  }`}>
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="w-5 h-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <UserIcon className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">@{user?.username}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="sm" className="md:hidden p-2">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
