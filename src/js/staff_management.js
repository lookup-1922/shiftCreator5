const { invoke } = window.__TAURI__.core;
const { open, save, message } = window.__TAURI__.dialog;
const { load } = window.__TAURI__.store;

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

// CSVとして保存する
async function saveCsv(staff) {
    const filePath = await save({
        filters: [
            {
                name: "My Filter",
                extensions: ["csv"],
            },
        ],
    });
    if (filePath) {
        await invoke("save_csv", { data: staff, path: filePath });
        alert("保存しました");
    }
}

// CSVを読み込む
async function loadCsv() {
    const filePath = await open({
        multiple: false,
        directory: false,
    });
    if (filePath) {
        const staff = await invoke("load_csv", { path: filePath });
        console.log("Loaded staff:", staff);
        return staff;
    }
}

// Storeに保存する
async function autoStore(tableId) {
    const store = await load("store.json", { autoSave: false });
    const staffArray = tableToArray(tableId);
    await store.set(tableId, staffArray);
    await store.save();
}

// Storeから読み出す
async function loadFromStore(tableId) {
    const store = await load("store.json", { autoSave: false });
    const staffArray = await store.get(tableId) || [];
    arrayToTable(staffArray, tableId);
}

// 表から2次元配列に変換する
function tableToArray(tableId) {
    const table = $(tableId);
    const data = [];

    table.find("tr").slice(0).each(function () {
        const cells = $(this).find("td");

        // 行を配列として作成
        const row = [
            $(cells[0]).text().trim(), // id
            $(cells[1]).text().trim(), // name
            $(cells[2]).text().trim(), // attributes
            $(cells[3]).text().trim()  // roles
        ];

        data.push(row);
    });

    return data;
}

// 2次元配列から表に変換する
function arrayToTable(array, tableId) {
    const table = $(tableId);
    table.find("tr:gt(0)").remove(); // ヘッダー行以外を削除

    // データを行ごとに追加
    array.slice(1).forEach(rowArray => {
        const row = $("<tr>");
        rowArray.forEach(cell => {
            row.append($("<td>").attr("contenteditable", "true").text(cell));
        });
        table.append(row);
    });
}

function addRowToTable(tableId, rowData) {
    const table = $(tableId);
    const row = $("<tr>");

    rowData.forEach(cell => {
        row.append($("<td>").attr("contenteditable", "true").text(cell));
    });

    table.append(row);
}

function deleteRowById(tableId, id) {
    const table = $(tableId);
    let deleted = false;

    table.find("tr").each(function (index) {
        // 最初の列(ID列)をチェック
        const cellText = $(this).find("td").eq(0).text().trim();
        if (cellText === id) {
            $(this).remove();
            deleted = true;
            return false; // break
        }
    });

    if (!deleted) {
        console.warn(`ID ${id} の行は見つかりませんでした`);
    }
}
