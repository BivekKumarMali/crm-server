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
import TeamController from './controller/team.controller'
import ListController from './controller/list.controller'
import ContactController from './controller/contact.controller'
import MemberController from './controller/member.controller'

async function bootstrap(): Promise<void> {
  dotenv.config()

  const port = config.get('PORT') as number

  const app = express()
  const db = container.resolve(Database)
  const logger = container.resolve(Logger)
  const errorMiddleware = container.resolve(ErrorMiddleware)
  const authController = container.resolve(AuthController)
  const memberController = container.resolve(MemberController)
  const teamController = container.resolve(TeamController)
  const listController = container.resolve(ListController)
  const contactController = container.resolve(ContactController)

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

  app.get('/api/v1/healthCheck', (req: Request, res: Response) =>
    res.status(200).send({ status: 'active' })
  )
  app.use('/api/v1/auth', authController.routes())
  app.use('/api/v1/member', memberController.routes())
  app.use('/api/v1/team', teamController.routes())
  app.use('/api/v1/list', listController.routes())
  app.use('/api/v1/contact', contactController.routes())

  app.use([errorMiddleware.routeNotFound, errorMiddleware.processErrors])
  app.listen(port, () => logger.info(`Application started at port ${port}`))
}

bootstrap()
