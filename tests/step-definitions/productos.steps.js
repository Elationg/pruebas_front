import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from './pages/loginPage';
import { ArticulosPage } from './pages/articulosPage';
import usuarios from './fixtures/usuarios.json';

let page, browser, loginPage, articulosPage;

Given('el usuario abre la página de login', async function () {
  browser = await this.launchBrowser();
  page = await browser.newPage();
  loginPage = new LoginPage(page);
  await loginPage.goto();
});

When('el usuario ingresa credenciales válidas', async function () {
  await loginPage.login('usuarios', 'contraseña');
});

When('el usuario inicia sesión con credenciales válidas', async function () {
  await loginPage.goto();
  await loginPage.login('usuario', 'contraseña');
});

When('navega a la lista de productos', async function () {
  articulosPage = new ArticulosPage(page);
  await articulosPage.irALista();
});

Then('debería ver la tabla de productos', async function () {
  await articulosPage.esperarTablaCargada();
  const visible = await ariculosPage.tablaVisible();
  expect(visible).toBe(true);
});

When('crea un nuevo producto con nombre {string}', async function (nombre) {
  await articulosPage.crearProducto({ nombre, descripcion: "Nuevo producto", precio: 999 });
});

Then('debería ver el producto {string} en la tabla', async function (nombre) {
  const existe = await ariculosPage.verificarProducto(nombre);
  expect(existe).toBe(true);
});

When('edita el producto {string} y cambia su nombre a {string}', async function (original, nuevo) {
  await articulosPage.editarProducto(original, { nombre: nuevo });
});

Then('debería ver el producto actualizado {string} en la tabla', async function (nombre) {
  const existe = await ariculosPage.verificarProducto(nombre);
  expect(existe).toBe(true);
});

When('elimina el producto {string}', async function (nombre) {
  await articulosPage.eliminarProducto(nombre);
});

Then('el producto {string} ya no debería aparecer en la tabla', async function (nombre) {
  const existe = await articulosPage.verificarProducto(nombre);
  expect(existe).toBe(false);
});

Given('el usuario no ha iniciado sesión', async function () {
  browser = await this.launchBrowser();
  page = await browser.newPage();
});

When('navega directamente a la lista de productos', async function () {
  await page.goto('https://tu-sistema.com/productos');
});

Then('debería ser redirigido a la página de login', async function () {
  await expect(page).toHaveURL(/.*login.*/);
});
