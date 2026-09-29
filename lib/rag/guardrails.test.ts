import { describe, it, expect } from "vitest";
import { checkClinicalGuardrails } from "./guardrails";

describe("checkClinicalGuardrails (Seguridad Clínica y Triaje de Alarmas)", () => {
  it("debe retornar consulta normal cuando el paciente no presenta síntomas de alarma", () => {
    const message = "Hola, quisiera saber cuántas sesiones de ácido hialurónico necesito para los labios.";
    const result = checkClinicalGuardrails(message);

    expect(result.isEmergency).toBe(false);
    expect(result.urgencyLevel).toBe("normal");
    expect(result.matchedCriteriaCount).toBe(0);
    expect(result.matchedCriteria).toHaveLength(0);
  });

  it("debe activar advertencia (warning) si el paciente presenta 1 solo criterio de alarma no crítico", () => {
    const message = "Tengo el párpado caído pero no tengo ningún otro síntoma de dolor o fiebre.";
    const result = checkClinicalGuardrails(message);

    expect(result.isEmergency).toBe(false);
    expect(result.urgencyLevel).toBe("warning");
    expect(result.matchedCriteriaCount).toBe(1);
    expect(result.matchedCriteria).toContain("Afectación periorbitaria o palpebral");
  });

  it("debe activar emergencia médica inmediata ante sospecha de crisis vascular (palidez + dolor)", () => {
    const message = "Tengo la piel blanca y siento un dolor insoportable en la zona donde me aplicaron el producto.";
    const result = checkClinicalGuardrails(message);

    expect(result.isEmergency).toBe(true);
    expect(result.urgencyLevel).toBe("emergency");
    expect(result.actionTitle).toContain("Atención Médica Prioritaria");
    expect(result.emergencyContactPhone).toBe("+57 300 912 3456");
  });

  it("debe activar emergencia médica inmediata ante reacción sistémica o anafiláctica (dificultad para respirar)", () => {
    const message = "Siento la garganta cerrada y tengo dificultad para respirar después del procedimiento.";
    const result = checkClinicalGuardrails(message);

    expect(result.isEmergency).toBe(true);
    expect(result.urgencyLevel).toBe("emergency");
    expect(result.matchedCriteria).toContain("Reacción respiratoria o sistémica");
  });

  it("debe activar emergencia cuando coinciden 2 o más criterios de alarma simultáneos", () => {
    const message = "Tengo el ojo caído y además me aparecieron varias ampollas pequeñas cerca a la ceja.";
    const result = checkClinicalGuardrails(message);

    expect(result.isEmergency).toBe(true);
    expect(result.urgencyLevel).toBe("emergency");
    expect(result.matchedCriteriaCount).toBeGreaterThanOrEqual(2);
    expect(result.matchedCriteria).toContain("Afectación periorbitaria o palpebral");
    expect(result.matchedCriteria).toContain("Reacción vesicular o febrícula");
  });
});
