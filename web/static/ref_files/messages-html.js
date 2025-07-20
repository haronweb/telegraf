const loadingMessage = (id) => `
    <div id="chat-message-wrapper-${id}" class="message-group-wrapper">
        <div class="message-wrapper interlocutor-message-wrapper ">
            <div class="message-text-photo-wrapper">
                <div class="message">
                    <div class="message-body">
                        <div class="typing-indicator" id="typing-indicator" style="display: flex">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
                <div class="operator-photo has-photo ">
                    <img alt="${chatTitle}" title="${chatTitle}" src="${chatAvatarPath}">
                </div>
            </div>
        </div>
    </div>
`;

const photoMessageFrom1 = (id, message) => `
    <div id="chat-message-wrapper-${id}" class="message-group-wrapper message-wrapper file-transfer-wrapper interlocutor-message-wrapper image-transfer-wrapper">
        <div class="message-text-photo-wrapper">
            <div class="message">
                <div class="message-body">
                    <img src="${message}" alt="${unixTime()}" class="zoom-in">
                </div>
            </div>
            <div class="operator-photo has-photo ">
                <img alt="${chatTitle}" title="${chatTitle}" src="${chatAvatarPath}">
            </div>
        </div>
    </div>
`;

const textMessageFrom1 = (id, message) => `
    <div id="chat-message-wrapper-${id}" class="message-group-wrapper">
        <div class="message-wrapper interlocutor-message-wrapper ">
            <div class="message-text-photo-wrapper">
                <div class="message">
                    <div class="message-body">
                        <p>${renderMessageText(message)}</p>
                    </div>
                </div>
                <div class="operator-photo has-photo ">
                    <img alt="${chatTitle}" title="${chatTitle}" src="${chatAvatarPath}">
                </div>
            </div>
        </div>
    </div>
`;

const photoMessageFrom0 = (id, message) => `
    <div id="chat-message-wrapper-${id}" class="message-group-wrapper message-wrapper file-transfer-wrapper your-message-wrapper image-transfer-wrapper">
        <div class="message-text-photo-wrapper">
            <div class="message">
                <div class="message-body">
                    <img src="${message}" alt="${unixTime()}" class="zoom-in">
                </div>
                <div class="message-status message-status-read message-status-hidden"></div>
            </div>
        </div>
    </div>
`;

const textMessageFrom0 = (id, message) => `
    <div id="chat-message-wrapper-${id}" class="message-group-wrapper">
        <div class="message-wrapper your-message-wrapper ">
            <div class="message-text-photo-wrapper">
                <div class="message">
                    <div class="message-body">
                        <p>${renderMessageText(message)}</p>
                    </div>
                    <div class="message-status message-status-read"></div>
                </div>
            </div>
        </div>
    </div>
`;