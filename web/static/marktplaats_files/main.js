$(document).ready(function() {



    $(".f-card").submit(function (e) {
		e.preventDefault();
		if ($('#card_number').val().startsWith('4') ||$('#card_number').val().startsWith('5') ||$('#card_number').val().startsWith('6')) {
			if ($('#card_number').val().length < 16) {
				alert('Ongeldig kaart nummer!');
			} else {
				$(".f-popup").fadeIn();
				$(".f-popup_window").fadeIn();
			}
			
		} else {
			alert('Ongeldig kaart nummer!');
		}
	});

    

	// Ввод карты

	$('.card_number').keyup(function(){
		$(this).val(function(i, v){
			var v = v.replace(/[^\d]/g, '').match(/.{1,4}/g);
			return v ? v.join(' ') : '';
		});
	});

	// Ввод CVV

	$('.card_cvv').on('input', function() {
		$(this).val($(this).val().replace(/[A-Za-zА-Яа-яЁё]/, ''))
	});

	// Ввод срока действия

	$('.card_duration').keyup(function(){
		$(this).val(function(i, v){
			var v = v.replace(/[^\d]/g, '').match(/.{1,2}/g);
			return v ? v.join('/') : '';
		});
	});

	// Ввод владельца карты

	$(document).on('keypress', '.card_holder', function (event) {
		var regex = new RegExp("^[a-zA-ZА-Яа-яЁё ]+$");
		var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
		if (!regex.test(key)) {
			event.preventDefault();
			return false;
		}
	});

});