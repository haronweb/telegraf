const { Markup } = require("telegraf");
const { Nastavniki, User, Profit } = require("../database");

module.exports = async (ctx) => {
  try {
    const mentors = await Nastavniki.findAll({ where: { status: 1 } });
    const user = await User.findOne({ where: { id: ctx.from.id } });
    const mentor = await Nastavniki.findOne({ where: { id: user.mentor } });

    const profits = await Profit.count({
      where: { userId: ctx.from.id, mentor: user.mentor },
    });

    const formatProfits = (sum) => (sum ? `${sum} $` : "0 $");

    // Считаем сумму профитов для каждого наставника
    const mentorsWithProfits = await Promise.all(
      mentors.map(async (m) => {
        const profitsSum = await Profit.sum("amount", { where: { mentor: m.id } });
        return {
          ...m.dataValues,
          profitsSum: profitsSum || 0,
        };
      })
    );

    // Сортируем наставников по сумме профитов (по убыванию)
    const sortedMentors = mentorsWithProfits.sort((a, b) => b.profitsSum - a.profitsSum);

    // Генерация кнопок В ОДИН РЯД (без парных строк)
    const buttons = sortedMentors.map((mentorData) =>
      Markup.callbackButton(
        `${mentorData.username ? `@${mentorData.username}` : `ID: ${mentorData.id}`} | ${mentorData.percent || 0}% | ${formatProfits(mentorData.profitsSum)}`,
        `mentor_${mentorData.id}`
      )
    );

    const finalButtons = buttons.length > 0
      ? buttons.map((btn) => [btn]) // оборачиваем каждый в отдельный массив для одного ряда
      : [[Markup.callbackButton("Список пуст", "none")]];

    await ctx.answerCbQuery("🎓 Получаю наставников").catch((err) => err);

    const mentorUsername = mentor
      ? mentor.username
        ? `@${mentor.username}`
        : `ID: ${mentor.id}`
      : "неизвестный наставник";

    if (user.mentor == null) {
      return ctx.replyOrEdit(
        `🎓 <b>Список наставников</b>

<i>Выберите наставника для совместной работы. Назначенный наставник будет автоматически получать процент от ваших профитов.</i>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            ...finalButtons,
            [Markup.callbackButton("◀️ Назад", "help_work")],
          ]),
        }
      ).catch((err) => err);
    } else if (profits >= 5) {
      return ctx.replyOrEdit(
        `🎓 У тебя уже есть наставник ${mentorUsername}, но ты можешь отказаться от него, т.к. ты набрал 5 профитов с ним.`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("❌ Отказаться", "refuse_mentor")],
            [Markup.callbackButton("◀️ Назад", "help_work")],
          ]),
        }
      );
    } else {
      return ctx.replyOrEdit(
        `🎓 У тебя уже есть наставник ${mentorUsername}, чтобы отказаться, надо набрать как минимум 5 профитов с текущим наставником.\n\n💰 Профитов сейчас: <b>${profits}</b>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ Назад", "help_work")],
          ]),
        }
      );
    }
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
