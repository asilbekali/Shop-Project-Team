const winston = require("winston");
const TelegramBot = require("node-telegram-bot-api");

const TELEGRAM_BOT_TOKEN = "7652895122:AAGAW2CYdPBoVz4HteH69npPXxy0eBh32do";
const CHAT_ID = "@winstonlog";

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

class TelegramTransport extends winston.Transport {
  log(info, callback) {
    bot
      .sendMessage(
        CHAT_ID,
        `📝 Log: ${info.level.toUpperCase()} - ${info.message}`
      )
      .then(() => callback(null, true))
      .catch((err) => callback(err));
  }
}

logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [new winston.transports.Console(), new TelegramTransport()],
});

module.exports = logger;
