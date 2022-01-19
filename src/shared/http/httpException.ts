export default class HttpException extends Error {
  public statusCode: number
  public message: string
  public errors: any
  constructor(
    errors?: any,
    statusCode: number = 500,
    message: string = 'Internal Server Error'
  ) {
    super(message)
    this.statusCode = statusCode
    this.message = message
    this.errors = errors
  }
}
