/**
 * 默认配置测试数据
 * 这些数据用于初始化工具和服务的默认配置
 */

import { AITool, MCPConfig } from '../types';

// 默认支持的工具列表
export const DEFAULT_TOOLS: AITool[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    icon: 'https://cursor.sh/favicon.ico',
    defaultPath: '~/.cursor/mcp.json'
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    icon: 'https://claude.ai/favicon.ico',
    defaultPath: '~/Library/Application Support/Claude Code/mcp.json'
  },
  {
    id: 'kilo-code',
    name: 'Kilo Code',
    icon: 'https://kilocode.com/favicon.ico',
    defaultPath: '~/.kilo/mcp.json'
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    icon: 'https://github.com/favicon.ico',
    defaultPath: '~/.config/gh-copilot/mcp.json'
  },
  {
    id: 'tabnine',
    name: 'Tabnine',
    icon: 'https://tabnine.com/favicon.ico',
    defaultPath: '~/.tabnine/mcp.json'
  },
  {
    id: 'amazon-codewhisperer',
    name: 'Amazon CodeWhisperer',
    icon: 'https://aws.amazon.com/favicon.ico',
    defaultPath: '~/.aws/codewhisperer/mcp.json'
  },
  {
    id: 'replit-agent',
    name: 'Replit Agent',
    icon: 'https://replit.com/favicon.ico',
    defaultPath: '~/.replit/agent/mcp.json'
  },
  {
    id: 'codeium',
    name: 'Codeium',
    icon: 'https://codeium.com/favicon.ico',
    defaultPath: '~/.codeium/mcp.json'
  },
  {
    id: 'mutable-ai',
    name: 'Mutable AI',
    icon: 'https://mutable.ai/favicon.ico',
    defaultPath: '~/.mutable/mcp.json'
  },
  {
    id: 'sourcegraph-cody',
    name: 'Sourcegraph Cody',
    icon: 'https://sourcegraph.com/favicon.ico',
    defaultPath: '~/.sourcegraph/cody/mcp.json'
  },
  {
    id: 'phind-code',
    name: 'Phind Code',
    icon: 'https://phind.com/favicon.ico',
    defaultPath: '~/.phind/code/mcp.json'
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    icon: 'https://windsurf.ai/favicon.ico',
    defaultPath: '~/.windsurf/mcp.json'
  },
  {
    id: 'coderabbit',
    name: 'CodeRabbit',
    icon: 'https://coderabbit.ai/favicon.ico',
    defaultPath: '~/.coderabbit/mcp.json'
  },
  {
    id: 'aider',
    name: 'Aider',
    icon: 'https://aider.com/favicon.ico',
    defaultPath: '~/.aider/mcp.json'
  },
  {
    id: 'continue',
    name: 'Continue',
    icon: 'https://continue.dev/favicon.ico',
    defaultPath: '~/.continue/mcp.json'
  }
];

// 扩展的AI工具扫描配置
export const EXTENDED_TOOL_SCAN_CONFIGS = {
  'cursor': {
    paths: [
      '~/.cursor/mcp.json',
      '~/Library/Application Support/Cursor/mcp.json',
      '~/.config/cursor/mcp.json'
    ]
  },
  'claude-code': {
    paths: [
      '~/Library/Application Support/Claude Code/mcp.json',
      '~/.claude/mcp.json',
      '~/.config/claude-code/mcp.json'
    ]
  },
  'kilo-code': {
    paths: [
      '~/.kilo/mcp.json',
      '~/Library/Application Support/Kilo Code/mcp.json',
      '~/.config/kilo/mcp.json'
    ]
  },
  'github-copilot': {
    paths: [
      '~/.config/gh-copilot/mcp.json',
      '~/.github/copilot/mcp.json',
      '~/Library/Application Support/GitHub Desktop/copilot/mcp.json'
    ]
  },
  'tabnine': {
    paths: [
      '~/.tabnine/mcp.json',
      '~/Library/Application Support/Tabnine/mcp.json',
      '~/.config/tabnine/mcp.json'
    ]
  },
  'amazon-codewhisperer': {
    paths: [
      '~/.aws/codewhisperer/mcp.json',
      '~/Library/Application Support/Amazon/codewhisperer/mcp.json',
      '~/.config/amazon/codewhisperer/mcp.json'
    ]
  },
  'replit-agent': {
    paths: [
      '~/.replit/agent/mcp.json',
      '~/Library/Application Support/Replit/agent/mcp.json',
      '~/.config/replit/agent/mcp.json'
    ]
  },
  'codeium': {
    paths: [
      '~/.codeium/mcp.json',
      '~/Library/Application Support/Codeium/mcp.json',
      '~/.config/codeium/mcp.json'
    ]
  },
  'mutable-ai': {
    paths: [
      '~/.mutable/mcp.json',
      '~/Library/Application Support/Mutable/mcp.json',
      '~/.config/mutable/mcp.json'
    ]
  },
  'sourcegraph-cody': {
    paths: [
      '~/.sourcegraph/cody/mcp.json',
      '~/Library/Application Support/Sourcegraph/cody/mcp.json',
      '~/.config/sourcegraph/cody/mcp.json'
    ]
  },
  'phind-code': {
    paths: [
      '~/.phind/code/mcp.json',
      '~/Library/Application Support/Phind/code/mcp.json',
      '~/.config/phind/code/mcp.json'
    ]
  },
  'windsurf': {
    paths: [
      '~/.windsurf/mcp.json',
      '~/Library/Application Support/Windsurf/mcp.json',
      '~/.config/windsurf/mcp.json'
    ]
  },
  'coderabbit': {
    paths: [
      '~/.coderabbit/mcp.json',
      '~/Library/Application Support/CodeRabbit/mcp.json',
      '~/.config/coderabbit/mcp.json'
    ]
  },
  'aider': {
    paths: [
      '~/.aider/mcp.json',
      '~/Library/Application Support/Aider/mcp.json',
      '~/.config/aider/mcp.json'
    ]
  },
  'continue': {
    paths: [
      '~/.continue/mcp.json',
      '~/Library/Application Support/Continue/mcp.json',
      '~/.config/continue/mcp.json'
    ]
  }
};

// 默认的MCP配置列表
export const DEFAULT_MCP_CONFIGS: MCPConfig[] = [];

// 默认工具ID列表（用于判断是否为默认工具）
export const DEFAULT_TOOL_IDS: string[] = DEFAULT_TOOLS.map(tool => tool.id);

// MCP配置建议模板
export const MCP_CONFIG_SUGGESTIONS = {
  'cursor': {
    name: 'Cursor MCP Server',
    description: 'Cursor IDE 的 MCP 服务器配置',
    config: {
      command: 'npx',
      args: ['@modelcontextprotocol/server-local'],
      env: {}
    }
  },
  'claude-code': {
    name: 'Claude Code MCP Server',
    description: 'Claude Code 的 MCP 服务器配置',
    config: {
      command: 'npx',
      args: ['@modelcontextprotocol/server-local'],
      env: {}
    }
  },
  'kilo-code': {
    name: 'Kilo Code MCP Server',
    description: 'Kilo Code 的 MCP 服务器配置',
    config: {
      command: 'npx',
      args: ['@modelcontextprotocol/server-local'],
      env: {}
    }
  }
};