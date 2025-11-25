import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()  // Changed to accept usernames
    email: string;  // Field name kept for compatibility

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    name: string;

    roleId?: number;
}

export class LoginDto {
    @IsString()  // Changed from @IsEmail() to allow usernames
    email: string;  // Field name stays 'email' for compatibility

    @IsString()
    password: string;
}
