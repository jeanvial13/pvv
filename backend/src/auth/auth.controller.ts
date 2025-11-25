import { Controller, Post, Body, UseGuards, Get, Request, Put, Delete, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    // User Management Endpoints (Admin Only)
    @UseGuards(JwtAuthGuard)
    @Get('users')
    async getAllUsers(@Request() req) {
        // TODO: Add role check for ADMIN
        return this.authService.getAllUsers();
    }

    @UseGuards(JwtAuthGuard)
    @Post('users')
    async createUser(@Body() createUserDto: CreateUserDto, @Request() req) {
        // TODO: Add role check for ADMIN
        return this.authService.createUser(createUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Put('users/:id')
    async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
        // TODO: Add role check for ADMIN
        return this.authService.updateUser(+id, updateUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('users/:id')
    async deleteUser(@Param('id') id: string, @Request() req) {
        // TODO: Add role check for ADMIN
        return this.authService.deleteUser(+id);
    }

    @Get('roles')
    async getRoles() {
        return this.authService.getRoles();
    }
}
