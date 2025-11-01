import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useStorageStats } from '@/services/useDataQueries';
import { useT } from '../i18n';

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useStorageStats();

  if (isLoading) {
    const t = useT();
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
          <Button>{t('dashboard.refresh')}</Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card p-6 rounded-lg border border-border animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const t = useT();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        <Button>{t('dashboard.refresh')}</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.totalMCPs')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMCPs || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.aiTools')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTools || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.backups')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBackups || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.storageUsed')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.totalBackupSize ? (stats.totalBackupSize / 1024 / 1024).toFixed(2) : '0')} MB
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">MCP Migration</div>
                  <div className="text-sm text-muted-foreground">{t('dashboard.hoursAgo', { count: 2 })}</div>
                </div>
                <div className="text-sm text-green-600">{t('dashboard.completed')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">{t('dashboard.importMCPData')}</Button>
            <Button variant="secondary" className="w-full">{t('dashboard.createBackup')}</Button>
            <Button variant="secondary" className="w-full">{t('dashboard.configureTools')}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};