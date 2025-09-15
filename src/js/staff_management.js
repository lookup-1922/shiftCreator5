const { invoke } = window.__TAURI__.core;
const { open, save, message } = window.__TAURI__.dialog;
const { load } = window.__TAURI__.store;

import { saveCsv, loadCsv, autoStore, loadFromStore, tableToArray, arrayToTable, addRowToTable, deleteRowById } from "./main.js";

$(function () {
    const actions = {
        addRow: () => {
            let rowData = ["", "", "", ""];
            addRowToTable("#staff_management_table", rowData);
        },
        deleteRow: () => {
            let id = prompt("削除する行のIDを入力してください");
            deleteRowById("#staff_management_table", id);
        },
        saveCsv: () => {
            const staffArray = tableToArray("#staff_management_table");
            saveCsv(staffArray);
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

// セルからフォーカスが外れたときの自動保存
$(document).on("blur", "#staff_management_table td[contenteditable]", function () {
    autoStore("#staff_management_table");
});

$(document).ready(function () {
    loadFromStore("#staff_management_table");
});

