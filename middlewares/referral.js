const { User, Referral } = require("../database");

module.exports = async (ctx, next) => {
  try {
    if (ctx.chat.id == ctx.from.id) {
      const userId = ctx.from.id;
      const referrerId = ctx.startPayload ? parseInt(ctx.startPayload) : null;

      if (referrerId && referrerId !== userId) {
        const existingReferral = await Referral.findOne({ where: { userId: userId } });
        const user = await User.findOne({ where: { id: referrerId } });

        if (!existingReferral) {
          await Referral.create({
            userId: userId,
            referrerId: referrerId,
            percent: null,
            profitAmount: 0,
          });

          ctx.telegram.sendMessage(referrerId, `<b>🎉 Новый пользователь зарегистрировался по вашей реферальной ссылке!</b>`, {
            parse_mode: "HTML",
          });

          ctx.replyWithHTML(`<b>Добро пожаловать!</b> Вы зарегистрировались по реферальной ссылке. 
Ваш реферал: <b>@${user.username}</b>`);
        }
      }
    }

    return next();
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch(err => err);
  }
};
