const { invoke } = window.__TAURI__.core;

import { saveCsv, loadCsv, saveToStore, tableToArray, arrayToTable, tableCommands, syncWithStore, addRowToTable } from "./main.js";

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
                saveToStore("#schedule_table");
            } else if (await window.confirm("読み込むデータ：時間設定\nよろしいですか?")) {
                const timeArray = await loadCsv();
                arrayToTable(timeArray, "#time_setting_table");
                saveToStore("#time_setting_table");
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

// スケジュールを作成
$("#newSchedule").on("click", async function () {
    const timeArray = tableToArray("#time_setting_table");
    const startDate = $("#startDate").val();
    const endDate = $("#endDate").val();

    if (timeArray[1][0] == "" | timeArray[1][1] == "" | timeArray[1][2] == "") {
        alert("時間を設定してください。");
    } else if (startDate == "" | endDate == "" | startDate > endDate) {
        alert("開始日, 終了日を正しく設定してください。");
    } else if (await confirm("現在のスケジュールは全て削除されます。\nよろしいですか?")) {
        let scheduleArray = [["日付", "時間", "人数"]];

        let current = new Date(startDate);
        let end = new Date(endDate);

        const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

        while (current <= end) {
            const m = current.getMonth() + 1;
            const d = current.getDate();
            const dayOfWeek = weekDays[current.getDay()];
            const dateStr = `${m}/${d} (${dayOfWeek})`;

            for (let i = 1; i < timeArray.length; i++) {
                const timeName = timeArray[i][0];
                scheduleArray.push([dateStr, timeName, ""]);
            }
            current.setDate(current.getDate() + 1);
        }
        arrayToTable(scheduleArray, "#schedule_table");
        saveToStore("#schedule_table");
    }
});
