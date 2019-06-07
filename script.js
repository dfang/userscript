// ==UserScript==
// @name         京东大家电
// @namespace    http://tampermonkey.net/
// @version      0.5.0
// @homepage     https://github.com/dfang/userscript
// @description  try to make partner.dhc.jd.com more user friendly! 京东大家电----订单一键导出
// @author       fang duan
// @include      *partner.dhc.jd.com*
// @include      *ext.mads.jd.com*
// @grant        GM_notification
// @grant        GM_log
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/dfang/userscript/master/script.js
// @downloadURL  https://raw.githubusercontent.com/dfang/userscript/master/script.js
// ==/UserScript==

(function () {
  "use strict";

  GM_log("start hacking ......");

  if (window.location.host == "partner.dhc.jd.com") {
    init1();
  } else {
    GM_notification(
      "I just did some work for you automatically, you're welcome ;p"
    );

    // var $ = window.jQuery;

    init2();

    // select default warehouses and default carrier
    allTasks();

    // add a fake button to modal popup for export data and then confirm reservation
    $("#reserve .modal-content").append(
      $("#confirm")
        .clone()
        .attr("id", "export")
        .text("导出数据")
    );
    $("#reserve #confirm").hide();
    $("#reserve .modal-content")
      .find(".btn-primary")
      .css("margin-bottom", "30px")
      .css("margin-left", "140px");

    $("#reserve #export").on("click", function (e) {
      e.preventDefault();

      $("#cyq7").val(
        "您好，您的订单已经预约成功，如遇客户催单及投诉，可以联系站点电话18070421816或0792-7688336，空调安装电话17370085337，或咚咚联系/李娟/邓彬"
      );

      $(e.target).attr("disabled", true);
      var reservation = null;
      var orderDetails = [];
      var payment = null;

      reservation = new Object({
        order_no: $("#cyq1").text(),
        customer_address: $("#cyq6").val(),
        customer_name: $("#cyq2").val(),
        customer_phone: $("#cyq3").val(),
        reserverd_delivery_time: $("#cyq4").val(),
        reserverd_setup_time: $("#cyq5").val(),
        is_delivery_and_setup: $("#cyq22").val()
      });

      var $paymentTR = $("#reserve .modal-content table:eq(0) tbody").find(
        "tr:eq(0)"
      );
      payment = new Object({
        total: $paymentTR.find("td:eq(0)").text(),
        paymentMethod: $paymentTR.find("td:eq(1)").text()
      });

      var $orderDetailsTRS = $("#reserve .modal-content table:eq(1) tbody").find(
        "tr"
      );
      $orderDetailsTRS.map(function (i, e) {
        var orderLine = new Object({
          order_no: reservation.order_no,
          product_no: $(e)
            .find("td:eq(1)")
            .text(),
          product_name: $(e)
            .find("td:eq(2)")
            .text(),
          quantity: $(e)
            .find("td:eq(3)")
            .text(),
          install: $(e)
            .find("td:eq(7)")
            .text()
        });
        orderDetails.push(orderLine);
      });

      reservation.receivables = payment.total;
      reservation.order_details = orderDetails;
      console.log(reservation);

      GM_log("reservation data : " + reservation);
      GM_log("Make an ajax request to send reservation to hook")

      // make a ajax request to save reservation data
      $.ajax({
        // url: 'https://jinshuju.net/api/v1/forms/VaVmnO',
        // url: "https://xsjd.df1228.now.sh/import",
        // url: "https://requestbin.df1228.now.sh/post",
        // url: "https://hook.io/df1228/import_jd_orders",
        url: "https://en52v9dw7pw0iy3.m.pipedream.net",
        type: "POST",
        dataType: "json",
        tryCount: 0,
        retryLimit: 5,
        data: JSON.stringify(reservation),
        beforeSend: function (xhr) {
          // xhr.setRequestHeader("Authorization", "Basic ".concat(btoa("ktAF6IyhZPZoRuyKuuaYRw:uhsvWAdrWcx-svHL-d2LtA")));
          xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
        },
        success: function (data) {
          GM_log("Post success");

          // notify user
          var notificationDetails = {
            text: "客户" + reservation.customer_name + "的数据导出成功!!!",
            title: "导出成功!",
            timeout: 5000,
            highlight: true,
            onclick: function () {
              window.focus();
            }
          };

          GM_notification(notificationDetails);
          $(e.target).hide();
          $("#reserve #confirm").show();
        },
        error: function (xhr, textStatus, errorThrown) {
          if (textStatus == "timeout") {
            this.tryCount++;
            if (this.tryCount <= this.retryLimit) {
              //try again
              $.ajax(this);
              return;
            }
            return;
          }
          if (xhr.status == 500) {
            //handle error
          } else {
            //handle error
          }
        }
      });

      $(document).on("click", ".reserveUrl", function (e) {
        console.log(e.target);
        $("#reserve #confirm").hide();
        $("#reserve #export").attr("disabled", false);
        $("#reserve #export").show();
      });
    });
  }


  GM_log("end hacking");

})();

function init1() {
  GM_log("window.location.host = partner.dhc.jd.com");

  // expand menu
  $("dt:eq(4) a").click();

  // open in new tab
  $("a[href='http://ext.mads.jd.com/outweb/orderReserve/index']").attr(
    "target",
    "_blank"
  );
}

function init2() {

  addStyles()

  // auto select carrier and click query button after change warehouse
  $(document).on("change", "#warehouses", function () {
    setTimeout(function () {
      $("#carriers").combobox("setText", "京东帮修水服务店D");
      // $('#carriers').combobox("setValue","569972");
    }, 500);

    setTimeout(function () {
      $("#query").click();
    }, 1000);
  });

  // 选择预约状态 自动查询
  $(document).on("change", "#states", function () {
    setTimeout(function () {
      $("#query").click();
    }, 500);
  });

  // 选择预约方式 自动查询
  $(document).on("change", "#reserveType", function () {
    setTimeout(function () {
      $("#query").click();
    }, 500);
  });
}

function addStyles() {
  var styleSheet =
    "" +
    "#table1.flexigrid_report {" +
    "font-size: 14px;" +
    "}" +
    ".form-group {" +
    "margin-top: 5px;" +
    "}" +
    "form button {" +
    "margin-top: 8px;" +
    "}" +
    "";

  GM_addStyle(styleSheet);
}

async function allTasks() {
  await task1();
  await task2();
  await task3();
  await task4();
  await task5();
}

function task1() {
  return new Promise(resolve => {
    setTimeout(() => {
      GM_log("1", "第一个任务: 自动选择机构");
      $("#organizations")
        .val($("#organizations option:eq(1)").val())
        .trigger("change");
      resolve("done");
    }, 3000);
  });
}

function task2() {
  return new Promise(resolve => {
    setTimeout(() => {
      GM_log("2", "第二个任务: 自动选择配送中心");
      $("#distributionCentres")
        .val($("#distributionCentres option:eq(1)").val())
        .trigger("change");
      resolve("done");
    }, 1000);
  });
}

function task3() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      GM_log("3", "第三个任务: 自动选择仓库");
      $("#warehouses")
        .val($("#warehouses option:eq(1)").val())
        .trigger("change");
      resolve("done");
    }, 1000);
  });
}

function task4() {
  return new Promise(resolve => {
    // setTimeout(() => {
    //   console.log("4", "第四个任务");
    //   $("#carriers").combobox("setText", "京东帮修水服务店A");
    //   // $('#carriers').combobox("setValue","569972");
    //   resolve("done");
    // }, 1000);
    GM_log("4", "第四个任务: 自动选择承运商");
    $.fn.combobox.defaults.onLoadSuccess = function (items) {
      if (items.length) {
        var opts = $(this).combobox('options');
        $(this).combobox('select', items[0][opts.valueField]);
      }
    }
    resolve("done")
  });
}

function task5() {
  return new Promise(resolve => {
    setTimeout(() => {
      GM_log("5", "第五个任务: 自动点击查询按钮");
      $("#query").click();
      resolve("done");
    }, 1000);
  });
}
