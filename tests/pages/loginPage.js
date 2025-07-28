import { expect } from '@playwright/test';

export class LoginPage {
    constructor(page) {
        this.page = page;
        this.inputEmail = page.locator('#email');
        this.inputClave = page.locator('#password');
        this.botonIngresar = page.getByRole('button', { name: 'Ingresar' });

    }   
    async goto(url = '/login') {
        await this.page.goto(url);
    }
    async expectBotonIngresarVisible() {
        await expect(this.botonIngresar).toBeVisible();
    }

    async login(email, clave) {
        await this.inputEmail.fill(email);
        await this.inputClave.fill(clave);
        await this.botonIngresar.click();
        }
    async expectToastMessage(textoEsperado, options = { timeout: 3000 }) {
        const alerta = this.page.locator('.Toastify__toast[role="alert"]');

        // Esperar a que exista al menos un toast visible
        await expect(alerta).toBeVisible({ timeout: 5000 });

        // Validar que contenga el texto deseado
        const toastConTexto = this.page.getByText(textoEsperado, { exact: false });
        await expect(toastConTexto).toBeVisible({ timeout: options.timeout });

        console.log(`✅ Alerta visible con mensaje: "${textoEsperado}"`);
    }

    async compararMensajesValidacion(inputLocator, mensajeEsperado, campo) {
        await inputLocator.focus();
        await inputLocator.blur(); // activa validación nativa HTML

        const mensaje = await inputLocator.evaluate(el => el.validationMessage);
        await expect(inputLocator).toBeVisible();
        const coincide = mensaje.includes(mensajeEsperado);

        if (coincide) {
        console.log(`✅ El mensaje de [${campo}] coincide: "${mensaje}"`);
        } else {
        console.warn(`❌ El mensaje de [${campo}] NO coincide.\nEsperado: "${mensajeEsperado}"\nObtenido: "${mensaje}"`);
        }

        expect(mensaje).toContain(mensajeEsperado);
    }
}

    
