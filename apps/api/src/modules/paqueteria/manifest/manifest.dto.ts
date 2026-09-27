import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateManifestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  sourceFileName!: string;

  @IsString()
  @MinLength(64)
  @MaxLength(64)
  sourceSha256!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  externalReference?: string;
}

export class UpdateManifestDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  externalReference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;
}

export class ManifestIdParamDto {
  @IsUUID()
  id!: string;
}
