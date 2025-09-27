const { load } = window.__TAURI__.store;
const { invoke } = window.__TAURI__.core;

import { saveCsv, loadCsv, saveToStore, tableToArray, arrayToTable, syncWithStore } from "./main.js";

$(function () {
    const actions = {
        caluculateShift: () => {
            prepareAndGenerateShifts();
        },
        reflectSchedule: async () => {
            await reflectSchedule();
            saveToStore("#shift_editor_table");
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

async function reflectSchedule() {
    const store = await load("store.json", { autoSave: false });
    const scheduleArray = await store.get("#schedule_table") || [];

    const $table = $("#shift_editor_table");
    $table.empty();

    // ヘッダー
    $table.append(`
        <tr>
            <td>日付</td>
            <td>時間</td>
            <td>スタッフID</td>
        </tr>
    `);

    scheduleArray.slice(1).forEach(([date, time, roles]) => {
        let roleList = [];

        if (roles) {
            roles.split(",").map(r => r.trim()).forEach(r => {
                // 「管理者_1」「補佐_2」みたいなパターン
                const match = r.match(/^(.+?)_(\d+)$/);
                if (match) {
                    const roleName = match[1] + "_";
                    const count = parseInt(match[2], 10);
                    // 指定回数だけ繰り返し入れる
                    for (let i = 0; i < count; i++) {
                        roleList.push(roleName);
                    }
                } else if (/^\d+$/.test(r)) {
                    // 純粋な人数 (誰でもOK)
                    const count = parseInt(r, 10);
                    for (let i = 0; i < count; i++) {
                        roleList.push("Any_");
                    }
                } else {
                    // それ以外（直接指定されたIDなど?）はそのまま
                    roleList.push(r);
                }
            });
        }

        $table.append(`
            <tr>
                <td>${date}</td>
                <td>${time}</td>
                <td contenteditable="true">${roleList.join(", ")}</td>
            </tr>
        `);
    });
}

async function prepareAndGenerateShifts() {
    const store = await load("store.json", { autoSave: false });
    const staffArray = await store.get("#staff_management_table") || [];
    const scheduleArray = await store.get("#schedule_table") || [];
    const timeArray = await store.get("#time_setting_table") || [];
    const preferArray = await store.get("#preferred_working_table") || [];
    const shiftArray = await store.get("#shift_editor_table") || [];
    const settingArray = await store.get("setting") || [];

    // staffArray：[ID, 名前, 役割]
    // preferArray：[ID, 名前, 希望日, 時間制限, 日数制限]
    const staffRelatedArray = staffArray.map(([staffId, name, role]) => {
        const pref = preferArray.find(p => p[0] === staffId) || [staffId, name, "", "", ""];
        return [
            staffId,
            name,
            role,
            pref[2], // 希望日
            pref[3], // 時間制限
            pref[4], // 日数制限
        ];
    });

    // scheduleRelatedArray：[日付, 時間, 開始, 終了, 人数]
    const scheduleRelatedArray = scheduleArray.map(([date, time, num]) => {
        const t = timeArray.find(tt => tt[0] === time) || [time, "0", "0"];
        return [date, time, t[1], t[2], num];
    });

    let resultShiftArray = generate_shifts_kari(
        staffRelatedArray,
        shiftArray,
        scheduleRelatedArray,
        settingArray,
    );

    console.log("result:" + resultShiftArray);

    await arrayToTable(resultShiftArray, "#shift_editor_table");
    await store.set("#shift_editor_table", resultShiftArray);
}

function generate_shifts_kari(
    staffRelatedArray,
    shiftArray,
    scheduleRelatedArray,
    settingArray) {
    alert("シフトサクセイカッコカリ を実行します。\n\n== 人数の部分はintで入力してください\n== 設定項目は希望の部分のみ反映されます\n== shiftCreator2と同等のアルゴリズムです");
    // デモ用にshiftCreator2と同等のアルゴリズムで実行する。
    // 設定は希望の部分だけを読み込む。

    console.log(staffRelatedArray);
    console.log(shiftArray);
    console.log(scheduleRelatedArray);
    console.log(settingArray);

    let hopeIsAvailable = settingArray[3][1];

    for (let i = 1; i < shiftArray.length; i++) {
        shiftArray[i][0] = scheduleRelatedArray[i][0];
        shiftArray[i][1] = scheduleRelatedArray[i][1];
        shiftArray[i][2] = [];
    }

    for (let i = 1; i < staffRelatedArray.length; i++) {
        let hopeArray = staffRelatedArray[i][3]
            .split(',')
            .map(s => s.trim())
            .filter(s => s !== "");
        staffRelatedArray[i][3] = hopeArray;
    }

    for (let i = 1; i < scheduleRelatedArray.length; i++) {
        scheduleRelatedArray[i][0] = scheduleRelatedArray[i][0] + "_" + scheduleRelatedArray[i][1];
    }

    function getMinMaxByColumn(data, columnName) {
        const header = data[0];
        const colIndex = header.indexOf(columnName);
        if (colIndex === -1) {
            throw new Error("列が見つかりません: " + columnName);
        }

        // 空文字は "0" に置換 → 数値化
        const values = data.slice(1).map(row => {
            const raw = row[colIndex] === "" ? "0" : row[colIndex];
            return parseInt(raw, 10);
        });

        const min = Math.min(...values);
        const max = Math.max(...values);

        return { min, max };
    }

    for (let shiftNum = 1; shiftNum < shiftArray.length; shiftNum++) {
        let shiftName = scheduleRelatedArray[shiftNum][0];
        let shiftStaffNumRequire = scheduleRelatedArray[shiftNum][4] === ""
            ? 0
            : parseInt(scheduleRelatedArray[shiftNum][4], 10);

        while (shiftStaffNumRequire > 0) {
            let attendanceCountMinMax = getMinMaxByColumn(staffRelatedArray, "時間制限");
            let attendanceCountMin = attendanceCountMinMax.min;
            let attendanceCountMax = attendanceCountMinMax.max;
            let assigned = false;

            for (let attendanceCount = attendanceCountMin; attendanceCount <= attendanceCountMax; attendanceCount++) {
                for (let staffNum = 1; staffNum < staffRelatedArray.length; staffNum++) {
                    if (hopeIsAvailable) {
                        if (staffRelatedArray[staffNum][4] == attendanceCount &&
                            staffRelatedArray[staffNum][3].includes(shiftName)) {
                            shiftArray[shiftNum][2].push(staffRelatedArray[staffNum][0]);
                            staffRelatedArray[staffNum][3] =
                                staffRelatedArray[staffNum][3].filter(item => item != shiftName);
                            staffRelatedArray[staffNum][4] =
                                staffRelatedArray[staffNum][4] + 1;
                            assigned = true;
                            break;
                        }
                    } else {
                        if (staffRelatedArray[staffNum][4] == attendanceCount &&
                            !staffRelatedArray[staffNum][3].includes(shiftName)) {
                            shiftArray[shiftNum][2].push(staffRelatedArray[staffNum][0]);
                            staffRelatedArray[staffNum][3].push(shiftName);
                            staffRelatedArray[staffNum][4] =
                                staffRelatedArray[staffNum][4] + 1;
                            assigned = true;
                            break;
                        }
                    }
                }
                if (assigned) break;
            }

            if (!assigned) {
                shiftArray[shiftNum][2].push("none");
            }

            shiftStaffNumRequire--;
        }
    }

    return shiftArray;
}
