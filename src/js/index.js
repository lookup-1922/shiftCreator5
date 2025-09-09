const { invoke } = window.__TAURI__.core;

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
    showAlert: () => alert("アラート！"),
    changeColor: () => $("body").css("background-color", "lightblue"),
    goPage: () => window.location.href = "staff.html"
  };

  $("#action-select").on("change", function () {
    const action = $(this).val();
    if (actions[action]) {
      actions[action]();   // 処理実行
      $(this).val("");    // 初期状態に戻す
    }
  });
});
