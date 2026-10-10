#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
 echo "Node.js не установлен. Установите его с https://nodejs.org/"
 read -p "Нажмите Enter для выхода..."
 exit 1
fi
echo "Вставьте API Token бота из BotFather (он не будет показан):"
read -r -s TELEGRAM_BOT_TOKEN
printf '\n'
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then echo "Токен пустой"; exit 1; fi
export TELEGRAM_BOT_TOKEN
export TELEGRAM_CHAT_ID=8293509366
(sleep 2; open http://localhost:3000/contacts.html) &
node server.js
