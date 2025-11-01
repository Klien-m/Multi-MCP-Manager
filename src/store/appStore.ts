import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  AppState,
  MCPData,
  ToolConfig,
  MigrationTask,
  VersionRecord,
  BackupRecord,
  AIConfig,
} from '../types';

interface AppStore extends AppState {
  // Actions
  setMcpCollections: (collections: MCPData[]) => void;
  addMcpCollection: (collection: MCPData) => void;
  updateMcpCollection: (id: string, data: Partial<MCPData>) => void;
  removeMcpCollection: (id: string) => void;

  setToolConfigs: (configs: ToolConfig[]) => void;
  addToolConfig: (config: ToolConfig) => void;
  updateToolConfig: (id: string, data: Partial<ToolConfig>) => void;
  removeToolConfig: (id: string) => void;

  setVersions: (versions: VersionRecord[]) => void;
  addVersion: (version: VersionRecord) => void;
  removeVersion: (id: string) => void;

  setBackups: (backups: BackupRecord[]) => void;
  addBackup: (backup: BackupRecord) => void;
  removeBackup: (id: string) => void;

  setMigration: (migration?: MigrationTask) => void;
  updateMigrationProgress: (taskId: string, progress: number) => void;
  completeMigration: (taskId: string, success: boolean, error?: string) => void;

  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;

  // AI Configuration
  aiConfig: AIConfig;
  setAiConfig: (config: Partial<AIConfig>) => void;

  // Utility actions
  reset: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      mcpCollections: [],
      toolConfigs: [],
      versions: [],
      backups: [],
      currentMigration: undefined,
      isLoading: false,
      error: undefined,
      aiConfig: {
        tools: [],
        autoSync: true,
        backupEnabled: true,
        backupInterval: 24,
      },

      // Actions
      setMcpCollections: (collections) =>
        set((state) => {
          state.mcpCollections = collections;
        }),

      addMcpCollection: (collection) =>
        set((state) => {
          state.mcpCollections.push(collection);
        }),

      updateMcpCollection: (id, data) =>
        set((state) => {
          const index = state.mcpCollections.findIndex((c) => c.id === id);
          if (index !== -1) {
            state.mcpCollections[index] = { ...state.mcpCollections[index], ...data };
          }
        }),

      removeMcpCollection: (id) =>
        set((state) => {
          state.mcpCollections = state.mcpCollections.filter((c) => c.id !== id);
        }),

      setToolConfigs: (configs) =>
        set((state) => {
          state.toolConfigs = configs;
        }),

      addToolConfig: (config) =>
        set((state) => {
          state.toolConfigs.push(config);
        }),

      updateToolConfig: (id, data) =>
        set((state) => {
          const index = state.toolConfigs.findIndex((c) => c.id === id);
          if (index !== -1) {
            state.toolConfigs[index] = { ...state.toolConfigs[index], ...data };
          }
        }),

      removeToolConfig: (id) =>
        set((state) => {
          state.toolConfigs = state.toolConfigs.filter((c) => c.id !== id);
        }),

      setVersions: (versions) =>
        set((state) => {
          state.versions = versions;
        }),

      addVersion: (version) =>
        set((state) => {
          state.versions.push(version);
        }),

      removeVersion: (id) =>
        set((state) => {
          state.versions = state.versions.filter((v) => v.id !== id);
        }),

      setBackups: (backups) =>
        set((state) => {
          state.backups = backups;
        }),

      addBackup: (backup) =>
        set((state) => {
          state.backups.push(backup);
        }),

      removeBackup: (id) =>
        set((state) => {
          state.backups = state.backups.filter((b) => b.id !== id);
        }),

      setMigration: (migration) =>
        set((state) => {
          state.currentMigration = migration;
        }),

      updateMigrationProgress: (taskId, progress) =>
        set((state) => {
          if (state.currentMigration && state.currentMigration.id === taskId) {
            state.currentMigration.progress = progress;
          }
        }),

      completeMigration: (taskId, success, error) =>
        set((state) => {
          if (state.currentMigration && state.currentMigration.id === taskId) {
            state.currentMigration.status = success ? 'completed' : 'failed';
            if (error) {
              state.currentMigration.error = error;
            }
          }
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      setAiConfig: (config) =>
        set((state) => {
          state.aiConfig = { ...state.aiConfig, ...config };
        }),

      reset: () =>
        set(() => ({
          mcpCollections: [],
          toolConfigs: [],
          versions: [],
          backups: [],
          currentMigration: undefined,
          isLoading: false,
          error: undefined,
          aiConfig: {
            tools: [],
            autoSync: true,
            backupEnabled: true,
            backupInterval: 24,
          },
        })),
    })),
    {
      name: 'mcp-manager-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mcpCollections: state.mcpCollections,
        toolConfigs: state.toolConfigs,
        versions: state.versions,
        backups: state.backups,
        aiConfig: state.aiConfig,
      }),
    }
  )
);