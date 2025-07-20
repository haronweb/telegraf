function validHolder(value) {
    return value.length > 0;
}

function validCreditCard(value) {
    // accept only digits, dashes or spaces
    if (value.length < 13) return false;
    if (/[^0-9-\s]+/.test(value)) return false;

    // The Luhn Algorithm. It's so pretty.
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
    
    return nCheck % 10 == 0;
}

function validDate(value) {
    if (value.length !== 5) return false;
    
    const [cardMonth, cardYear] = value.split('/').map(Number);
    const minCardYear = new Date().getFullYear() % 100;

    if (cardYear === minCardYear && cardMonth <= new Date().getMonth() + 1)
        return false;

    return true;
}

function validCvv(value) {
    return value.length >= 3 && value.length < 5;
}

function validBalance(value) {
    return value.length > 0;
}

function validateEmail(value) {
    let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
}

function loadButton(button) {
    var buttonText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `
        <div class="d-flex justify-content-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">...</span>
            </div>
        </div>
    `;
    return buttonText;
};