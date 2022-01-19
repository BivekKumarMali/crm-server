import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'

export async function validateDTO(dto: any, body: string) {
  let result: { data: any; errors: any } = { data: null, errors: null }

  result.data = plainToClass(dto, body)

  const errors = await validate(result.data)
  if (errors.length > 0) {
    result.errors = []
    errors.map((error) => {
      if (error.constraints) {
        result.errors = [...result.errors, ...Object.values(error.constraints)]
      }
    })
  }
  return result
}
