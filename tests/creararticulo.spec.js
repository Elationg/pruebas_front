import { LoginPage } from './pages/loginPage';
import { test, expect } from '@playwright/test';
import { CrearArticuloPage } from './pages/crearArticuloPage';
import { ArticulosPage } from './pages/articulosPage';
import { DetalleArticuloPage } from './pages/detalleArticuloPage';
import { EditarArticuloPage } from './pages/editarArticuloPage';
import articulos from './fixtures/articulos.json';
import usuarios from './fixtures/usuarios.json';

test.describe('Pruebas de creación, edición y eliminación de artículos', () => {
  let pagina;

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/login');
    await login.inputEmail.fill(usuarios.valido.email);
    await login.inputClave.fill(usuarios.valido.clave);
    await login.botonIngresar.click();
    await expect(page).toHaveURL(/dashboard/);

    pagina = new CrearArticuloPage(page);
    await pagina.irAFormulario();
  });

  const claves = Object.keys(articulos);

  const pruebas = claves.map(nombre => ({
    nombre,
    datos: articulos[nombre]
  }));

  for (const prueba of pruebas) {
    test(`Prueba ${prueba.nombre}`, async ({ page }) => {
      const articulo = prueba.datos;
      const sku = articulo.sku;
      const descripcion = articulo.descripcion;
      const stock = articulo.stock;
      const crearPage = new CrearArticuloPage(page);
      const editarPage = new EditarArticuloPage(page);
      const articulosPage = new ArticulosPage(page);
      const detallePage = new DetalleArticuloPage(page);
      const descripcionEditada = articulo.descripcion + 'EDITADO';
      const alerta = page.locator('.Toastify__toast[role="alert"]');

      console.log(`Iniciando prueba: ${prueba.nombre}`);
      await crearPage.completarFormulario(articulo);
      await crearPage.guardar();

      if (articulo.exito === true) {
        //const { descripcion } = prueba.datos;
        
        // Esperar mensaje de éxito
        await expect(alerta).toBeVisible();
        await expect(alerta).toHaveText(`Articulo "${descripcion}" creado con éxito!`);
        console.log(`Articulo "${descripcion}" creado con éxito!`);

        // Volver a tabla de artículos
        await page.goto('/articulos');
        await articulosPage.esperarTablaCargada();

        const index = await articulosPage.buscarFilaPorCampos([sku, descripcion,stock]);

        if (index === -1) {
          console.log(`No se encontró el artículo con SKU: ${articulo.sku}`);
          return;
        }

        // Obtener datos de la fila encontrada
        const { fila, datos } = await articulosPage.obtenerDatosFilaComoObjeto(index);
        console.log('Datos extraídos de la tabla:', datos);


        // Ir al detalle del artículo
        await fila.click();
        await expect(page).toHaveURL(/\/articulos\/\d+$/);
        const urlArticulo = page.url();
        console.log(`Entramos al detalle del artículo. URL: ${urlArticulo}`);
        await detallePage.validarCoincidenciasPorCampo(datos);

        //Ir a la pagina de edición
        await page.getByRole('button', { name: 'Editar' }).click();
        await expect(page).toHaveURL(/\/editar$/);
        console.log('Navegamos a la página de edición');

        //Editamos el artículo
        
        await editarPage.inputDescripcion.fill(descripcionEditada);
        await editarPage.btnGuardar.click();
        await expect(alerta).toBeVisible();
        await expect(alerta).toHaveText(`Artículo "${descripcionEditada}" actualizado con éxito!`);
        console.log('Artículo editado correctamente');

        // Volver a la tabla
        await page.goto('/articulos');
        await articulosPage.esperarTablaCargada();
        await page.waitForSelector('tbody tr', { state: 'visible', timeout: 5000 });
        
        // Eliminar Artículo
        const indexEliminar = await articulosPage.buscarFilaPorCampos([sku, descripcionEditada,stock]);
        if (indexEliminar !== -1) {
          const filaEliminar = await articulosPage.obtenerFila(indexEliminar);
          await filaEliminar.locator('.text-red-600').click();
          await expect(alerta).toHaveText(`Artículo eliminado con éxito.`);
          console.log(`✅ Articulo creado y eliminado con éxito: ${articulo.sku}`);
        }

      } 
      else {
        // Artpiculos "exito" = false
        let errorNoEncontrado = false;
        const errorEsperado = articulo.error;

          if (errorEsperado?.trim()) {
            try {
              await expect(page.getByText(errorEsperado)).toBeVisible({ timeout: 3000 });
            } catch (err) {
              console.warn(`No se encontró el mensaje de error esperado: "${errorEsperado}"`);
              errorNoEncontrado = true;
            }
          } else {
            console.warn(`No se definió mensaje de error para la prueba fallida: ${prueba.nombre}`);
            errorNoEncontrado = true;
          }

          // Ir a la tabla y eliminar si el artículo se creó por error
          await page.goto('/articulos');
          await articulosPage.esperarTablaCargada();

          const index = await articulosPage.buscarFilaPorCampos([sku, descripcion,stock]);
          if (index !== -1) {

            console.warn(`⚠️ Artículo inválido fue creado (esto no debería pasar).`);
            //Obtener fila para ir a detalle
            const { fila, datos } = await articulosPage.obtenerDatosFilaComoObjeto(index);
            await fila.click();
            await expect(page).toHaveURL(/articulos\/\d+$/);

            //Guardar URL del artículo creado y verificar datos

            const urlArticulo = page.url();
            await detallePage.validarCoincidenciasPorCampo(datos);

            //Ir a la página de edición

            await page.getByRole('button', { name: 'Editar' }).click();
            await expect(page).toHaveURL(/\/editar$/);

            //Completar campos con información predeterminada.
            await editarPage.inputDescripcion.fill(descripcionEditada);
            await editarPage.btnGuardar.click();
            await expect(alerta).toHaveText(`Artículo "${descripcionEditada}" actualizado con éxito!`);

            await page.goto('/articulos');
            await articulosPage.esperarTablaCargada();

            //Verificar que los datos fueron editados en la tabla /articulos

            const indexEditado = await articulosPage.buscarFilaPorCampos([sku, descripcionEditada,stock]);
            expect(indexEditado).not.toBe(-1);
            const { fila: filaEditada, datos: datosEditados } = await articulosPage.obtenerDatosFilaComoObjeto(indexEditado);

            //Verificar artículo con URL

            await filaEditada.click();
            expect(page.url()).toContain(urlArticulo.split('/').pop());
            await detallePage.validarCoincidenciasPorCampo(datosEditados);

            await page.getByRole('button', { name: 'Volver' }).click();
            await articulosPage.esperarTablaCargada();
         
            // Eliminar artículo
            const indexEliminar = await articulosPage.buscarFilaPorCampos([sku, descripcionEditada,stock]);

            //Se crean excepciones porque hay casos en que "alerta" no se muestra.
            if (indexEliminar !== -1) {
              const filaEliminar = await articulosPage.obtenerFila(indexEliminar);
              await filaEliminar.locator('.text-red-600').click();

              let validado = false;
              //Se vuelve a definir alerta
              const alerta = page.locator('.Toastify__toast[role="alert"]');

              try {
                // Caso 1: Validar si aparece alerta de eliminación
                await expect(alerta).toHaveText('Artículo eliminado con éxito.', { timeout: 5000 });
                validado = true;
                console.log(`✅ Artículo INVALIDO creado y eliminado con éxito (alerta): ${articulo.sku}`);
              } catch {
                console.warn('Alerta no detectada, intentando validación en detalle...');
                
                try {
                  // Caso 2: Ir directamente al detalle del artículo con la URL capturada
                  await page.goto(urlArticulo, { waitUntil: 'load' });

                  const errorDetalle = page.locator('text=Error al cargar el artículo.');
                  await expect(errorDetalle).toBeVisible({ timeout: 5000 });
                  validado = true;
                  console.log(`✅ Artículo INVALIDO creado y eliminado con éxito (detalle): ${articulo.sku}`);
                } catch {
                  console.warn('No se encontró el error en detalle. Verificando fila en tabla...');

                  try {
                    // Caso 3: Validar si la fila en la tabla tiene datos distintos
                    await articulosPage.esperarTablaCargada();

                    const filaIndex = await articulosPage.buscarFilaPorCampos([sku, descripcionEditada,stock]);
                    if (filaIndex !== -1) {
                      const fila = await articulosPage.obtenerFila(filaIndex);
                      const camposFila = await fila.allTextContents();

                      const coincide = camposFila.some(texto => 
                        articulo.descripcion.includes(texto.trim())
                      );

                      if (!coincide) {
                        console.log(`✅ Artículo INVALIDO eliminado (validación por diferencia de datos en tabla): ${articulo.sku}`);
                        validado = true;
                       // Si no se logra validar la eliminación por ninguno de los 3 casos
                      } else {
                        console.error('Artículo aún aparece con datos coincidentes en tabla. No fue eliminado.');
                        throw new Error(`Artículo inválido aún presente en tabla: ${articulo.sku}`);
                      }
                    } else {
                      console.log(`Artículo inválido no aparece en la tabla (considerado eliminado): ${articulo.sku}`);
                      validado = true;
                    }
                  } catch (err) {
                    console.error('Fallo en la tercera validación (comparación con fila):', err);
                    throw err;
                  }
                }
              }

              // Si ninguna validación funcionó
              if (!validado) {
                throw new Error(`No se pudo confirmar la eliminación del artículo inválido: ${articulo.sku}`);
              }
            }
          }
          else {
            console.warn(`✅ El artículo inválido no fue creado (como se esperaba).`);
              if (errorNoEncontrado) {
                throw new Error(`❌ No se encontró mensaje de error esperado en "${prueba.nombre}"`);
              }
              return;
          }

          // Lanzar error si no se encontró el mensaje esperado (para que Playwright falle) DOBLE ALERTA
          if (errorNoEncontrado) {
            throw new Error(`ALERTA! No se encontró el mensaje de error esperado para caso: ${prueba.nombre}`);
          }
      }
    });
  }
});