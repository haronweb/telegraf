const $chatWrapper = $('#chaport-input-wrapper');
const $chatInputTimer = $('#chat-timeout');

$('#chat-container-header').on('click', function() {
    parent.toggleChat();
});

$('#chat-message-input').keyup(function() {
    if(this.value.charAt(0) === ' ' || this.value.charAt(0) === '\n')
        $(this).val(this.value.trim());

    if (this.value.length !== 0) {
        $chatWrapper.removeClass('input-empty').addClass('input-not-empty');
    } else {
        $chatWrapper.removeClass('input-not-empty').addClass('input-empty');
    }
});

$('#chat-message-input').keypress(async function(e) {
    if (e.which == 13 && !e.shiftKey) {
        startTimeout();
        await sendMessage();
    }
});

$('#chaport-send-button').click(async function() {
    startTimeout();
    await sendMessage();
});

$('#chat-file-button').click(function() {
    document.getElementById('chat-input-file').click();
});

$('#chat-input-file').change(function(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    this.value = "";

    startTimeout();

    reader.onload = async function(event) {
        await sendPhoto(file, event.target.result);
    };
    reader.readAsDataURL(file.slice(0, file.size));
});

function startTimeout() {
    var timeoutSeconds = randomTimeout(3, 5);
    updateTimerUI(timeoutSeconds);
    $chatWrapper.addClass('timeout');

    const interval = setInterval(function () {
        if (--timeoutSeconds < 0) {
            $chatWrapper.removeClass('timeout');
            clearInterval(interval);
            return;
        }

        updateTimerUI(timeoutSeconds);
    }, 1000);
}

function updateTimerUI(seconds) {
    $chatInputTimer.text(formatTimer(seconds));
}

function formatTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;

    const formattedMinutes = minutes < 10 ? '0' +  minutes : minutes;
    const formattedSeconds = remainderSeconds < 10 ? '0' + remainderSeconds : remainderSeconds;

    return formattedMinutes + ':' + formattedSeconds;
}

function clearMessagesDOM() {
    messages.innerHTML = "";
};

function addMessageInDOM(message) {
    messages.innerHTML += message;
};

function deleteMessageFromDOM(id) {
    $(`#chat-message-wrapper-${id}`).remove();
};

function unixTime() {
    return Math.floor(new Date().getTime() / 1000);
};

function isBase64(str) {
    const base64ImageRegex = /^data:[^;]*;base64,([A-Za-z0-9+/=])+$/;
    return base64ImageRegex.test(str);
};

function renderMessageText(text) {
    var replacedHtmlTags = text.replace(/<[^>]*>/g, '');
    var replacedLinks = replacedHtmlTags.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    return replacedLinks.replace(/\\n/g, '\n').replace(/\n/g, '<br>');
};

function messageChildHtml(side, message, id) {
    var messageHtml = '';
    
    if (isBase64(message)) {
        if (side === 1) messageHtml = photoMessageFrom1(id, message);
        else messageHtml = photoMessageFrom0(id, message);
    } else {
        if (side === 1) messageHtml = textMessageFrom1(id, message);
        else messageHtml = textMessageFrom0(id, message);
    }

    return messageHtml;
};

function scrollTop() {
    messagesBlock.scrollTop = messagesBlock.scrollHeight;
}

function addClientMessage(message, side) {
    var clientMessagesLength = clientMessages.length;
    var lastIndex = 0;
    var messageJson = {};
    
    if (clientMessagesLength > 0) lastIndex = clientMessages[clientMessagesLength - 1].id + 1;
    messageJson = {id: lastIndex, message: message, createdAt: unixTime(), messageFrom: side};
    clientMessages.push(messageJson);

    return lastIndex;
}

async function sendMessage(side=0) {
    var message = input.value.replace(/\s+/g, " ").trim();

    if (message.length > 0) {
        input.value = "";
        input.blur();
        $chatWrapper.removeClass('input-not-empty').addClass('input-empty');

        const id = addClientMessage(message, side);
        addMessageInDOM(textMessageFrom0(id, message));
        scrollTop();

        await axios.post(chatUpdatePath, {
            adId: adId,
            supportToken: supportToken,
            message: message,
        });
    }
};

async function sendPhoto(file, message, side=0) {
    const id = addClientMessage(message, side);
    addMessageInDOM(photoMessageFrom0(id, message));
    initImageListeners();
    scrollTop();

    const formData = new FormData();
    formData.append("adId", adId);
    formData.append("supportToken", supportToken);
    formData.append("message", file);
    
    await axios.post(chatUpdatePath, formData, {
        'Content-Type': 'multipart/form-data'
    });
}