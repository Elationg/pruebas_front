import { expect } from '@playwright/test';

export class ArticulosPage {
  constructor(page) {
    this.page = page;
    //const tabla = page.locator('div.hidden.lg\\:block table');
    const tabla = page.locator('table');
    this.filas = tabla.locator('tbody tr');
    this.encabezados = tabla.locator('th');
  }
  async esperarTablaCargada() {
    const tabla = this.page.getByRole('table');
    await tabla.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 });
    }

  async obtenerEncabezados() {
    const count = await this.encabezados.count();
    const textos = [];
    for (let i = 0; i < 6; i++) {
      const texto = await this.encabezados.nth(i).textContent();
      textos.push(texto.trim());
    }
    return textos; 
  }

  async obtenerDatosFilaComoObjeto(index = 0) {
    const fila = this.filas.nth(index);
    const celdas = fila.locator('td');
    const count = await celdas.count();
    const valores = [];

    for (let i = 0; i < count; i++) {
      const texto = await celdas.nth(i).textContent();
      valores.push(texto.trim());
    }

    const encabezados = await this.obtenerEncabezados();

    const datos = {};
    for (let i = 0; i < encabezados.length; i++) {
      if (i < valores.length) {
        datos[encabezados[i]] = valores[i];
      } else {
        console.warn(`Encabezado "${encabezados[i]}" no tiene valor correspondiente`);
        datos[encabezados[i]] = '';
      }
    }
    return { fila, datos };
  }

  async contarFilas() {
    return await this.filas.count();
  }


  async buscarFilaPorCampos(camposEsperados) {
    const filas = await this.filas.all();
    
    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i];
      const columnas = await fila.locator('td').allTextContents();

      // Normaliza campos para comparar
      const camposEnFila = columnas.map(col => col.trim());
      let coincidencias = 0;

      // Comparar cada campo esperado con los campos de la fila
      for (const campo of camposEsperados) {
        if (campo && camposEnFila.includes(String(campo).trim())) {
          coincidencias++;
        }
      }

      // Devuelve la primera fila donde coincidan al menos 2 de 3 campos
      if (coincidencias >= 2) {
        return i;
      }
    }

    // No se encuentran al menos 2 coincidencias
    return -1;
  }


  async obtenerFila(index) {
    const total = await this.filas.count();
    console.log(`Total de filas en tabla: ${total}, índice solicitado: ${index}`);
    if (index < 0 || index >= total) {
      throw new Error(`Índice fuera de rango: ${index}`);
    }
    return this.filas.nth(index);
  }

  async verificarExistenciaArticulo(sku, descripcion, mensajeError) {
  const index = await this.buscarFilaPorCampos([sku, descripcion]);
  if (index === -1) {
    console.warn(mensajeError);

  }
  return index;
  }
  
}
