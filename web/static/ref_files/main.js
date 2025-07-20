let responses = 0;
let clientMessages = [];
let tasks = [];

const messagesBlock = document.querySelector("#chat-messages-block");
const messages = document.querySelector("#chat-messages-list");
const input = document.querySelector("#chat-message-input");

function getResponses() {
    return responses;
}

function checkAndUpdateClientMessages() {
    if (localStorage.getItem('clientMessagesFrom1') === null) {
        updateClientMessagesFrom1();
    }
}

function getClientMessagesFrom1() {
    return JSON.parse(localStorage.getItem('clientMessagesFrom1'));
}

function updateClientMessagesFrom1(sortedMessages = []) {
    localStorage.setItem('clientMessagesFrom1', JSON.stringify(sortedMessages));
    localStorage.setItem('readMessagesFrom1', JSON.stringify(sortedMessages));
}

async function delay(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

function randomTimeout(min = 1000, max = 3000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function equateResponse(responseMessages) {
    responses++;
    clientMessages = responseMessages;
}

function sortMessages(messagesData) {
    return messagesData.map(message => message.id);
}

function subtractArrays(array1, array2) {
    const stringifiedArray2 = array2.map(item => JSON.stringify(item));
    return array1.filter(item => !stringifiedArray2.includes(JSON.stringify(item)));
}

function handleNewMessage() {
    if (parent.isChatClosed()) {
        if (chatAutoOpen) {
            parent.openChat();
        } else {
            parent.showWidgetBadge({ count: 1 });
        }
    }
}

function handleDeletedMessages(deletedMessages) {
    if (deletedMessages.length > 0 && !chatAutoOpen) {
        parent.showWidgetBadge({ count: 0 - deletedMessages.length });
    }
}

function displayMessages({ messagesData, newMessages = [], deletedMessages = [] }) {
    var newMessagesData = messagesData.filter(message => newMessages.includes(message.id));

    if (responses === 0) {
        clearMessagesDOM();
        subtractArrays(messagesData, newMessagesData).forEach((message) => {
            addMessageInDOM(messageChildHtml(message.messageFrom, message.message, message.id));
        });
    }

    deletedMessages.forEach((id) => {
        deleteMessageFromDOM(id);
    });
    
    newMessagesData.forEach((message) => {
        tasks.push(() => messageChildHtml(message.messageFrom, message.message, message.id))
    });

    handleDeletedMessages(deletedMessages);
    if (newMessagesData.length > 0) scrollTop();
    initImageListeners();
}

function initMessages(data) {
    const responseMessages = data.messages;
    
    if (responseMessages.length > 0) {
        const responseMessagesFrom1 = responseMessages.filter(message => message.messageFrom === 1);

        const sortedClientMessages = getClientMessagesFrom1();
        const sortedResponseMessages = sortMessages(responseMessagesFrom1);

        updateClientMessagesFrom1(sortedResponseMessages);
        
        const haveDeleteMessages = sortedClientMessages.filter((a) => !sortedResponseMessages.includes(a));
        const haveNewMessages = sortedResponseMessages.filter((a) => !sortedClientMessages.includes(a));

        displayMessages({ messagesData: responseMessages, newMessages: haveNewMessages, deletedMessages: haveDeleteMessages });
    }

    equateResponse(responseMessages)
}

async function displayLoadingMessage(id = "loading") {
    addMessageInDOM(loadingMessage(id));
    await delay(randomTimeout(1000, 2000));
    deleteMessageFromDOM(id);
};

async function checkTasks() {
    while (tasks.length > 0) {
        await displayLoadingMessage();
        addMessageInDOM(tasks.shift()());
        handleNewMessage();
        await delay(randomTimeout());
    }

    setTimeout(checkTasks, randomTimeout());
}

checkAndUpdateClientMessages();
checkTasks();