import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza campos e texto obrigatório abaixo do botão', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/senha/i)).toBeTruthy();
    expect(
      screen.getByText('Ainda não possui um cadastro? Clique aqui'),
    ).toBeTruthy();
  });

  it('mantém botão desabilitado até formulário ficar válido', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          data: {
            accessToken: 'token',
            refreshToken: 'refresh',
            user: {
              id: '1',
              clinicId: 'clinic-1',
              name: 'Usuário',
              email: 'user@example.com',
              role: 'clinic_admin',
              phone: null,
              sex: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        }),
        { status: 200 },
      ),
    );
    const user = userEvent.setup();

    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /login/i });

    expect(submitButton).toHaveProperty('disabled', true);

    await user.type(screen.getByLabelText(/email/i), 'email-invalido');
    await user.type(screen.getByLabelText(/senha/i), '123456');

    expect(submitButton).toHaveProperty('disabled', true);

    await user.clear(screen.getByLabelText(/email/i));
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');

    await waitFor(() => {
      expect(submitButton).toHaveProperty('disabled', false);
    });
  });

  it('submete formulário válido no fluxo de login', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          data: {
            accessToken: 'token',
            refreshToken: 'refresh',
            user: {
              id: '1',
              clinicId: 'clinic-1',
              name: 'Usuário',
              email: 'user@example.com',
              role: 'clinic_admin',
              phone: null,
              sex: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        }),
        { status: 200 },
      ),
    );
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/senha/i), '123456');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });
});
