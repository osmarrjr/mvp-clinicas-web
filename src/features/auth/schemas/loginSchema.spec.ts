import { loginSchema } from './loginSchema';

describe('loginSchema', () => {
  it('valida payload com email e senha válidos', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '123456',
    });

    expect(result.success).toBe(true);
  });

  it('retorna erro quando email está vazio', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: '123456',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Email é obrigatório.');
    }
  });

  it('retorna erro quando email é inválido', () => {
    const result = loginSchema.safeParse({
      email: 'invalido',
      password: '123456',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Email inválido.');
    }
  });

  it('retorna erro quando senha está vazia', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Senha é obrigatória.');
    }
  });
});
