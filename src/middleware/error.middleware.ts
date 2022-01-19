import { Request, Response, NextFunction } from 'express'
import { autoInjectable } from 'tsyringe'
import HttpException from '../shared/http/httpException'

@autoInjectable()
export default class ErrorMiddleware {
  routeNotFound(_req: Request, _res: Response, next: NextFunction) {
    const exception = new HttpException(null, 404, 'Not Found')
    next(exception)
  }

  processErrors(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    const status = 'error'
    const timestamp = new Date()
    const uri = `${req.protocol}://${req.hostname}${req.originalUrl}`

    if (err instanceof HttpException) {
      return res.status(err.statusCode).send({
        statusCode: err.statusCode,
        message: err.message,
        errors: err.errors,
        status,
        uri,
        timestamp,
      })
    }

    res.status(500).send({
      statusCode: 500,
      message: 'Internal Server Error',
      status,
      uri,
      timestamp,
    })
  }
}
