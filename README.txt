CleanLine Group — заявки без переходу в Telegram

1. Создайте бота через @BotFather в Telegram (/newbot).
2. Напишите новому боту /start.
3. Узнайте свой chat_id: откройте https://api.telegram.org/botВАШ_ТОКЕН/getUpdates и найдите message.chat.id. Не публикуйте токен.
4. На сервере задайте переменные окружения TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID.
5. Запустите Node.js 20+: npm start (или node server.js).
6. Откройте http://localhost:3000/contacts.html, отправьте тестовую заявку.
7. Для настоящего сайта нужен хостинг с Node.js и HTTPS. Просто открыть HTML файлом или разместить только на статическом хостинге недостаточно.

ВАЖНО: ник @CleanLineGroup сам по себе не позволяет сайту автоматически отправлять заявки. Бот должен быть создан и запущен, а его chat_id указан на сервере. Токен нельзя помещать в HTML/JS браузера.
