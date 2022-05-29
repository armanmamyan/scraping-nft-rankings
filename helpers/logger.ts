import { regExp } from "../constants/logger.constant";

const { createLogger, format, transports } = require("winston");

export default class LoggerHelper {
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
