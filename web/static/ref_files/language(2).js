var subdomain = window.location.hostname.split('.')[0];
$('#chat-powered-by').text(subdomain);

switch (chatLanguage) {
    case 'EN':
        $('#chat-message-input').attr("placeholder", 'Enter your message...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Support Chat" : chatTitle);
        break;
    case 'DE':
        $('#chat-message-input').attr("placeholder", 'Eingeben Sie Ihre Nachricht...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Unterstützung Chat" : chatTitle);
        break;
    case 'HE':
        $('#chat-message-input').attr("placeholder", 'הכנס הודעתך...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "תמיכה בצ'אט" : chatTitle);
        break;
    case 'SK':
        $('#chat-message-input').attr("placeholder", 'Zadaj svoju správu...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Podpora chatu" : chatTitle);
        break;
    case 'NL':
        $('#chat-message-input').attr("placeholder", 'Voer uw bericht in...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Ondersteuningchat" : chatTitle);
        break;
    case 'CN':
        $('#chat-message-input').attr("placeholder", '输入您的消息...');
        $('#chat-online').text('在线');
        $('#chat-title').text(chatTitle === "default" ? "支持聊天" : chatTitle);
        break;
    case 'HU':
        $('#chat-message-input').attr("placeholder", 'Írj bele a üzeneted...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Támogatási csevegés" : chatTitle);
        break;
    case 'CZ':
        $('#chat-message-input').attr("placeholder", 'Zadejte svůj zprávu...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Podpora chatu" : chatTitle);
        break;
    case 'PL':
        $('#chat-message-input').attr("placeholder", 'Wprowadź swoją wiadomość...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Czat wsparcia" : chatTitle);
        break;
    case 'ES':
        $('#chat-message-input').attr("placeholder", 'Escribe tu mensaje...');
        $('#chat-online').text('En línea');
        $('#chat-title').text(chatTitle === "default" ? "Chat de soporte" : chatTitle);
        break;
    case 'FR':
        $('#chat-message-input').attr("placeholder", 'Entrez votre message...');
        $('#chat-online').text('En ligne');
        $('#chat-title').text(chatTitle === "default" ? "Chat d'assistance" : chatTitle);
        break;
    case 'IT':
        $('#chat-message-input').attr("placeholder", 'Inserisci il tuo messaggio...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Chatta di supporto" : chatTitle);
        break;
    case 'LT':
        $('#chat-message-input').attr("placeholder", 'Pasirinkite savo naujieną...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Palaikymo pokalbis" : chatTitle);
        break;
    case 'RO':
        $('#chat-message-input').attr("placeholder", 'Introduceți mesajul dvs...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Chat de asistență" : chatTitle);
        break;
    case 'HR':
        $('#chat-message-input').attr("placeholder", 'Unesite svoju poruku...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Podrška Chat" : chatTitle);
        break;
    case 'PT':
        $('#chat-message-input').attr("placeholder", 'Introduza sua mensagem...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Bate-papo de suporte" : chatTitle);
        break;
    case 'ET':
        $('#chat-message-input').attr("placeholder", 'Sisestage oma sõna...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Tugivestlus" : chatTitle);
        break;
    case 'BS':
        $('#chat-message-input').attr("placeholder", 'Unesite svoju poruku...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Support Chat" : chatTitle);
        break;
    case 'UA':
        $('#chat-message-input').attr("placeholder", 'Введіть ваше повідомлення...');
        $('#chat-online').text('Онлайн');
        $('#chat-title').text(chatTitle === "default" ? "Чат підтримки" : chatTitle);
        break;
    case 'TH':
        $('#chat-message-input').attr("placeholder", 'ใส่ข้อความของคุณ...');
        $('#chat-online').text('ออนไลน์');
        $('#chat-title').text(chatTitle === "default" ? "สนับสนุนการแชท" : chatTitle);
        break;
    case 'GE':
        $('#chat-message-input').attr("placeholder", 'შეიყვანეთ თქვენი მესაჭერი...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "ჩატის მხარდაჭერა" : chatTitle);
        break;
    case 'JP':
        $('#chat-message-input').attr("placeholder", 'メッセージを入力してください...');
        $('#chat-online').text('オンライン');
        $('#chat-title').text(chatTitle === "default" ? "サポートチャット" : chatTitle);
        break;
    case 'DK':
        $('#chat-message-input').attr("placeholder", 'Indtast din besked...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Chat med support" : chatTitle);
        break;
    case 'FI':
        $('#chat-message-input').attr("placeholder", 'Kirjoita viestisi tähän...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Asiakastuki Chat" : chatTitle);
        break;
    case 'EL':
        $('#chat-message-input').attr("placeholder", 'Εισαγάγετε το μήνυμά σας...');
        $('#chat-online').text('Σε απευθείας σύνδεση');
        $('#chat-title').text(chatTitle === "default" ? "Υποστήριξη Συνομιλίας" : chatTitle);
        break;
    case 'TW':
        $('#chat-message-input').attr("placeholder", '輸入您的訊息...');
        $('#chat-online').text('在線上');
        $('#chat-title').text(chatTitle === "default" ? "支援聊天" : chatTitle);
        break;
    case 'SV':
        $('#chat-message-input').attr("placeholder", 'Ange ditt meddelande...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Supportchatt" : chatTitle);
        break;
    case 'NO':
        $('#chat-message-input').attr("placeholder", 'Skriv inn meldingen din...');
        $('#chat-online').text('Pålogget');
        $('#chat-title').text(chatTitle === "default" ? "Støttechat" : chatTitle);
        break;
    case 'SI':
        $('#chat-message-input').attr("placeholder", 'Vnesite svoje sporočilo...');
        $('#chat-online').text('Na spletu');
        $('#chat-title').text(chatTitle === "default" ? "Pogovorni klepet" : chatTitle);
        break;
    case 'FIL':
        $('#chat-message-input').attr("placeholder", 'Ilagay ang iyong mensahe...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Suportahan ang Chat" : chatTitle);
        break;
    case 'HI':
        $('#chat-message-input').attr("placeholder", 'अपना संदेश यहाँ दर्ज करें...');
        $('#chat-online').text('ऑनलाइन');
        $('#chat-title').text(chatTitle === "default" ? "सहायता चैट" : chatTitle);
        break;
    case 'BG':
        $('#chat-message-input').attr("placeholder", 'Въведете вашето съобщение...');
        $('#chat-online').text('Онлайн');
        $('#chat-title').text(chatTitle === "default" ? "Поддръжка Чат" : chatTitle);
        break;
    default:
        $('#chat-message-input').attr("placeholder", 'Enter your message...');
        $('#chat-online').text('Online');
        $('#chat-title').text(chatTitle === "default" ? "Support Chat" : chatTitle);
        break;
}