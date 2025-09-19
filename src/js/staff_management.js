const { invoke } = window.__TAURI__.core;

import { saveCsv, loadCsv, tableToArray, arrayToTable, tableCommands, syncWithStore, addRowToTable } from "./main.js";

$(function () {
    const actions = {
        addRow: () => {
            let rowData = ["", "", ""];
            addRowToTable("#shift_editor_table", rowData);
        },
        saveCsv: () => {
            const shiftArray = tableToArray("#shift_editor_table");
            saveCsv(shiftArray, "shift_editor_table.csv");
        },
        loadCsv: async () => {
            const shiftArray = await loadCsv();
            arrayToTable(shiftArray, "#shift_editor_table");
        }
    };

    $("#action-select").on("change", function () {
        const action = $(this).val();
        if (actions[action]) {
            actions[action]();   // 処理実行
            $(this).val("");    // 初期状態に戻す
        }
    });
});

// Storeとデータを同期する関数
syncWithStore("#staff_management_table");

// tableでコマンドを使えるようにする関数
tableCommands("#staff_management_table");
