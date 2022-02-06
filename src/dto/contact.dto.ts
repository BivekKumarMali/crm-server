import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator'
import { Disposition } from '../constants/enums/disposition.enum'

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  primaryCountryCode: string

  @MinLength(10, {
    message: 'Invalid Phone Number',
  })
  @MaxLength(10, {
    message: 'Invalid Phone Number',
  })
  @IsNotEmpty()
  primaryContactNumber: string

  @IsNotEmpty()
  @ValidateIf((obj) => obj.secondaryContactNumber)
  secondaryCountryCode?: string

  @MinLength(10, {
    message: 'Invalid Phone Number',
  })
  @MaxLength(10, {
    message: 'Invalid Phone Number',
  })
  @IsOptional()
  secondaryContactNumber?: string

  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  company?: string

  @IsEnum(Disposition)
  @IsOptional()
  disposition?: Disposition

  @IsString()
  @IsOptional()
  extra?: string

  @IsString()
  @IsOptional()
  remarks?: string

  @IsString()
  @IsOptional()
  note?: string
}

export class UpdateContactDto {
  @IsNotEmpty()
  @ValidateIf((obj) => obj.secondaryContactNumber)
  secondaryCountryCode?: string

  @MinLength(10, {
    message: 'Invalid Phone Number',
  })
  @MaxLength(10, {
    message: 'Invalid Phone Number',
  })
  @IsOptional()
  secondaryContactNumber?: string

  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  company?: string

  @IsEnum(Disposition)
  @IsOptional()
  disposition?: Disposition

  @IsString()
  @IsOptional()
  extra?: string

  @IsString()
  @IsOptional()
  remarks?: string

  @IsString()
  @IsOptional()
  note?: string
}
