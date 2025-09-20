const { invoke } = window.__TAURI__.core;

import { saveCsv, loadCsv, saveToStore, tableToArray, arrayToTable, tableCommands, syncWithStore, addRowToTable, } from "./main.js";

$(function () {
    const actions = {
        addRow: () => {
            let rowData = ["", "", ""];
            addRowToTable("#staff_management_table", rowData);
        },

        saveCsv: () => {
            const staffArray = tableToArray("#staff_management_table");
            saveCsv(staffArray, "staff_management_table.csv");
        },
        loadCsv: async () => {
            const staffArray = await loadCsv();
            arrayToTable(staffArray, "#staff_management_table");
            saveToStore("#staff_management_table");
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
