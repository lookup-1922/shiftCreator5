// タブボタンでページ遷移
$(function () {
  $(".tab-menu button").on("click", function () {
    const page = $(this).data("page");
    if (page) {
      window.location.href = page;
    }
  });
});
