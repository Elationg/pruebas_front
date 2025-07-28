import { expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export class DetalleArticuloPage {
  constructor(page) {
    this.page = page;
  }

  async obtenerDatosDetalle() {
    await this.page.locator('dl > div').first().waitFor({ state: 'visible' });

    const secciones = this.page.locator('dl > div');
    const count = await secciones.count();
    const resultados = [];

    const maxCampos = Math.min(count, 6);

    for (let i = 0; i < maxCampos; i++) {
      const seccion = secciones.nth(i);
      const titulo = await seccion.locator('dt').textContent();
      const valor = await seccion.locator('dd').textContent();

      resultados.push({
        titulo: titulo?.trim() || '',
        valor: valor?.trim() || ''
      });
    }

    return resultados;
  }

  async validarCoincidenciasPorCampo(datosEsperados) {
    const datosDetalle = await this.obtenerDatosDetalle();

    let seNormalizoValor = false;

    const normalizar = (valor) => {
      if (valor === 0 || valor === '0' || valor === '' || valor === 'N/A') {
        seNormalizoValor = true;
        return 'N/A';
      }
      return String(valor).trim();
    };

    for (const [tituloEsperado, valorEsperadoOriginal] of Object.entries(datosEsperados)) {
      const campoDetalle = datosDetalle.find((item) => item.titulo === tituloEsperado);
      const encontradoOriginal = campoDetalle?.valor ?? '[NO ENCONTRADO]';

      const valorEsperado = normalizar(valorEsperadoOriginal);
      const encontrado = normalizar(encontradoOriginal);

      console.log(`Comparando campo "${tituloEsperado}": esperado = "${valorEsperado}", encontrado = "${encontrado}"`);
      expect(encontrado).toBe(valorEsperado);
    }

    if (seNormalizoValor) {
      console.warn('⚠️ Se detectaron valores 0, vacíos ("") o "N/A" en los datos, que han sido normalizados como "N/A" en la vista de detalle.');
    }
  }

}
