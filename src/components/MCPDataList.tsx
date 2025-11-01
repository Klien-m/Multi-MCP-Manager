import React, { useState, useEffect, useMemo } from 'react';
import { MCPData, CodeSnippet } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  FileText, 
  Code, 
  Tag, 
  Clock, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  List, 
  Grid 
} from 'lucide-react';

interface MCPDataListProps {
  mcpData: MCPData[];
  onMCPSelect?: (mcpData: MCPData) => void;
  onExport?: (mcpData: MCPData) => void;
  loading?: boolean;
  error?: string;
}

interface MCPDataItemProps {
  mcpData: MCPData;
  onSelect: () => void;
  onExport: () => void;
}

const MCPDataItem: React.FC<MCPDataItemProps> = ({ mcpData, onSelect, onExport }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getToolColor = (tool: string) => {
    const toolColors: Record<string, string> = {
      'github-copilot': 'bg-blue-100 text-blue-800',
      'tabnine': 'bg-green-100 text-green-800',
      'cursor': 'bg-purple-100 text-purple-800',
      'codex': 'bg-orange-100 text-orange-800',
      'kilocode': 'bg-red-100 text-red-800',
      'unknown': 'bg-gray-100 text-gray-800'
    };
    
    return toolColors[tool] || toolColors['unknown'];
  };
  
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold cursor-pointer" onClick={onSelect}>
                {mcpData.metadata.name}
              </h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getToolColor(mcpData.sourceTool)}`}>
                {mcpData.sourceTool}
              </span>
            </div>
            
            {mcpData.metadata.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {mcpData.metadata.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                {mcpData.codeSnippets.length} 个代码片段
              </span>
              <span className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {mcpData.metadata.tags.length} 个标签
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDate(mcpData.updatedAt)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2 ml-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onExport}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            {mcpData.metadata.description && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">描述</h4>
                <p className="text-gray-600">{mcpData.metadata.description}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">标签</h4>
              <div className="flex flex-wrap gap-1">
                {mcpData.metadata.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">代码片段预览</h4>
              <div className="grid gap-2 max-h-32 overflow-y-auto">
                {mcpData.codeSnippets.slice(0, 3).map((snippet) => (
                  <div key={snippet.id} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium text-gray-800">{snippet.language}</div>
                    <div className="text-gray-600 line-clamp-1">{snippet.content}</div>
                  </div>
                ))}
                {mcpData.codeSnippets.length > 3 && (
                  <div className="text-center text-gray-500 text-sm">
                    还有 {mcpData.codeSnippets.length - 3} 个代码片段...
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const MCPDataListView: React.FC<MCPDataListProps> = ({
  mcpData,
  onMCPSelect,
  onExport,
  loading = false,
  error
}) => {
  const [selectedMCP, setSelectedMCP] = useState<MCPData | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTool, setFilterTool] = useState<string>('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  
  // 搜索和过滤逻辑
  const filteredData = useMemo(() => {
    return mcpData.filter(item => {
      const matchesSearch = item.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.metadata.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTool = !filterTool || item.sourceTool === filterTool;
      
      const matchesTags = filterTags.length === 0 || 
                         filterTags.some(filterTag => 
                           item.metadata.tags.some(itemTag => 
                             itemTag.toLowerCase().includes(filterTag.toLowerCase())
                           )
                         );
      
      return matchesSearch && matchesTool && matchesTags;
    });
  }, [mcpData, searchTerm, filterTool, filterTags]);
  
  // 获取所有唯一的工具和标签用于过滤
  const availableTools = useMemo(() => {
    const tools = new Set(mcpData.map(item => item.sourceTool));
    return Array.from(tools).sort();
  }, [mcpData]);
  
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    mcpData.forEach(item => {
      item.metadata.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [mcpData]);
  
  const handleMCPSelect = (mcpData: MCPData) => {
    setSelectedMCP(mcpData);
    onMCPSelect?.(mcpData);
  };
  
  const handleExport = (mcpData: MCPData) => {
    onExport?.(mcpData);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setFilterTool('');
    setFilterTags([]);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        <p className="font-medium">加载失败</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索MCP数据..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={filterTool}
                onChange={(e) => setFilterTool(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有工具</option>
                {availableTools.map(tool => (
                  <option key={tool} value={tool}>{tool}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
                disabled={!searchTerm && !filterTool && filterTags.length === 0}
              >
                <Filter className="h-4 w-4" />
                清除筛选
              </Button>
            </div>
          </div>
          
          {/* 标签筛选 */}
          {availableTags.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">标签筛选:</div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <span
                    key={tag}
                    className={`px-2 py-1 rounded text-xs cursor-pointer ${
                      filterTags.includes(tag) 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                    onClick={() => {
                      if (filterTags.includes(tag)) {
                        setFilterTags(filterTags.filter(t => t !== tag));
                      } else {
                        setFilterTags([...filterTags, tag]);
                      }
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* MCP数据列表 */}
      <div className="grid gap-4">
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无MCP数据</h3>
            <p className="text-gray-600">
              {mcpData.length === 0 ? '请导入MCP数据开始使用' : '没有找到符合条件的MCP数据'}
            </p>
          </div>
        ) : (
          filteredData.map((item) => (
            <MCPDataItem
              key={item.id}
              mcpData={item}
              onSelect={() => handleMCPSelect(item)}
              onExport={() => handleExport(item)}
            />
          ))
        )}
      </div>
      
      {/* MCP详情弹窗 */}
      {selectedMCP && (
        <MCPDetailDialog
          mcpData={selectedMCP}
          open={!!selectedMCP}
          onOpenChange={(open) => !open && setSelectedMCP(null)}
        />
      )}
    </div>
  );
};

interface MCPDetailDialogProps {
  mcpData: MCPData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MCPDetailDialog: React.FC<MCPDetailDialogProps> = ({
  mcpData,
  open,
  onOpenChange
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto w-11/12">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">{mcpData.metadata.name}</h2>
              <p className="text-gray-600">{mcpData.metadata.description}</p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="border-b mb-4">
            <div className="flex space-x-4">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                概览
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'snippets' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('snippets')}
              >
                代码片段
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'metadata' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('metadata')}
              >
                元数据
              </button>
            </div>
          </div>
          
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">基本信息</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">ID:</span> {mcpData.id}</div>
                    <div><span className="text-gray-600">源工具:</span> {mcpData.sourceTool}</div>
                    <div><span className="text-gray-600">版本:</span> {mcpData.metadata.version}</div>
                    <div><span className="text-gray-600">创建时间:</span> {formatDate(mcpData.createdAt)}</div>
                    <div><span className="text-gray-600">更新时间:</span> {formatDate(mcpData.updatedAt)}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">统计信息</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">代码片段数量:</span> {mcpData.codeSnippets.length}</div>
                    <div><span className="text-gray-600">标签数量:</span> {mcpData.metadata.tags.length}</div>
                  </div>
                </div>
              </div>
              
              {mcpData.metadata.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {mcpData.metadata.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'snippets' && (
            <div>
              <div className="max-h-96 overflow-y-auto">
                {mcpData.codeSnippets.map((snippet) => (
                  <div key={snippet.id} className="border-b py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs">
                        {snippet.language}
                      </span>
                      {snippet.description && (
                        <span className="text-sm text-gray-600">{snippet.description}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {snippet.tags.map((tag, index) => (
                        <span key={index} className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {snippet.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'metadata' && (
            <div>
              <div className="max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(mcpData.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCPDataListView;