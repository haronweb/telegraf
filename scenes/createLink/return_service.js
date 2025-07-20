const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Service, Profiles, MyDomains } = require("../../database");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");
const axios = require("axios");
const rand = require("../../helpers/rand");
const myAd = require("../../commands/myAd");
const downloadImage = require("../../helpers/downloadImage");

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
  NGN: "₦",
  EGP: "£",
  KES: "KSh",
  GHS: "₵",
  MAD: "DH",
  PKR: "₨",
};

const scene = new WizardScene(
  "return_service",

  // Step 1: Get old ad and ask title
  async (ctx) => {
    const oldAd = await Ad.findOne({ where: { id: ctx.match[1] } });
    if (!oldAd)
      return ctx.scene
        .reply("❌ Объявление не найдено")
        .then(() => ctx.scene.leave());

    ctx.wizard.state.oldAd = oldAd;
    await ctx.scene.reply("Введите название объявления", {
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("Отменить", "cancel")],
      ]),
    });
    return ctx.wizard.next();
  },

  // Step 2: Save title, ask photo
  async (ctx) => {
    if (!ctx.message?.text)
      return ctx.scene.reply("❌ Введите корректный заголовок.");

    ctx.wizard.state.title = ctx.message.text;
    await ctx.scene
      .reply("Отправьте изображение товара", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Пропустить", "skip")],
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      })
      .catch((err) => err);
    return ctx.wizard.next();
  },

  async (ctx) => {
    try {
    if (ctx.callbackQuery?.data === "skip") {

  ctx.wizard.state.photo = null; // 👈 обязательно инициализировать

  if (ctx.wizard.state.oldAd.version === 0)
 {
return ctx.wizard.steps[6](ctx);
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
                Markup.callbackButton("🇳🇬 Найра (NGN)", "NGN"), // Нигерия
                Markup.callbackButton("🇿🇦 Ранд (ZAR)", "ZAR"), // Южная Африка
              ],
              [
                Markup.callbackButton("🇪🇬 Египетский фунт (EGP)", "EGP"), // Египет
                Markup.callbackButton("🇰🇪 Кенийский шиллинг (KES)", "KES"), // Кения
              ],
              [
                Markup.callbackButton("🇬🇭 Седи (GHS)", "GHS"), // Гана
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
      }

      // Обработка фото, если НЕ skip
      if (!ctx.message?.photo || ctx.message.photo.length < 1) {
        await ctx.scene.reply(
          "❌ Пожалуйста, отправьте фото или нажмите 'Пропустить'",
          {
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("Отменить", "cancel")],
            ]),
          }
        );
        return;
      }

      const fileLink = await ctx.telegram.getFileLink(
        ctx.message.photo.slice(-1)[0].file_id
      );
      ctx.wizard.state.photo = await downloadImage(fileLink);

      if (ctx.wizard.state.oldAd.version === 0)
 {
return ctx.wizard.steps[6](ctx);
  }

      // Спрашиваем валюту
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
              Markup.callbackButton("🇳🇬 Найра (NGN)", "NGN"), // Нигерия
              Markup.callbackButton("🇿🇦 Ранд (ZAR)", "ZAR"), // Южная Африка
            ],
            [
              Markup.callbackButton("🇪🇬 Египетский фунт (EGP)", "EGP"), // Египет
              Markup.callbackButton("🇰🇪 Кенийский шиллинг (KES)", "KES"), // Кения
            ],
            [
              Markup.callbackButton("🇬🇭 Седи (GHS)", "GHS"), // Гана
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
      console.error("Ошибка на шаге 3:", err);
      await ctx.scene.reply("❌ Ошибка при обработке изображения");
      return ctx.scene.leave();
    }
  },
  // Step 4: Save currency
  async (ctx) => {
    const currency = ctx.callbackQuery?.data;
    if (!currency)
      return ctx.scene.reply("❌ Выберите валюту из списка выше.", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });

    ctx.wizard.state.currency = currency;

 if (currency === "no_price") {
  ctx.wizard.state.price = null;

  const profiles = await Profiles.findAll({ where: { userId: ctx.from.id } });
  if (!profiles.length) {
    return ctx.wizard.next(); // переход к финальному шагу, если профилей нет
  }

  const buttons = profiles.map(p => [Markup.callbackButton(p.title, `profile_${p.id}`)]);
  await ctx.scene.reply("👤 Выберите профиль", {
    reply_markup: Markup.inlineKeyboard([
      ...buttons,
      [Markup.callbackButton("Отменить", "cancel")]
    ])
  });

  return ctx.wizard.next(); // переход к шагу с выбором профиля
}


    await ctx.scene.reply(`Введите цену в ${currencySymbols[currency]}`, {
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("Отменить", "cancel")],
      ]),
    });
    return ctx.wizard.next();
  },

  // Step 5: Save price
// Step 5: Save price
async (ctx) => {
  // ⛔ если пришёл callback, пропусти (это профиль)
  if (ctx.callbackQuery) return ctx.wizard.nextStep(6); // перейти на профиль

  const price = parseFloat(ctx.message?.text);
  if (isNaN(price)) return ctx.scene.reply("❌ Введите число.",{
     reply_markup: Markup.inlineKeyboard([
      [Markup.callbackButton("Отменить", "cancel")],
    ]),
  });

  ctx.wizard.state.price = `${price} ${currencySymbols[ctx.wizard.state.currency]}`;

  const profiles = await Profiles.findAll({
    where: { userId: ctx.from.id },
  });

  if (profiles.length === 0) {
    return ctx.wizard.selectStep(7); // переход к финальному шагу
  }

  const buttons = profiles.map((p) => [
    Markup.callbackButton(p.title, `profile_${p.id}`),
  ]);

  await ctx.scene.reply(`👤 Выберите профиль`, {
    reply_markup: Markup.inlineKeyboard([
      ...buttons,
      [Markup.callbackButton("Отменить", "cancel")],
    ]),
  });

  return ctx.wizard.next();
},
  // Step 6: Save profile
  async (ctx) => {
    const profileId = ctx.callbackQuery?.data?.split("_")[1];
    if (!profileId) return ctx.scene.reply("❌ Некорректный выбор",{
       reply_markup: Markup.inlineKeyboard([
      [Markup.callbackButton("Отменить", "cancel")],
    ]),
    });

    await ctx.answerCbQuery();

    const profile = await Profiles.findOne({
      where: {
        id: profileId,
        userId: ctx.from.id, // 🔐 двойная проверка
      },
    });

    if (!profile) {
      return ctx.scene.reply("❌ Профиль не найден или не принадлежит вам.",{
         reply_markup: Markup.inlineKeyboard([
      [Markup.callbackButton("Отменить", "cancel")],
    ]),
      });
    }

    Object.assign(ctx.wizard.state, {
      name: profile.name,
      address: profile.address,
      phone: profile.phone,
    });

    return ctx.wizard.nextStep();
  },

  // Step 7: Final, create ad
  async (ctx) => {
    const old = ctx.wizard.state.oldAd;
    const adId = parseInt(rand(999999, 99999999) + Date.now() / 10000);
    const fullDomain = old.customLink.match(/^https:\/\/([^\/]+)\//)?.[1];
    const customLink = `https://${fullDomain}/${adId}`;

    const ad = await Ad.create({
      id: adId,
      userId: ctx.from.id,
      customLink,
      balanceChecker: old.balanceChecker,
      logo: old.logo,
      version: old.version,
      photo: ctx.wizard.state.photo,
      name: ctx.wizard.state.name || old.name,
      address: ctx.wizard.state.address || old.address,
      phone: ctx.wizard.state.phone || old.phone,
      about: old.about,
      date: old.date,
      price: ctx.wizard.state.price,
      title: ctx.wizard.state.title,
      serviceCode: old.serviceCode,
      color: old.color,
      favicon: old.favicon,
      language: old.language,
    });

    log(ctx, `создал объявление ${old.title} (ID: ${ad.id})`);
    await myAd(ctx, ad.id);

    return ctx.scene.leave();
  }
);

module.exports = scene;
