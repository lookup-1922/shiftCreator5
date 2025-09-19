import { saveCsv, loadCsv, saveToStore, loadFromStore, tableToArray, arrayToTable, tableCommands, syncWithStore, addRowToTable } from "./main.js";

$(function () {
    const actions = {
        readForm: () => {
        },
        addRow: () => {
            let rowData = ["", "", "", ""];
            addRowToTable("#preferred_working_table", rowData);
        },
        saveCsv: () => {
            const preferArray = tableToArray("#preferred_working_table");
            saveCsv(preferArray, "preferred_working_table.csv");
        },
        loadCsv: async () => {
            const preferArray = await loadCsv();
            arrayToTable(preferArray, "#preferred_working_table");
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
syncWithStore("#preferred_working_table");

// tableでコマンドを使えるようにする関数
tableCommands("#preferred_working_table");
