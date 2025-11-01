const zhCN = {
  // 通用文案
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    close: '关闭',
    confirm: '确认',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    search: '搜索',
    filter: '筛选',
    clear: '清除',
    refresh: '刷新',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '信息',
    yes: '是',
    no: '否',
    ok: '确定',
    all: '全部',
    none: '无',
    tools: '工具',
    select: '选择',
    deselect: '取消选择',
    export: '导出',
    import: '导入',
    download: '下载',
    upload: '上传',
    copy: '复制',
    paste: '粘贴',
    cut: '剪切',
    undo: '撤销',
    redo: '重做',
    settings: '设置',
    help: '帮助',
    about: '关于',
    exit: '退出'
  },

  // 导航
  navigation: {
    dashboard: '仪表板',
    mcpManager: 'MCP管理器',
    aiTools: 'AI工具',
    migration: '数据迁移',
    settings: '设置'
  },

  // 页面标题
  pages: {
    dashboard: '仪表板',
    mcpManager: 'MCP管理器',
    toolConfig: '工具配置',
    migration: '数据迁移',
    settings: '设置'
  },

  // Dashboard页面
  dashboard: {
    title: '仪表板',
    refresh: '刷新',
    totalMCPs: 'MCP总数',
    aiTools: 'AI工具',
    backups: '备份',
    storageUsed: '已用存储',
    recentActivity: '最近活动',
    quickActions: '快速操作',
    importMCPData: '导入MCP数据',
    createBackup: '创建备份',
    configureTools: '配置工具',
    completed: '已完成',
    hoursAgo: '小时前'
  },

  // MCP管理器
  mcpManager: {
    title: 'MCP管理器',
    description: '管理您的MCP数据集合',
    noData: '暂无MCP数据',
    importData: '请导入MCP数据开始使用',
    noMatch: '没有找到符合条件的MCP数据',
    codeSnippets: '个代码片段',
    tags: '个标签',
    lastUpdated: '最后更新',
    moreCodeSnippets: '还有 {count} 个代码片段...',
    overview: '概览',
    snippets: '代码片段',
    metadata: '元数据',
    basicInfo: '基本信息',
    statistics: '统计信息',
    labels: '标签',
    language: '语言',
    snippetDescription: '描述',
    snippetContent: '内容'
  },

  // 工具配置
  toolConfig: {
    title: '工具配置',
    description: '配置AI编程工具和MCP文件路径',
    aiConfig: 'AI配置设置',
    toolConfig: '工具配置管理',
    defaultTool: '默认工具',
    autoSync: '自动同步',
    autoSyncDescription: '自动检测和读取MCP文件更改',
    backupEnabled: '备份启用',
    backupDescription: '自动创建MCP数据备份',
    backupInterval: '备份间隔 (小时)',
    addTool: '添加工具',
    addFirstTool: '添加第一个工具',
    noTools: '暂无配置的工具',
    pleaseAddTool: '请添加工具配置以开始使用MCP统一管理器',
    toolName: '工具名称',
    displayName: '显示名称',
    defaultPath: '默认路径',
    customPath: '自定义路径',
    supportedFormats: '支持格式',
    enabled: '已启用',
    disabled: '已禁用',
    lastSync: '最后同步',
    selectDefaultTool: '选择默认工具',
    selectPresetPath: '选择预设路径',
    optionalCustomPath: '可选的自定义路径',
    jsonYamlYml: 'json, yaml, yml',
    enableTool: '启用此工具'
  },

  // 数据迁移
  migration: {
    title: '数据迁移',
    description: '跨工具MCP数据迁移和同步',
    workflow: '跨工具迁移工作流',
    selectMCPs: '选择MCP',
    migrate: '迁移',
    history: '历史',
    sourceTool: '源工具',
    targetTool: '目标工具',
    selectSourceTool: '选择源工具',
    selectTargetTool: '选择目标工具',
    selectMCPsToMigrate: '选择MCPs从 {sourceTool} 迁移到 {targetTool}',
    mcpSelection: 'MCP选择界面将在此处',
    migrationSummary: '迁移摘要',
    selectedMCPs: '已选择的MCP',
    migrationProgress: '迁移进度',
    migrating: '迁移中...',
    cancelMigration: '取消迁移',
    backToSelection: '返回选择',
    startMigration: '开始迁移',
    activeTasks: '活跃迁移任务',
    migrationHistory: '迁移历史',
    completed: '已完成',
    failed: '失败',
    inProgress: '进行中',
    pending: '等待中',
    cancelled: '已取消',
    unknown: '未知',
    items: '项',
    mcp: 'MCP'
  },

  // 设置页面
  settings: {
    title: '设置',
    description: '配置MCP统一管理器的偏好设置',
    general: '常规设置',
    theme: '主题',
    light: '浅色主题',
    dark: '深色主题',
    system: '跟随系统',
    defaultExportFormat: '默认导出格式',
    showAdvancedOptions: '显示高级选项',
    showAdvancedOptionsDescription: '启用更多高级配置选项',
    backup: '备份设置',
    autoBackup: '自动备份',
    autoBackupDescription: '定期自动创建数据备份',
    backupInterval: '备份间隔 (小时)',
    everyHour: '每小时',
    every6Hours: '每6小时',
    every12Hours: '每12小时',
    daily: '每天',
    every2Days: '每2天',
    weekly: '每周',
    notifications: '通知设置',
    enableNotifications: '启用通知',
    enableNotificationsDescription: '接收重要事件的通知',
    advanced: '高级设置',
    enableTelemetry: '启用遥测',
    telemetryDescription: '发送匿名使用数据以帮助改进产品',
    saveSettings: '保存设置',
    saveSettingsSuccess: '设置保存成功！',
    saveSettingsError: '保存设置时出错，请重试。',
    saving: '保存中...',
    reset: '重置'
  },

  // 错误和状态
  errors: {
    loadMCPError: '加载MCP数据时出错: {message}',
    loadToolConfigError: '加载工具配置时出错: {message}',
    migrationFailed: '迁移失败: {message}',
    migrationCancelled: '迁移已取消',
    selectSourceTarget: '请选择源工具、目标工具和要迁移的MCP',
    sourceTargetSame: '源工具和目标工具必须不同',
    unknownError: '未知错误',
    validationFailed: '验证失败',
    migrationInProgress: '迁移进行中',
    migrationComplete: '迁移完成'
  },

  // 工具名称
  tools: {
    cursor: 'Cursor',
    'github-copilot': 'GitHub Copilot',
    tabnine: 'Tabnine',
    codex: 'Codex',
    kilocode: 'KiloCode',
    vscode: 'VS Code',
    claude: 'Claude Code',
    jetbrains: 'JetBrains',
    unknown: '未知'
  },

  // 文件格式
  formats: {
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YML'
  },

  // 时间相关
  time: {
    justNow: '刚刚',
    minuteAgo: '分钟前',
    minutesAgo: '{count}分钟前',
    hourAgo: '小时前',
    hoursAgo: '{count}小时前',
    dayAgo: '天前',
    daysAgo: '{count}天前',
    monthAgo: '月前',
    monthsAgo: '{count}月前',
    yearAgo: '年前',
    yearsAgo: '{count}年前'
  }
};

export default zhCN;