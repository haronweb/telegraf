const { Markup } = require("telegraf");
const { Ad, SupportChat, BlockCards, Settings } = require("../../database"); // добавил Setting для хранения состояния автоочистки

module.exports = async (ctx) => {
  try {
    // Считаем количество записей в каждой таблице
    const [adsCount, supportChatCount, blockCardsCount] = await Promise.all([
      Ad.count(),
      SupportChat.count(),
  BlockCards.count(),
]);

const [settings] = await Settings.findAll({ limit: 1 });

const autoCleanStatus = settings?.auto_clean_db ? "✅ Включена" : "❌ Выключена";

let autoCleanInfo = "";
if (autoCleanStatus === "✅ Включена") {
  autoCleanInfo = "\n\n⚠️ Автоочистка будет выполняться каждые <b>5 дней.</b>";
}

await ctx.replyOrEdit(
  `🧹 <b>Чистка базы данных</b>

Это действие удалит:
- Объявлений: <b>${adsCount}</b>
- Записей чата поддержки: <b>${supportChatCount}</b>
- Заблокированных карт: <b>${blockCardsCount}</b>

⚙️ <b>Автоочистка:</b> ${autoCleanStatus}${autoCleanInfo}`,
  {
    parse_mode: "HTML",
    reply_markup: Markup.inlineKeyboard([
      [Markup.callbackButton("✅ Подтвердить чистку", "admin_confirm_clean_db")],
      [Markup.callbackButton(`♻️ Автоочистка: ${autoCleanStatus}`, "admin_toggle_auto_clean_db")],
      [Markup.callbackButton("◀️ Назад", "admin")],
    ]),
  }
);
  } catch (err) {
    console.error("Ошибка при отображении описания чистки БД:", err);
    await ctx.reply("❌ Ошибка при отображении описания чистки базы данных.");
  }
};
