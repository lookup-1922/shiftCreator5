const { load } = window.__TAURI__.store;

import { saveCsv, loadCsv, saveToStore, tableToArray, arrayToTable, syncWithStore } from "./main.js";

$(function () {
    const actions = {
        caluculateShift: () => {
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
                    // 純粋な人数 (誰でもOK) → 無視
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
