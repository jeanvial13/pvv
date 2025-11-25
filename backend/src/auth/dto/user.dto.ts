import { IsEmail, IsString, MinLength, IsInt, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsString()  // Changed to accept usernames instead of emails
    email: string;  // Field name kept for compatibility

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    name: string;

    @IsInt()
    roleId: number;
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @IsOptional()
    @IsInt()
    roleId?: number;
}
