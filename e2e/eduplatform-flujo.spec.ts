import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Suite E2E para AuraTips (Plataforma Clínica de Procedimientos y Recuperación).
 * Adaptado a la arquitectura de consultorio estético Dra. Mariana Gómez.
 *
 * Flujos Encadenados:
 * 1) Visitante (sin sesión): Navega catálogo, verifica widget de Edy/AURA sin voz activa.
 * 2) Instructor (Dra. Mariana Gómez): Entra a dirección clínica, crea nuevo protocolo gratis (precio 0), publica y verifica en catálogo público.
 * 3) Estudiante (Paciente Ana Gómez): Busca ese mismo protocolo, se inscribe directamente y verifica en su panel de cuidados activos.
 * Limpieza (Teardown): Elimina el protocolo creado para no alterar el catálogo médico real.
 */

const authDir = path.resolve(__dirname, '.auth');
const instructorStorage = path.join(authDir, 'instructor.json');
const studentStorage = path.join(authDir, 'student.json');

// Variables de estado encadenadas entre flujos
const testTimestamp = Date.now();
const testCourseTitle = `Protocolo E2E Playwright ${testTimestamp}`;
const testCourseDescription = `Protocolo médico de prueba E2E automatizada en AuraTips (Timestamp: ${testTimestamp}).`;
let createdCourseSlug = '';
let createdCourseId = '';

test.describe.serial('EduPlatform / AuraTips - Flujos E2E Encadenados', () => {

  // Limpieza al finalizar para no alterar el consultorio médico
  test.afterAll(async () => {
    if (createdCourseSlug || createdCourseId) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && supabaseServiceKey) {
          const { createClient } = await import('@supabase/supabase-js');
          const adminClient = createClient(supabaseUrl, supabaseServiceKey);

          // Obtener ID si no se capturó
          let targetId = createdCourseId;
          if (!targetId && createdCourseSlug) {
            const { data } = await adminClient
              .from('courses')
              .select('id')
              .eq('slug', createdCourseSlug)
              .maybeSingle();
            if (data?.id) targetId = data.id;
          }

          if (targetId) {
            await adminClient.from('enrollments').delete().eq('course_id', targetId);
            await adminClient.from('courses').delete().eq('id', targetId);
            console.log(`[Teardown E2E] Protocolo de prueba '${testCourseTitle}' (${targetId}) eliminado con éxito.`);
          }
        }
      } catch (err) {
        console.warn('[Teardown E2E] Error durante la limpieza de datos de prueba:', err);
      }
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1) Visitante (sin sesión)
  // ──────────────────────────────────────────────────────────────────────────
  test.describe('1) Visitante (sin sesión)', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('navega el catálogo y verifica la presencia del widget/botón de Edy en el DOM', async ({ page }) => {
      // 1. Abre la página pública de AuraTips
      await page.goto('/');

      // 2. Navega y verifica el catálogo público
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const catalogGrid = page.getByTestId('catalog-grid');
      await expect(catalogGrid).toBeVisible();

      const procedureCards = page.getByTestId('procedure-card');
      await expect(procedureCards.first()).toBeVisible({ timeout: 10000 });
      const cardsCount = await procedureCards.count();
      expect(cardsCount).toBeGreaterThan(0);

      // 3. Verifica que el botón de Edy / AURA está presente en el DOM
      const edyVoiceBtn = page.getByTestId('edy-voice-button');
      await expect(edyVoiceBtn).toBeVisible();
      await expect(page.getByRole('button', { name: /Consúltalo con AURA|Hablar en vivo/i })).toBeVisible();

      // 4. Abre el modal del widget para comprobar su renderizado en el DOM (sin simular voz)
      await edyVoiceBtn.click();
      const edyWidget = page.getByTestId('edy-voice-widget');
      await expect(edyWidget).toBeVisible();
      await expect(page.getByRole('dialog', { name: /Llamada de voz con AURA/i })).toBeVisible();

      // 5. Cierra el modal de voz
      const closeBtn = page.getByRole('button', { name: /Cerrar modal de voz/i });
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();
      await expect(edyWidget).not.toBeVisible();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2) Instructor (storageState de instructor)
  // ──────────────────────────────────────────────────────────────────────────
  test.describe('2) Instructor (storageState de instructor)', () => {
    test.use({ storageState: instructorStorage });

    test('entra a su dashboard, crea un curso GRATIS nuevo (precio 0) y lo publica; verifica en catálogo', async ({ page }) => {
      // 1. Entra al dashboard de dirección clínica
      await page.goto('/dashboard/protocolos');
      await expect(page.getByRole('heading', { name: /Dra\. Mariana Gómez/i })).toBeVisible();

      // 2. Inicia creación de nuevo protocolo clínico
      const newCourseBtn = page.getByTestId('new-course-button');
      await expect(newCourseBtn).toBeVisible();
      await newCourseBtn.click();

      // 3. Espera a llegar al formulario de nuevo protocolo
      await page.waitForURL('**/dashboard/protocolos/new');
      await expect(page.getByRole('heading', { name: /Nuevo Protocolo de Recuperación/i })).toBeVisible();

      // 4. Llena los campos requeridos: título, descripción y precio 0
      const titleInput = page.getByTestId('course-title-input');
      await expect(titleInput).toBeVisible();
      await titleInput.fill(testCourseTitle);

      const descInput = page.getByTestId('course-description-input');
      await expect(descInput).toBeVisible();
      await descInput.fill(testCourseDescription);

      const priceInput = page.getByTestId('course-price-input');
      await expect(priceInput).toBeVisible();
      await priceInput.fill('0');

      // 5. Envía el formulario para crear el protocolo
      const submitBtn = page.getByTestId('course-submit-button');
      await expect(submitBtn).toBeEnabled();
      await submitBtn.click();

      // 6. Espera la redirección al editor de protocolo /dashboard/protocolos/[slug]
      await page.waitForURL(
        (url) => (url.pathname.startsWith('/dashboard/protocolos/') || url.pathname.startsWith('/dashboard/teaching/')) && !url.pathname.endsWith('/new'),
        { timeout: 15000 }
      );
      const currentUrl = page.url();
      const basePath = currentUrl.includes('/dashboard/protocolos/') ? '/dashboard/protocolos/' : '/dashboard/teaching/';
      createdCourseSlug = currentUrl.split(basePath)[1].split('?')[0];
      expect(createdCourseSlug).toBeTruthy();
      expect(createdCourseSlug).not.toBe('new');

      // 7. En el editor, verifica estado borrador y publica
      const statusBadge = page.getByTestId('course-status-badge');
      await expect(statusBadge).toContainText(/En Borrador/i);

      const publishBtn = page.getByTestId('publish-course-button');
      await expect(publishBtn).toHaveText(/Publicar/i);
      await publishBtn.click();

      // Espera explícita al cambio de estado en vivo
      await expect(statusBadge).toContainText(/Activo en Clínica/i, { timeout: 10000 });

      // 8. Navega al catálogo público y verifica que el nuevo protocolo aparece
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const publishedCard = page.getByRole('link', { name: new RegExp(testCourseTitle, 'i') });
      await expect(publishedCard).toBeVisible({ timeout: 10000 });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3) Estudiante (storageState de estudiante)
  // ──────────────────────────────────────────────────────────────────────────
  test.describe('3) Estudiante (storageState de estudiante)', () => {
    test.use({ storageState: studentStorage });

    test('busca ESE mismo curso, se inscribe directamente y verifica que aparece en su panel de cuidados', async ({ page }) => {
      // 1. Abre la plataforma como estudiante autenticado
      await page.goto('/');

      // 2. Busca ESE mismo curso en la barra de búsqueda clínica
      const searchInput = page.getByTestId('clinical-search-input');
      await expect(searchInput).toBeVisible();
      await searchInput.fill(testCourseTitle);

      // Si el dropdown spotlight muestra el resultado, hace click; o navega desde el catálogo
      const searchItem = page.getByTestId('clinical-search-item').filter({ hasText: testCourseTitle });

      try {
        await expect(searchItem).toBeVisible({ timeout: 4000 });
        await searchItem.click();
      } catch {
        // En caso de que el spotlight no haya terminado la llamada de red, interactuar con la tarjeta visible en catálogo
        const catalogCard = page.getByRole('link', { name: new RegExp(testCourseTitle, 'i') });
        await expect(catalogCard).toBeVisible();
        await catalogCard.click();
      }

      // 3. Verifica llegada a la página del protocolo
      await expect(page).toHaveURL(new RegExp(`/(courses|procedimientos)/${createdCourseSlug}`), { timeout: 15000 });
      await expect(page.getByRole('heading', { level: 1, name: testCourseTitle })).toBeVisible();

      // 4. Activa / se inscribe al protocolo (confirmación directa por ser gratuito)
      const enrollBtn = page.getByTestId('enroll-button');
      await expect(enrollBtn).toBeVisible();
      await expect(enrollBtn).toContainText(/Activar Acompañamiento Clínico/i);
      await enrollBtn.click();

      // Espera explícita de confirmación de activación
      const enrolledStatus = page.getByTestId('enrolled-status');
      await expect(enrolledStatus).toBeVisible({ timeout: 10000 });
      await expect(enrolledStatus).toContainText(/Protocolo activo en tu seguimiento/i);

      // 5. Entra a su panel de cuidados y protocolos inscritos
      await page.goto('/dashboard/learning');
      await page.waitForLoadState('networkidle');

      // 6. Verifica que ESE mismo protocolo encadenado aparece en su panel
      await expect(page.getByTestId('active-procedure-card')).toBeVisible();
      const activeTitle = page.getByTestId('active-procedure-title');
      await expect(activeTitle).toHaveText(testCourseTitle);
    });
  });
});
