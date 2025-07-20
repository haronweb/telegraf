const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Service, Settings } = require("../../database");
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
  "admin_add_domain_to_service",

  // Шаг 1 — запрос домена
  async (ctx) => {
    const serviceId = ctx.scene.state?.serviceId;
    if (!serviceId) {
      await ctx.scene.reply("❌ Не указан ID сервиса");
      return ctx.scene.leave();
    }

    const requestMsg = await ctx.reply(
      "Введите домен, который хотите добавить и привязать к сервису (например: example.com или subdomain.example.com)",
      {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel_service")],
        ]),
      }
    );
    ctx.scene.state.requestMsg = requestMsg;
    return ctx.wizard.next();
  },

  // Шаг 2 — обработка домена
  async (ctx) => {
    const serviceId = ctx.scene.state?.serviceId;
    if (!ctx.message?.text || !serviceId) return ctx.scene.leave();

    let rootDomain, subdomain;
    try {
      ({ rootDomain, subdomain } = parseDomain(ctx.message.text));
    } catch (e) {
      await ctx.scene.reply("❌ Укажите корректный домен, например: sub.example.com или example.com", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel_service")],
        ]),


      });
      return ctx.scene.leave();
    }

    const fullDomain = subdomain === "@" ? rootDomain : `${subdomain}.${rootDomain}`;
    const userMessageId = ctx.message.message_id;

    // Удаляем сообщение пользователя
    await ctx.deleteMessage(userMessageId).catch((err) =>
      console.log("⚠️ Ошибка удаления сообщения пользователя:", err.message)
    );

    // Удаляем предыдущее сообщение-запрос
    if (ctx.scene.state.requestMsg) {
      await ctx.deleteMessage(ctx.scene.state.requestMsg.message_id).catch(() => { });
    }

    const settings = await Settings.findOne({ where: { id: 1 } });
    if (!settings || !settings.cf_id || !settings.cf_api || !settings.cf_mail) {
      await ctx.scene.reply("❌ Не настроены параметры Cloudflare");
      return ctx.scene.leave();
    }

    const loadingMsg = await ctx.reply("⏳ Добавляю домен в Cloudflare...");
    ctx.scene.state.loadingMsg = loadingMsg;

    try {
      const service = await Service.findByPk(serviceId);



      let zoneId;
      let ns1, ns2;

      try {
        // 1. Проверяем, существует ли уже такая зона
        const existingZoneRes = await axios.get(
          `https://api.cloudflare.com/client/v4/zones?name=${rootDomain}`,
          {
            headers: {
              "X-Auth-Email": settings.cf_mail,
              "X-Auth-Key": settings.cf_api,
              "Content-Type": "application/json",
            },
          }
        );

        const existingZone = existingZoneRes.data.result?.[0];

        if (existingZone) {
          // Если зона уже существует
          zoneId = existingZone.id;
          [ns1, ns2] = existingZone.name_servers;
        } else {
          // 2. Создаём новую зону
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

        }
      } catch (err) {
        console.error("❌ Ошибка при получении/создании зоны:", err.response?.data || err.message);
        await ctx.scene.reply("❌ Ошибка при получении или создании зоны Cloudflare");
        return ctx.scene.leave();
      }


      // Получение текущего IP
      const ipRes = await axios.get("https://api.ipify.org/?format=json");
      const ip = ipRes.data.ip;

      // Создание A-записи
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

      // Включаем SSL Flexible
      await axios
        .patch(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/ssl`,
          { value: "flexible" },
          {
            headers: {
              "X-Auth-Email": settings.cf_mail,
              "X-Auth-Key": settings.cf_api,
              "Content-Type": "application/json",
            },
          }
        )
        .catch((err) =>
          console.warn("⚠️ Не удалось установить режим SSL Flexible:", err.response?.data || err.message)
        );

      // Включаем Always Use HTTPS
      await axios
        .patch(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/always_use_https`,
          { value: "on" },
          {
            headers: {
              "X-Auth-Email": settings.cf_mail,
              "X-Auth-Key": settings.cf_api,
              "Content-Type": "application/json",
            },
          }
        )
        .catch((err) =>
          console.warn("⚠️ Не удалось включить Always Use HTTPS:", err.response?.data || err.message)
        );

      // Обновляем данные сервиса
      await service.update({
        domain: fullDomain,
        zone: zoneId,
      });

      const updatedService = await Service.findByPk(serviceId);

      await new Promise((resolve) => setTimeout(resolve, 500)); // Мини-задержка

      // Уведомление об успехе
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        loadingMsg.message_id,
        null,
        `<b>✅ Домен успешно добавлен к сервису ${updatedService.title}</b>

<i>Теперь измените DNS у купленного домена на:</i>

<code>${ns1}</code>
<code>${ns2}</code>`,
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
          `<b>✅ Новый домен установлен для сервиса ${updatedService.title}</b>\n\n<i>Домен станет активным в течение 5–20 минут. Повторное создание ссылок не требуется!</i>`,
          { parse_mode: "HTML" }
        );
      }

      // Логирование
      if (settings.loggingGroupId) {
        log(
          ctx,
          `добавил домен <b>${fullDomain}</b> для сервиса <b>${updatedService.title}</b>`
        );
      }

      return ctx.scene.leave();
    } catch (err) {
      console.error("❌ Ошибка при добавлении домена:", err.response?.data || err.message);

      // Сообщение об ошибке
      if (ctx.scene.state.loadingMsg) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.scene.state.loadingMsg.message_id,
          null,
          `❌ Произошла ошибка при добавлении домена. Попробуйте позже.`,
          {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("◀️ Назад", `admin_service_${serviceId}`)],
            ]),
          }
        );
      }

      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
