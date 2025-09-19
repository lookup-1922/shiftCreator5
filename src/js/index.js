const { invoke } = window.__TAURI__.core;
const { load } = window.__TAURI__.store;

import { saveCsv, loadCsv, loadFromStore, tableToArray, arrayToTable, } from "./main.js";

let greetInputEl;
let greetMsgEl;

async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}

window.addEventListener("DOMContentLoaded", () => {
    greetInputEl = document.querySelector("#greet-input");
    greetMsgEl = document.querySelector("#greet-msg");
    document.querySelector("#greet-form").addEventListener("submit", (e) => {
        e.preventDefault();
        greet();
    });
});

$(function () {
    const actions = {
        deleteStore: () => {
            if (window.confirm("内部に保存されているデータが削除されます。よろしいですか?")) {
                const store = load("store.json", { autoSave: false });
                store.reset();
            }
        },
        saveCsv: () => {
            alert("未実装の機能です。");
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
