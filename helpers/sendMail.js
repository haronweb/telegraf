const { Telegram, Markup } = require("telegraf");
const { workerData, parentPort } = require("worker_threads");
const { User, Settings } = require("../database");

const { chat_id, message } = workerData;
const bot = new Telegram(process.env.BOT_TOKEN);

(async () => {
  try {
    await bot.sendMessage(chat_id, "👥 Собираем список пользователей...");

    let users;
    try {
      users = await User.findAndCountAll({
        where: {
          banned: 0, // ✅ Только неблокированные пользователи
        },
      });
    } catch (dbError) {
      console.error("❌ Ошибка базы данных при получении пользователей:", dbError.message);
      await bot.sendMessage(chat_id, "❌ Ошибка базы данных при получении пользователей.");
      throw dbError;
    }

    await bot.sendMessage(
      chat_id,
      `✅ Список пользователей собран (Всего: ${users.count})`
    );

    await bot.sendMessage(chat_id, "⏳ Начинаем рассылку...");

    let success = 0,
      errors = 0;

    for (const user of users.rows) {
      try {
        await bot.sendCopy(user.id, message, {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("❌ Скрыть", "delete")],
          ]),
        });
        success++;
      } catch (err) {
        console.error(`⚠️ Ошибка отправки пользователю ${user.id}:`, err.message);

        if (
          err.response?.error_code &&
          [400, 403].includes(err.response.error_code) &&
          [
            "Bad Request: chat not found",
            "Forbidden: bot can't initiate conversation with a user",
            "Forbidden: user is deactivated",
            "Forbidden: bots can't send messages to bots",
            "Forbidden: bot was blocked by the user",
          ].includes(err.response.description)
        ) {
          console.log(`⛔ Пользователь ${user.id} заблокировал бота или удалил чат. Удаляем из базы...`);

          try {
            await User.destroy({ where: { id: user.id } });
          } catch (delErr) {
            console.error(`❌ Ошибка при удалении пользователя ${user.id}:`, delErr.message);
          }
        }
        errors++;
      }
    }

    await bot.sendMessage(
      chat_id,
      `📤 Рассылка завершена!\n\n✅ Успешных отправок: <b>${success}</b>\n❌ Ошибок: <b>${errors}</b>`,
      {
        parse_mode: "HTML",
      }
    );

    try {
      const settings = await Settings.findOne({ where: { id: 1 } });

      if (settings?.allGroupId) {
        await bot.sendCopy(settings.allGroupId, message);
      }
    } catch (err) {
      console.error(`❌ Ошибка при отправке сообщения в группу:`, err.message);
    }
  } catch (err) {
    console.error("🚨 Общая ошибка:", err.message);
    await bot.sendMessage(
      chat_id,
      `❌ Произошла ошибка: ${err.message || "Неизвестная ошибка"}`
    );
  } finally {
    try {
      parentPort.postMessage(true);
    } catch (workerErr) {
      console.error("❌ Ошибка при завершении worker_threads:", workerErr.message);
    }
    process.exit(0);
  }
})();
