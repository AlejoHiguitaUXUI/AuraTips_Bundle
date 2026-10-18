import { describe, it, expect } from "vitest";
import {
  calculateElapsedDays,
  isRecentlyCreatedProtocol,
  DEFAULT_PROTOCOL_DURATION_DAYS,
} from "./patient-protocols";

describe("patient-protocols lifecycle helpers", () => {
  it("calcula correctamente los días transcurridos desde la asignación", () => {
    const today = new Date().toISOString();
    expect(calculateElapsedDays(today)).toBe(0);

    const fiveDaysAgo = new Date(
      Date.now() - 5 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(calculateElapsedDays(fiveDaysAgo)).toBe(5);
  });

  it("identifica protocolos creados en las últimas 24 horas para el badge Nuevo", () => {
    const twoHoursAgo = new Date(
      Date.now() - 2 * 60 * 60 * 1000
    ).toISOString();
    expect(isRecentlyCreatedProtocol(twoHoursAgo)).toBe(true);

    const threeDaysAgo = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(isRecentlyCreatedProtocol(threeDaysAgo)).toBe(false);
    expect(isRecentlyCreatedProtocol(null)).toBe(false);
  });

  it("define 14 días como vigencia estándar por defecto", () => {
    expect(DEFAULT_PROTOCOL_DURATION_DAYS).toBe(14);
  });
});
