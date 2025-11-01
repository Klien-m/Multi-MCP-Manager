// MCP Data Types
export interface MCPData {
  id: string;
  sourceTool: string;
  codeSnippets: CodeSnippet[];
  metadata: MCPMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface CodeSnippet {
  id: string;
  content: string;
  language: string;
  description?: string;
  tags: string[];
  context?: Record<string, any>;
}

export interface MCPMetadata {
  name: string;
  description?: string;
  version: string;
  author?: string;
  tags: string[];
  dependencies?: string[];
  configuration?: Record<string, any>;
}

// Tool Configuration Types
export interface ToolConfig {
  id: string;
  name: string;
  displayName: string;
  defaultPath: string;
  customPath?: string;
  supportedFormats: string[];
  isActive: boolean;
  lastSync?: string;
  error?: string;
}

export interface AIConfig {
  tools: ToolConfig[];
  defaultTool?: string;
  autoSync: boolean;
  backupEnabled: boolean;
  backupInterval: number; // in hours
}

// Migration Types
export interface MigrationTask {
  id: string;
  sourceTool: string;
  targetTool: string;
  mcpData: MCPData[];
  status: MigrationStatus;
  progress: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export enum MigrationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Version Management Types
export interface VersionRecord {
  id: string;
  mcpId: string;
  version: string;
  data: MCPData;
  createdAt: string;
  createdBy: string;
  description?: string;
  isCurrent: boolean;
}

// Backup Types
export interface BackupRecord {
  id: string;
  name: string;
  description?: string;
  data: BackupData;
  createdAt: string;
  createdBy: string;
  size: number;
}

export interface BackupData {
  mcpCollections: MCPData[];
  toolConfigs: ToolConfig[];
  versions: VersionRecord[];
  metadata: {
    backupDate: string;
    appVersion: string;
    platform: string;
  };
}

// User Interface Types
export interface AppState {
  mcpCollections: MCPData[];
  toolConfigs: ToolConfig[];
  versions: VersionRecord[];
  backups: BackupRecord[];
  currentMigration?: MigrationTask;
  isLoading: boolean;
  error?: string;
  aiConfig: AIConfig;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// File System Types
export interface FileSystemItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modifiedAt?: string;
}

// Event Types
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: string;
  source: string;
}

// Configuration Types
export interface AppConfig {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoBackup: boolean;
  backupPath: string;
  showAdvanced: boolean;
  telemetryEnabled: boolean;
}