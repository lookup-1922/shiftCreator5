const { load } = window.__TAURI__.store;

import { saveCsv, loadCsv, } from "./main.js";

$(function () {
    const actions = {
        saveCsv: () => {
            const settingArray = settingToArray();
            saveCsv(settingArray, "setting.csv");
        },
        loadCsv: async () => {
            const settingArray = loadCsv();
            arrayToSetting(settingArray);
            saveSetting();
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

function settingToArray() {
    const allowMultipleShiftsPerDay = $("#allowMultipleShiftsPerDay").is(":checked");
    const dailyTimeLimit = parseInt($("#dailyTimeLimit").val(), 10) || 0;
    const consecutiveDayLimit = parseInt($("#consecutiveDayLimit").val(), 10) || 0;
    const preferredMeaning = $("input[name='preferred_working_hours']:checked").val();

    // 配列形式に変換
    return [
        ["allowMultipleShiftsPerDay", allowMultipleShiftsPerDay],
        ["dailyTimeLimit", dailyTimeLimit],
        ["consecutiveDayLimit", consecutiveDayLimit],
        ["preferIsAvailable", preferredMeaning === "available"]
    ];
}

function arrayToSetting(array) {
    const map = Object.fromEntries(array);

    $("#allowMultipleShiftsPerDay").prop("checked", !!map.allowMultipleShiftsPerDay);
    $("#dailyTimeLimit").val(map.dailyTimeLimit || 0);
    $("#consecutiveDayLimit").val(map.consecutiveDayLimit || 0);

    if (map.preferIsAvailable) {
        $("input[name='preferred_working_hours'][value='available']").prop("checked", true);
    } else {
        $("input[name='preferred_working_hours'][value='unavailable']").prop("checked", true);
    }
}

async function saveSetting() {
    const store = await load("store.json", { autoSave: false });
    const settingArray = settingToArray();
    await store.set("setting", settingArray);
    await store.save();
}

async function loadSetting() {
    const store = await load("store.json", { autoSave: false });
    const settingArray = await store.get("setting") || [];
    arrayToSetting(settingArray);
}

$(document).ready(function () {
    loadSetting();
    saveSetting();
});

$("#allowMultipleShiftsPerDay, #dailyTimeLimit, #consecutiveDayLimit, input[name=preferredMeaning]").on("change input", function () {
    saveSetting();
});
