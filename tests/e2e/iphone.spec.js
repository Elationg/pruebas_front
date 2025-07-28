import articulos from '../fixtures/articulos.json';
import usuarios from '../fixtures/usuarios.json';
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboardPage';
import { CrearArticuloPage } from '../pages/crearArticuloPage';
import { ArticulosPage } from '../pages/articulosPage';
import { DetalleArticuloPage } from '../pages/detalleArticuloPage';
import { EditarArticuloPage } from '../pages/editarArticuloPage';
import { LoginPage } from '../pages/loginPage';

let dashboardPage;
let crearArticuloPage;
let articulosPage;
let detalleArticuloPage;
let editarArticuloPage;

test.beforeEach(async ({ page }) => {
  const login = new LoginPage(page);

  await login.goto('/login');
  await login.inputEmail.fill(usuarios.valido.email);
  await login.inputClave.fill(usuarios.valido.clave);
  await login.botonIngresar.click();

  await expect(page).toHaveURL(/dashboard/);

  // Instanciamos las páginas necesarias
  dashboardPage = new DashboardPage(page);
  crearArticuloPage = new CrearArticuloPage(page);
  articulosPage = new ArticulosPage(page);
  detalleArticuloPage = new DetalleArticuloPage(page);
  editarArticuloPage = new EditarArticuloPage(page);

  // Navegamos al formulario de creación
  await crearArticuloPage.irAFormulario();
});

test('Flujo completo: crear, verificar, editar y eliminar artículo', async ({ page }) => {
  const datosOriginales = articulos.exitoCreacion;
  const datosEditados = { ...datosOriginales, descripcion: 'Iphone 16 Pro Max' }; // modificamos solo el stock
  const sku = datosOriginales.sku;
  const alerta = page.locator('.Toastify__toast[role="alert"]');
  const descripcion = datosOriginales.descripcion;
  const stock = datosOriginales.stock;
  

  // Paso 1: Crear artículo
  await crearArticuloPage.completarFormulario(datosOriginales);
  await crearArticuloPage.guardar();
  await expect(alerta).toBeVisible();
  await expect(alerta).toHaveText(`Articulo "${descripcion}" creado con éxito!`);
  console.log(`Articulo "${descripcion}" creado con éxito!`);


  // Paso 2: Verificar en tabla
  await page.goto('/articulos');
  await articulosPage.esperarTablaCargada();
  const index = await articulosPage.buscarFilaPorCampos([sku, descripcion,stock]);
  expect(index).not.toBe(-1);

  const { fila, datos } = await articulosPage.obtenerDatosFilaComoObjeto(index);
  await fila.click();
  await expect(page).toHaveURL(/\/articulos\/\d+$/);

  const urlArticulo = page.url();
  console.log(`Entramos al detalle del artículo. URL: ${urlArticulo}`);
  

  // Paso 3: Verificar en detalle
  await detalleArticuloPage.validarCoincidenciasPorCampo(datos);
  console.log('Verificación en vista detalle correcta');

  // Paso 4: Editar artículo
  await page.getByRole('button', { name: 'Editar' }).click();
  await expect(page).toHaveURL(/\/editar$/);
  await editarArticuloPage.editarCampo('descripcion', datosEditados.descripcion);
  await editarArticuloPage.guardarCambios();
  await expect(alerta).toContainText('actualizado con éxito');
  console.log('Artículo editado');

  // Paso 5: Verificar cambio en tabla
  await page.goto('/articulos');
  await articulosPage.esperarTablaCargada();
  const { datos: datosEditadosTabla } = await articulosPage.obtenerDatosFilaComoObjeto(index);
  expect(datosEditadosTabla['Descripción']).toBe(datosEditados.descripcion);
  console.log('Cambio reflejado en tabla');

  // Paso 6: Verificar cambio en detalle
  const fila2 = await articulosPage.obtenerFila(index);
  await fila2.click();
  const detalleDatos = await detalleArticuloPage.obtenerDatosDetalle();
  const campoDescripcion = detalleDatos.find(item => item.titulo === 'Descripción');
  expect(campoDescripcion?.valor).toBe(datosEditados.descripcion);
  console.log('Cambio reflejado en detalle');

  // Paso 7: Eliminar artículo
  await page.goto('/articulos');
  await articulosPage.esperarTablaCargada();
  const filaEliminar = await articulosPage.obtenerFila(index);
  await filaEliminar.locator('.text-red-600').click();
  await expect(alerta).toContainText('eliminado con éxito');
  console.log(`Artículo eliminado: ${sku}`);
});
