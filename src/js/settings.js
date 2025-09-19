import { saveCsv, loadCsv, saveToStore, loadFromStore, tableToArray, arrayToTable, tableCommands } from "./main.js";

$(function () {
    const actions = {
        saveCsv: () => {
            const staffArray = tableToArray("#staff_management_table");
            saveCsv(staffArray, "staff_management_table.csv");
        },
        loadCsv: async () => {
            const staffArray = await loadCsv();
            arrayToTable(staffArray, "#staff_management_table");
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