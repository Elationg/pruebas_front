import { expect } from '@playwright/test';
import data from '../fixtures/dashboard.json';

export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.data = data;
    this.menuSidebar = page.locator('aside');
    this.botonContraer = page.getByRole('button', { name: /contraer/i });
    this.botonCerrarSesion = page.getByRole('button', { name: /cerrar sesión/i });
  }

  async contraerMenu() {
    await this.botonContraer.click();
  }

  async clickSeccion(nombre) {
    await this.page.getByText(nombre).click();
  }

  async navegarAItem(nombre) {
    if (this.data.entidades.includes(nombre)) {
      await this.clickSeccion('Entidades');
    }
    if (this.data.configuracion.includes(nombre)) {
      await this.clickSeccion('Configuración');
    }
    await this.clickSeccion(nombre);
  }

  async validarRuta(nombre) {
    const rutaEsperada = this.data.rutas[nombre];

    await expect(this.page).toHaveURL(rutaEsperada, { timeout: 5000 });
  }

  async validarTitulo(nombre) {
    await expect(this.page.getByRole('heading', { name: nombre })).toBeVisible();
  }

  async validarBoton(nombre) {
    const boton = this.data.botones[nombre];
    if (boton) {
      await expect(this.page.getByRole('button', { name: new RegExp(boton, 'i') })).toBeVisible();
    }
  }

  async validarCerrarSesionVisible() {
    await expect(this.botonCerrarSesion).toBeVisible();
  }
}
