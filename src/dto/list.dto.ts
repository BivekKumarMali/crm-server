import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator'

export class CreateListDto {
  @IsString()
  @IsOptional()
  creatorId: string

  @IsString()
  @IsNotEmpty()
  name: string

}

export class UpdateListDto {
  @IsString()
  @IsNotEmpty()
  name?: string
}
