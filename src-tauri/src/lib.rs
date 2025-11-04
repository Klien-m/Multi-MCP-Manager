mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      };
      
      // 注册文件系统插件
      app.handle().plugin(
        tauri_plugin_fs::init(),
      )?;
      
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      // 文件存在性检查
      commands::file_commands::file_exists,
      commands::file_commands::file_dir_exists,
      // 文件读取
      commands::file_commands::file_read,
      commands::file_commands::file_read_bytes,
      // 文件写入
      commands::file_commands::file_write,
      commands::file_commands::file_write_bytes,
      commands::file_commands::file_append,
      // 目录操作
      commands::file_commands::file_create_dir,
      commands::file_commands::file_delete,
      commands::file_commands::file_copy,
      commands::file_commands::file_move,
      // 文件信息
      commands::file_commands::file_size,
      commands::file_commands::file_modified,
      commands::file_commands::file_list_dir,
      // JSON 操作
      commands::file_commands::file_read_json,
      commands::file_commands::file_write_json,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

