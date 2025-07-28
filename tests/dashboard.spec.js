import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { DashboardPage } from './pages/dashboardPage';
import usuarios from './fixtures/usuarios.json';
import dashboardData from './fixtures/dashboard.json';

let dashboard;

test.beforeEach(async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto('/login');
  await login.inputEmail.fill(usuarios.valido.email);
  await login.inputClave.fill(usuarios.valido.clave);
  await login.botonIngresar.click();
  await expect(page).toHaveURL(/dashboard/);

  dashboard = new DashboardPage(page);
});

test.afterEach(async () => {
    await dashboard.validarCerrarSesionVisible();

})

test('Botón Contraer oculta los textos del menú', async ({ page }) => {
  await dashboard.contraerMenu();
  await expect(page.locator('text=Dashboard')).toHaveCount(1);
  await expect(page.locator('text=Entidades')).toHaveCount(0);
});

test('Navegar a Entidades, despliega elementos', async ({ page }) => {
  await dashboard.clickSeccion('Entidades');
  for (const item of dashboardData.entidades) {
    await expect(page.getByText(item)).toBeVisible();
  }
  await expect(page).toHaveURL(/\/dashboard$/);
});

for (const item of [...dashboardData.entidades, ...dashboardData.seccionesSimples, ...dashboardData.configuracion]) {
  const tieneBoton = dashboardData.botones[item] !== undefined;

  test(`Navegar a ${item}`, async ({}, testInfo) => {
    const errores = [];

    await dashboard.navegarAItem(item);

    try {
      await dashboard.validarRuta(item);
    } catch (e) {
      errores.push(`Error validando ruta para ${item}: ${e.message}`);
    }
    
    await dashboard.validarTitulo(item);

    if (tieneBoton) {
      await dashboard.validarBoton(item);
    }

    // Si hubo errores, falla el test con el resumen
    if (errores.length > 0) {
      throw new Error(`Fallaron validaciones para ${item}:\n${errores.join('\n')}`);
    }
  });
}

test('Navegar a Configuración, despliega elementos', async ({ page }) => {
  await dashboard.clickSeccion('Configuración');
  for (const item of dashboardData.configuracion) {
    await expect(page.getByText(item)).toBeVisible();
  }
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('El botón "Cerrar Sesión" está visible siempre', async () => {
  await dashboard.validarCerrarSesionVisible();
});
