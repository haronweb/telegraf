const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { MyDomains, User } = require("../database");

const shareDomainScene = new WizardScene(
  "share_domain",
  async (ctx) => {
    try {
      await ctx.scene.reply("Введите ID или @username пользователя, которому хотите передать домен:", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch(() => {});
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      const input = ctx.message?.text?.trim();
      if (!input) {
        await ctx.scene.reply("❌ Введите корректный ID или username. Попробуйте ещё раз.").catch(() => {});
        return ctx.wizard.selectStep(1); // вернуть на ввод
      }

      const user =
        /^\d+$/.test(input)
          ? await User.findOne({ where: { id: input } })
          : await User.findOne({ where: { username: input.replace("@", "") } });

      if (!user) {
        await ctx.scene.reply("❌ Пользователь не найден. Введите ID или username повторно.",{
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        }).catch(() => {});
        return ctx.wizard.selectStep(1);
      }

      const domainId = ctx.session.shareDomainId;
      const domain = await MyDomains.findOne({ where: { id: domainId } });

      if (!domain) {
        await ctx.scene.reply("❌ Домен не найден").catch(() => {});
        return ctx.scene.leave();
      }

      const alreadyExists = await MyDomains.findOne({
        where: { userId: user.id, domain: domain.domain },
      });

      if (alreadyExists) {
        await ctx.scene.reply("⚠️ У этого пользователя уже есть этот домен. Введите другого:",{
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        }).catch(() => {});
        return ctx.wizard.selectStep(1);
      }

      await MyDomains.create({
        userId: user.id,
        domain: domain.domain,
        zoneId: domain.zoneId,
      });

      await ctx.telegram.sendMessage(
        user.id,
        `📥 <b>С вами поделился доменом @${ctx.from.username || ctx.from.id}</b>\n\n🔗 Домен: <code>${domain.domain}</code>`,
        { parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("➡️ К домену", `my_domains_${domainId}`)],
          ]),
         }
      ).catch((err) => {
        console.warn("❗ Не удалось отправить сообщение получателю:", err.message);
      });

      await ctx.scene.reply(
        `✅ Домен <b>${domain.domain}</b> успешно передан пользователю <b>@${user.username || user.id}</b>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ Назад", `my_domains_${domainId}`)],
          ]),
        }
      );

      return ctx.scene.leave();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка при передаче домена").catch(() => {});
      return ctx.scene.leave();
    }
  }
);

module.exports = shareDomainScene;
