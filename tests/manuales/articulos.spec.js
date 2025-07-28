import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { DashboardPage } from '../pages/dashboardPage';
import { ArticulosPage } from '../pages/articulosPage';
import { DetalleArticuloPage } from '../pages/detalleArticuloPage';
import usuarios from '../fixtures/usuarios.json';

let login;
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

test('Validar que los datos del artículo coincidan entre tabla y detalle', async ({ page }) => {
  const articulosPage = new ArticulosPage(page);
  const detallePage = new DetalleArticuloPage(page);

  await page.goto('/articulos');
  await page.waitForSelector('tbody tr', { state: 'visible', timeout: 5000 });

  // Extraer datos y fila para click
  const { fila, datos } = await articulosPage.obtenerDatosFilaComoObjeto(0);
  console.log('Datos extraídos de la tabla:', datos); 
  // Clic en fila para navegar a detalle
  await fila.click();

  await expect(page).toHaveURL(/\/articulos\/\d+$/);

  // Validar que cada dato del detalle coincida con la tabla
  await detallePage.validarCoincidenciasPorCampo(datos);
});

