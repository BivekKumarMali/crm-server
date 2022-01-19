import { autoInjectable } from 'tsyringe'
import { createConnection } from 'typeorm'
import Logger from '../logger/logger'
import config from 'config'

@autoInjectable()
export default class Database {
  constructor(private readonly logger: Logger) {}
  private async connectSQL(): Promise<void> {
    try {
      createConnection({
        type: 'mysql',
        host: config.get('DB_HOST') as string,
        port: config.get('DB_PORT') as number,
        username: config.get('DB_USERNAME') as string,
        password: config.get('DB_PASSWORD') as string,
        database: config.get('DB_DATABASE') as string,
        synchronize: true,
        entities: ['src/**/*.entity{.ts,.js}', 'src/**/**/*.entity{.ts,.js}'],
      })
      this.logger.info('DB Connected')
    } catch (error: any) {
      this.logger.error(`DB Error`)
      this.logger.error(`${error.message}`)
    }
  }

  public async connect(): Promise<void> {
    Promise.all([this.connectSQL()])
  }
}
