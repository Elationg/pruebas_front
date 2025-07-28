import { expect } from '@playwright/test';

export class EditarArticuloPage {
  constructor(page) {
    this.page = page;

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

  async verificarPaginaEdicion() {
    await expect(this.page).toHaveURL(/\/editar$/);
  }

  /**
   * Edita el campo indicado con el valor entregado
   * @param {string} campo - Puede ser: sku, descripcion, stock, costo, precio, unidad
   * @param {string} valor - El nuevo valor a ingresar
   */
  async editarCampo(campo, valor) {
    switch (campo) {
      case 'sku':
        await this.inputSku.fill(valor);
        break;
      case 'descripcion':
        await this.inputDescripcion.fill(valor);
        break;
      case 'stock':
        await this.inputStock.fill(valor);
        break;
      case 'costo':
        await this.inputCosto.fill(valor);
        break;
      case 'precio':
        await this.inputPrecioVenta.fill(valor);
        break;
      case 'unidad':
        await this.selectUnidad.selectOption(valor);
        break;
      default:
        throw new Error(`⚠️ Campo no válido: "${campo}"`);
    }
    console.log(`✏️ Campo "${campo}" editado con valor "${valor}"`);
  }

  /**
   * Hace clic en el botón "Guardar Cambios"
   */
  async guardarCambios() {
    await this.btnGuardar.click();
    console.log('💾 Cambios guardados');
  }

  // Forma 1: desde detalle
  static async desdeDetalle(page, index = 0) {
    const tabla = page.locator('div.hidden.lg\\:block table');
    const fila = tabla.locator('tbody tr').nth(index);
    await fila.click();
    await page.getByRole('button', { name: 'Editar' }).click();
    return new EditarArticuloPage(page);
  }

  // Forma 2: desde botón directo en tabla
  static async desdeTabla(page, index = 0) {
    await page.goto('/dashboard');
    const tabla = page.locator('div.hidden.lg\\:block table');
    const fila = tabla.locator('tbody tr').nth(index);
    await fila.locator('.text-indigo-600').click();
    return new EditarArticuloPage(page);
  }
}
