import { expect } from '@playwright/test';

export class CrearArticuloPage {
  constructor(page) {
    this.page = page;
    this.url = 'https://test-adl.leonardojose.dev/articulos/nuevo';

    // Inputs
    this.inputSku = page.locator('#sku');
    this.inputDescripcion = page.locator('#name');
    this.inputStock = page.locator('#stock_quantity');
    this.inputCosto = page.locator('#cost_price');
    this.inputPrecioVenta = page.locator('#sale_price');
    this.selectUnidad = page.locator('#unit');

    // Botones
    this.btnCancelar = page.getByRole('button', { name: 'Cancelar' });
    this.btnGuardar = page.getByRole('button', { name: 'Guardar Cambios' });
  }

  async irAFormulario() {
    await this.page.goto('https://test-adl.leonardojose.dev/articulos');
    await this.page.getByRole('button', { name: 'Crear Artículo' }).click();
    await expect(this.page).toHaveURL(this.url);
  }

  async completarFormulario(datos) {
    if (datos.sku !== undefined) await this.inputSku.fill(String(datos.sku));
    if (datos.descripcion !== undefined) await this.inputDescripcion.fill(datos.descripcion);
    if (datos.stock !== undefined) await this.inputStock.fill(String(datos.stock));
    if (datos.costo !== undefined) await this.inputCosto.fill(String(datos.costo));
    if (datos.precio !== undefined) await this.inputPrecioVenta.fill(String(datos.precio));
    if (datos.unidad !== undefined) await this.selectUnidad.selectOption({ label: datos.unidad });
  }

  async guardar() {
    await this.btnGuardar.click();
  }

  async cancelar() {
    await this.btnCancelar.click();
  }
};
