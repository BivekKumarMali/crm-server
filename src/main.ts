import 'reflect-metadata'
import './constants/global/global'
import { container } from 'tsyringe'
import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import config from 'config'
import helmet from 'helmet'
import cors from 'cors'
import xss from 'xss-clean'
import rateLimit from 'express-rate-limit'
import hpp from 'hpp'
import Database from './db/database'
import ErrorMiddleware from './middleware/error.middleware'
import Logger from './logger/logger'
import AuthController from './controller/auth.controller'

async function bootstrap(): Promise<void> {
  dotenv.config()

  const port = config.get('PORT') as number

  const app = express()
  const db = container.resolve(Database)
  const logger = container.resolve(Logger)
  const errorMiddleware = container.resolve(ErrorMiddleware)
  const authController = container.resolve(AuthController)

  db.connect()

  const apiLimiter = rateLimit({
    max: 50, // Limit each IP to 50 requests per `window` (here, per 1 minutes)
    windowMs: 1 * 60 * 1000, // 1 minutes
    message: 'Too many requests!',
    standardHeaders: true,
    legacyHeaders: false,
  })

  app.use(express.json({ limit: '5mb' }))
  app.use(express.urlencoded({ extended: false, limit: '5mb' }))
  app.use(cors({ origin: true, credentials: true }))
  app.use(helmet())
  app.use(xss())
  app.use(hpp({ whitelist: [] }))
  app.use(apiLimiter)

  app.use('/api/v1/auth', authController.routes())

  app.get('/api/v1/healthCheck', (req: Request, res:Response) => res.status(200).send({ status: 'active' }))
  
  app.use([errorMiddleware.routeNotFound, errorMiddleware.processErrors])
  app.listen(port, () => logger.info(`Application started at port ${port}`))
}

bootstrap()
