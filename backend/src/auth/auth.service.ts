import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class AuthService {
    // HARDCODED FALLBACK USER - Always works even if database fails
    private readonly HARDCODED_SUPER_USER = {
        id: 999,
        email: 'jeanvial',
        password: 'Tessi1308',
        name: 'Jean Vial (Sistema)',
        roleId: 1,
        role: {
            id: 1,
            name: 'ADMIN',
            permissions: ['ALL']
        }
    };

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(data: RegisterDto) {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Default to roleId 2 (CASHIER) if not provided
        const roleId = data.roleId || 2;

        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                roleId,
            },
            include: {
                role: true,
            },
        });

        const { password, ...result } = user;
        return result;
    }

    async login(data: LoginDto) {
        console.log('🔐 Login attempt for:', data.email);

        // STRATEGY 1: Try database user first
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: data.email },
                include: { role: true },
            });

            if (user) {
                console.log('✓ User found in database');
                const isPasswordValid = await bcrypt.compare(data.password, user.password);

                if (isPasswordValid) {
                    console.log('✓ Database password valid');
                    const payload = { sub: user.id, email: user.email, role: user.role.name };
                    const token = this.jwtService.sign(payload);

                    const { password, ...result } = user;

                    return {
                        access_token: token,
                        user: result,
                    };
                }
            }
        } catch (dbError) {
            console.error('⚠️  Database error, trying fallback user:', dbError.message);
        }

        // STRATEGY 2: Try hardcoded super user (FALLBACK)
        if (data.email === this.HARDCODED_SUPER_USER.email &&
            data.password === this.HARDCODED_SUPER_USER.password) {

            console.log('✓ Hardcoded super user authenticated successfully!');

            const payload = {
                sub: this.HARDCODED_SUPER_USER.id,
                email: this.HARDCODED_SUPER_USER.email,
                role: this.HARDCODED_SUPER_USER.role.name
            };
            const token = this.jwtService.sign(payload);

            return {
                access_token: token,
                user: {
                    id: this.HARDCODED_SUPER_USER.id,
                    email: this.HARDCODED_SUPER_USER.email,
                    name: this.HARDCODED_SUPER_USER.name,
                    roleId: this.HARDCODED_SUPER_USER.roleId,
                    role: this.HARDCODED_SUPER_USER.role,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
            };
        }

        console.error('✗ Login failed for:', data.email);
        throw new UnauthorizedException('Invalid credentials');
    }

    async validateUser(userId: number) {
        // Handle hardcoded user
        if (userId === this.HARDCODED_SUPER_USER.id) {
            return {
                id: this.HARDCODED_SUPER_USER.id,
                email: this.HARDCODED_SUPER_USER.email,
                name: this.HARDCODED_SUPER_USER.name,
                roleId: this.HARDCODED_SUPER_USER.roleId,
                role: this.HARDCODED_SUPER_USER.role,
            };
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (!user) {
            return null;
        }

        const { password, ...result } = user;
        return result;
    }

    // User Management Methods
    async getAllUsers() {
        try {
            const users = await this.prisma.user.findMany({
                include: { role: true },
                orderBy: { createdAt: 'desc' },
            });

            return users.map(({ password, ...user }) => user);
        } catch (error) {
            console.error('Error fetching users:', error);
            // Return hardcoded user if DB fails
            return [{
                id: this.HARDCODED_SUPER_USER.id,
                email: this.HARDCODED_SUPER_USER.email,
                name: this.HARDCODED_SUPER_USER.name + ' (Fallback)',
                roleId: this.HARDCODED_SUPER_USER.roleId,
                role: this.HARDCODED_SUPER_USER.role,
                createdAt: new Date(),
                updatedAt: new Date()
            }];
        }
    }

    async createUser(data: CreateUserDto) {
        try {
            console.log('Creating user:', data.email);

            const hashedPassword = await bcrypt.hash(data.password, 10);

            const user = await this.prisma.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    name: data.name,
                    roleId: data.roleId,
                },
                include: {
                    role: true,
                },
            });

            const { password, ...result } = user;
            console.log('User created successfully:', result.email);
            return result;
        } catch (error) {
            console.error('Error creating user:', error);

            // Handle unique constraint violation
            if (error.code === 'P2002') {
                throw new Error(`El usuario "${data.email}" ya existe`);
            }

            throw new Error(`Error al crear usuario: ${error.message}`);
        }
    }

    async updateUser(id: number, data: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const updateData: any = {};

        if (data.name) updateData.name = data.name;
        if (data.roleId) updateData.roleId = data.roleId;
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateData,
            include: { role: true },
        });

        const { password, ...result } = updatedUser;
        return result;
    }

    async deleteUser(id: number) {
        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.prisma.user.delete({ where: { id } });

        return { message: 'User deleted successfully' };
    }

    async getRoles() {
        try {
            return await this.prisma.role.findMany({
                orderBy: { name: 'asc' },
            });
        } catch (error) {
            // Return default roles if DB fails
            return [
                { id: 1, name: 'ADMIN', permissions: ['ALL'] },
                { id: 2, name: 'CASHIER', permissions: ['SALES', 'CLIENTS'] },
                { id: 3, name: 'SUPERVISOR', permissions: ['SALES', 'CLIENTS', 'REPORTS'] },
                { id: 4, name: 'INVENTORY', permissions: ['PRODUCTS', 'INVENTORY'] },
            ];
        }
    }
}
