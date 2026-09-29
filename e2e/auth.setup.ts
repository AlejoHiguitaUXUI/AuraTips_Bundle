import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authDir = path.resolve(__dirname, '.auth');
export const instructorFile = path.join(authDir, 'instructor.json');
export const studentFile = path.join(authDir, 'student.json');

setup('autenticar instructor (Dra. Mariana Gómez)', async ({ page }) => {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /Iniciar Sesión/i })).toBeVisible();

  await page.fill('#email', 'especialista@auratips.io');
  await page.fill('#password', 'Password123!');
  await page.getByRole('button', { name: /Ingresar/i }).click();

  // Esperar navegación exitosa al panel
  await page.waitForURL((url) => url.pathname.includes('/dashboard'), { timeout: 15000 });
  await expect(page.getByRole('link', { name: /Dirección Clínica/i })).toBeVisible({ timeout: 10000 });

  await page.context().storageState({ path: instructorFile });
});

setup('autenticar estudiante (Ana Gómez)', async ({ page }) => {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /Iniciar Sesión/i })).toBeVisible();

  await page.fill('#email', 'paciente@auratips.io');
  await page.fill('#password', 'Password123!');
  await page.getByRole('button', { name: /Ingresar/i }).click();

  // Esperar navegación exitosa al panel de aprendizaje/cuidados
  await page.waitForURL((url) => url.pathname.includes('/dashboard'), { timeout: 15000 });
  await expect(page.getByRole('link', { name: 'Mis Cuidados', exact: true })).toBeVisible({ timeout: 10000 });

  await page.context().storageState({ path: studentFile });
});
