import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import usuarios from '../fixtures/usuarios.json';

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
    const usuario = usuarios.valido.email;
    await login.inputEmail.fill(email);
    await login.inputClave.fill(clave);
    await login.botonIngresar.click();

    await expect(page).toHaveURL(/\/dashboard/);
    console.log(`✅ ${usuario} redirigido a Dashboard con éxito!`)
  });

  for (const [key, user] of Object.entries(usuarios)) {
    if (key === 'valido') continue;

    test(`Caso: ${key}`, async ({ page }) => {
      await login.inputEmail.fill(user.email);
      await login.inputClave.fill(user.clave);
      await login.botonIngresar.click();

      if (key === 'Contraseña Vacía') {
        await login.compararMensajesValidacion(login.inputClave, user.mensaje, 'clave');
      }
      else if (key.startsWith('Email')) {
        await login.compararMensajesValidacion(login.inputEmail, user.mensaje, 'email');
        
      } else {
        // Mensaje Toastify
        await login.expectToastMessage(user.mensaje);
      }
    });
  }
});
