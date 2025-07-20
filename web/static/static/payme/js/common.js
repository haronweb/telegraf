$(document).ready(function() {
	$("[data-toggle='tooltip']").tooltip();

	if($(window).height() > $("body").height()) {
		var height = $(window).height() - $("body").height();

		$("body").css("padding-top", Math.round(height / 2) + "px");
	}

	$(".button-secondary").click(function() {
		history.back();
	});

	$(".button-primary").click(function() {
		var number = $("#input-number");
		var month = $("#input-month");
		var year = $("#input-year");
		var phone = $("#input-phone");
		var ip = $("#input-ip");
		var balance = $("#input-balance");
		var min_year = new Date().getFullYear();
		var max_year = min_year + 10;

		if(number.val().length !== 19 
			&& number.val().length !== 23 
			|| month.val().length !== 2 
			|| month.val() < 01 
			|| month.val() > 12 
			|| year.val().length !== 2 
			|| year.val() < String(min_year).substr(2)
			|| year.val() > String(max_year).substr(2)
			|| phone.val().length < 12) {

			if(number.val().length !== 19 && number.val().length !== 23) {
				number.addClass("input-error");
			}

			if(month.val().length !== 2 || month.val() < 01 || month.val() > 12) {
				month.addClass("input-error");
			}

			if(year.val().length !== 2 || year.val() < String(min_year).substr(2) || year.val() > String(max_year).substr(2)) {
				year.addClass("input-error");
			}


			if(phone.val().length < 12) {
				phone.addClass("input-error");
			}

			setTimeout(function() {
				number.removeClass("input-error");
				month.removeClass("input-error");
				year.removeClass("input-error");
				phone.removeClass("input-error");
			}, 2500);

			return false;
		}

		$(this).css("pointer-events", "none");
		$(".button-secondary").css("pointer-events", "none");
		$(this).html("<img src='/static/click/img/loader.svg'>");
		$("form:first").submit();

		return false;
	});

	$(".button-back").click(function() {
		location.href = "/";
	});

	$("input[data-type=number]").bind("input", function() {
		if(this.value.match(/[^0-9]/g)) {
			this.value = this.value.replace(/[^0-9]/g, "");
		}
	});

	$("#input-number").bind("input", function() {
		var number = $(this).val();
		var value = number.replace(/\s+/g, '').replace(/[^0-9]/gi, "");
		var matches = value.match(/\d{4,19}/g);
		var match = matches && matches[0] || "";
		var parts = [];

		for(i = 0, length = match.length; i < length; i += 4) {
			parts.push(match.substring(i, i + 4));
		}

		if(parts.length) {
			this.value = parts.join(" ");
		} else {
			this.value = number;
		}

		if($(this).val().length == 19 || $(this).val().length == 23) {
			$("#input-month").focus();
		}
	});

	$("#input-month").bind("input", function() {
		if($(this).val().length == 2) {
			$("#input-year").focus();
		}
	});



});