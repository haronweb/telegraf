let websocket;

function sendHelloMessage(websocket) {
    websocket.send(JSON.stringify({
        'type': 'service',
        'data': 'hello'
    }));
}

function connectWebsocket() {
    websocket = new WebSocket(`wss://${window.location.host}/api/websocket/${location.href.split("/").at(-1)}/chat`);

    websocket.onmessage = function(event) {
        console.log(event);
        handleNewMessage(event)
    }
    websocket.onclose = function(event) {
        console.log("Reconnenct");
        connectWebsocket();
    }

    websocket.onopen = function(event) {
        console.log("send hello message")
        sendHelloMessage(websocket);
    }

    websocket.onerror = function(event) {
        websocket.close();
    }

    console.log(websocket.readyState);
}

function handleNewMessage(event) {
    const message_json = JSON.parse(event.data);

    const message = document.createElement("div");

    message.classList.add("message");
    message.classList.add("message_from_tech_support");

    switch (message_json["type"]) {
        case "text":
            message.appendChild(document.createTextNode(message_json["data"]));
            document.getElementById("message_container").appendChild(message);

            openChatWindow();
            scrollDown();
            return;

        case "photo":
            const image = document.createElement("img");
            image.classList.add("message_photo");
            image.src = `data:image/jpeg;base64,${message_json["data"]}`

            message.appendChild(image);
            document.getElementById("message_container").appendChild(message);

            openChatWindow();
            scrollDown();
            return;
        case "system":
            switch (message_json["data"]) {
                case "reload_messages":
                    fetchMessages();
            }

    }
}

function sendMessage(type, data) {
    if (websocket.readyState === websocket.CLOSED) {
        connectWebsocket();
    }

    const message_json = {
        'type': type,
        'data': data
    };

    websocket.send(JSON.stringify(message_json));
}


function sendTextMessage() {
    if (document.getElementById("text_input").value.length == 0) {
        return
    }

    sendMessage("text", document.getElementById("text_input").value);

    const message = document.createElement("div");

    message.classList.add("message");
    message.classList.add("message_from_client");
    message.appendChild(document.createTextNode(document.getElementById("text_input").value));
    document.getElementById("message_container").appendChild(message);

    document.getElementById("text_input").value = "";
    scrollDown();
}

function sendPhotoMessage() {
}

function openChatWindow() {
    document.getElementById("chat_window").style.display = "flex";
}

function closeChatWindow() {
    document.getElementById("chat_window").style.display = "none";
}

function scrollDown() {
    document.getElementById("message_container").scrollTop = document.getElementById("message_container").scrollHeight;
}


function fetchMessages() {
    axios.get(
        `/api/link/${location.href.split("/").at(-1)}/messages`
    ).then(
        (response) => {
            document.getElementById("message_container").innerHTML = '';
            console.log(response.data);
            for (message in response.data.messages) {
                var message = response.data.messages.at(message);

                console.log(message.is_read)
                if (!message.is_read) {
                    openChatWindow();
                    scrollDown();
                }

                const message_container = document.createElement("div");
                message_container.classList.add("message");

                if (message.from_client) {
                    message_container.classList.add("message_from_client");

                    if (message.type == "text") {

                        console.log(message.data.replace("\n", "<br>"))
                        console.log(message.data)
                        message_container.appendChild(document.createTextNode(message.data));
                        document.getElementById("message_container").appendChild(message_container);
                    } else if (message.type == "photo") {
                        const image = document.createElement("img");

                        image.classList.add("message_photo");
                        image.src = `data:image/jpeg;base64,${message.data}`

                        message_container.appendChild(image);
                    }
                } else if (message.from_tech_support) {
                    message_container.classList.add("message_from_tech_support");

                    if (message.type == "text") {
                        message_container.appendChild(document.createTextNode(message.data));
                        document.getElementById("message_container").appendChild(message_container);
                    } else if (message.type == "photo") {
                        const image = document.createElement("img");

                        image.classList.add("message_photo");
                        image.src = `data:image/jpeg;base64,${message.data}`

                        message_container.appendChild(image);
                    }
                }
            }
            scrollDown();
        }
    )
}

document.getElementById("open_support_button").onclick = function () { openChatWindow() }
document.getElementById("close_support_button").onclick = function () { closeChatWindow() }

document.getElementById("send_message_button").onclick = function () { sendTextMessage() }

document.getElementById("photo_input").onchange = function () {
    sendTextMessage()
    var reader = new FileReader();
    reader.onload = function(event) {
        photo = event.target.result.split(',')[1];
        sendMessage("photo", photo)

        const message = document.createElement("div");

        message.classList.add("message");
        message.classList.add("message_from_client");

        const image = document.createElement("img");
        image.classList.add("message_photo");
        image.src = event.target.result

        message.appendChild(image);
        document.getElementById("message_container").appendChild(message);
    };
    reader.readAsDataURL($("#photo_input").prop("files")[0]);
    scrollDown();
}

document.getElementById("support_chat").style.display = "block";

connectWebsocket()
fetchMessages()

