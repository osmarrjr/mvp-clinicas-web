import { NextResponse } from 'next/server';

import { loginSchema } from '@/features/auth/schemas/loginSchema';
import { loginServerService } from '@/features/auth/services/authServerService';

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email ou senha incorretos.',
  INTERNAL_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
};

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = loginSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos. Verifique os campos e tente novamente.',
        },
      },
      { status: 400 },
    );
  }

  const response = await loginServerService(parsed.data);

  if (!response.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: response.error.code,
          message:
            LOGIN_ERROR_MESSAGES[response.error.code] ?? LOGIN_ERROR_MESSAGES.INTERNAL_ERROR,
        },
      },
      { status: response.error.code === 'INVALID_CREDENTIALS' ? 400 : 500 },
    );
  }

  const nextResponse = NextResponse.json({
    ok: true,
    data: response.data,
  });

  nextResponse.cookies.set('accessToken', response.data.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  nextResponse.cookies.set('refreshToken', response.data.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return nextResponse;
}
