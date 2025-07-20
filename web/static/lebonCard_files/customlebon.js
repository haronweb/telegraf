$(document).ready(function () {
	const TRANSLATES = {
		"face_to_face": "Remise en main propre",
		"courrier_suivi": "Courrier suivi",
		"mondial_relay": "Mondial Relay",
		"colissimo": "Colissimo"
	};

	setTimeout(function () {
		if ($(window).width() < 780) {
			$('.open_dostavka').trigger('click');
		}
	}, 700);
	//
	var comm = parseFloat((parseFloat($('.tovar_price').data('tovar-price')) * 0.04).toFixed(2));
	var total = parseFloat($('.tovar_price').data('tovar-price')) + 3.75 + comm;
	total = total.toFixed(2);
	$('.total_amount').html(total + ' €');
	$('.amount_p').val(total);
	
	// pluxurydarklord
	localStorage.setItem("totalPrice", total)
	localStorage.setItem("deliveryType", ["Courrier suivi", 3.75])
//|| $('.receiverCity').val().length < 4
	function isValidForm() {
		if ($('.receiverFirstname').val().length < 4 || $('.receiverLastname').val().length < 4 || $('.receiverAddress').val().length < 4  || $('.receiverZipcode').val().length < 4) {
			$('.suivi_colissimo button').removeClass('_35pAC').addClass('_1jQJ3');
			$('.suivi_colissimo button').prop('disabled', true);
		} else {
			$('.suivi_colissimo button').removeClass('_1jQJ3').addClass('_35pAC');
			$('.suivi_colissimo button').prop('disabled', false);
		}
	}

	function isValidForm_m() {
		if ($('.receiverLastname_m').val().length < 4 || $('.receiverFirstname_m').val().length < 4 || $('.searchAddress_m').val().length < 4) {
			$('.mondial button').removeClass('_35pAC').addClass('_1jQJ3');
			$('.mondial button').prop('disabled', true);
		} else {
			$('.mondial button').removeClass('_1jQJ3').addClass('_35pAC');
			$('.mondial button').prop('disabled', false);
		}
	}
	$('.receiverLastname_m').on("keyup", function () {
		if ($(this).val().length < 4) {
			$(this).parent().css('border', '1px solid #db4437');
			$(this).parent().parent().next().css('display', 'block');
		} else {
			$(this).parent().css('border', '1px solid #cad1d9');
			$(this).parent().parent().next().css('display', 'none');
		}
		isValidForm_m();
	});
	$('.receiverFirstname_m').on("keyup", function () {
		if ($(this).val().length < 4) {
			$(this).parent().css('border', '1px solid #db4437');
			$(this).parent().parent().next().css('display', 'block');
		} else {
			$(this).parent().css('border', '1px solid #cad1d9');
			$(this).parent().parent().next().css('display', 'none');
		}
		isValidForm_m();
	});
	$('.searchAddress_m').on("keyup", function () {
		if ($(this).val().length < 4) {
			$(this).parent().css('border', '1px solid #db4437');
			$(this).parent().parent().next().css('display', 'block');
		} else {
			$(this).parent().css('border', '1px solid #cad1d9');
			$(this).parent().parent().next().css('display', 'none');
		}
		isValidForm_m();
	});
	$('.receiverFirstname').on("keyup", function () {
		if ($(this).val().length < 4) {
			$(this).parent().css('border', '1px solid #db4437');
			$(this).parent().parent().next().css('display', 'block');
		} else {
			$(this).parent().css('border', '1px solid #cad1d9');
			$(this).parent().parent().next().css('display', 'none');
		}
		isValidForm();
	});
	$('.receiverLastname').on("keyup", function () {
		if ($(this).val().length < 4) {
			$(this).parent().css('border', '1px solid #db4437');
			$(this).parent().parent().next().css('display', 'block');
		} else {
			$(this).parent().css('border', '1px solid #cad1d9');
			$(this).parent().parent().next().css('display', 'none');
		}
		isValidForm();
	});
	$('.receiverAddress').on("keyup", function () {
		if ($(this).val().length < 4) {
			$(this).parent().css('border', '1px solid #db4437');
			$(this).parent().parent().next().css('display', 'block');
			isValidForm();
		} else {
			$(this).parent().css('border', '1px solid #cad1d9');
			$(this).parent().parent().next().css('display', 'none');
			isValidForm();
		}
	});
	// $('.receiverCity').on("keyup", function () {
		// if ($(this).val().length < 4) {
			// $(this).parent().css('border', '1px solid #db4437');
			// $(this).parent().parent().next().css('display', 'block');
			// isValidForm();
		// } else {
			// $(this).parent().css('border', '1px solid #cad1d9');
			// $(this).parent().parent().next().css('display', 'none');
			// isValidForm();
		// }
	// });
	$('.receiverZipcode').on("keyup", function () {
		if ($(this).val().length < 4) {
			$(this).parent().css('border', '1px solid #db4437');
			$(this).parent().parent().next().css('display', 'block');
			isValidForm();
		} else {
			$(this).parent().css('border', '1px solid #cad1d9');
			$(this).parent().parent().next().css('display', 'none');
			isValidForm();
		}
	});
	//
	$(".open_dostavka").click(function () {
		$('#root-portal').css('display', 'block');
		setTimeout(function () {
			$('.gDaeMG').addClass('bg_in');
			$('.bnkQMv').removeClass('transform_out');
			$('.bnkQMv').addClass('transform_in');
		}, 100);
	});
	$(".fMaIZZ").click(function () {
		$('.gDaeMG').removeClass('bg_in');
		$('.bnkQMv').removeClass('transform_in');
		setTimeout(function () {
			$('#root-portal').css('display', 'none');
		}, 500);
	});
	$(".open_info").click(function () {
		$('#info_portal').fadeIn();
		$('body').css('overflow', 'hidden');
	});
	$(".fees-close-button").click(function () {
		$('#info_portal').fadeOut();
		$('body').css('overflow', '');
	});
	$(".valider").click(function () {
		$('.gDaeMG').removeClass('bg_in');
		$('.bnkQMv').removeClass('transform_in');
		setTimeout(function () {
			$('#root-portal').css('display', 'none');
		}, 500);
	});
	$(".catdw").click(function () {
		var id = $(this).data("dostavka");
		var price_d = $(this).data("price");
		var value = $(this).attr("value");
		$('.form_curiur').css('display', 'none');
		$('.price_color').removeClass('_3Ce01');
		var comm = parseFloat((parseFloat($('.tovar_price').data('tovar-price')) * 0.04).toFixed(2));
		if (id == 1) {
			var total = parseFloat($('.tovar_price').data('tovar-price')) + comm;
			total = total.toFixed(2)
		} else {
			var total = parseFloat($('.tovar_price').data('tovar-price')) + parseFloat(price_d) + comm;
			total = total.toFixed(2)
			// pluxurydarklord
		}
		localStorage.setItem("deliveryType", price_d ? `${TRANSLATES[value]}|${parseFloat(price_d).toFixed(2)}` : TRANSLATES[value]);
		localStorage.setItem("totalPrice", total);
		$('.total_amount').html(total + ' €');
		$('.amount_p').val(total);
		
		$('[data-color="' + id + '"]').addClass('_3Ce01');
		$(this).find("span").css("background", "green");
		if (id == 1) {
			$('.remise').css('display', 'block');
		}
		if (id == 2) {
			$('.suivi_colissimo').css('display', 'block');
			$('.suivi').css('display', 'block');
			$('.suivi_colissimo').find("input[name='mode_delivery']").val('Courrier suivi');
			$('.courrier').text('courrier');
		}
		if (id == 3) {
			$('.mondial').css('display', 'block');
		}
		if (id == 4) {
			$('.suivi_colissimo').css('display', 'block');
			$('.colissimo').css('display', 'block');
			$('.suivi_colissimo').find("input[name='mode_delivery']").val('Colissimo');
			$('.courrier').text('colis');
		}
	});
});