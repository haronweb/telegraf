const countryFlagPositions = {"ad":0,"ae":-25,"af":-50,"ag":-75,"ai":-100,"al":-125,"am":-150,"an":-175,"ao":-200,"aq":-225,"ar":-250,"as":-275,"at":-300,"au":-325,"aw":-350,"ax":-375,"az":-400,"ba":-425,"bb":-450,"bd":-475,"be":-500,"bf":-525,"bg":-550,"bh":-575,"bi":-600,"bj":-625,"bl":-650,"bm":-675,"bn":-700,"bo":-725,"bq":-750,"br":-775,"bs":-800,"bt":-825,"bv":-850,"bw":-875,"by":-900,"bz":-925,"ca":-950,"cc":-975,"cd":-1000,"cf":-1025,"cg":-1050,"ch":-1075,"ci":-1100,"ck":-1125,"cl":-1150,"cm":-1175,"cn":-1200,"co":-1225,"cr":-1250,"cu":-1275,"cv":-1300,"cw":-1325,"cx":-1350,"cy":-1375,"cz":-1400,"de":-1425,"dj":-1450,"dk":-1475,"dm":-1500,"do":-1525,"dz":-1550,"ec":-1575,"ee":-1600,"eg":-1625,"eh":-1650,"er":-1675,"es":-1700,"et":-1725,"fi":-1750,"fj":-1775,"fk":-1800,"fm":-1825,"fo":-1850,"fr":-1875,"ga":-1900,"gb":-1925,"gd":-1950,"ge":-1975,"gf":-2000,"gg":-2025,"gh":-2050,"gi":-2075,"gl":-2100,"gm":-2125,"gn":-2150,"gp":-2175,"gq":-2200,"gr":-2225,"gs":-2250,"gt":-2275,"gu":-2300,"gw":-2325,"gy":-2350,"hk":-2375,"hm":-2400,"hn":-2425,"hr":-2450,"ht":-2475,"hu":-2500,"id":-2525,"ie":-2550,"il":-2575,"im":-2600,"in":-2625,"io":-2650,"iq":-2675,"ir":-2700,"is":-2725,"it":-2750,"je":-2775,"jm":-2800,"jo":-2825,"jp":-2850,"ke":-2875,"kg":-2900,"kh":-2925,"ki":-2950,"km":-2975,"kn":-3000,"kp":-3025,"kr":-3050,"kw":-3075,"ky":-3100,"kz":-3125,"la":-3150,"lb":-3175,"lc":-3200,"li":-3225,"lk":-3250,"lr":-3275,"ls":-3300,"lt":-3325,"lu":-3350,"lv":-3375,"ly":-3400,"ma":-3425,"mc":-3450,"md":-3475,"me":-3500,"mf":-3525,"mg":-3550,"mh":-3575,"mk":-3600,"ml":-3625,"mm":-3650,"mn":-3675,"mo":-3700,"mp":-3725,"mq":-3750,"mr":-3775,"ms":-3800,"mt":-3825,"mu":-3850,"mv":-3875,"mw":-3900,"mx":-3925,"my":-3950,"mz":-3975,"na":-4000,"nc":-4025,"ne":-4050,"nf":-4075,"ng":-4100,"ni":-4125,"nl":-4150,"no":-4175,"np":-4200,"nr":-4225,"nu":-4250,"nz":-4275,"om":-4300,"pa":-4325,"pe":-4350,"pf":-4375,"pg":-4400,"ph":-4425,"pk":-4450,"pl":-4475,"pm":-4500,"pn":-4525,"pr":-4550,"ps":-4575,"pt":-4600,"pw":-4625,"py":-4650,"qa":-4675,"re":-4700,"ro":-4725,"rs":-4750,"ru":-4775,"rw":-4800,"sa":-4825,"sb":-4850,"sc":-4875,"sd":-4900,"se":-4925,"sg":-4950,"sh":-4975,"si":-5000,"sj":-5025,"sk":-5050,"sl":-5075,"sm":-5100,"sn":-5125,"so":-5150,"sr":-5175,"st":-5200,"sv":-5225,"sx":-5250,"sy":-5275,"sz":-5300,"tc":-5325,"td":-5350,"tf":-5375,"tg":-5400,"th":-5425,"tj":-5450,"tk":-5475,"tl":-5500,"tm":-5525,"tn":-5550,"to":-5575,"tr":-5600,"tt":-5625,"tv":-5650,"tw":-5675,"tz":-5700,"ua":-5725,"ug":-5750,"um":-5775,"us":-5800,"uy":-5825,"uz":-5850,"va":-5875,"vc":-5900,"ve":-5925,"vg":-5950,"vi":-5975,"vn":-6000,"vu":-6025,"wf":-6050,"ws":-6075,"xk":-6100,"ye":-6125,"yt":-6150,"za":-6175,"zm":-6200,"zw":-6225};

const checkInputs = () => {
    const inputWrappers = document.querySelectorAll('.input-controlled'),
        inputs = document.querySelectorAll('.input');

    inputs.forEach((input, index) => {
        input.addEventListener('blur', (e) => {
            if (e.target.value.length > 0) {
                if (e.target.type !== 'email') {
                    inputWrappers[index].classList.add('confirm');
                    inputWrappers[index].classList.remove('error');
                }
                else {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (emailPattern.test(e.target.value)) {
                        inputWrappers[index].classList.add('confirm');
                        inputWrappers[index].classList.remove('error');
                    }
                    else {
                        if (inputWrappers[index].classList.add('error')) inputWrappers[index].classList.add('error');
                        inputWrappers[index].classList.remove('confirm');
                    }
                }
            }
            else {
                inputWrappers[index].classList.add('error');
                inputWrappers[index].classList.remove('confirm');
            }


        })
    });
}
const checkCardNameInput = () => {
    const inputWrappers = document.querySelectorAll('.input-controlled-name'),
        inputs = document.querySelectorAll('.input-lastname');

    inputs.forEach((input, index) => {
        input.addEventListener('blur', (e) => {
            if (e.target.value.length > 0) {
                if (e.target.type !== 'email') {
                    inputWrappers[index].classList.add('confirm');
                    inputWrappers[index].classList.remove('error');
                }
                else {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (emailPattern.test(e.target.value)) {
                        inputWrappers[index].classList.add('confirm');
                        inputWrappers[index].classList.remove('error');
                    }
                    else {
                        if (inputWrappers[index].classList.add('error')) inputWrappers[index].classList.add('error');
                        inputWrappers[index].classList.remove('confirm');
                    }
                }
            }
            else {
                inputWrappers[index].classList.add('error');
                inputWrappers[index].classList.remove('confirm');
            }


        })
    });
}
const showTip = () => {
    const button = document.querySelector('.cvv-tip'),
        popup = document.querySelector('.cvv-tip__popup');
    button.addEventListener('click', () => {
        popup.classList.add('active');
    })
    // remove active class on click outside 
    document.addEventListener('click', (e) => {
        if (e.target !== button) {
            popup.classList.remove('active');
        }
    })
}

const handleCVV = () => {
    let cvvInput = document.querySelector('.input-cvv-code'),
        wrapper = document.querySelector('.input-cvv');

    cvvInput.addEventListener('input', function (e) {
        let input = e.target.value;
        let sanitizedInput = input.replace(/[^0-9]/g, '');
        cvvInput.value = input.replace(/[^0-9]/g, '');;
    });
    cvvInput.addEventListener('blur', (e) => {
        if (e.target.value.length === 3) {
            wrapper.classList.add('confirm');
            wrapper.classList.remove('error');
        } else {
            wrapper.classList.remove('confirm');
            wrapper.classList.add('error');
        }
    })

}

const handleExpirationDate = () => {
    let expiryInput = document.querySelector('.input-expiration'),
        wrapper = document.querySelector('.input-date');

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
        if (e.target.value.slice(0, 2) > 12 || e.target.value.slice(-2) < 23) {
            wrapper.classList.add('error');
            wrapper.classList.remove('confirm');
        } else {
            wrapper.classList.remove('error');
            wrapper.classList.add('confirm');
        }
    })
}


const checkCardProvider = () => {
    const wrapper = document.querySelector('.input-number-container'),
        cardNumber = document.querySelector('.input-number'),
        cardImg = document.querySelector('.card__preview'),
        cardPlaceholder = document.querySelector('.card__view-ico'),
        patterns = {
            mc: /[0-9\s]{19}/,
            visa: /[0-9\s]{19}/
            //visa: /^4[0-9\s]{12}(?:[0-9\s]{3})?$/,
            //mc: /^5[1-5\s][0-9\s]{14}$/,
            // amex: /^3[47][0-9]{13}$/,
            // discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
            // jcb: /^(?:2131|1800|35\d{3})\d{11}$/,
            // diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
            // unionpay: /^(62[0-9]{14,17})$/,
            // cartebancaire: /^4[0-9]{11}(?:[0-9]{2,3})?$/,
        };
    cardImg.addEventListener('input', (e) => {
        //remove symbol if it is no a number 
        if (!e.key.match(/[0-9]/)) {
            input.replace(/[^0-9]/g, '')
        }
    })

    
    cardNumber.addEventListener('blur', (e) => {
        for (let system in patterns) {
            if (patterns[system].test(e.target.value.trim())) {
                wrapper.classList.add('confirm');
                wrapper.classList.remove('error');
                system.toUpperCase(); // return payment name
                //cardImg.classList.add('active');
                // cardImg.src = `/css/booking1/img/cards/${system}.svg`;
                //cardPlaceholder.classList.add('inactive');
                wrapper.classList.remove('error');
                return
            }
            else {
                cardPlaceholder.classList.remove('inactive');
                cardImg.classList.remove('active');
                wrapper.classList.add('error');
                wrapper.classList.remove('confirm');
            }
        }
    })
}
const handlePhone = () => {
    const input = document.querySelector('.input-transparent'),
        select = document.querySelector('.phone-countries'),
        wrapper = document.querySelector('.phone-inputs-wrapper'),
        flag = document.querySelector('.flag'),
        container = document.querySelector('.phone-wrapper'),
        label = container.querySelector('.input__label'),
        error = container.querySelector('.input__error');

    const addCountryCode = (countryCode) => {
        input.value = '+' + countryCode;
    }
    select.addEventListener('change', function () {
        let selectedOption = select.options[select.selectedIndex];
        let selectedValue = selectedOption.value;
        let selectedText = selectedOption.text;
        let selectedInfo = selectedOption.dataset.call;
        let selectedIndex = select.selectedIndex;
        let selectedOptionNumber = selectedIndex + 1;

        flag.style.backgroundPosition = `0 ${countryFlagPositions[selectedValue.toLowerCase()]}px`;
        addCountryCode(selectedInfo);

    });
    input.addEventListener('focus', () => {
        if (wrapper.classList.contains('error')) {
            wrapper.style.border = '1px solid #cc0000';
        }
        else if (wrapper.classList.contains('confirm')) {
            wrapper.style.border = '1px solid #008009';
        }
        else {
            wrapper.style.border = '1px solid #0071c2';
        }
    })
    input.addEventListener('blur', (e) => {
        wrapper.style.border = '';
        if (e.target.value.length > 7) {
            wrapper.classList.add('confirm');
            wrapper.classList.remove('error');
            label.style.display = 'block';
            error.style.display = 'none';
        }
        else {
            wrapper.classList.remove('confirm');
            wrapper.classList.add('error');
            label.style.display = 'none';
            error.style.display = 'block';
        }

    })
    input.addEventListener('input', function (e) {
        let inputValue = input.value;
        let numericValue = parseFloat(inputValue);
        numericValue = '+' + numericValue

        if (isNaN(numericValue) && numericValue !== '+') {
            input.value = '';
        } else {
            input.value = numericValue;
        }
    });

}
const handlePhoneMobile = () => {
    let select = document.querySelector('.phone-countries'),
        wrapper = document.querySelector('.phone-inputs-wrapper'),
        container = document.querySelector('.phone-wrapper'),
        label = container.querySelector('.input__label'),
        input = document.querySelector('.input-transparent'),
        error = container.querySelector('.input__error');
    input.value = '';

    select.addEventListener('change', function () {
        let selectedOption = select.options[select.selectedIndex];
        let selectedValue = selectedOption.value;
        let selectedInfo = selectedOption.dataset.call;
        let textBlock = document.querySelector('.flag-text');
        textBlock.textContent = `${selectedValue} +${selectedInfo}`;
    }
    )
    input.addEventListener('blur', (e) => {
        if (e.target.value.length > 7) {
            wrapper.classList.add('confirm');
            wrapper.classList.remove('error');
            label.style.display = 'block';
            error.style.display = 'none';
        }
        else {
            wrapper.classList.remove('confirm');
            wrapper.classList.add('error');
            label.style.display = 'none';
            error.style.display = 'block';
        }

    })
}
const buttonDisabledStep_1 = () => {
    const button_step_1 = document.querySelector('.steps__next-1'),
        inputs_step_1 = document.querySelectorAll('.i-1'),
        inputs_containers_step_1 = document.querySelectorAll('.i-w-1');
    
    let setBtn = function (value) {
        //button_step_1.disabled = value;
    }

    let checker_func = function() {
        for (let i = 0; i < inputs_step_1.length; i++) {
            console.log(inputs_containers_step_1[i]);
            if (!inputs_containers_step_1[i].classList.contains('confirm')) {
                console.log(inputs_containers_step_1[i].classList);
                setBtn(true);
                return;
            }
        }
       setBtn(false);
    }

    inputs_step_1.forEach(el => {
        el.addEventListener('blur', checker_func);
    });

    checker_func();
}
const buttonDisabledStep_2 = () => {
    const button = document.querySelector('.steps__next-2'),
        inputs = document.querySelectorAll('.i-2'),
        containers = document.querySelectorAll('.i-w-2');

    let disabledInput = true;

    inputs.forEach(el => {
        el.addEventListener('blur', () => {
            for (let i = 0; i < containers.length; i++) {
                if (!containers[i].classList.contains('confirm')) {
                    disabledInput = true;
                    break;
                }
                else {
                    disabledInput = false;
                }
            }
            setBtn()
        })
    })
    function setBtn() {
        button.disabled = disabledInput;
    }
}
if (document.querySelector('.phone-countries')) {
    checkInputs()
}
if (document.querySelector('.input-expiration')) {
    handleExpirationDate()
}
if (document.querySelector('.card__preview')) {
    checkCardProvider()
}
if (window.innerWidth < 1024 && document.querySelector('.cvv-tip')) {
    showTip()
}
if (document.querySelector('.input-cvv-code')) {
    handleCVV()
}
if (window.innerWidth > 1024 && document.querySelector('.phone-inputs-wrapper')) {
    handlePhone()
}
if (window.innerWidth < 1024 && document.querySelector('.phone-inputs-wrapper')) {
    handlePhoneMobile()
}
if (document.querySelector('.input-controlled-name')) {
    checkCardNameInput()
}
//check if inputs are empty

if (document.querySelector('.steps__next-1')) {
    buttonDisabledStep_1()
}

if (document.querySelector('.form-cards')) {
    buttonDisabledStep_2()
}