import { describe, expect, it } from 'vitest';

import { loginSchema } from '@/shared/schemas/auth';

describe('loginSchema', () => {
  it('should validate correct login data', () => {
    const validData = {
      username: 'testuser',
      password: 'password123',
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject empty username', () => {
    const invalidData = {
      username: '',
      password: 'password123',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Username is required');
    }
  });

  it('should reject short username', () => {
    const invalidData = {
      username: 'ab',
      password: 'password123',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Username must be at least 3 characters');
    }
  });

  it('should reject short password', () => {
    const invalidData = {
      username: 'testuser',
      password: '12345',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password must be at least 6 characters');
    }
  });

  it('should reject too long inputs', () => {
    const invalidData = {
      username: 'a'.repeat(51),
      password: 'b'.repeat(101),
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
