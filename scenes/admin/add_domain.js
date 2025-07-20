const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Settings, Service } = require("../../database");
const log = require("../../helpers/log");
const axios = require("axios");

module.exports = new WizardScene(
  "add_domain",

  // Шаг 1 — Запрашиваем домен
  async (ctx) => {
    try {
      await ctx.scene.reply("Введите домен, который хотите добавить", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "admin_cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка").catch(() => { });
      return ctx.scene.leave();
    }
  },

  // Шаг 2 — Обработка домена
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();

      const domainInput = ctx.message.text.trim().toLowerCase();
      const settings = await Settings.findOne({ where: { id: 1 } });
      const services = await Service.findAll();

      if (!settings.cf_mail || !settings.cf_api || !settings.cf_id) {
        await ctx.reply("❌ Ошибка: Cloudflare не настроен").catch(() => { });
        return ctx.scene.leave();
      }

      await ctx.scene.reply("⏳ Обрабатываю...").catch(() => { });

      // Удаляем старую зону
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
        } catch (err) {
          console.warn(
            "⚠️ Не удалось удалить старую зону:",
            err.response?.data || err.message
          );
        }
      }

      // Создаём новую зону
      const zoneRes = await axios.post(
        "https://api.cloudflare.com/client/v4/zones",
        {
          name: domainInput,
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

      const zoneId = zoneRes.data.result.id;
      const [ns1, ns2] = zoneRes.data.result.name_servers;

      await axios.patch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/ssl`,
        { value: "flexible" },
        {
          headers: {
            "X-Auth-Email": settings.cf_mail,
            "X-Auth-Key": settings.cf_api,
            "Content-Type": "application/json",
          },
        }
      ).catch((err) =>
        console.warn("⚠️ Не удалось установить SSL Flexible:", err.response?.data || err.message)
      );

      await axios.patch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/always_use_https`,
        { value: "on" },
        {
          headers: {
            "X-Auth-Email": settings.cf_mail,
            "X-Auth-Key": settings.cf_api,
            "Content-Type": "application/json",
          },
        }
      ).catch((err) =>
        console.warn("⚠️ Не удалось включить Always Use HTTPS:", err.response?.data || err.message)
      );
      // Устанавливаем минимальный уровень защиты (low)
      await axios.patch(
        `https://api.cloudflare.com/client/v4/zones/${zoneRes.data.result.id}/settings/security_level`,
        { value: "low" },
        {
          headers: {
            "X-Auth-Email": settings.cf_mail,
            "X-Auth-Key": settings.cf_api,
            "Content-Type": "application/json",
          },
        }
      ).catch((err) =>
        console.warn(
          "⚠️ Не удалось установить уровень защиты low:",
          err.response?.data || err.message
        )
      );


      // Обновляем настройки
      await Settings.update(
        { cf_id_domain: zoneId, domain: domainInput },
        { where: { id: 1 } }
      );

      const ip = await axios.get("https://api.ipify.org?format=json").then((r) => r.data.ip);

      const createdSubdomains = new Set();

      await Promise.all(
        services.map(async (service) => {
          const subdomain = service.code.split("_")[0];
          const fullDomain = `${subdomain}.${domainInput}`;

          if (!createdSubdomains.has(fullDomain)) {
            createdSubdomains.add(fullDomain);
            try {
              const existing = await axios.get(
                `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A&name=${fullDomain}`,
                {
                  headers: {
                    "X-Auth-Email": settings.cf_mail,
                    "X-Auth-Key": settings.cf_api,
                  },
                }
              ).then((res) => res.data.result[0]).catch(() => null);

              if (existing) {
                await axios.put(
                  `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existing.id}`,
                  {
                    type: "A",
                    name: fullDomain,
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
                );
              } else {
                await axios.post(
                  `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
                  {
                    type: "A",
                    name: fullDomain,
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
                );
              }
            } catch (e) {
              console.warn(`⚠️ Ошибка при работе с ${fullDomain}:`, e.response?.data || e.message);
            }
          }

          // Обновляем у всех сервисов
          await Service.update(
            { domain: fullDomain, zone: null },
            { where: { code: service.code } }
          );
        })
      );

      await ctx.scene.reply(
        `<b>✅ Домен успешно установлен (Основной)</b>\n\n<i>Измените DNS у купленного домена на:</i>\n\n<code>${ns1}</code>\n<code>${ns2}</code>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ Назад", "admin_domains")],
          ]),
        }
      );

      if (settings.allGroupId) {
        await ctx.telegram.sendMessage(
          settings.allGroupId,
          `<b>✅ Новый основной домен установлен!</b>\n\n<i>Домен станет активным в течение 5–20 минут.</i>`,
          { parse_mode: "HTML" }
        );
      }

      if (settings.loggingGroupId) {
        log(ctx, `добавил новый основной домен <b>${domainInput}</b>`);
      }

      return ctx.scene.leave();
    } catch (err) {
      console.error("❌ Ошибка при добавлении домена:", err.response?.data || err.message);
      await ctx.reply("❌ Ошибка").catch(() => { });
      return ctx.scene.leave();
    }
  }
);
