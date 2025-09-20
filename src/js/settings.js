import { saveCsv, loadCsv, saveToStore, loadFromStore, } from "./main.js";

$(function () {
    const actions = {
        saveCsv: () => {
        },
        loadCsv: async () => {
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
