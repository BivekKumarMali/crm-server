import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'
import { MemberRole } from '../constants/enums/member.enum'

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  teamId: string

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

  @IsBoolean()
  @IsNotEmpty()
  crmAccess: boolean

  @IsBoolean()
  @IsNotEmpty()
  modifyMember: boolean

  @IsBoolean()
  @IsNotEmpty()
  skipCall: boolean

  @IsBoolean()
  @IsNotEmpty()
  allListAccess: boolean

  @IsEnum(MemberRole)
  @IsNotEmpty()
  memberRole: MemberRole
}

export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @MinLength(8, {
    message: 'password is too short',
  })
  @MaxLength(30, {
    message: 'password is too long',
  })
  @IsOptional()
  password?: string

  @IsBoolean()
  @IsOptional()
  crmAccess?: boolean

  @IsBoolean()
  @IsOptional()
  modifyMember?: boolean

  @IsBoolean()
  @IsOptional()
  skipCall?: boolean

  @IsBoolean()
  @IsOptional()
  allListAccess?: boolean

  @IsEnum(MemberRole)
  @IsOptional()
  memberRole?: MemberRole
}
