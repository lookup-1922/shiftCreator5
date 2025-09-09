const { invoke } = window.__TAURI__.core;
const { open, save } = window.__TAURI__.dialog;

$(function () {
    const actions = {
        showAlert: () => alert("アラート！"),
        changeColor: () => $("body").css("background-color", "lightblue"),
        saveCsv: () => {
            console.log(tableToArray());
            const staffArray = tableToArray();
            invoke("save_json", {
                staff: staffArray,
                path: "test.json"
            }).then(() => alert("保存しました"));
        },
        loadCsv: () => {
            console.log(tableToArray());
            const staffArray = tableToArray();
            invoke("save_json", {
                staff: staffArray,
                path: "test.json"
            }).then(() => alert("保存しました"));
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

async function saveCsv(staff) {
    const filePath = await save({
        title: "保存先を選んでください",
        filters: [{ name: "JSON Files", extensions: ["json"] }],
    });
    if (filePath) {
        await invoke("save_json", { staff, path: filePath });
    }
}

// 読み込むファイルを選んでロード
async function loadCsv() {
    const filePath = await open({
        multiple: false,
        filters: [{ extensions: ["json"] }],
    });
    if (filePath && typeof filePath === "string") {
        const staff = await invoke("load_json", { path: filePath });
        console.log("Loaded staff:", staff);
        return staff;
    }
}

function tableToArray() {
    const table = $("#staff_management_table");
    const data = [];

    table.find("tr").slice(1).each(function () {
        const row = {};
        const cells = $(this).find("td");

        // 日本語見出し順に → 英語キーへ変換
        row["id"] = $(cells[0]).text().trim();
        row["name"] = $(cells[1]).text().trim();
        row["attributes"] = $(cells[2]).text().trim();
        row["roles"] = $(cells[3]).text().trim();

        data.push(row);
    });

    return data;
}


function arrayToTable(data) {
    const table = $("#staff_management_table");

    // ヘッダー行以外を削除
    table.find("tr:gt(0)").remove();

    // 日本語ラベルと英語キーの対応表
    const columnMap = {
        "ID": "id",
        "名前": "name",
        "属性": "attribute",
        "役割": "role"
    };

    // データを行ごとに追加
    data.forEach(staff => {
        const row = $("<tr>");
        for (const label in columnMap) {
            const key = columnMap[label];
            row.append($("<td>").attr("contenteditable", "true").text(staff[key]));
        }
        table.append(row);
    });
}
