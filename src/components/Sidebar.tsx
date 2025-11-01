import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: 'LayoutDashboard',
  },
  {
    title: 'MCP Manager',
    href: '/mcp',
    icon: 'Database',
  },
  {
    title: 'AI Tools',
    href: '/tools',
    icon: 'Cpu',
  },
  {
    title: 'Migration',
    href: '/migration',
    icon: 'ArrowRightLeft',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'Settings',
  },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary">MCP Manager</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-primary hover:bg-accent"
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  );
};