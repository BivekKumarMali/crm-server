import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator'

export class CreateTeamDto {
  @IsString()
  @IsOptional()
  creatorId: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string
}

export class UpdateTeamDto {
  @IsString()
  @IsNotEmpty()
  @ValidateIf((obj) => !obj.description)
  name?: string

  @IsString()
  @IsNotEmpty()
  @ValidateIf((obj) => !obj.name)
  description?: string
}
