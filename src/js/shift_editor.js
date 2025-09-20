import { saveCsv, loadCsv, saveToStore, loadFromStore, tableToArray, arrayToTable, tableCommands } from "./main.js";

$(function () {
    const actions = {
        caluculateShift: () => {
        },
        deleteShift: () => {
        },
        saveCsv: () => {
            const shiftArray = tableToArray("#shift_editor_table");
            saveCsv(shiftArray, "shift_editor_table.csv");
        },
        loadCsv: async () => {
            const shiftArray = await loadCsv();
            arrayToTable(shiftArray, "#shift_editor_table");
            saveToStore("#shift_editor_table");
        },
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
syncWithStore("#shift_editor_table");