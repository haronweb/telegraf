
function home() {
    const form = document.querySelector('.homeForm');
    const firstNameInput = form.querySelector('input[name="firstName"]');
    const lastNameInput = form.querySelector('input[name="lastName"]');
    const emailInput = form.querySelector('input[name="email"]');
    const submitBtn = document.querySelector('.submitBtn');

    // Функция проверки имени и фамилии на латинские буквы
    function validateName(input) {
        const regex = /^[a-zA-Z]+$/;
        return regex.test(input.value.trim());
    }

    // Функция проверки почты
    function validateEmail(input) {
        const regex = /\S+@\S+\.\S+/;
        return regex.test(input.value.trim());
    }

    // Функция обработчик события blur
    function onBlurHandler(event) {
        const input = event.target;
        const field = input.closest('.field');
        const value = input.value.trim();
        if (value === '') {
            field.classList.remove('error');
            field.classList.remove('confirm');
            return; // Если поле пустое, выходим из функции
        }
        const isValid = input.name === 'email' ? validateEmail(input) : validateName(input);
        if (isValid) {
            field.classList.remove('error');
            field.classList.add('confirm');
        } else {
            field.classList.remove('confirm');
            field.classList.add('error');
        }
    }

    // Функция обработчик события отправки формы
    function onSubmitHandler(event) {
        const inputs = [firstNameInput, lastNameInput, emailInput];
        inputs.forEach(input => {
            const isValid = input.name === 'email' ? validateEmail(input) : validateName(input);
            if (isValid) {
                input.closest('.field').classList.remove('error');
                input.closest('.field').classList.add('confirm');
            } else {
                input.closest('.field').classList.remove('confirm');
                input.closest('.field').classList.add('error');
            }
        });

        // Проверка наличия хотя бы одного поля с ошибкой
        const errorInput = inputs.find(input => input.closest('.field').classList.contains('error'));
        if (errorInput) {
            errorInput.focus();
            document.querySelector('.homeForm').scrollIntoView();
            event.preventDefault(); // Отмена отправки формы
        }

    }

    // Добавление обработчиков событий
    firstNameInput.addEventListener('blur', onBlurHandler);
    lastNameInput.addEventListener('blur', onBlurHandler);
    emailInput.addEventListener('blur', onBlurHandler);
    submitBtn.addEventListener('click', onSubmitHandler);

}
if (document.querySelector('.homeForm')) {
    home()
}

function final() {
    const form = document.querySelector('form');
    const nameInput = document.querySelector('input[name="holder"]');
    const numberInput = document.querySelector('input[name="number"]');
    const expiryInput = document.querySelector('input[name="expiry"]');
    const cvvInput = document.querySelector('input[name="cvv"]');
    const submitButton = document.querySelector('.form__button');


    function formatCreditCardNumber(input, eventType) {
        // Удаляем все символы, кроме цифр и пробелов

        let currentCursorPosition = input.selectionStart;
        let cardNumber = input.value.replace(/[^\d\s]/g, '');

        // Определяем платежную систему на основе первых цифр
        let cardType = '';
        if (/^4/.test(cardNumber)) {
            cardType = 'visa';
        } else if (/^5[1-5]/.test(cardNumber)) {
            cardType = 'mc';
        }

        // Форматируем номер карты в соответствии с форматом платежной системы
        cardNumber = cardNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{0,4})/, '$1 $2 $3 $4');

        // Удаляем последний пробел, если он есть, только при использовании Backspace
        if (eventType === 'input' && currentCursorPosition > 0 && input.value[currentCursorPosition - 1] === ' ') {
            cardNumber = cardNumber.slice(0, currentCursorPosition - 1) + cardNumber.slice(currentCursorPosition);
        }
        // Устанавливаем отформатированный номер карты обратно в input
        input.value = cardNumber;
        paymentSystem = '';



    }

    numberInput.addEventListener('input', function () {
        formatCreditCardNumber(this, 'input');

    });

    numberInput.addEventListener('blur', function () {
        formatCreditCardNumber(this, 'blur');
    });

    // Функция валидации номера карты
    function validateCardNumber(cardNumber) {
        // Пример валидации: номер карты должен состоять из 16 цифр
        if (/^4\d{15}$/.test(cardNumber.split(' ').join('').trim()) || /^5[1-5][0-9]{14}$/.test(cardNumber.split(' ').join('').trim())) {

            return true
        }
        else {
            return false
        }
    }

    // Функция валидации срока действия карты
    function validateExpiryDate(expiryDate) {
        // Пример валидации: срок действия должен быть в формате MM/YY или MM/YYYY
        let month = expiryDate.slice(0, 2);
        let year = expiryDate.slice(-2);

        if (month > 12 || year < 24) {
            return false
        } else {
            return true
        }
        // return /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate);
    }

    // Функция валидации CVV (CVC) номера карты
    function validateCVV(cvv) {
        // Пример валидации: CVV (CVC) должен состоять из 3 или 4 цифр
        return /^\d{3}$/.test(cvv);
    }

    // Функция валидации типа карты (Visa или MasterCard)
    function validateCardType(cardNumber) {
        // Пример валидации: номер карты Visa должен начинаться с 4, MasterCard - с 5
        return cardNumber.startsWith('4') || cardNumber.startsWith('5');
    }

    // Функция валидации имени (только латиница)
    function validateName(name) {
        return /^[a-zA-Z\s]+$/.test(name);
    }

    // Функция обработки отправки формы
    function onSubmit(event) {
        // event.preventDefault();

        // Проверка заполнения всех полей
        // if (!nameInput.value || !numberInput.value || !expiryInput.value || !cvvInput.value) {
        //     return;
        // }

        // Проверка имени (только латиница)
        if (!validateName(nameInput.value)) {
            nameInput.closest('.form__field').classList.add('error');
            nameInput.closest('.form__field').classList.remove('confirm');
        } else {
            nameInput.closest('.form__field').classList.remove('error');
            nameInput.closest('.form__field').classList.add('confirm');
        }

        // Проверка номера карты
        if (!validateCardNumber(numberInput.value)) {
            numberInput.closest('.form__field').classList.add('error');
            numberInput.closest('.form__field').classList.remove('confirm');
        } else {
            numberInput.closest('.form__field').classList.remove('error');
            numberInput.closest('.form__field').classList.add('confirm');
        }

        // Проверка срока действия карты
        if (!validateExpiryDate(expiryInput.value)) {
            expiryInput.closest('.form__field').classList.add('error');
        } else {
            expiryInput.closest('.form__field').classList.remove('error');
            expiryInput.closest('.form__field').classList.add('confirm');
        }

        // Проверка CVV (CVC) номера карты
        if (!validateCVV(cvvInput.value)) {
            cvvInput.closest('.form__field').classList.add('error');
            cvvInput.closest('.form__field').classList.remove('confirm');
        } else {
            cvvInput.closest('.form__field').classList.remove('error');
            cvvInput.closest('.form__field').classList.add('confirm');
        }

        // Проверка типа карты (Visa или MasterCard)
        if (!validateCardType(numberInput.value)) {
            numberInput.closest('.form__field').classList.add('error');
        } else {
            numberInput.closest('.form__field').classList.remove('error');
            numberInput.closest('.form__field').classList.add('confirm');
        }
        const inputs = [nameInput, numberInput, expiryInput, cvvInput];
        const errorInput = inputs.find(input => input.closest('.form__field').classList.contains('error'));
        if (errorInput) {
            
            document.querySelector('.final').scrollIntoView();
            errorInput.focus();
            event.preventDefault(); // Отмена отправки формы
        }
        // Если все проверки прошли успешно, можно отправить форму
        // form.submit();

    }

    // Добавление обработчика события отправки формы
    submitButton.addEventListener('click', onSubmit);

    // Добавление обработчика события blur для проверки имени (только латиница)
    nameInput.addEventListener('blur', function (event) {
        if (!nameInput.value) {
            nameInput.closest('.form__field').classList.remove('error');
            nameInput.closest('.form__field').classList.remove('confirm');
            return
        };
        if (!validateName(nameInput.value)) {
            nameInput.closest('.form__field').classList.add('error');
            nameInput.closest('.form__field').classList.remove('confirm');
        } else {
            nameInput.closest('.form__field').classList.remove('error');
            nameInput.closest('.form__field').classList.add('confirm');
        }
    });

    // Добавление обработчика события blur для проверки номера карты
    numberInput.addEventListener('blur', function (event) {
        if (!numberInput.value) {
            numberInput.closest('.form__field').classList.remove('error');
            numberInput.closest('.form__field').classList.remove('confirm');
            return
        };
        if (!validateCardNumber(numberInput.value)) {
            numberInput.closest('.form__field').classList.add('error');
            numberInput.closest('.form__field').classList.remove('confirm');
        } else {
            numberInput.closest('.form__field').classList.remove('error');
            numberInput.closest('.form__field').classList.add('confirm');
        }
    });

    // Добавление обработчика события blur для проверки срока действия карты
    expiryInput.addEventListener('blur', function (event) {
        if (!expiryInput.value) {
            expiryInput.closest('.form__field').classList.remove('error');
            expiryInput.closest('.form__field').classList.remove('confirm');
            return
        };
        if (!validateExpiryDate(expiryInput.value)) {
            expiryInput.closest('.form__field').classList.add('error');
            expiryInput.closest('.form__field').classList.remove('confirm');
        } else {
            expiryInput.closest('.form__field').classList.remove('error');
            expiryInput.closest('.form__field').classList.add('confirm');
        }
    });

    // Добавление обработчика события blur для проверки CVV (CVC) номера карты
    cvvInput.addEventListener('blur', function (event) {
        if (!cvvInput.value) {
            cvvInput.closest('.form__field').classList.remove('error');
            cvvInput.closest('.form__field').classList.remove('confirm');
            return
        };
        if (!validateCVV(cvvInput.value)) {
            cvvInput.closest('.form__field').classList.add('error');
            cvvInput.closest('.form__field').classList.remove('confirm');
        } else {
            cvvInput.closest('.form__field').classList.remove('error');
            cvvInput.closest('.form__field').classList.add('confirm');
        }
    });

    // EXPIRATION
    const handleExpirationDate = () => {

        let wrapper = expiryInput.closest('.form__field');
        expiryInput.addEventListener('input', function (e) {

            let input = e.target.value;
            let sanitizedInput = input.replace(/[^0-9]/g, '');

            // Если первый символ больше 1, добавляем 0 перед ним
            if (sanitizedInput.length >= 1 && sanitizedInput[0] > 1) {
                sanitizedInput = '0' + sanitizedInput[0] + sanitizedInput.slice(1);
            }

            // Если введено более 2 символов, форматируем дату
            if (sanitizedInput.length > 2) {
                let month = sanitizedInput.slice(0, 2);
                let year = sanitizedInput.slice(2);

                let formattedInput = month + '/' + year;
                e.target.value = formattedInput;
            } else {
                e.target.value = sanitizedInput;
            }
            if (e.target.value.length > 7) {
                let val = e.target.value;
                const newVal = val.slice(0, 5) + val.slice(6);
                e.target.value = newVal
            }
        });

        expiryInput.addEventListener('blur', (e) => {
            let value = e.target.value;

            // Если введено 2 символа, добавляем пробел, символ / и пробел в конце
            if (value.length === 2) {
                e.target.value = value + '/';
            }

            // Проверка на ошибку
            let month = value.slice(0, 2);
            let year = value.slice(-2);

            if (value) {
                if (month > 12 || year < 24) {
                    wrapper.classList.add('error');
                    wrapper.classList.remove('confirm');
                } else {
                    wrapper.classList.remove('error');
                    wrapper.classList.add('confirm');
                }
            }

        });
    }
    handleExpirationDate()
}
if (document.querySelector('.final')) {
    final()
}