use std::fs;
use std::io;
use std::path::Path;

/// 文件操作工具模块
/// 提供常用的文件读写和存在性判断功能
pub mod file_utils {
    use super::*;
    
    /// 获取用户主目录路径
    ///
    /// # Returns
    /// * `Option<String>` - 用户主目录路径，如果获取失败则返回 None
    pub fn get_user_home_dir() -> Option<String> {
        dirs::home_dir()
            .and_then(|path| path.to_str().map(|s| s.to_string()))
    }
    
    /// 检查文件是否存在
    /// 
    /// # Arguments
    /// * `path` - 文件路径
    /// 
    /// # Returns
    /// * `bool` - 文件是否存在
    pub fn file_exists<P: AsRef<Path>>(path: P) -> bool {
        path.as_ref().exists() && path.as_ref().is_file()
    }
    
    /// 检查目录是否存在
    /// 
    /// # Arguments
    /// * `path` - 目录路径
    /// 
    /// # Returns
    /// * `bool` - 目录是否存在
    pub fn dir_exists<P: AsRef<Path>>(path: P) -> bool {
        path.as_ref().exists() && path.as_ref().is_dir()
    }
    
    /// 读取文件内容为字符串
    /// 
    /// # Arguments
    /// * `path` - 文件路径
    /// 
    /// # Returns
    /// * `Result<String, io::Error>` - 文件内容或错误
    pub fn read_file<P: AsRef<Path>>(path: P) -> Result<String, io::Error> {
        fs::read_to_string(path)
    }
    
    /// 读取文件内容为字节数组
    /// 
    /// # Arguments
    /// * `path` - 文件路径
    /// 
    /// # Returns
    /// * `Result<Vec<u8>, io::Error>` - 文件内容或错误
    pub fn read_file_bytes<P: AsRef<Path>>(path: P) -> Result<Vec<u8>, io::Error> {
        fs::read(path)
    }
    
    /// 写入字符串到文件
    /// 
    /// # Arguments
    /// * `path` - 文件路径
    /// * `content` - 要写入的内容
    /// 
    /// # Returns
    /// * `Result<(), io::Error>` - 成功或错误
    pub fn write_file<P: AsRef<Path>>(path: P, content: &str) -> Result<(), io::Error> {
        fs::write(path, content)
    }
    
    /// 写入字节数组到文件
    /// 
    /// # Arguments
    /// * `path` - 文件路径
    /// * `content` - 要写入的字节数组
    /// 
    /// # Returns
    /// * `Result<(), io::Error>` - 成功或错误
    pub fn write_file_bytes<P: AsRef<Path>>(path: P, content: &[u8]) -> Result<(), io::Error> {
        fs::write(path, content)
    }
    
    /// 追加内容到文件
    /// 
    /// # Arguments
    /// * `path` - 文件路径
    /// * `content` - 要追加的内容
    /// 
    /// # Returns
    /// * `Result<(), io::Error>` - 成功或错误
    pub fn append_file<P: AsRef<Path>>(path: P, content: &str) -> Result<(), io::Error> {
        use std::io::Write;
        let mut file = fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(path)?;
        file.write_all(content.as_bytes())
    }
    
    /// 创建目录（如果不存在）
    /// 
    /// # Arguments
    /// * `path` - 目录路径
    /// 
    /// # Returns
    /// * `Result<(), io::Error>` - 成功或错误
    pub fn create_dir<P: AsRef<Path>>(path: P) -> Result<(), io::Error> {
        if !dir_exists(&path) {
            fs::create_dir_all(path)
        } else {
            Ok(())
        }
    }
    
    /// 删除文件
    /// 
    /// # Arguments
    /// * `path` - 文件路径
    /// 
    /// # Returns
    /// * `Result<(), io::Error>` - 成功或错误
    pub fn delete_file<P: AsRef<Path>>(path: P) -> Result<(), io::Error> {
        if file_exists(&path) {
            fs::remove_file(path)
        } else {
            Ok(())
        }
    }
    
    /// 复制文件
    /// 
    /// # Arguments
    /// * `from` - 源文件路径
    /// * `to` - 目标文件路径
    /// 
    /// # Returns
    /// * `Result<u64, io::Error>` - 复制的字节数或错误
    pub fn copy_file<P: AsRef<Path>>(from: P, to: P) -> Result<u64, io::Error> {
        fs::copy(from, to)
    }
    
    /// 移动文件
    /// 
    /// # Arguments
    /// * `from` - 源文件路径
    /// * `to` - 目标文件路径
    /// 
    /// # Returns
    /// * `Result<(), io::Error>` - 成功或错误
    pub fn move_file<P: AsRef<Path>>(from: P, to: P) -> Result<(), io::Error> {
        fs::rename(from, to)
    }
    
    /// 获取文件大小（字节）
    /// 
    /// # Arguments
    /// * `path` - 文件路径
    /// 
    /// # Returns
    /// * `Result<u64, io::Error>` - 文件大小或错误
    pub fn file_size<P: AsRef<Path>>(path: P) -> Result<u64, io::Error> {
        let metadata = fs::metadata(path)?;
        Ok(metadata.len())
    }
    
    /// 获取文件修改时间
    /// 
    /// # Arguments
    /// * `path` - 文件路径
    /// 
    /// # Returns
    /// * `Result<std::time::SystemTime, io::Error>` - 修改时间或错误
    pub fn file_modified<P: AsRef<Path>>(path: P) -> Result<std::time::SystemTime, io::Error> {
        let metadata = fs::metadata(path)?;
        metadata.modified()
    }
    
    /// 列出目录中的文件和子目录
    /// 
    /// # Arguments
    /// * `path` - 目录路径
    /// 
    /// # Returns
    /// * `Result<Vec<String>, io::Error>` - 文件和目录名列表或错误
    pub fn list_dir<P: AsRef<Path>>(path: P) -> Result<Vec<String>, io::Error> {
        let entries = fs::read_dir(path)?;
        let mut names = Vec::new();
        
        for entry in entries {
            let entry = entry?;
            if let Some(name) = entry.file_name().to_str() {
                names.push(name.to_string());
            }
        }
        
        Ok(names)
    }
}

/// JSON 文件操作工具
pub mod json_utils {
    use super::*;
    use serde::de::DeserializeOwned;
    use serde::Serialize;
    
    /// 读取 JSON 文件
    /// 
    /// # Arguments
    /// * `path` - JSON 文件路径
    /// 
    /// # Returns
    /// * `Result<T, Box<dyn std::error::Error>>` - 解析后的数据或错误
    pub fn read_json<P: AsRef<Path>, T: DeserializeOwned>(path: P) -> Result<T, Box<dyn std::error::Error>> {
        let content = super::file_utils::read_file(&path)?;
        let data: T = serde_json::from_str(&content)?;
        Ok(data)
    }
    
    /// 写入 JSON 文件
    /// 
    /// # Arguments
    /// * `path` - JSON 文件路径
    /// * `data` - 要序列化的数据
    /// 
    /// # Returns
    /// * `Result<(), Box<dyn std::error::Error>>` - 成功或错误
    pub fn write_json<P: AsRef<Path>, T: Serialize>(path: P, data: &T) -> Result<(), Box<dyn std::error::Error>> {
        let content = serde_json::to_string_pretty(data)?;
        super::file_utils::write_file(&path, &content)?;
        Ok(())
    }
}