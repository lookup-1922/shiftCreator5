const { invoke } = window.__TAURI__.core;

import { saveCsv, loadCsv, tableToArray, arrayToTable, tableCommands, syncWithStore, addRowToTable } from "./main.js";

$(function () {
    const actions = {
        formSupport: () => {
            alert("未実装の機能です");
        },
        addRow: () => {
            let rowData = ["", "", "", ""];
            addRowToTable("#schedule_table", rowData);
            rowData = ["", "", "",];
            addRowToTable("#time_setting_table", rowData);
        },
        saveCsv: async () => {
            if (await window.confirm("保存するデータ：スケジュール\nよろしいですか?")) {
                const scheduleArray = tableToArray("#schedule_table");
                saveCsv(scheduleArray, "schedule_table.csv");
            } else if (await window.confirm("保存するデータ：時間設定\nよろしいですか?")) {
                const timeArray = tableToArray("#time_setting_table");
                saveCsv(timeArray, "time_setting_table.csv");
            }
        },
        loadCsv: async () => {
            if (await window.confirm("読み込むデータ：スケジュール\nよろしいですか?")) {
                const scheduleArray = await loadCsv();
                arrayToTable(scheduleArray, "#schedule_table");
            } else if (await window.confirm("読み込むデータ：時間設定\nよろしいですか?")) {
                const timeArray = await loadCsv();
                arrayToTable(timeArray, "#time_setting_table");
            }
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
syncWithStore("#schedule_table");
syncWithStore("#time_setting_table");

// tableでコマンドを使えるようにする関数
tableCommands("#schedule_table");
tableCommands("#time_setting_table");
