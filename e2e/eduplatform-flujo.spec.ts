import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * Suite E2E para AuraTips (Portal Clínico de Cuidados Post-Procedimiento — AuraMed).
 *
 * Flujos Encadenados:
 * 1) Visitante (sin sesión): Entra a la portada editorial (/), verifica el aviso de credenciales en /login
 *    (sin auto-registro) y explora la vitrina informativa /procedimientos verificando el CTA de WhatsApp.
 * 2) Especialista: Crea y publica un nuevo protocolo clínico, regresa a /dashboard/protocolos,
 *    verifica el badge "Nuevo" y asigna el protocolo a la paciente desde el modal compartido.
 * 3) Paciente (Ana Gómez): Ingresa a su sesión y verifica que el protocolo delegado por el especialista
 *    aparece activo en su panel; y que al finalizar el ciclo, el protocolo se desactiva dejando el
 *    procedimiento en su historial clínico sin exponer el contenido propietario.
 */

const authDir = path.resolve(__dirname, '.auth');
const instructorStorage = path.join(authDir, 'instructor.json');
const studentStorage = path.join(authDir, 'student.json');

const testTimestamp = Date.now();
const testCourseTitle = `Protocolo Clínico AuraMed ${testTimestamp}`;
const testCourseDescription = `Protocolo médico post-tratamiento supervisado por especialistas de AuraMed (${testTimestamp}).`;
let createdCourseSlug = '';
let createdCourseId = '';

test.describe.serial('AuraTips — Flujos Clínicos E2E Encadenados', () => {
  test.afterAll(async () => {
    if (createdCourseSlug || createdCourseId) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && supabaseServiceKey) {
          const { createClient } = await import('@supabase/supabase-js');
          const admin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false },
          });

          if (createdCourseId) {
            await admin.from('courses').delete().eq('id', createdCourseId);
          } else if (createdCourseSlug) {
            await admin.from('courses').delete().eq('slug', createdCourseSlug);
          }
        }
      } catch (err) {
        console.warn('No se pudo limpiar el protocolo E2E en afterAll:', err);
      }
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1) Visitante (sin sesión)
  // ──────────────────────────────────────────────────────────────────────────
  test.describe('1) Visitante (sin sesión)', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('explora la portada editorial, verifica aviso de credenciales en login y consulta la vitrina /procedimientos con CTA a WhatsApp', async ({ page }) => {
      // 1. Abre la portada pública de AuraTips
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Verifica que el botón principal lleva al Portal de Cuidados (/login) y que no hay botón de auto-registro
      const portalBtn = page.locator('#hero-portal-cuidados-btn');
      await expect(portalBtn).toBeVisible();
      await expect(page.getByRole('link', { name: /Registrarse/i })).toHaveCount(0);

      // 2. Verifica en /login el mensaje natural de entrega de credenciales por el especialista de AuraMed
      await portalBtn.click();
      await expect(page).toHaveURL(/\/login/);
      const credentialsNotice = page.getByTestId('login-credentials-notice');
      await expect(credentialsNotice).toBeVisible();
      await expect(credentialsNotice).toContainText(/especialista en AuraMed/i);

      // 3. Explora la vitrina informativa /procedimientos (solo lectura)
      await page.goto('/procedimientos');
      const catalogGrid = page.getByTestId('catalog-grid');
      await expect(catalogGrid).toBeVisible();

      const procedureCards = page.getByTestId('procedure-card');
      await expect(procedureCards.first()).toBeVisible({ timeout: 10000 });

      // 4. Abre la ficha informativa de un procedimiento y verifica el CTA a WhatsApp (sin auto-inscripción)
      await procedureCards.first().click();
      const whatsappLink = page.getByTestId('whatsapp-consultation-link');
      await expect(whatsappLink).toBeVisible();
      await expect(whatsappLink).toContainText(/Consultar con la clínica \/ Agendar valoración por WhatsApp/i);
      await expect(page.getByTestId('enroll-button')).toHaveCount(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2) Especialista: Creación, Badge "Nuevo" en /dashboard/protocolos y Delegación a Paciente
  // ──────────────────────────────────────────────────────────────────────────
  test.describe('2) Especialista (Dirección Clínica)', () => {
    test.use({ storageState: instructorStorage });

    test('crea y publica un protocolo, verifica el badge Nuevo en /dashboard/protocolos y lo asigna a la paciente desde la lista compartida', async ({ page }) => {
      // 1. Entra a la sección de Protocolos Clínicos
      await page.goto('/dashboard/protocolos');
      await expect(page.getByRole('heading', { name: /Dirección de Protocolos Clínicos/i })).toBeVisible();

      // 2. Inicia creación de nuevo protocolo clínico
      const newCourseBtn = page.getByTestId('new-course-button');
      await expect(newCourseBtn).toBeVisible();
      await newCourseBtn.click();

      await page.waitForURL('**/dashboard/protocolos/new');
      await page.getByTestId('course-title-input').fill(testCourseTitle);
      await page.getByTestId('course-description-input').fill(testCourseDescription);
      await page.getByTestId('course-price-input').fill('0');
      await page.getByTestId('course-submit-button').click();

      // 3. Espera redirección al editor y publica el protocolo
      await page.waitForURL(
        (url) => url.pathname.startsWith('/dashboard/protocolos/') && !url.pathname.endsWith('/new'),
        { timeout: 15000 }
      );
      createdCourseSlug = page.url().split('/dashboard/protocolos/')[1].split('?')[0];
      expect(createdCourseSlug).toBeTruthy();

      const statusBadge = page.getByTestId('course-status-badge');
      await expect(statusBadge).toContainText(/En Borrador/i);

      const publishBtn = page.getByTestId('publish-course-button');
      await publishBtn.click();
      await expect(statusBadge).toContainText(/Activo en Clínica/i, { timeout: 10000 });

      // 4. Regresa a la sección /dashboard/protocolos (sin ir a la raíz ni entrar al detalle interno)
      //    y verifica que la tarjeta del protocolo recién creado muestra el badge "Nuevo" y estado "Activo"
      await page.goto('/dashboard/protocolos');
      const createdCard = page.getByTestId('protocol-card').filter({ hasText: testCourseTitle });
      await expect(createdCard).toBeVisible({ timeout: 10000 });
      await expect(createdCard.getByTestId('new-protocol-badge')).toHaveText('Nuevo');
      await expect(createdCard).toContainText('Activo');

      // 5. Abre el modal compartido "Asignar Protocolo a Paciente" y delega el protocolo a la paciente existente
      await page.getByTestId('open-assign-protocol-modal').click();
      const assignModal = page.getByTestId('assign-protocol-modal');
      await expect(assignModal).toBeVisible();

      const patientSelect = page.getByTestId('assign-patient-select');
      await expect(patientSelect).toBeVisible();
      // Seleccionar a la paciente de prueba (paciente@auratips.io)
      const patientOption = patientSelect.locator('option', { hasText: /paciente@auratips\.io/i });
      const patientVal = await patientOption.getAttribute('value');
      if (patientVal) {
        await patientSelect.selectOption(patientVal);
      }

      const protocolSelect = page.getByTestId('assign-protocol-select');
      const protocolOption = protocolSelect.locator('option', { hasText: testCourseTitle });
      const protocolVal = await protocolOption.getAttribute('value');
      expect(protocolVal).toBeTruthy();
      createdCourseId = protocolVal || '';
      await protocolSelect.selectOption(createdCourseId);

      await page.getByTestId('confirm-assign-protocol-button').click();

      // Verifica la tarjeta de confirmación de credenciales y cierra el modal
      await expect(page.getByTestId('assignment-confirmation-card')).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId('assigned-patient-email')).toContainText('paciente@auratips.io');
      await page.getByTestId('close-assign-modal-button').click();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3) Paciente (Ana Gómez): Acceso directo a su protocolo delegado y Récord Histórico
  // ──────────────────────────────────────────────────────────────────────────
  test.describe('3) Paciente (Ana Gómez)', () => {
    test.use({ storageState: studentStorage });

    test('ingresa con sus credenciales y ve inmediatamente el protocolo asignado en su panel de cuidados', async ({ page }) => {
      await page.goto('/dashboard/learning');
      await page.waitForLoadState('networkidle');

      await expect(page.getByTestId('active-procedure-card')).toBeVisible();
      const activeTitle = page.getByTestId('active-procedure-title');
      await expect(activeTitle).toHaveText(testCourseTitle);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4) Ciclo de finalización del protocolo y preservación en el récord del paciente
  // ──────────────────────────────────────────────────────────────────────────
  test.describe('4) Finalización de protocolo por el especialista y récord del paciente', () => {
    test.use({ storageState: instructorStorage });

    test('el especialista finaliza el protocolo activo de la paciente desde su panel', async ({ page }) => {
      await page.goto('/dashboard/protocolos');
      const activePatientCard = page
        .getByTestId('specialist-active-patient-card')
        .filter({ hasText: testCourseTitle });
      await expect(activePatientCard).toBeVisible();

      await activePatientCard.getByTestId('deactivate-protocol-button').click();
      await expect(activePatientCard).toHaveCount(0, { timeout: 10000 });
    });
  });

  test.describe('5) Verificación de récord histórico sin acceso al protocolo propietario', () => {
    test.use({ storageState: studentStorage });

    test('la paciente conserva el procedimiento en su historial clínico pero ya no puede abrir el protocolo propietario', async ({ page }) => {
      await page.goto('/dashboard/learning');
      await page.waitForLoadState('networkidle');

      // Verifica que el procedimiento quedó registrado en su Historial de Procedimientos Realizados
      const historySection = page.getByTestId('completed-procedure-history');
      await expect(historySection).toBeVisible();
      await expect(historySection).toContainText(testCourseTitle);
      await expect(historySection).toContainText(/Ciclo finalizado/i);

      // Si intenta acceder por URL directa al protocolo interno, es redirigida a la vitrina informativa
      await page.goto(`/procedimientos/${createdCourseSlug}`);
      await expect(page).toHaveURL(new RegExp(`/procedimientos\\?proc=${createdCourseSlug}`));
    });
  });
});
