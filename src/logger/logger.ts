import winston, { createLogger, format, transports } from 'winston'
import { injectable } from 'tsyringe'
import config from 'config'

@injectable()
export default class Logger {
  private env: string
  private logger: winston.Logger
  private console: winston.transports.ConsoleTransportInstance

  constructor() {
    this.env = config.get('NODE_ENV') as string
    const { combine, timestamp, printf } = format

    const myFormat = printf(({ level, message, timestamp }) => {
      return `[${level}] ${timestamp} ${message}`
    })

    this.logger = createLogger({
      level: 'info',
      format: combine(timestamp(), myFormat),
    })

    this.console = new transports.Console({
      format: combine(format.colorize(), timestamp(), myFormat),
    })

    if (this.env !== 'production') {
      this.logger.add(this.console)
    }

    if (this.env === 'production') {
      this.logger.add(
        new transports.File({ filename: 'error.log', level: 'error' })
      )
      this.logger.add(new transports.File({ filename: 'combined.log' }))
    }
  }

  public info(message: string): void {
    if (this.env === 'production') {
      this.logger.add(this.console)
    }
    this.logger.info(message)
    if (this.env === 'production') {
      this.logger.remove(this.console)
    }
  }

  public error(message: string): void {
    this.logger.error(message)
  }
}
