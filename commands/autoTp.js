const { Markup } = require("telegraf");
const { AutoTp, Country } = require("../database");
const chunk = require("chunk");

module.exports = async (ctx, page = 1) => {
  try {
    const currentPage = parseInt(page);
    
    // Получаем все авто-шаблоны пользователя
    const autoRaw = await AutoTp.findAll({ 
      where: { userId: ctx.from.id },
      order: [['createdAt', 'DESC']]
    });

    // Получаем данные о странах для всех шаблонов
    const autoWithCountries = await Promise.all(
      autoRaw.map(async (v) => {
        const country = await Country.findOne({ where: { id: v.countryId } });
        return {
          ...v.dataValues,
          countryTitle: country ? country.title : "Не указана"
        };
      })
    );

    // Группируем по странам
    const grouped = {};
    autoWithCountries.forEach(item => {
      const countryName = item.countryTitle;
      if (!grouped[countryName]) {
        grouped[countryName] = [];
      }
      grouped[countryName].push(item);
    });

    // Сортируем страны по алфавиту и объединяем шаблоны
    const auto = [];
    Object.keys(grouped)
      .sort((a, b) => {
        // "Не указана" всегда в конце
        if (a === "Не указана") return 1;
        if (b === "Не указана") return -1;
        return a.localeCompare(b);
      })
      .forEach(country => {
        auto.push(...grouped[country]);
      });

    const itemsPerPage = 5;
    const paginated = chunk(auto, itemsPerPage);
    const totalPages = paginated.length;
    const currentItems = paginated[currentPage - 1] || [];

    // Создаем кнопки с отображением страны для текущей страницы
    var buttons = currentItems.map((v) => {
      const countryTitle = v.countryTitle;

      return [
        Markup.callbackButton(
          `${
            v.status == 1
              ? `🔗 ${v.title} (${countryTitle})`
              : v.status == 2
              ? `📱 ${v.title} (${countryTitle})`
              : v.status == 3
              ? `💬 ${v.title} (${countryTitle})`
              : v.status == 4
              ? `⏳ ${v.title} (${countryTitle})`
              : v.status == 5
              ? `💳 ${v.title} (${countryTitle})`
              : v.status == 6
              ? `🔄 ${v.title} (${countryTitle})`
              : v.status == 7
              ? `💰 ${v.title} (${countryTitle})`
              : `${v.title} (${countryTitle})`
          }`,
          `auto_${v.id}`
        ),
      ];
    });

    // Добавляем кнопки пагинации, если страниц больше одной
    const pageNavButtons = totalPages > 1
      ? chunk(
          Array.from({ length: totalPages }, (_, i) =>
            Markup.callbackButton(
              i + 1 === currentPage ? `· ${i + 1} ·` : `${i + 1}`,
              `auto_tp_page_${i + 1}`
            )
          ),
          5 // показываем максимум 5 кнопок страниц в ряду
        )
      : [];

    // Объединяем все кнопки
    const allButtons = buttons.length > 0 
      ? [...buttons] 
      : [[Markup.callbackButton("Список пуст", "none")]];

    // Добавляем основные кнопки управления
    allButtons.push(
      [Markup.callbackButton("➕ Добавить шаблон", "add_auto")],
      [Markup.callbackButton("❌ Удалить все авто-шаблоны", "delete_all_my_auto")],
      [Markup.callbackButton('ℹ️ Инструкция по шаблонам', 'open_auto_tp_guide')]
    );

    // Добавляем кнопки пагинации перед кнопкой "Назад"
    if (pageNavButtons.length > 0) {
      allButtons.push(...pageNavButtons);
    }

    // Добавляем кнопку "Назад" в самый низ
    allButtons.push([Markup.callbackButton("◀️ Назад", "settings")]);


    await ctx.answerCbQuery("Получаю шаблоны ТП..").catch((err) => err);

    return ctx
      .replyOrEdit(
        `🤖 Управление автоматическим-ТП (Всего: ${auto.length})\n\n<blockquote>Перед добавлением шаблона советуем ознакомиться с <b>инструкцией</b></blockquote>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard(allButtons),
        }
      )
      .catch((err) => err);
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};