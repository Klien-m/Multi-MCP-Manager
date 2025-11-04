import { invoke } from '@tauri-apps/api/core';

// 文件操作相关的类型定义
export interface FileResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FileInfo {
  path: string;
  size: number;
  modified: string;
  isFile: boolean;
  isDirectory: boolean;
}

export interface DirectoryEntry {
  name: string;
  isFile: boolean;
  isDirectory: boolean;
}

// 文件存在性检查
export async function fileExists(path: string): Promise<FileResult<boolean>> {
  try {
    const result = await invoke<boolean>('file_exists', { path });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function fileDirExists(path: string): Promise<FileResult<boolean>> {
  try {
    const result = await invoke<boolean>('file_dir_exists', { path });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// 文件读取操作
export async function fileRead(path: string): Promise<FileResult<string>> {
  try {
    const result = await invoke<string>('file_read', { path });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function fileReadBytes(path: string): Promise<FileResult<Uint8Array>> {
  try {
    const result = await invoke<Uint8Array>('file_read_bytes', { path });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// 文件写入操作
export async function fileWrite(path: string, content: string): Promise<FileResult<void>> {
  try {
    await invoke<void>('file_write', { path, content });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function fileWriteBytes(path: string, content: Uint8Array): Promise<FileResult<void>> {
  try {
    await invoke<void>('file_write_bytes', { path, content });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function fileAppend(path: string, content: string): Promise<FileResult<void>> {
  try {
    await invoke<void>('file_append', { path, content });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// 目录操作
export async function fileCreateDir(path: string): Promise<FileResult<void>> {
  try {
    await invoke<void>('file_create_dir', { path });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function fileDelete(path: string): Promise<FileResult<void>> {
  try {
    await invoke<void>('file_delete', { path });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function fileCopy(from: string, to: string): Promise<FileResult<number>> {
  try {
    const result = await invoke<number>('file_copy', { from, to });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function fileMove(from: string, to: string): Promise<FileResult<void>> {
  try {
    await invoke<void>('file_move', { from, to });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// 文件信息操作
export async function fileSize(path: string): Promise<FileResult<number>> {
  try {
    const result = await invoke<number>('file_size', { path });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function fileModified(path: string): Promise<FileResult<string>> {
  try {
    const result = await invoke<string>('file_modified', { path });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function fileListDir(path: string): Promise<FileResult<string[]>> {
  try {
    const result = await invoke<string[]>('file_list_dir', { path });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// JSON 操作
export async function fileReadJson<T = any>(path: string): Promise<FileResult<T>> {
  try {
    const result = await invoke<T>('file_read_json', { path });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function fileWriteJson<T = any>(path: string, data: T): Promise<FileResult<void>> {
  try {
    await invoke<void>('file_write_json', { path, data });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// 实用工具函数
export async function ensureDir(path: string): Promise<FileResult<void>> {
  const dirExistsResult = await fileDirExists(path);
  if (!dirExistsResult.success) {
    return { success: false, error: dirExistsResult.error };
  }
  
  if (!dirExistsResult.data) {
    return await fileCreateDir(path);
  }
  
  return { success: true };
}

export async function readJsonFile<T = any>(path: string, defaultValue: T): Promise<FileResult<T>> {
  const result = await fileReadJson<T>(path);
  if (!result.success) {
    // 如果文件不存在或读取失败，返回默认值
    if (result.error?.includes('No such file') || result.error?.includes('读取 JSON 文件失败')) {
      return { success: true, data: defaultValue };
    }
    return result;
  }
  return result;
}

export async function writeJsonFile<T = any>(path: string, data: T): Promise<FileResult<void>> {
  const dirPath = path.substring(0, path.lastIndexOf('/'));
  if (dirPath) {
    const dirResult = await ensureDir(dirPath);
    if (!dirResult.success) {
      return dirResult;
    }
  }
  
  return await fileWriteJson(path, data);
}