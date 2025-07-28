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
    async expectToastMessage(textoEsperado, options = { timeout: 3000 }) {
        const toast = this.page.getByText(textoEsperado, { exact: false });
        await expect(toast).toBeVisible({ timeout: options.timeout });
    }

    async login(email, clave) {
    await this.inputEmail.fill(email);
    await this.inputClave.fill(clave);
    await this.botonIngresar.click();
    }
}
