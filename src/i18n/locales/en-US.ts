const enUS = {
  // Common texts
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    refresh: 'Refresh',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    all: 'All',
    none: 'None',
    select: 'Select',
    deselect: 'Deselect',
    export: 'Export',
    import: 'Import',
    download: 'Download',
    upload: 'Upload',
    copy: 'Copy',
    paste: 'Paste',
    cut: 'Cut',
    undo: 'Undo',
    redo: 'Redo',
    settings: 'Settings',
    help: 'Help',
    about: 'About',
    exit: 'Exit'
  },

  // Navigation
  navigation: {
    mcpManager: 'MCP Manager',
    aiTools: 'AI Tools',
    migration: 'Migration'
  },

  // Page titles
  pages: {
    mcpManager: 'MCP Manager',
    toolConfig: 'Tool Configuration',
    migration: 'Migration'
  },


  // MCP Manager
  mcpManager: {
    title: 'MCP Manager',
    description: 'Manage your MCP data collections',
    noData: 'No MCP data available',
    importData: 'Please import MCP data to get started',
    noMatch: 'No MCP data matches the criteria',
    codeSnippets: 'code snippets',
    tags: 'tags',
    lastUpdated: 'Last updated',
    overview: 'Overview',
    snippets: 'Code Snippets',
    metadata: 'Metadata',
    basicInfo: 'Basic Information',
    statistics: 'Statistics',
    labels: 'Labels',
    language: 'Language',
    snippetDescription: 'Description',
    snippetContent: 'Content'
  },

  // Tool Configuration
  toolConfig: {
    title: 'Tool Configuration',
    description: 'Configure AI programming tools and MCP file paths',
    aiConfig: 'AI Configuration',
    toolConfig: 'Tool Configuration',
    defaultTool: 'Default Tool',
    autoSync: 'Auto Sync',
    autoSyncDescription: 'Automatically detect and read MCP file changes',
    backupEnabled: 'Backup Enabled',
    backupDescription: 'Automatically create MCP data backups',
    backupInterval: 'Backup Interval (hours)',
    addTool: 'Add Tool',
    addFirstTool: 'Add First Tool',
    noTools: 'No tools configured',
    pleaseAddTool: 'Please add tool configurations to start using MCP Unified Manager',
    toolName: 'Tool Name',
    displayName: 'Display Name',
    defaultPath: 'Default Path',
    customPath: 'Custom Path',
    supportedFormats: 'Supported Formats',
    enabled: 'Enabled',
    disabled: 'Disabled',
    lastSync: 'Last Sync',
    selectDefaultTool: 'Select default tool',
    selectPresetPath: 'Select preset path',
    optionalCustomPath: 'Optional custom path',
    jsonYamlYml: 'json, yaml, yml',
    enableTool: 'Enable this tool'
  },

  // Migration
  migration: {
    title: 'Migration',
    description: 'Cross-tool MCP data migration and synchronization',
    workflow: 'Cross-Tool Migration Workflow',
    selectMCPs: 'Select MCPs',
    migrate: 'Migrate',
    history: 'History',
    sourceTool: 'Source Tool',
    targetTool: 'Target Tool',
    selectSourceTool: 'Select source tool',
    selectTargetTool: 'Select target tool',
    selectMCPsToMigrate: 'Select MCPs from {sourceTool} to migrate to {targetTool}',
    mcpSelection: 'MCP selection interface will go here',
    migrationSummary: 'Migration Summary',
    selectedMCPs: 'Selected MCPs',
    migrationProgress: 'Migration Progress',
    migrating: 'Migrating...',
    cancelMigration: 'Cancel Migration',
    backToSelection: 'Back to Selection',
    startMigration: 'Start Migration',
    activeTasks: 'Active Migration Tasks',
    migrationHistory: 'Migration History',
    completed: 'Completed',
    failed: 'Failed',
    inProgress: 'In Progress',
    pending: 'Pending',
    cancelled: 'Cancelled',
    unknown: 'Unknown',
    items: 'items',
    mcp: 'MCP'
  },


  // Errors and status
  errors: {
    loadMCPError: 'Failed to load MCP data: {message}',
    loadToolConfigError: 'Failed to load tool configuration: {message}',
    migrationFailed: 'Migration failed: {message}',
    migrationCancelled: 'Migration cancelled',
    selectSourceTarget: 'Please select source tool, target tool, and MCPs to migrate',
    sourceTargetSame: 'Source and target tools must be different',
    unknownError: 'Unknown error',
    validationFailed: 'Validation failed',
    migrationInProgress: 'Migration in progress',
    migrationComplete: 'Migration complete'
  },

  // Tool names
  tools: {
    cursor: 'Cursor',
    'github-copilot': 'GitHub Copilot',
    tabnine: 'Tabnine',
    codex: 'Codex',
    kilocode: 'KiloCode',
    vscode: 'VS Code',
    claude: 'Claude Code',
    jetbrains: 'JetBrains',
    unknown: 'Unknown'
  },

  // File formats
  formats: {
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YML'
  },

  // Time related
  time: {
    justNow: 'Just now',
    minuteAgo: 'minute ago',
    minutesAgo: '{count} minutes ago',
    hourAgo: 'hour ago',
    hoursAgo: '{count} hours ago',
    dayAgo: 'day ago',
    daysAgo: '{count} days ago',
    monthAgo: 'month ago',
    monthsAgo: '{count} months ago',
    yearAgo: 'year ago',
    yearsAgo: '{count} years ago'
  }
};

export default enUS;