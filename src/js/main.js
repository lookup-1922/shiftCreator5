const { invoke } = window.__TAURI__.core;
const { open, save, message } = window.__TAURI__.dialog;
const { load } = window.__TAURI__.store;

// タブボタンでページ遷移
$(function () {
    $(".tab-menu button").on("click", function () {
        const page = $(this).data("page");
        if (page) {
            window.location.href = page;
        }
    });
});

// CSVとして保存する
export async function saveCsv(array) {
    const path = await save({
        filters: [
            {
                name: "File",
                extensions: ["csv"],
            },
        ],
    });
    if (path) {
        await invoke("save_csv", { data: array, path: path });
        alert("保存しました");
    }
}

// CSVを読み込む
export async function loadCsv() {
    const path = await open({
        multiple: false,
        directory: false,
    });
    if (path) {
        const array = await invoke("load_csv", { path: path });
        return array;
    }
}

// tableをStoreに保存する
export async function autoStore(tableId) {
    const store = await load("store.json", { autoSave: false });
    const array = tableToArray(tableId);
    await store.set(tableId, array);
    await store.save();
}

// Storeから読み出す
export async function loadFromStore(tableId) {
    const store = await load("store.json", { autoSave: false });
    const array = await store.get(tableId) || [];
    arrayToTable(array, tableId);
}

// 表から2次元配列に変換する
export function tableToArray(tableId) {
    const table = $(tableId);
    const data = [];

    table.find("tr").each(function () {
        const cells = $(this).find("th, td");
        const row = [];

        cells.each(function () {
            row.push($(this).text().trim());
        });

        data.push(row);
    });

    return data;
}

// 2次元配列から表に変換する
export function arrayToTable(array, tableId) {
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

export function addRowToTable(tableId, rowData) {
    const table = $(tableId);
    const row = $("<tr>");

    rowData.forEach(cell => {
        row.append($("<td>").attr("contenteditable", "true").text(cell));
    });

    table.append(row);
}

export function deleteRowById(tableId, id) {
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
        console.log(`ID ${id} の行は見つかりませんでした`);
    }
}
