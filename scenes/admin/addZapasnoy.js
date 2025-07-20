const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Settings, Service, Domains } = require("../../database");
const log = require("../../helpers/log");

const axios = require("axios");

module.exports = new WizardScene(
  "admin_domain_addZapasnoy",
  async (ctx) => {
    try {
      await ctx.scene.reply("Введите домен который вы уже приобрели", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отмена", "admin_cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();
      const settings = await Settings.findOne({ where: { id: 1 } });
      var ns1 = "";
      var ns2 = "";
      await ctx.scene.reply("⏳ Добавляю...").catch((err) => err);

      axios
        .post(
          "https://api.cloudflare.com/client/v4/zones",
          {
            name: ctx.message.text,
            jump_start: true,
            account: {
              id: settings.cf_id,
            },
          },
          {
            headers: {
              "X-Auth-Email": settings.cf_mail,
              "X-Auth-Key": settings.cf_api,
              "Content-Type": "application/json",
            },
          }
        )
        .then(async function (response) {
          ns1 = response["data"]["result"]["name_servers"][0];
          ns2 = response["data"]["result"]["name_servers"][1];

          const services = await Service.findAll();
          let ip = await axios
            .get("https://api.ipify.org/?format=json")
            .then(function (response) {
              return response["data"]["ip"];
            })
            .catch(function (error) {
              ctx
                .reply("❌ Ошибка при получении IP адреса сервера")
                .catch((error) => error);
            });
          // Включаем Always Use HTTPS
          await axios
            .patch(
              `https://api.cloudflare.com/client/v4/zones/${response.data.result.id}/settings/ssl`,
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
          axios
            .patch(
              `https://api.cloudflare.com/client/v4/zones/${response.data.result.id}/settings/always_use_https`,
              {
                value: "on", // Включаем перенаправление
              },
              {
                headers: {
                  "X-Auth-Email": settings.cf_mail,
                  "X-Auth-Key": settings.cf_api,
                  "Content-Type": "application/json",
                },
              }
            )
            .then(function (response) {
              // Обработка успешного включения "Always Use HTTPS"
              console.log("Always Use HTTPS enabled successfully");
            })
            .catch(function (error) {
              // Обработка ошибки при попытке включить "Always Use HTTPS"
              console.error("Error enabling Always Use HTTPS", error);
              ctx
                .reply("❌ Ошибка при включении Always Use HTTPS")
                .catch((err) => err);
            });
          // Устанавливаем минимальный уровень защиты (low)
          await axios.patch(
            `https://api.cloudflare.com/client/v4/zones/${response.data.result.id}/settings/security_level`,
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

          await ctx.scene.reply(
            `<b>✅ Домен успешно добавлен (Запасной)</b>\n\n<i>Теперь измените DNS у купленного домена на следующие:</i>\n\n<code>${ns1}</code>\n\n<code>${ns2}</code>`,
            {
              parse_mode: "HTML",
              reply_markup: Markup.inlineKeyboard([
                [Markup.callbackButton("◀️ Назад", "admin_domains")],
              ]),
            }
          );
          try {
            if (settings.loggingGroupId) {
              log(ctx, `добавил запасной домен <b>${ctx.message.text}</b>`);
            }
          } catch (err) {
            console.error(
              "❌ Ошибка при логировании действия:",
              err.description || err.message
            );
          }

          await Domains.create({
            domain: ctx.message.text,
          });
          services.map((v) =>
            axios.post(
              `https://api.cloudflare.com/client/v4/zones/${response["data"]["result"]["id"]}/dns_records`,
              {
                type: "A",
                name: `${v.code.split("_")[0]}.${ctx.message.text}`,
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
          );
        })
        .catch(function (err) {
          console.log(err);
          ctx.reply("❌ Ошибка").catch((err) => err);
        });

      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  }
);
