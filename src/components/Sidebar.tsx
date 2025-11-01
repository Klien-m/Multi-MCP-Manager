import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Database, Cpu, ArrowRightLeft, Settings } from 'lucide-react';
import { useT } from '../i18n';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navigation: NavItem[] = [
  {
    title: 'navigation.dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'navigation.mcpManager',
    href: '/mcp',
    icon: Database,
  },
  {
    title: 'navigation.aiTools',
    href: '/tools',
    icon: Cpu,
  },
  {
    title: 'navigation.migration',
    href: '/migration',
    icon: ArrowRightLeft,
  },
  {
    title: 'navigation.settings',
    href: '/settings',
    icon: Settings,
  },
];

export const Sidebar: React.FC = () => {
  const t = useT();
  
  const navigationWithTranslation = [
    {
      title: t('navigation.dashboard'),
      href: '/',
      icon: LayoutDashboard,
    },
    {
      title: t('navigation.mcpManager'),
      href: '/mcp',
      icon: Database,
    },
    {
      title: t('navigation.aiTools'),
      href: '/tools',
      icon: Cpu,
    },
    {
      title: t('navigation.migration'),
      href: '/migration',
      icon: ArrowRightLeft,
    },
    {
      title: t('navigation.settings'),
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary">{t('pages.mcpManager')}</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navigationWithTranslation.map((item) => (
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