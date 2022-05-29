const { createLogger, format, transports } = require("winston");
const { regExp } = require("../constants/logger.constant");

class LoggerHelper {
  static getLogger() {
    return createLogger({
      regExp,
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.json()
      ),
      exitOnError: false,
      transports: [new transports.Console()],
    });
  }
}

module.exports = LoggerHelper;
