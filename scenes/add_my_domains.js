const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Settings, MyDomains } = require("../database");
const log = require("../helpers/log");

const axios = require("axios");

const psl = require("psl"); // Понадобится библиотека для разбора доменов (установи: `npm install psl`)

// 🔧 Очистка домена от https://, www. и /
function cleanDomain(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

const scene = new WizardScene(
  "add_my_domains",
  async (ctx) => {
    try {
      await ctx.replyOrEdit("Введите приобретённый домен (например: example.com или subdomain.example.com)", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отмена", "cancel_my_domain")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка").catch(() => { });
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();

      const userInput = ctx.message.text;
      const domain = cleanDomain(userInput);

      const parsed = psl.parse(domain);
      if (!parsed.domain) {
        await ctx.scene.reply("❌ Неверный домен", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отмена", "cancel_my_domain")],
          ]),
        }).catch(() => { });
        return ctx.scene.leave();
      }
      const zoneName = parsed.domain;
      const recordName = domain === zoneName ? "@" : domain.replace(`.${zoneName}`, "");

      const settings = await Settings.findOne({ where: { id: 1 } });

      const loadingMsg = await ctx.reply("⏳ Добавляю...");

      // Попытка получить существующую зону
      const zonesRes = await axios.get(
        `https://api.cloudflare.com/client/v4/zones?name=${zoneName}`,
        {
          headers: {
            "X-Auth-Email": settings.cf_mail,
            "X-Auth-Key": settings.cf_api,
            "Content-Type": "application/json",
          },
        }
      );

      let zoneId;
      let ns1, ns2;

      if (zonesRes.data.result.length > 0) {
        // Зона уже есть
        zoneId = zonesRes.data.result[0].id;
        [ns1, ns2] = zonesRes.data.result[0].name_servers;
      } else {
        // Создаём новую зону
        const zoneRes = await axios.post(
          "https://api.cloudflare.com/client/v4/zones",
          {
            name: zoneName,
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
      // Получаем IP
      const ipRes = await axios.get("https://api.ipify.org/?format=json");
      const ip = ipRes.data.ip;
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
        .catch(() => {
          ctx.reply("⚠️ Не удалось включить Always Use HTTPS").catch(() => { });
        });

      // Добавление A-записи
      try {
        await axios.post(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
          {
            type: "A",
            name: recordName,
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
      } catch (err) {
        const code = err.response?.data?.errors?.[0]?.code;
        if (code === 81058) {
          console.warn("⚠️ DNS-запись уже существует, продолжаем.");
        } else {
          console.error(
            "❌ Ошибка при создании DNS-записи:",
            err.response?.data || err.message
          );
          await ctx.reply("❌ Ошибка при создании DNS-записи").catch(() => { });
        }
      }

      // Сохраняем домен в БД (без https://)
      await MyDomains.create({
        userId: ctx.from.id,
        domain: domain,
        zoneId: zoneId,
      });

      // Уведомление
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        loadingMsg.message_id,
        null,
        `<b>✅ Домен добавлен</b>\n\n<i>Теперь измените DNS у купленного домена на:</i>\n\n<code>${ns1}</code>\n<code>${ns2}</code>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ Назад", "settings_my_domains")],
          ]),
        }
      );

      try {
        if (settings.loggingGroupId) {
          log(ctx, `добавил личный домен <b>${domain}</b>`);
        }
      } catch (err) {
        console.error(
          "❌ Ошибка при логировании действия:",
          err.description || err.message
        );
      }

      return ctx.scene.leave();
    } catch (err) {
      console.error(
        "❌ Ошибка при добавлении домена:",
        err?.response?.data || err.message
      );
      await ctx.reply("❌ Ошибка при добавлении домена").catch(() => { });
      return ctx.scene.leave();
    }
  }
);
// scene.leave(domain);

module.exports = scene;
