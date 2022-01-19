import winston, { createLogger, format, transports } from 'winston'
import { injectable } from 'tsyringe'
import config from 'config'

@injectable()
export default class Logger {
  private logger: winston.Logger

  constructor() {
    const env = config.get('NODE_ENV') as string
    const { combine, timestamp, printf } = format

    const myFormat = printf(({ level, message, timestamp }) => {
      return `[${level}] ${timestamp} ${message}`
    })

    this.logger = createLogger({
      level: 'info',
      format: combine(timestamp(), myFormat),
    })

    if (true || env !== 'production') {
      this.logger.add(
        new transports.Console({
          format: combine(format.colorize(), timestamp(), myFormat),
        })
      )
    }

    // if (env === 'production') {
    //   this.logger.add(
    //     new transports.File({ filename: 'error.log', level: 'error' })
    //   )
    //   this.logger.add(new transports.File({ filename: 'combined.log' }))
    // }
  }

  public info(message: string): void {
    this.logger.info(message)
  }

  public error(message: string): void {
    this.logger.error(message)
  }
}
