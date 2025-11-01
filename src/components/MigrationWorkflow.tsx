import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  FileText, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Upload,
  Download
} from 'lucide-react';
import { CrossToolMigrationService } from '../services/crossToolMigrationService';
import { ToolConfiguration } from './ToolConfiguration';

interface MigrationTask {
  id: string;
  sourceTool: string;
  targetTool: string;
  mcpData: any[];
  status: string;
  progress: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

interface MigrationProgress {
  percentage: number;
  message: string;
}

export const MigrationWorkflow: React.FC<{ onMigrationComplete?: () => void }> = ({ onMigrationComplete }) => {
  const [sourceTool, setSourceTool] = useState<string>('');
  const [targetTool, setTargetTool] = useState<string>('');
  const [selectedMCPs, setSelectedMCPs] = useState<string[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [currentTask, setCurrentTask] = useState<MigrationTask | null>(null);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'select' | 'migrate' | 'history'>('select');
  const [migrationHistory, setMigrationHistory] = useState<MigrationTask[]>([]);
  const [activeTasks, setActiveTasks] = useState<MigrationTask[]>([]);

  // Load migration history and active tasks
  useEffect(() => {
    loadMigrationData();
  }, []);

  const loadMigrationData = async () => {
    try {
      const history = await CrossToolMigrationService.getMigrationHistory();
      const active = await CrossToolMigrationService.getActiveTasks();
      setMigrationHistory(history);
      setActiveTasks(active);
    } catch (error) {
      console.error('Failed to load migration data:', error);
    }
  };

  const handleStartMigration = async () => {
    if (!sourceTool || !targetTool || selectedMCPs.length === 0) {
      setMigrationStatus('Please select source tool, target tool, and MCPs to migrate');
      return;
    }

    if (sourceTool === targetTool) {
      setMigrationStatus('Source and target tools must be different');
      return;
    }

    setIsMigrating(true);
    setMigrationStatus('Validating migration...');
    setMigrationProgress(0);

    try {
      // Create migration task
      const task = await CrossToolMigrationService.createMigrationTask(
        sourceTool,
        targetTool,
        [] // We'll get the actual MCP data when executing
      );

      setCurrentTask(task);
      setMigrationStatus('Starting migration...');
      
      // Execute migration with progress tracking
      await CrossToolMigrationService.executeMigrationTask(
        task,
        (progress) => {
          // Use the progress object from migration engine
          setMigrationProgress(progress.progress || 0);
          setMigrationStatus(`Processing ${progress.current}/${progress.total} items...`);
        }
      );

      setMigrationStatus('Migration completed successfully!');
      await loadMigrationData();
      onMigrationComplete?.();

    } catch (error) {
      setMigrationStatus(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleCancelMigration = async () => {
    if (currentTask) {
      const cancelled = await CrossToolMigrationService.cancelMigrationTask(currentTask.id);
      if (cancelled) {
        setIsMigrating(false);
        setMigrationStatus('Migration cancelled');
        setCurrentTask(null);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="text-green-500" />;
      case 'FAILED':
        return <XCircle className="text-red-500" />;
      case 'IN_PROGRESS':
        return <Clock className="text-blue-500 animate-spin" />;
      case 'PENDING':
        return <Clock className="text-yellow-500" />;
      default:
        return <Clock className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'COMPLETED':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>;
      case 'FAILED':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Failed</span>;
      case 'IN_PROGRESS':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>In Progress</span>;
      case 'PENDING':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      case 'CANCELLED':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Cancelled</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <RefreshCw className="h-6 w-6" />
          Cross-Tool Migration Workflow
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b">
          <Button
            onClick={() => setActiveTab('select')}
            variant={activeTab === 'select' ? 'primary' : 'secondary'}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Select MCPs
          </Button>
          <Button
            onClick={selectedMCPs.length === 0 ? undefined : () => setActiveTab('migrate')}
            variant={activeTab === 'migrate' ? 'primary' : 'secondary'}
            className={`flex items-center gap-2 ${selectedMCPs.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ArrowRight className="h-4 w-4" />
            Migrate
          </Button>
          <Button
            onClick={() => setActiveTab('history')}
            variant={activeTab === 'history' ? 'primary' : 'secondary'}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            History
          </Button>
        </div>

        {/* Select MCPs Tab */}
        {activeTab === 'select' && (
          <div className="space-y-6">
            {/* Tool Configuration */}
            <ToolConfiguration />

            {/* Migration Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Migration Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Source Tool</label>
                    <select
                      value={sourceTool}
                      onChange={(e) => setSourceTool(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select source tool</option>
                      <option value="cursor">Cursor</option>
                      <option value="claude">Claude Code</option>
                      <option value="vscode">VS Code</option>
                      <option value="jetbrains">JetBrains</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Tool</label>
                    <select
                      value={targetTool}
                      onChange={(e) => setTargetTool(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select target tool</option>
                      <option value="cursor">Cursor</option>
                      <option value="claude">Claude Code</option>
                      <option value="vscode">VS Code</option>
                      <option value="jetbrains">JetBrains</option>
                    </select>
                  </div>
                </div>

                {sourceTool && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Select MCPs from {sourceTool} to migrate to {targetTool}
                    </p>
                    {/* Placeholder for MCP selection - would integrate with MCPDataList */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mt-2">
                      <p className="text-center text-gray-500">
                        MCP selection interface would go here
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <div />
              <Button
                onClick={() => setActiveTab('migrate')}
                variant={!sourceTool || !targetTool || selectedMCPs.length === 0 ? 'secondary' : 'primary'}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Continue to Migration
              </Button>
            </div>
          </div>
        )}

        {/* Migration Tab */}
        {activeTab === 'migrate' && (
          <div className="space-y-6">
            {/* Migration Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Migration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Source Tool</div>
                    <div className="font-medium">{sourceTool}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Target Tool</div>
                    <div className="font-medium">{targetTool}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Selected MCPs</div>
                  <div className="font-medium">{selectedMCPs.length} items selected</div>
                </div>
              </CardContent>
            </Card>

            {/* Migration Progress */}
            {isMigrating && currentTask && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Migration Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${migrationProgress}%` }}
                    />
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    {migrationStatus}
                  </div>
                  <div className="flex justify-center">
                    <Button
                      variant="destructive"
                      onClick={handleCancelMigration}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Migration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Migration Actions */}
            {!isMigrating && (
              <div className="flex justify-between">
                <Button
                  variant="secondary"
                  onClick={() => setActiveTab('select')}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Back to Selection
                </Button>
                <Button
                  onClick={handleStartMigration}
                  variant={isMigrating ? 'secondary' : 'primary'}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isMigrating ? 'Migrating...' : 'Start Migration'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Active Tasks */}
            {activeTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Migration Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto">
                    {activeTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(task.status)}
                          <div>
                            <div className="font-medium">
                              {task.sourceTool} → {task.targetTool}
                            </div>
                            <div className="text-sm text-gray-600">
                              {task.mcpData.length} MCPs • {task.progress}%
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(task.status)}
                          <Button
                            size="sm"
                            onClick={() => setCurrentTask(task)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Migration History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Migration History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  {migrationHistory.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border-b">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <div className="font-medium">
                            {task.sourceTool} → {task.targetTool}
                          </div>
                          <div className="text-sm text-gray-600">
                            {task.mcpData.length} MCPs • {task.progress}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(task.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setActiveTab('migrate')}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Back to Migration
              </Button>
              <Button
                onClick={loadMigrationData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Status Alert */}
        {migrationStatus && (
          <div className={`mt-4 p-4 rounded-lg ${isMigrating ? "bg-blue-50" : "bg-green-50"}`}>
            <div className="font-medium">
              {isMigrating ? "Migration in Progress" : "Migration Complete"}
            </div>
            <div className="text-sm">{migrationStatus}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};