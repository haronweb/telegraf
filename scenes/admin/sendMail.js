const WizardScene = require("telegraf/scenes/wizard");
const admin = require("../../commands/admin/admin");
const { Worker } = require("worker_threads");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");
const scene = new WizardScene(
  "admin_send_mail",
  async (ctx) => {
    try {
      await ctx.reply("Отправьте сообщение для рассылки", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.reply("⏳ Рассылка отправляется...").catch((err) => err);
      log(ctx, "запустил рассылку");
      const worker = new Worker(
        require("path").join(__dirname, "../../helpers/sendMail.js"),
        {
          workerData: {
            chat_id: ctx.chat.id,
            message: ctx.message,
          },
        }
      );
      worker.on("message", () => worker.terminate());
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);

scene.leave(admin);

module.exports = scene;
