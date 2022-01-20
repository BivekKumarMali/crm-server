import { Router } from 'express'
import { autoInjectable } from 'tsyringe'
import UserService from '../service/user.service'

@autoInjectable()
export default class UserController {
  private router: Router
  constructor(private readonly userService: UserService) {
    this.router = Router()
  }

  public routes(): Router {
    return this.router
  }
}
