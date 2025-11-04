use std::io::Write;

// 文件存在性检查命令
#[tauri::command]
pub fn file_exists(path: String) -> Result<bool, String> {
  match std::path::Path::new(&path).exists() {
    true => Ok(true),
    false => Ok(false),
  }
}

#[tauri::command]
pub fn file_dir_exists(path: String) -> Result<bool, String> {
  match std::path::Path::new(&path).exists() {
    true => Ok(std::path::Path::new(&path).is_dir()),
    false => Ok(false),
  }
}

// 文件读取命令
#[tauri::command]
pub fn file_read(path: String) -> Result<String, String> {
  std::fs::read_to_string(&path)
    .map_err(|e| format!("读取文件失败: {}", e))
}

#[tauri::command]
pub fn file_read_bytes(path: String) -> Result<Vec<u8>, String> {
  std::fs::read(&path)
    .map_err(|e| format!("读取文件失败: {}", e))
}

// 文件写入命令
#[tauri::command]
pub fn file_write(path: String, content: String) -> Result<(), String> {
  std::fs::write(&path, content)
    .map_err(|e| format!("写入文件失败: {}", e))
}

#[tauri::command]
pub fn file_write_bytes(path: String, content: Vec<u8>) -> Result<(), String> {
  std::fs::write(&path, content)
    .map_err(|e| format!("写入文件失败: {}", e))
}

#[tauri::command]
pub fn file_append(path: String, content: String) -> Result<(), String> {
  let mut file = std::fs::OpenOptions::new()
    .create(true)
    .append(true)
    .open(&path)
    .map_err(|e| format!("打开文件失败: {}", e))?;
  file.write_all(content.as_bytes())
    .map_err(|e| format!("追加文件失败: {}", e))
}

// 目录操作命令
#[tauri::command]
pub fn file_create_dir(path: String) -> Result<(), String> {
  if !std::path::Path::new(&path).exists() {
    std::fs::create_dir_all(&path)
      .map_err(|e| format!("创建目录失败: {}", e))
  } else {
    Ok(())
  }
}

#[tauri::command]
pub fn file_delete(path: String) -> Result<(), String> {
  if std::path::Path::new(&path).exists() {
    std::fs::remove_file(&path)
      .map_err(|e| format!("删除文件失败: {}", e))
  } else {
    Ok(())
  }
}

#[tauri::command]
pub fn file_copy(from: String, to: String) -> Result<u64, String> {
  std::fs::copy(&from, &to)
    .map_err(|e| format!("复制文件失败: {}", e))
}

#[tauri::command]
pub fn file_move(from: String, to: String) -> Result<(), String> {
  std::fs::rename(&from, &to)
    .map_err(|e| format!("移动文件失败: {}", e))
}

// 文件信息命令
#[tauri::command]
pub fn file_size(path: String) -> Result<u64, String> {
  let metadata = std::fs::metadata(&path)
    .map_err(|e| format!("获取文件元数据失败: {}", e))?;
  Ok(metadata.len())
}

#[tauri::command]
pub fn file_modified(path: String) -> Result<String, String> {
  let metadata = std::fs::metadata(&path)
    .map_err(|e| format!("获取文件元数据失败: {}", e))?;
  let modified = metadata.modified()
    .map_err(|e| format!("获取修改时间失败: {}", e))?;
  Ok(format!("{:?}", modified))
}

#[tauri::command]
pub fn file_list_dir(path: String) -> Result<Vec<String>, String> {
  let entries = std::fs::read_dir(&path)
    .map_err(|e| format!("读取目录失败: {}", e))?;
  let mut names = Vec::new();
  
  for entry in entries {
    let entry = entry.map_err(|e| format!("读取目录项失败: {}", e))?;
    if let Some(name) = entry.file_name().to_str() {
      names.push(name.to_string());
    }
  }
  
  Ok(names)
}

// JSON 操作命令
#[tauri::command]
pub fn file_read_json(path: String) -> Result<serde_json::Value, String> {
  let content = std::fs::read_to_string(&path)
    .map_err(|e| format!("读取 JSON 文件失败: {}", e))?;
  let data: serde_json::Value = serde_json::from_str(&content)
    .map_err(|e| format!("解析 JSON 失败: {}", e))?;
  Ok(data)
}

#[tauri::command]
pub fn file_write_json(path: String, data: serde_json::Value) -> Result<(), String> {
  let content = serde_json::to_string_pretty(&data)
    .map_err(|e| format!("序列化 JSON 失败: {}", e))?;
  std::fs::write(&path, content)
    .map_err(|e| format!("写入 JSON 文件失败: {}", e))?;
  Ok(())
}