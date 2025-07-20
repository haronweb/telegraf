const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Settings, Service } = require("../../database");
const log = require("../../helpers/log");
const axios = require("axios");

// 🔧 Парсинг домена на root и поддомен
function parseDomain(input) {
  const clean = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const parts = clean.split(".");
  if (parts.length < 2) throw new Error("Некорректный домен");

  const rootDomain = parts.slice(-2).join(".");
  const subdomain = parts.length > 2 ? parts.slice(0, -2).join(".") : "@";

  return { rootDomain, subdomain };
}

const scene = new WizardScene(
  "admin_add_shortlink_to_service",

  // Шаг 1 — запрос домена
  async (ctx) => {
    const serviceId = ctx.scene.state?.serviceId;
    if (!serviceId) {
      await ctx.scene.reply("❌ Не указан ID сервиса");
      return ctx.scene.leave();
    }

    const service = await Service.findByPk(serviceId);
    if (!service) {
      await ctx.scene.reply("❌ Сервис не найден");
      return ctx.scene.leave();
    }

    const msg = await ctx.reply(
      `Введите домен сокращалки, который хотите добавить и привязать к сервису (например: example.com или subdomain.example.com)`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel_service")],
        ]),
      }
    );
    ctx.scene.state.requestMsg = msg;
    return ctx.wizard.next();
  },

  // Шаг 2 — обработка домена
  async (ctx) => {
    const serviceId = ctx.scene.state?.serviceId;
    if (!ctx.message?.text || !serviceId) return ctx.scene.leave();

    const service = await Service.findByPk(serviceId);
    if (!service) {
      await ctx.scene.reply("❌ Сервис не найден");
      return ctx.scene.leave();
    }

    let rootDomain, subdomain;
    try {
      ({ rootDomain, subdomain } = parseDomain(ctx.message.text));
    } catch {
      await ctx.scene.reply("❌ Укажите корректный домен, например: sub.example.com или example.com", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel_service")],
        ]),
      });
      return ctx.scene.leave();
    }

    const fullDomain = subdomain === "@" ? rootDomain : `${subdomain}.${rootDomain}`;
    const userMsgId = ctx.message.message_id;
    await ctx.deleteMessage(userMsgId).catch(() => { });
    if (ctx.scene.state.requestMsg) {
      await ctx.deleteMessage(ctx.scene.state.requestMsg.message_id).catch(() => { });
    }

    const settings = await Settings.findOne({ where: { id: 1 } });
    if (!settings?.cf_mail || !settings?.cf_api || !settings?.cf_id) {
      await ctx.scene.reply("❌ Cloudflare не настроен");
      return ctx.scene.leave();
    }

    const loading = await ctx.reply("⏳ Добавляю сокращалку...");
    ctx.scene.state.loadingMsg = loading;

    try {
      let zoneId;
      let ns1, ns2;

      // Проверяем существующую зону
      const existingZone = await axios
        .get(`https://api.cloudflare.com/client/v4/zones?name=${rootDomain}`, {
          headers: {
            "X-Auth-Email": settings.cf_mail,
            "X-Auth-Key": settings.cf_api,
            "Content-Type": "application/json",
          },
        })
        .then((res) => res.data.result?.[0])
        .catch(() => null);

      if (existingZone) {
        zoneId = existingZone.id;
        [ns1, ns2] = existingZone.name_servers;
      } else {
        // Создаём новую зону
        const zoneRes = await axios.post(
          "https://api.cloudflare.com/client/v4/zones",
          {
            name: rootDomain,
            jump_start: true,
            account: { id: settings.cf_id },
          },
          {
            headers: {
              "X-Auth-Email": settings.cf_mail,
              "X-Auth-Key": settings.cf_api,
              "Content-Type": "application/json",
            },
          }
        );
        zoneId = zoneRes.data.result.id;
        [ns1, ns2] = zoneRes.data.result.name_servers;
      }
      // Устанавливаем уровень защиты LOW
      await axios
        .patch(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/security_level`,
          { value: "low" },
          {
            headers: {
              "X-Auth-Email": settings.cf_mail,
              "X-Auth-Key": settings.cf_api,
              "Content-Type": "application/json",
            },
          }
        )
        .catch((err) =>
          console.warn(
            "⚠️ Не удалось установить уровень защиты low:",
            err.response?.data || err.message
          )
        );


      // Получаем IP
      // Жёстко заданный IP для сокращалки
      const ip = "185.208.158.144";

      // Добавляем A-запись
      await axios
        .post(
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
              "X-Auth-Email": settings.cf_mail,
              "X-Auth-Key": settings.cf_api,
              "Content-Type": "application/json",
            },
          }
        )
        .catch((err) => {
          const code = err.response?.data?.errors?.[0]?.code;
          if (code !== 81058) {
            throw new Error("Ошибка создания A-записи");
          }
        });

      // Включаем настройки
      await axios
        .patch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/ssl`, { value: "flexible" }, {
          headers: {
            "X-Auth-Email": settings.cf_mail,
            "X-Auth-Key": settings.cf_api,
            "Content-Type": "application/json",
          },
        }).catch(() => { });
      await axios
        .patch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/always_use_https`, { value: "on" }, {
          headers: {
            "X-Auth-Email": settings.cf_mail,
            "X-Auth-Key": settings.cf_api,
            "Content-Type": "application/json",
          },
        }).catch(() => { });

      // Сохраняем в сервис
      await service.update({
        shortlink: fullDomain,
        shortlinkZone: zoneId,
      });

      await ctx.telegram.editMessageText(
        ctx.chat.id,
        loading.message_id,
        null,
        `<b>✅ Новый домен сокращалки установлен для сервиса ${service.title}</b>\n\n<i>Теперь измените DNS у купленного домена на:</i>\n\n<code>${ns1}</code>\n<code>${ns2}</code>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ Назад", `admin_service_${serviceId}`)],
          ]),
        }
      );


      // Уведомление в общую группу
      if (settings.allGroupId) {
        await ctx.telegram.sendMessage(
          settings.allGroupId,
          `<b>✅ Новый домен сокращалки установлен для сервиса ${service.title}</b>\n\n<i>Домен станет активным в течение 5–20 минут. Повторное создание ссылок не требуется!</i>`,
          { parse_mode: "HTML" }
        );
      }

      if (settings.loggingGroupId) {
        log(ctx, `добавил сокращалку <b>${fullDomain}</b> для <b>${service.title}</b>`);
      }

      return ctx.scene.leave();
    } catch (err) {
      console.error("❌ Ошибка при установке сокращалки:", err.response?.data || err.message);
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        ctx.scene.state.loadingMsg.message_id,
        null,
        `❌ Ошибка при установке сокращалки. Попробуйте позже.`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ Назад", `admin_service_${serviceId}`)],
          ]),
        }
      );
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
