import { singleton } from 'tsyringe'
import { createClient } from 'redis'
import config from 'config'
import Logger from '../logger/logger'

@singleton()
export default class Redis {
  private client

  constructor(private readonly logger: Logger) {
    this.connect()
  }

  private async connect(): Promise<void> {
    try {
      this.client = createClient({
        url: `redis://${config.get('REDIS_URL') as string}`,
      })
      this.client.on('connect', () =>
        this.logger.info('Redis Client Connected')
      )
      // this.client.on('error', () => this.logger.error('Redis Client Error'))
      await this.client.connect()
    } catch (error: any) {
      this.logger.error('Redis Client Error')
    }
  }

  async set(key: string, value: string, expiry: number): Promise<void> {
    await this.client.set(key, value, expiry)
  }

  async get(key: string): Promise<string> {
    return await this.client.get(key)
  }

  async del(key: string): Promise<void> {
    await this.client.del(key)
  }
}
