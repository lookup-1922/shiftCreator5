use csv::{ReaderBuilder, WriterBuilder};
use std::fs::File;
use std::io::Write;

// ビルダー関数
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet, save_csv, load_csv,])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn save_csv(data: Vec<Vec<String>>, path: String) -> Result<(), String> {
    let mut file = File::create(path).map_err(|e| e.to_string())?;

    // BOMを書き込む
    file.write_all(b"\xEF\xBB\xBF").map_err(|e| e.to_string())?;

    let mut wtr = WriterBuilder::new().has_headers(true).from_writer(file);

    for row in data {
        wtr.write_record(&row).map_err(|e| e.to_string())?;
    }

    wtr.flush().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_csv(path: String) -> Result<Vec<Vec<String>>, String> {
    let file = File::open(&path).map_err(|e| e.to_string())?;
    let mut rdr = ReaderBuilder::new().has_headers(false).from_reader(file);

    let mut result = Vec::new();
    for record in rdr.records() {
        let record = record.map_err(|e| e.to_string())?;
        result.push(record.iter().map(|s| s.to_string()).collect());
    }

    Ok(result)
}
