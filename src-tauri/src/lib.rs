use serde::{Deserialize, Serialize};

// ビルダー関数
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet, save_json, load_json,])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[derive(Serialize, Deserialize)]
struct Staff {
    id: String,
    name: String,
    attributes: String,
    roles: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn save_json(staff: Vec<Staff>, path: String) -> Result<(), String> {
    let json = serde_json::to_string_pretty(&staff).map_err(|e| e.to_string())?;
    std::fs::write(path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_json(path: String) -> Result<Vec<Staff>, String> {
    let data = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let staff: Vec<Staff> = serde_json::from_str(&data).map_err(|e| e.to_string())?;
    Ok(staff)
}
