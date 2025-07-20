const { Markup } = require("telegraf");
const { SupportTemp, Country } = require("../database");
const chunk = require("chunk");

module.exports = async (ctx, page = 1) => {
  try {
    const currentPage = parseInt(page);
    
    // Получаем все шаблоны пользователя
    const supportTempsRaw = await SupportTemp.findAll({ 
      where: { userId: ctx.from.id },
      order: [['createdAt', 'DESC']]
    });

    // Получаем данные о странах для всех шаблонов
    const supportTempsWithCountries = await Promise.all(
      supportTempsRaw.map(async (temp) => {
        let countryTitle = "Не указана";
        if (temp.countryId) {
          const country = await Country.findOne({ where: { id: temp.countryId } });
          if (country) {
            countryTitle = country.title;
          }
        }
        return {
          ...temp.dataValues,
          countryTitle: countryTitle,
          countryShort: temp.countryId ? (await Country.findOne({ where: { id: temp.countryId } }))?.short : null
        };
      })
    );

    // Группируем по странам
    const grouped = {};
    supportTempsWithCountries.forEach(item => {
      const countryName = item.countryTitle;
      if (!grouped[countryName]) {
        grouped[countryName] = [];
      }
      grouped[countryName].push(item);
    });

    // Сортируем страны по алфавиту и объединяем шаблоны
    const supportTemps = [];
    Object.keys(grouped)
      .sort((a, b) => {
        // "Не указана" всегда в конце
        if (a === "Не указана") return 1;
        if (b === "Не указана") return -1;
        return a.localeCompare(b);
      })
      .forEach(country => {
        supportTemps.push(...grouped[country]);
      });

    const itemsPerPage = 5;
    const paginated = chunk(supportTemps, itemsPerPage);
    const totalPages = paginated.length;
    const currentItems = paginated[currentPage - 1] || [];

    const buttons = [];

    // Создаем кнопки для шаблонов текущей страницы (по 1 в ряд)
    for (const temp of currentItems) {
      let label = temp.title;

      if (temp.countryId) {
        label += ` (${temp.countryShort || temp.countryTitle})`;
      }

      buttons.push([Markup.callbackButton(label, `temp_${temp.id}`)]);
    }

    // Добавляем кнопки пагинации, если страниц больше одной
    const pageNavButtons = totalPages > 1
      ? chunk(
          Array.from({ length: totalPages }, (_, i) =>
            Markup.callbackButton(
              i + 1 === currentPage ? `· ${i + 1} ·` : `${i + 1}`,
              `support_templates_${i + 1}`
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
      [Markup.callbackButton("➕ Добавить шаблон", "add_temp")],
      [Markup.callbackButton("📤 Загрузить шаблоны", "import_templates")],
      [Markup.callbackButton("📥 Выгрузить шаблоны", "export_templates")],
      [Markup.callbackButton("ℹ️ Инструкция по шаблонам", "open_support_temp_guide")],
      [Markup.callbackButton("❌ Удалить все шаблоны", "delete_all_my_temp")]
    );

    // Добавляем кнопки пагинации перед кнопкой "Назад"
    if (pageNavButtons.length > 0) {
      allButtons.push(...pageNavButtons);
    }

    // Добавляем кнопку "Назад" в самый низ
    allButtons.push([Markup.callbackButton("◀️ Назад", "settings")]);

    await ctx.answerCbQuery("📋 Получаю шаблоны").catch(() => {});


    return ctx.replyOrEdit(
      `📋 Управление шаблонами (Всего: ${supportTemps.length})\n\n<blockquote>Перед добавлением шаблона советуем ознакомиться с <b>инструкцией</b></blockquote>`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard(allButtons),
      }
    );
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch(() => {});
  }
};