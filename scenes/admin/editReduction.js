const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Settings, Service } = require("../../database");
const log = require("../../helpers/log");
const axios = require("axios");

module.exports = new WizardScene(
  "admin_reduction",
  async (ctx) => {
    try {
      await ctx.scene.reply(
        "Введите домен который вы уже приобрели для сокращалки",
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отмена", "admin_cancel")],
          ]),
        }
      );
      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка").catch(() => {});
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();

      const newDomain = ctx.message.text.trim();
      const settings = await Settings.findOne({ where: { id: 1 } });

      if (!settings) {
        await ctx.reply("❌ Ошибка загрузки настроек").catch(() => {});
        return ctx.scene.leave();
      }

      await ctx.scene.reply("⏳ Добавляю домен...").catch(() => {});

      // 1. Удаление старой зоны, если есть
      if (settings.shortlinkZone) {
        try {
          await axios.delete(
            `https://api.cloudflare.com/client/v4/zones/${settings.shortlinkZone}`,
            {
              headers: {
                "X-Auth-Email": settings.cf_mail,
                "X-Auth-Key": settings.cf_api,
                "Content-Type": "application/json",
              },
            }
          );
          console.log(
            `✅ Удалена старая зона сокращалки: ${settings.shortlinkZone}`
          );
        } catch (err) {
          console.warn(
            "⚠️ Не удалось удалить старую зону:",
            err.response?.data || err.message
          );
        }
      }

      // 2. Создание новой зоны
      const zoneResponse = await axios.post(
        "https://api.cloudflare.com/client/v4/zones",
        {
          name: newDomain,
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

      const zoneId = zoneResponse.data.result.id;
      const [ns1, ns2] = zoneResponse.data.result.name_servers;
      const ip = "185.208.158.144";
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
          console.warn(
            "⚠️ Не удалось установить режим SSL Flexible:",
            err.response?.data || err.message
          )
        );
      // 3. Включаем Always Use HTTPS
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
        .catch(() => {});

      // 4. Создаём A-запись
      await axios
        .post(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
          {
            type: "A",
            name: "@",
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
        .catch(() => {});

      // 5. Обновляем настройки
      await Settings.update(
        {
          shortlink: newDomain,
          shortlinkZone: zoneId,
        },
        { where: { id: 1 } }
      );

      // 6. Сообщение об успехе
      await ctx.scene.reply(
        `<b>✅ Домен для сокращалки успешно установлен!</b>\n\n<i>Измените DNS у купленного домена на следующие NS-сервера:</i>\n\n<code>${ns1}</code>\n<code>${ns2}</code>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ Назад", "admin_domains")],
          ]),
        }
      );

      // 7. Логирование
      if (settings.logsGroupId) {
        log(ctx, `добавил новый домен сокращалки <b>${newDomain}</b>`);
      }

      // 8. Уведомление в общую группу
      if (settings.allGroupId) {
        await ctx.telegram.sendMessage(
          settings.allGroupId,
          `<b>🌐 Новый домен сокращалки установлен!</b>\n\n<i>✅ Активируется через 5–20 минут.</i>`,
          { parse_mode: "HTML" }
        );
      }

      return ctx.scene.leave();
    } catch (err) {
      console.error("❌ Ошибка при добавлении сокращалки:", err);
      await ctx.reply("❌ Ошибка").catch(() => {});
      return ctx.scene.leave();
    }
  }
);
