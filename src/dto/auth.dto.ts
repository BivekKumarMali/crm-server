import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @ValidateIf((obj) => !obj.team)
  company?: string

  @IsString()
  @ValidateIf((obj) => !obj.company)
  teamId?: string

  @MinLength(4, {
    message: 'Invalid username length',
  })
  @IsString()
  @IsNotEmpty()
  username: string

  @Matches(/^(\+?\d{1,3}|\d{1,4})$/, {
    message: 'Invalid country code',
  })
  @IsNotEmpty()
  countryCode: string

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
  @MinLength(4, {
    message: 'Invalid username length',
  })
  @IsNotEmpty()
  @ValidateIf((cred) => !cred.email)
  username?: string

  @IsEmail()
  @IsNotEmpty()
  @ValidateIf((cred) => !cred.username)
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
  @Matches(/^(\+?\d{1,3}|\d{1,4})$/, {
    message: 'Invalid country code',
  })
  @IsNotEmpty()
  countryCode: string

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
  @Matches(/^(\+?\d{1,3}|\d{1,4})$/, {
    message: 'Invalid country code',
  })
  @IsNotEmpty()
  countryCode: string

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

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string
}
