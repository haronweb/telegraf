let chatOpened = false, newMessagesCount = 0;
if (localStorage.getItem('readMessagesFrom1') === null) updateReadMessagesFrom1();

$('#chat-widget-container').on('click', function() {
    if (document.getElementById('chat-iframe').contentWindow.getResponses() > 0) {
        toggleChat();
    }
});

$(window).on('resize', function() {
    checkWindowSize();
});

$(window).on("orientationchange", function() {
    checkWindowSize();
});

$(document).ready(function() {
    checkWindowSize();
});


function getReadMessagesFrom1() {
    let storageMessages = localStorage.getItem('readMessagesFrom1');
    return JSON.parse(storageMessages);
}

function updateReadMessagesFrom1(sortedMessages = []) {
    localStorage.setItem('readMessagesFrom1', JSON.stringify(sortedMessages));
}

function toggleChat() {
    isChatClosed() ? openChat() : closeChat();
}

function isChatClosed() {
    return chatOpened === false;
}

function openChat() {
    chatOpened = true;
    updateReadMessagesFrom1(document.getElementById('chat-iframe').contentWindow.getClientMessagesFrom1());
    $('#chat-widget-style').removeClass('chaport-collapsed').addClass('chaport-expanded');
    $('#chat-window-0').removeClass('chaport-anim-hide').addClass('chaport-anim-show');
    document.getElementById('chat-iframe').contentWindow.scrollTop();
    showWidgetBadge({ count: 0, show: false });
    checkWindowSize();
}

function closeChat() {
    chatOpened = false;
    $('#chat-widget-style').removeClass('chaport-expanded').addClass('chaport-collapsed');
    $('#chat-window-0').removeClass('chaport-anim-show').addClass('chaport-anim-hide');
    checkWindowSize();
}

function checkWindowSize() {
    if (($(window).width() <= 750 || $(window).height() <= 700) && chatOpened) {
        $('body').css('overflow', 'hidden');
    } else {
        $('body').css('overflow', 'auto');
    }
}

function showWidgetBadge({ count = 0, show = true }) {
    var badge = $('#chat-widget-badge');

    if (show === true) {
        newMessagesCount += count;

        if (newMessagesCount <= 0) badge.removeClass('chaport-badge-show').addClass('chaport-badge-hide');
        else badge.removeClass('chaport-badge-hide').addClass('chaport-badge-show');
    }
    else {
        newMessagesCount = 0;
        badge.removeClass('chaport-badge-show').addClass('chaport-badge-hide');
    }

    badge.text(newMessagesCount);
}