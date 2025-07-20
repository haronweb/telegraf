module.exports = {
  mainMenu: {
    text: `
👤 ID: <code>{id}</code> | <b>{tag}</b>
🪪 Статус(ы): <b>{status}</b>  
💳 Карт заведено: <b>{logs_count}</b>  
💵 Профиты: <b>{profitlogs_count}</b> / <b>{profits_sum}</b> | <b>{monthly_count}</b> / <b>{monthly_sum}</b>
⚖️ Процент: <b>{payoutPercent}%</b>  


`,
  },

  roles: {
    admin: "Администратор",
    writer: "Вбивер",
    worker: "Воркер",
    pro: "Профи",
  },
};
