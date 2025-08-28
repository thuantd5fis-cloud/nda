import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordService {
  private readonly minLength = 8;
  private readonly maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days

  validatePassword(password: string): void {
    const errors: string[] = [];

    if (password.length < this.minLength) {
      errors.push(`Mật khẩu phải có ít nhất ${this.minLength} ký tự`);
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Mật khẩu phải chứa ít nhất 1 chữ cái thường');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải chứa ít nhất 1 chữ cái hoa');
    }

    if (!/\d/.test(password)) {
      errors.push('Mật khẩu phải chứa ít nhất 1 số');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&)');
    }

    // Check for common patterns
    if (this.hasCommonPatterns(password)) {
      errors.push('Mật khẩu không được chứa các mẫu phổ biến (123456, qwerty, password, etc.)');
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('. '));
    }
  }

  async hashPassword(password: string): Promise<string> {
    this.validatePassword(password);
    return bcrypt.hash(password, 12);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  isPasswordExpired(passwordChangedAt: Date | null): boolean {
    if (!passwordChangedAt) return false;
    
    const now = new Date();
    const timeDiff = now.getTime() - passwordChangedAt.getTime();
    return timeDiff > this.maxAge;
  }

  private hasCommonPatterns(password: string): boolean {
    const commonPatterns = [
      '123456', '654321', 'qwerty', 'asdfgh', 'password', 
      'admin', 'user', '111111', '000000', 'abc123',
      'password123', 'admin123', '123123'
    ];

    const lowerPassword = password.toLowerCase();
    return commonPatterns.some(pattern => lowerPassword.includes(pattern));
  }

  generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
    let result = '';
    
    // Ensure at least one character from each required category
    result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Upper
    result += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lower
    result += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    result += '@$!%*?&'[Math.floor(Math.random() * 7)]; // Special
    
    // Fill the rest randomly
    for (let i = 4; i < 12; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Shuffle the result
    return result.split('').sort(() => Math.random() - 0.5).join('');
  }
}
