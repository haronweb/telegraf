const WizardScene = require("telegraf/scenes/wizard");
const { Request, User } = require("../database");
const locale = require("../locale");
const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const log = require("../helpers/log");

const scene = new WizardScene(
  "send_request",
  async (ctx) => {
    try {
      await ctx.deleteMessage().catch((err) => err);
      log(ctx, "перешёл к заполнению заявки");
      ctx.scene.state.data = {};
      const message = await ctx.scene.reply(locale.requests.steps[0].scene_text, { parse_mode: "HTML" });
      if (message && message.message_id) {
        ctx.scene.state.lastMessageId = message.message_id;
      }
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();
      log(ctx, "перешёл ко второму шагу заполнения заявки");
      ctx.scene.state.data.step1 = escapeHTML(
        ctx.message.text.replace(/\s+/g, " ").substr(0, 600)
      );
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.scene.reply(locale.requests.steps[1].scene_text, {
        parse_mode: "HTML",
      });
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();
      log(ctx, "перешёл к третьему шагу заполнения заявки");
      ctx.scene.state.data.step2 = escapeHTML(
        ctx.message.text.replace(/\s+/g, " ").substr(0, 600)
      );
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.scene.reply(locale.requests.steps[2].scene_text, {
        parse_mode: "HTML",
      });
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();

      const text = ctx.message.text.trim();

      if (text.includes("@")) {
        const username = text.replace("@", "");
        const user = await User.findOne({ where: { username: username } });

        if (!user) {
          await ctx.reply("❌ Пользователь не найден в боте").catch((err) => err);
          return ctx.wizard.prevStep();
        }
      }

      ctx.scene.state.data.step3 = escapeHTML(text.replace(/\s+/g, " ").substr(0, 600));
      ctx.session.step1 = ctx.scene.state.data.step1;
      ctx.session.step2 = ctx.scene.state.data.step2;
      ctx.session.step3 = ctx.message.text.trim();

      const message = await ctx.scene.reply("<b>4️⃣ Прикрепите скриншот с профитами </b>", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          Markup.callbackButton("Пропустить", "skipPhoto"),
        ]),
      });
      if (message && message.message_id) {
        ctx.scene.state.lastMessageId = message.message_id;
      }
      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      ctx.reply("❌ Ошибка").catch((err) => console.error(err));
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      if (ctx.updateType === 'callback_query' && ctx.update.callback_query.data === 'skipPhoto') {
        ctx.scene.state.data.photo = null;
        await ctx.answerCbQuery();
      } else if (ctx.message?.photo) {
        const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        ctx.scene.state.data.photo = fileId;
      } else {
        return ctx.wizard.prevStep();
      }

      if (ctx.scene.state.lastMessageId) {
        await ctx.deleteMessage(ctx.scene.state.lastMessageId).catch((err) => err);
      }

      const summaryMessage = `<b>📝 Ваша заявка:</b>

📌 Команды, в которых работал: <b>${ctx.session.step1}</b>
📌 Общая сумма профитов: <b>${ctx.session.step2}</b>
📌 Откуда узнал о команде: <b>${ctx.session.step3}</b>`;

      if (ctx.scene.state.data.photo) {
        // await ctx.deleteMessage().catch(err => err);

        const summaryMessage2 =  await ctx.replyWithPhoto(ctx.scene.state.data.photo, {
          caption: summaryMessage,
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            Markup.callbackButton("✅ Подтвердить", "confirmRequest"),
            Markup.callbackButton("🔄 Перезаполнить", "editRequest"),
          ]),
        });

        ctx.scene.state.summaryMessageId = summaryMessage2.message_id;

      } else {
        await ctx.scene.reply(summaryMessage, {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            Markup.callbackButton("✅ Подтвердить", "confirmRequest"),
            Markup.callbackButton("🔄 Перезаполнить", "editRequest"),
          ]),
        });
      }

      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      ctx.reply("❌ Ошибка").catch((err) => console.error(err));
      return ctx.scene.leave();
    }
  }
);

scene.action("editRequest", async (ctx) => {
  try {

    if (ctx.scene.state.summaryMessageId) {
      await ctx.deleteMessage(ctx.scene.state.summaryMessageId).catch((err) => err);
    }
    if (ctx.scene.state.data.photo) {
      await ctx.deleteMessage(ctx.scene.state.lastMessageId).catch((err) => err);
    }
    delete ctx.session.step1;
    delete ctx.session.step2;
    delete ctx.session.step3;

    ctx.wizard.selectStep(1);
    // await ctx.answerCbQuery("Перезаполняем...").catch((err) => err);

    await ctx.scene.reply(locale.requests.steps[0].scene_text, {
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Ошибка").catch((err) => console.error(err));
    return ctx.scene.leave();
  }
});

scene.action("confirmRequest", async (ctx) => {
  try {

    if (ctx.scene.state.summaryMessageId) {
      await ctx.deleteMessage(ctx.scene.state.summaryMessageId).catch((err) => err);
    }
    if (ctx.scene.state.data.photo) {
      await ctx.deleteMessage(ctx.scene.state.lastMessageId).catch((err) => err);
    }
    const requestData = {
      step1: ctx.session.step1,
      step2: ctx.session.step2,
      step3: ctx.session.step3,
      photo: ctx.scene.state.data.photo,
    };

    const request = await Request.create({
      userId: ctx.from.id,
      ...requestData,
    });
    const sender = ctx.from.username
  ? `@${ctx.from.username}`
  : `<a href="tg://user?id=${ctx.from.id}">пользователя</a>`;


    log(ctx, "отправил заявку на рассмотрение");
const photoInfo = ctx.scene.state.data.photo
    ? "Скриншот с профитами: <b>прикреплен</b>"
    : "Скриншот с профитами: <b>не прикреплен</b>";

    if (ctx.scene.state.data.photo) {


      await ctx.telegram.sendPhoto(
        ctx.state.bot.requestsGroupId,
        ctx.scene.state.data.photo,
        {
          caption: `<b>📨 Новая заявка от ${sender}</b> | <code>${ctx.from.id}</code>
      
Статус: <b>На рассмотрении</b>

${locale.requests.steps[0].request_text}: <b>${request.step1}</b>
${locale.requests.steps[1].request_text}: <b>${request.step2}</b>
${locale.requests.steps[2].request_text}: <b>${request.step3}</b>
${photoInfo}`,
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "✅ Принять",
                `admin_request_${request.id}_accept`
              ),
              Markup.callbackButton(
                "❌ Отклонить",
                `admin_request_${request.id}_decline`
              ),
            ],
          ]),
        }
      );
    } else {
      await ctx.telegram.sendMessage(
        ctx.state.bot.requestsGroupId,
        `<b>📨 Новая заявка от ${sender}</b> | <code>${ctx.from.id}</code>
      
Статус: <b>На рассмотрении</b>

${locale.requests.steps[0].request_text}: <b>${request.step1}</b>
${locale.requests.steps[1].request_text}: <b>${request.step2}</b>
${locale.requests.steps[2].request_text}: <b>${request.step3}</b>
${photoInfo}`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "✅ Принять",
                `admin_request_${request.id}_accept`
              ),
              Markup.callbackButton(
                "❌ Отклонить",
                `admin_request_${request.id}_decline`
              ),
            ],
          ]),
        }
      );
    }
    

    await ctx.scene.reply(locale.requests.done, {
      parse_mode: "HTML",
    });
  } catch (err) {
    console.log(err);
    ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
  }
  return ctx.scene.leave();
});

module.exports = scene;
