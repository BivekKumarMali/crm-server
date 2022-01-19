import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator'

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  username: string

  @MinLength(10, {
    message: 'Invalid Phone Number',
  })
  @MaxLength(10, {
    message: 'Invalid Phone Number',
  })
  @IsNotEmpty()
  phoneNumber: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @MinLength(8, {
    message: 'password is too short',
  })
  @MaxLength(30, {
    message: 'password is too long',
  })
  @IsNotEmpty()
  password: string
}

export class SigninDto {
  @IsString()
  @ValidateIf((cred) => !cred.email || cred.username)
  username?: string

  @IsEmail()
  @ValidateIf((cred) => cred.email || !cred.username)
  email?: string

  @IsString()
  @MinLength(8, {
    message: 'password is too short',
  })
  @MaxLength(30, {
    message: 'password is too long',
  })
  @IsNotEmpty()
  password: string
}

export class SendOTPDto {
  @MinLength(10, {
    message: 'Invalid Phone Number',
  })
  @MaxLength(10, {
    message: 'Invalid Phone Number',
  })
  @IsNotEmpty()
  phoneNumber: string
}

export class VerifyOTPDto {
  @MinLength(10, {
    message: 'Invalid Phone Number',
  })
  @MaxLength(10, {
    message: 'Invalid Phone Number',
  })
  @IsNotEmpty()
  phoneNumber: string

  @MinLength(6, {
    message: 'Invalid OTP',
  })
  @MaxLength(6, {
    message: 'Invalid OTP',
  })
  @IsNotEmpty()
  otp: string
}
