#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler[
            scan_local_tools,
            get_user_home_dir,
            read_file_content,
            check_file_exists
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Tauri 命令：获取用户主目录
#[tauri::command]
fn get_user_home_dir() -> Result<String, String> {
    match std::env::var("HOME") {
        Ok(home) => Ok(home),
        Err(_) => Err("无法获取用户主目录".to_string())
    }
}

// Tauri 命令：检查文件是否存在
#[tauri::command]
async fn check_file_exists(path: String) -> Result<bool, String> {
    use std::path::Path;
    
    let resolved_path = resolve_path(&path);
    
    match tokio::fs::metadata(&resolved_path).await {
        Ok(metadata) => Ok(metadata.is_file()),
        Err(e) => {
            if e.kind() == std::io::ErrorKind::NotFound {
                Ok(false)
            } else {
                Err(format!("检查文件时发生错误: {}", e))
            }
        }
    }
}

// Tauri 命令：读取文件内容
#[tauri::command]
async fn read_file_content(path: String) -> Result<String, String> {
    use std::path::Path;
    
    let resolved_path = resolve_path(&path);
    
    match tokio::fs::read_to_string(&resolved_path).await {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("读取文件时发生错误: {}", e))
    }
}

// Tauri 命令：扫描本地AI工具
#[tauri::command]
async fn scan_local_tools() -> Result<Vec<ScanResult>, String> {
    use serde_json::json;
    
    // TODO: 实现实际的扫描逻辑
    // 这里返回模拟数据作为占位符
    let mock_results = vec![
        json!({
            "toolId": "cursor",
            "toolName": "Cursor",
            "foundConfigs": [],
            "scanStatus": "success"
        })
    ];
    
    Ok(mock_results)
}

// 辅助函数：解析路径（处理 ~ 符号）
fn resolve_path(path: &str) -> String {
    if path.starts_with("~/") {
        match std::env::var("HOME") {
            Ok(home) => format!("{}/{}", home, &path[2..]),
            Err(_) => path.to_string() // 如果无法获取HOME目录，返回原始路径
        }
    } else {
        path.to_string()
    }
}

// 扫描结果结构体
#[derive(serde::Serialize, serde::Deserialize)]
struct ScanResult {
    tool_id: String,
    tool_name: String,
    found_configs: Vec<FoundMcpConfig>,
    scan_status: String,
    error_message: Option<String>,
}

// 发现的MCP配置结构体
#[derive(serde::Serialize, serde::Deserialize)]
struct FoundMcpConfig {
    name: String,
    description: String,
    config: serde_json::Value,
    source_file: String,
    format: String,
    confidence: f64,
}
