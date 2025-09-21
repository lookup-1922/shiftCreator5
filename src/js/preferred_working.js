const { load } = window.__TAURI__.store;

import { saveCsv, loadCsv, saveToStore, tableToArray, arrayToTable, tableCommands, syncWithStore, addRowToTable } from "./main.js";

$(function () {
    const actions = {
        readForm: () => {
            alert("未実装の機能です。");
        },
        addRow: () => {
            let rowData = ["", "", "", "", ""];
            addRowToTable("#preferred_working_table", rowData);
        },
        saveCsv: () => {
            const preferArray = tableToArray("#preferred_working_table");
            saveCsv(preferArray, "preferred_working_table.csv");
        },
        loadCsv: async () => {
            const preferArray = await loadCsv();
            arrayToTable(preferArray, "#preferred_working_table");
            saveToStore("#preferred_working_table");
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

$(document).ready(async function () {
    const store = await load("store.json", { autoSave: false });
    const scheduleArray = await store.get("#schedule_table") || [];

    let text = "";

    for (let i = 1; i < scheduleArray.length; i++) {
        const row = scheduleArray[i];
        const date = row[0];
        const time = row[1];
        const label = `${date}_${time}`;
        const value = `${date}_${time}`;

        text += `
            <label>
                <input type="checkbox" name="preferred_working" value="${value}">
                ${label}
            </label><br>
        `;
    }

    $("#preferred_working_checkbox").html(text);
});

$("#staffId").on("change", async function () {
    const staffID = $("#staffId").val();
    const store = await load("store.json", { autoSave: false });
    const staffArray = await store.get("#staff_management_table") || [];
    const match = staffArray.slice(1).find(row => row[0].trim() == staffID.trim());
    if (match) {
        $("#staffName").text(match[1]);
    } else {
        $("#staffName").text("?");
    }
});

$("#register").on("click", function () {
    const staffID = $("#staffId").val().trim();
    const staffName = $("#staffName").text().trim();
    const timeLimit = $("#timeLimit").val().trim();
    const dayLimit = $("#dayLimit").val().trim();

    // チェックされた希望日を配列にする
    const preferredDays = [];
    $("input[name='preferred_working']:checked").each(function () {
        preferredDays.push($(this).val());
    });

    // カンマ区切りの文字列に
    const preferredDaysStr = preferredDays.join(", ");

    // 表の最後に追加
    const newRow = `
        <tr>
            <td contenteditable="true">${staffID}</td>
            <td contenteditable="true">${staffName}</td>
            <td contenteditable="true">${preferredDaysStr}</td>
            <td contenteditable="true">${timeLimit}</td>
            <td contenteditable="true">${dayLimit}</td>
        </tr>
    `;
    $("#preferred_working_table").append(newRow);

    // 入力フォームをリセット（必要なら）
    $("#staffId").val("");
    $("#staffName").text("名前");
    $("input[name='preferred_working']").prop("checked", false);
    $("#dayLimit").val("");
    $("#timeLimit").val("");
    saveToStore("#preferred_working_table");
});
