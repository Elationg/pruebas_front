import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import usuarios from './fixtures/usuarios.json';

let login;

test.describe('Pruebas de Login con usuarios desde JSON', () => {
  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.goto('/login');
  });

  test('Corroborar URL y visibilidad del botón "Ingresar"', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
    await login.expectBotonIngresarVisible();
  });

  test('Login válido redirige a dashboard', async ({ page }) => {
    const { email, clave } = usuarios.valido;
    await login.inputEmail.fill(email);
    await login.inputClave.fill(clave);
    await login.botonIngresar.click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  for (const [key, user] of Object.entries(usuarios)) {
    if (key === 'valido') continue;

    test(`Caso: ${key}`, async ({ page }) => {
      await login.inputEmail.fill(user.email);
      await login.inputClave.fill(user.clave);
      await login.botonIngresar.click();

      if (key === 'Contraseña vacía') {
        const mensaje = await login.inputClave.evaluate(el => el.validationMessage);
        expect(mensaje).toContain(user.mensaje);
      } else if (key.startsWith('Email')) {
        const mensaje = await login.inputEmail.evaluate(el => el.validationMessage);
        expect(mensaje).toMatch(user.mensaje);
      } else {
        // Mensaje Toastify
        await login.expectToastMessage(user.mensaje);
      }
    });
  }
});
