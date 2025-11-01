import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storageService } from './storageService';
import { AppState, MCPData, ToolConfig, MigrationTask, BackupRecord } from '../types';

// Query keys for cache management
export const QUERY_KEYS = {
  userData: ['userData'],
  mcpCollections: ['mcpCollections'],
  toolConfigs: ['toolConfigs'],
  migrations: ['migrations'],
  backups: ['backups'],
  storageStats: ['storageStats'],
} as const;

/**
 * Hook to load user data from storage
 */
export const useUserData = () => {
  return useQuery({
    queryKey: QUERY_KEYS.userData,
    queryFn: async () => {
      const data = await storageService.loadUserData();
      if (!data) {
        throw new Error('No user data found');
      }
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to get MCP collections
 */
export const useMcpCollections = () => {
  return useQuery({
    queryKey: QUERY_KEYS.mcpCollections,
    queryFn: async () => {
      const data = await storageService.loadUserData();
      return data?.mcpCollections || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to get tool configurations
 */
export const useToolConfigs = () => {
  return useQuery({
    queryKey: QUERY_KEYS.toolConfigs,
    queryFn: async () => {
      const data = await storageService.loadUserData();
      return data?.toolConfigs || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to get backups
 */
export const useBackups = () => {
  return useQuery({
    queryKey: QUERY_KEYS.backups,
    queryFn: () => {
      return storageService.listBackups();
    },
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Hook to get storage statistics
 */
export const useStorageStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.storageStats,
    queryFn: () => {
      return storageService.getStorageStats();
    },
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook to save user data
 */
export const useSaveUserData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AppState) => {
      await storageService.saveUserData(data);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userData });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mcpCollections });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.toolConfigs });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.backups });
    },
  });
};

/**
 * Hook to create a backup
 */
export const useCreateBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await storageService.backupUserData();
    },
    onSuccess: () => {
      // Invalidate and refetch backups
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.backups });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storageStats });
    },
  });
};

/**
 * Hook to restore from backup
 */
export const useRestoreBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (backupId: string) => {
      return await storageService.restoreFromBackup(backupId);
    },
    onSuccess: () => {
      // Invalidate and refetch all data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userData });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mcpCollections });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.toolConfigs });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.backups });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storageStats });
    },
  });
};

/**
 * Hook to delete a backup
 */
export const useDeleteBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (backupId: string) => {
      return await storageService.deleteBackup(backupId);
    },
    onSuccess: () => {
      // Invalidate and refetch backups
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.backups });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.storageStats });
    },
  });
};

/**
 * Hook to import MCP data
 */
export const useImportMcpData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filePath: string) => {
      return await storageService.importMCPData(filePath);
    },
    onSuccess: () => {
      // Invalidate and refetch MCP collections
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mcpCollections });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userData });
    },
  });
};

/**
 * Hook to export MCP data
 */
export const useExportMcpData = () => {
  return useMutation({
    mutationFn: async ({ mcpIds, format }: { mcpIds: string[]; format?: 'json' | 'csv' }) => {
      return await storageService.exportMCPData(mcpIds, format);
    },
  });
};