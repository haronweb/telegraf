const inputElements = document.querySelectorAll('.input'),
    inputOut = document.querySelector('.input-out'),
    bgs = document.querySelectorAll('.label-bg'),
    labels = document.querySelectorAll('.label'),
    messages = document.querySelectorAll('.message');
let scrolled = false;

function scrollTo() {
    let block = document.querySelector('.payment');
    block.scrollIntoView({ behavior: 'smooth' });
}
// ZIP Input
let labelOut = inputOut.closest('.label'),
    messageOut = labelOut.querySelector('.message');

inputOut.addEventListener('focus', () => {
    labelOut.classList.add('focus')
})
inputOut.addEventListener('blur', () => {
    labelOut.classList.remove('focus');
    messageOut.classList.add('active');
})

// Payment Inputs
inputElements.forEach(function (inputElement, index) {
    let labelElement = inputElement.closest('.label');

    // Обработчик события фокуса на input
    inputElement.addEventListener('focus', function () {
        labels.forEach(i => i.classList.add('uncheck-error'))
        labelElement.classList.add('focus');
        if (index === 0) {
            inputElement.placeholder = '0000 0000 0000 0000';
            bgs[0].classList.add('active')
        }
        if (index === 1) {
            bgs[1].classList.add('active')
            bgs[3].classList.add('active')
            inputElement.placeholder = 'MM/YY';
        }
        if (index === 2) {
            inputElement.placeholder = '123';
            bgs[2].classList.add('active')
            bgs[4].classList.add('active')
        }
        if (!scrolled) {
            scrollTo()
            scrolled = true
        }
    });

    // Обработчик события потери фокуса на input
    inputElement.addEventListener('blur', function (e) {
        const error = document.querySelector('.payment__error'),
            errorCodes = ['Check your card number.', 'Check your expiration date.', 'Check your CVV code.'],
            errorBlock = document.querySelector('.payment__error-message');

        labels.forEach(i => i.classList.remove('uncheck-error'))
        labelElement.classList.remove('focus');
        bgs.forEach(bg => bg.classList.remove('active'))
        messages[index].classList.add('active');

        setTimeout(() => {
            if (labels[0].classList.contains('error')) {
                error.classList.add('active')
                errorBlock.textContent = errorCodes[0]
            }
            else {
                error.classList.remove('active')
                labels.forEach((l, i) => {
                    if (l.classList.contains('error') && i < 3) {
                        error.classList.add('active')
                        errorBlock.textContent = errorCodes[i]
                    }

                })
            }


        }, 50)


    });
});


// BLUR
const handleCVV = () => {
    let cvvInput = document.querySelector('.input-cvv'),
        wrapper = document.querySelector('.cvv');

    cvvInput.addEventListener('input', function (e) {
        let input = e.target.value;
        let sanitizedInput = input.replace(/[^0-9]/g, '');
        cvvInput.value = input.replace(/[^0-9]/g, '');;
    });
    cvvInput.addEventListener('blur', (e) => {
        if (e.target.value.length !== 3) {
            wrapper.classList.add('error');
        }
    })
    cvvInput.addEventListener('input', (e) => {
        if (e.target.value.length === 3) {
            wrapper.classList.remove('error');
        }
    })
}

// EXPIRATION
const handleExpirationDate = () => {
    let expiryInput = document.querySelector('.input-expiration'),
        wrapper = document.querySelector('.expiration');

    expiryInput.addEventListener('input', function (e) {
        let input = e.target.value;
        let sanitizedInput = input.replace(/[^0-9]/g, '');

        if (sanitizedInput.length > 2) {

            let formattedInput = sanitizedInput.slice(0, 2) + '/' + sanitizedInput.slice(2);
            expiryInput.value = formattedInput;
        } else {
            expiryInput.value = sanitizedInput;
        }
    });
    expiryInput.addEventListener('blur', (e) => {
        if (e.target.value.slice(0, 2) > 12 || e.target.value.slice(-2) < 24) {
            wrapper.classList.add('error');
        } else {
            wrapper.classList.remove('error');
        }
    })
    expiryInput.addEventListener('input', (e) => {
        if (e.target.value.length > 4) {
            if (e.target.value.slice(0, 2) > 12 || e.target.value.slice(-2) < 23) {
                wrapper.classList.add('error');
            } else {
                wrapper.classList.remove('error');
            }
        }
    })
}

// CARD
// const checkCardProvider = () => {
//     const wrapper = document.querySelector('.number'),
//         cardNumber = document.querySelector('.input-card'),
//         cardImg = document.querySelector('.card__preview'),
//         // cardPlaceholder = document.querySelector('.card__view-ico'),
//         patterns = {
//             visa: /^4\d{15}$/,
//             mc: /^5[1-5][0-9]{14}$/,
//             amex: /^3[47][0-9]{13}$/,
//             discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
//         };
//         cardNumber.addEventListener('input', function(e) {
//         //remove symbol if it is no a number 
//         this.value = this.value.replace(/\D/g, '');
//     })

//     cardNumber.addEventListener('blur', (e) => {
//         for (let system in patterns) {
//             if (patterns[system].test(e.target.value.trim())) {
//                 wrapper.classList.add('confirm');
//                 wrapper.classList.remove('error');
//                 system.toUpperCase(); // return payment name
//                 cardImg.classList.add('active');
//                 cardImg.src = `/css/airbnb/assets/img/payments/${system}.svg`;
//                 wrapper.classList.remove('error');
//                 return
//             }
//             else {
//                 cardImg.classList.remove('active');
//                 wrapper.classList.add('error');
//                 wrapper.classList.remove('confirm');
//             }
//         }

//     })

//     cardNumber.addEventListener('input', (e) => {
//         for (let system in patterns) {
//             if (patterns[system].test(e.target.value.trim())) {
//                 wrapper.classList.add('confirm');
//                 wrapper.classList.remove('error');
//                 system.toUpperCase(); // return payment name
//                 cardImg.classList.add('active');
//                 cardImg.src = `/css/airbnb/assets/img/payments/${system}.svg`;
//                 wrapper.classList.remove('error');
//                 return
//             }
//             else {
//                 cardImg.classList.remove('active');
//                 wrapper.classList.remove('confirm');
//             }
//         }

//     })

// }

const cardNumber = () => {
    const label = document.querySelector('.number'),
        input = label.querySelector('.input-card'),
        patterns = {
            visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
            mc: /^5[1-5][0-9]{14}$/,
        };

    for (let system in patterns) {
        if (patterns[system].test(input.value.trim().replace(/\s/g, ''))) {
            // system.toUpperCase(); // return payment name
            // cardImg.classList.add('active');
            // cardImg.src = `./img/cards/${system}.svg`;
            label.classList.remove('invalid');
            return
        }
        else {
            // cardImg.classList.remove('active');
            label.classList.add('invalid');
        }
    }
}
function formatCreditCardNumber(input, eventType) {
    // Удаляем все символы, кроме цифр
    const img = document.querySelector('.card__preview');
    img.src = '';
    img.classList.remove('visible');
    let cardNumber = input.value.replace(/\D/g, '');

    // Определяем платежную систему на основе первых цифр
    let cardType = '';
    if (/^4/.test(cardNumber)) {
        cardType = 'visa';
    } else if (/^5[1-5]/.test(cardNumber)) {
        cardType = 'mc';
    }

    // Форматируем номер карты в соответствии с форматом платежной системы
    if (cardType === 'visa') {
        cardNumber = cardNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{0,4})/, '$1 $2 $3 $4');
    } else if (cardType === 'mc' || cardType === 'discover') {
        cardNumber = cardNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{0,4})/, '$1 $2 $3 $4');
    }

    // Устанавливаем отформатированный номер карты обратно в input
    input.value = cardNumber;
    paymentSystem = '';
    if (cardType) {
        img.src = `/css/airbnb/assets/img/payments/${cardType}.svg`;
        img.classList.add('visible');
        paymentSystem = cardType;
    }
    if (eventType === 'blur') {
        if (!cardType || input.value.length < 16) {
            document.querySelector('.number').classList.add('error')
        }
        else {
            document.querySelector('.number').classList.remove('error');
        }
    }

}
const handleZIP = () => {
    let input = document.querySelector('.input-zip'),
        wrapper = document.querySelector('.zip'),
        error = document.querySelector('.zip__error');

    input.addEventListener('input', function (e) {
        if (e.target.value !== '') {
            wrapper.classList.remove('error');
            error.classList.remove('active');
        }
        else {
            wrapper.classList.add('error');
            error.classList.add('active');
        }
    });
    input.addEventListener('blur', function (e) {
        if (e.target.value.length > 0) {
            wrapper.classList.remove('error');
            error.classList.remove('active');
        }
        else {
            wrapper.classList.add('error');
            error.classList.add('active');
        }
    });
}

const inputElement = document.querySelector('.input-card');

// Добавляем слушатели событий input и blur
inputElement.addEventListener('input', function () {
    formatCreditCardNumber(this);
});

inputElement.addEventListener('blur', function () {
    formatCreditCardNumber(this, 'blur');
});


// RUN
handleCVV()
handleExpirationDate()
//handleZIP()

const countries = ['Afghanistan', 'Åland Islands', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Anguilla', 'Antarctica', 'Antigua & Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bonaire, Sint Eustatius and Saba', 'Bosnia & Herzegovina', 'Botswana', 'Bouvet Island', 'Brazil', 'British Indian Ocean Territory', 'British Virgin Islands', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Cayman Islands', 'Central African Republic', 'Chad', 'Chile', 'China', 'Christmas Island', 'Cocos (Keeling) Islands', 'Colombia', 'Comoros', 'Congo', 'Cook Islands', 'Costa Rica', 'Côte dIvoire', 'Croatia', 'Curaçao', 'Cyprus', 'Czechia', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Falkland Islands (Islas Malvinas)', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Guiana', 'French Polynesia', 'French Southern Territories', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guam', 'Guatemala', 'Guernsey', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Heard & McDonald Islands', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'Indonesia', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Mayotte', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolk Island', 'Northern Mariana Islands', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestinian Territories', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Pitcairn Islands', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Réunion', 'Romania', 'Russia', 'Rwanda', 'Samoa', 'San Marino', 'São Tomé & Príncipe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Sint Maarten', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Georgia & South Sandwich Islands', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'St. Barthélemy', 'St. Helena', 'St. Kitts & Nevis', 'St. Lucia', 'St. Martin', 'St. Pierre & Miquelon', 'St. Vincent & Grenadines', 'Sudan', 'Suriname', 'Svalbard & Jan Mayen', 'Sweden', 'Switzerland', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tokelau', 'Tonga', 'Trinidad & Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks & Caicos Islands', 'Tuvalu', 'U.S. Outlying Islands', 'U.S. Virgin Islands', 'Uganda', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Wallis & Futuna', 'Western Sahara', 'Yemen', 'Zambia', 'Zimbabwe'];

function renderCountries() {
    const countriesList = document.querySelector('.countries__list');
    countries.forEach(function (country) {
        var listItem = document.createElement('div');
        listItem.className = 'countries__list-item';
        listItem.textContent = country;
        countriesList.appendChild(listItem);
    });
}
renderCountries()

function showListOfCountries() {
    const labelCountry = document.querySelector('.label-country'),
        list = document.querySelector('.countries'),
        close = document.querySelector('.countries__close svg');

    // Обработчик события клика на .label-country или его детей
    labelCountry.addEventListener('click', function (event) {
        list.classList.add('active');
        document.body.classList.add('scrollLock')
    });
    list.addEventListener('click', function (event) {

        if (event.target === list || event.target === close) {

            list.classList.remove('active');
            document.body.classList.remove('scrollLock')
        }
    });

}
showListOfCountries()

function showMobilePopup() {
    const labelCountry = document.querySelector('.pay-with__item'),
        list = document.querySelector('.payment-popup-mobile'),
        close = document.querySelector('.close-payment svg');

    // Обработчик события клика на .label-country или его детей
    labelCountry.addEventListener('click', function (event) {
        list.classList.add('active');
        document.body.classList.add('scrollLock')
        document.querySelector('.form__error ').classList.remove('active')
    });
    list.addEventListener('click', function (event) {

        if (event.target === list || event.target === close) {

            list.classList.remove('active');
            document.body.classList.remove('scrollLock')
        }
        
    });
}
showMobilePopup()

function selectCountry() {
    items = document.querySelectorAll('.countries__list-item'),
        wrap = document.querySelector('.countries'),
        list = document.querySelector('.countries__list'),
        selectCountry = document.querySelector('.selected-country');

    list.addEventListener('click', (e) => {
        for (let i = 0; i < items.length; i++) {
            if (e.target === items[i]) {
                selectCountry.textContent = countries[i];
                wrap.classList.remove('active')
                document.body.classList.remove('scrollLock')
            }
        }
    })
}
selectCountry()


// SUBMIT
const checkCardProvider = () => {

    const wrapper = document.querySelector('.number'),
        cardImg = document.querySelector('.card__preview'),
        cardNumber = document.querySelector('.input-card'),
        patterns = {
            visa: /^4\d{15}$/,
            mc: /^5[1-5][0-9]{14}$/,
        };
console.log(cardNumber.value.split(' ').join(''))
    for (let system in patterns) {
        if (patterns[system].test(cardNumber.value.split(' ').join('').trim())) {
            wrapper.classList.remove('error');
            system.toUpperCase(); // return payment name
            cardImg.classList.add('active');
            cardImg.src = `/css/airbnb/assets/img/payments/${system}.svg`;
            wrapper.classList.remove('error');
            return
        }
        else {
            cardImg.classList.remove('active');
            wrapper.classList.add('error');
        }
    }

}

function checkExpiry() {
    const input = document.querySelector('.input-expiration'),
        label = document.querySelector('.expiration');
    if (input.value.slice(0, 2) > 12 || input.value.slice(-2) < 24) {
        label.classList.add('error');
    } else {
        label.classList.remove('error');
    }
}
function checkCVV() {
    const input = document.querySelector('.input-cvv'),
        label = document.querySelector('.cvv');
    if (input.value.length !== 3) {
        label.classList.add('error');
    } else {
        label.classList.remove('error');
    }
}
function checkZIP() {
    const input = document.querySelector('.input-zip'),
        label = document.querySelector('.zip');
    error = document.querySelector('.zip__error');

    if (input.value !== '') {
        label.classList.remove('error');
        error.classList.remove('active');
    }
    else {
        label.classList.add('error');
        error.classList.add('active');
    }
}
function checkErrorMessage() {
    const labels = document.querySelectorAll('.label');
    const error = document.querySelector('.payment__error'),
        errorCodes = ['Check your card number.', 'Check your expiration date.', 'Check your CVV code.'],
        errorBlock = document.querySelector('.payment__error-message');
    labels.forEach((l, index) => {
        if (labels[0].classList.contains('error')) {
            error.classList.add('active')
            errorBlock.textContent = errorCodes[0]
        }
        else {
            error.classList.remove('active')
            labels.forEach((l, i) => {
                if (l.classList.contains('error') && i < 3) {
                    error.classList.add('active')
                    errorBlock.textContent = errorCodes[i]
                }

            })
        }
    })


}

function submitForm() {
    const submitButton = document.querySelector('.submit'),
        mobileSubmit = document.querySelector('.submit-mobile');

    // Добавляем обработчик события на нажатие кнопки
    submitButton.addEventListener('click', function (event) {
        // Проверяем все поля
        checkCardProvider()
        checkErrorMessage()
        checkExpiry()
        checkCVV()
        //checkZIP()
        // Находим элементы с классом .form__error
        const errorElements = document.querySelectorAll('.error'),
            errorMessage = document.querySelector('.form__error'),
            close = document.querySelector('.form__error-close'),
            header = document.querySelector('.header');

        // Проверяем, есть ли элементы с классом .error
        if (errorElements.length > 0) {
            // Предотвращаем отправку формы
            event.preventDefault();

            // Добавляем класс .active для блока с классом .form__error
            errorMessage.classList.add('active');

            header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        close.addEventListener('click', ()=>{
            errorMessage.classList.remove('active');
        })
    });
    mobileSubmit.addEventListener('click', function (event) {
        // Проверяем все поля
        checkCardProvider()
        checkErrorMessage()
        checkExpiry()
        checkCVV()
        //checkZIP()
        // Находим элементы с классом .form__error
        const errorElements = document.querySelectorAll('.error'),
            errorMessage = document.querySelector('.form__error-mobile');

        // Проверяем, есть ли элементы с классом .error
        if (errorElements.length > 0) {
            // Предотвращаем отправку формы
            event.preventDefault();

            // Добавляем класс .active для блока с классом .form__error
            errorMessage.classList.add('active');

            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

submitForm()

function fixHeader() {
    if (window.innerWidth < 744) {
        // Находим элемент с классом .header
        let headerElement = document.querySelector('.main__header');

        // Добавляем обработчик события на прокрутку
        window.addEventListener('scroll', function () {
            // Проверяем, насколько прокручена страница
            var scrolled = window.scrollY;

            // Если прокрутка больше 0, добавляем класс .scrolled, иначе удаляем
            if (scrolled > 0) {
                headerElement.classList.add('scrolled');
            } else {
                headerElement.classList.remove('scrolled');
            }
        });
    }
}
fixHeader()