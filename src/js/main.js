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
export async function saveCsv(array, defaultPath) {
    const path = await save({
        defaultPath: defaultPath,
        filters: [
            {
                name: "CSV",
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
export async function saveToStore(tableId) {
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

// Tableのコマンド機能
export function tableCommands(tableId) {
    $(document).on("blur", `${tableId} td:first-child`, function () {
        const cell = $(this);

        let html = cell.html().replace(/<br\s*\/?>/gi, "\n");
        const lines = html.split(/\n/).map(s => s.trim());
        const row = cell.closest("tr");
        const colCount = row.find("td").length;

        function createEmptyRow() {
            const newRow = $("<tr>");
            for (let i = 0; i < colCount; i++) {
                newRow.append($("<td>").attr("contenteditable", "true"));
            }
            return newRow;
        }

        let command = null;
        for (const line of lines) {
            const lower = line.toLowerCase();
            if (lower === "/delete") command = "/delete";
            if (lower === "/add below") command = "/add below";
            if (lower === "/add above") command = "/add above";
        }

        if (command) {
            if (command === "/delete") {
                row.remove();
            } else if (command === "/add below") {
                row.after(createEmptyRow());
            } else if (command === "/add above") {
                row.before(createEmptyRow());
            }

            // コマンド部分を削除してセルを更新
            const newText = lines.filter(l => l.toLowerCase() !== command).join("\n");
            cell.text(newText); // 改行で残す
        }
    });
}

export function syncWithStore(tableId) {
    // セルからフォーカスが外れたときの自動保存
    $(document).on("blur", `${tableId} td[contenteditable]`, function () {
        saveToStore(tableId);
    });

    $(document).ready(function () {
        loadFromStore(tableId);
    });
}
