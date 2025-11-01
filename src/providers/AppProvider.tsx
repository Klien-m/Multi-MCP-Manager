import React, { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { useUserData } from '../services/useDataQueries';
import { storageService } from '../services/storageService';

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { setMcpCollections, setToolConfigs, setVersions, setBackups, setLoading, setError } = useAppStore();
  const { data: userData, isLoading, error, refetch } = useUserData();

  useEffect(() => {
    setLoading(isLoading);
    if (error) {
      setError(error.message);
    }
  }, [isLoading, error, setLoading, setError]);

  useEffect(() => {
    if (userData) {
      setMcpCollections(userData.mcpCollections);
      setToolConfigs(userData.toolConfigs);
      setVersions(userData.versions);
      setBackups(userData.backups);
      setError(undefined);
    }
  }, [userData, setMcpCollections, setToolConfigs, setVersions, setBackups, setError]);

  // Initialize app data if no user data exists
  useEffect(() => {
    if (!userData && !isLoading) {
      // Initialize with default data or try to load from storage
      storageService.loadUserData().then(storedData => {
        if (storedData) {
          setMcpCollections(storedData.mcpCollections);
          setToolConfigs(storedData.toolConfigs);
          setVersions(storedData.versions);
          setBackups(storedData.backups);
        } else {
          // Initialize with empty default data to ensure Dashboard works
          setMcpCollections([]);
          setToolConfigs([]);
          setVersions([]);
          setBackups([]);
        }
      }).catch(error => {
        console.error('Failed to load stored data:', error);
        setMcpCollections([]);
        setToolConfigs([]);
        setVersions([]);
        setBackups([]);
      });
    }
  }, [userData, isLoading, setMcpCollections, setToolConfigs, setVersions, setBackups]);

  return <>{children}</>;
};