"use client";

import { useState } from "react";

interface QuizOverlayProps {
  quizId: string;
  question: string;
  options: string[];
  onAnswer: (quizId: string, chosenIndex: number) => boolean;
}

export function QuizOverlay({ quizId, question, options, onAnswer }: QuizOverlayProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  function handleChoice(idx: number) {
    if (result === "correct") return;
    setSelected(idx);
    const correct = onAnswer(quizId, idx);
    setResult(correct ? "correct" : "wrong");

    if (!correct) {
      // Reset after 1.5s so user can retry
      setTimeout(() => {
        setSelected(null);
        setResult(null);
      }, 1500);
    }
  }

  return (
    <div className="quiz-overlay" role="dialog" aria-modal="true" aria-labelledby="quiz-question">
      <div className="quiz-card animate-scale-in">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
          <span
            style={{
              width: 28, height: 28,
              borderRadius: "var(--radius-sm)",
              background: "var(--gradient-brand)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: "white",
            }}
            aria-hidden="true"
          >
            ✦
          </span>
          <p style={{ fontSize: "var(--text-xs)", fontWeight: "var(--fw-semibold)", color: "var(--color-brand)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Quick check
          </p>
        </div>

        <p id="quiz-question" className="quiz-question">{question}</p>

        <ul className="quiz-options" role="list">
          {options.map((opt, idx) => {
            const isSelected = selected === idx;
            const optClass =
              isSelected && result === "correct" ? "quiz-option correct" :
              isSelected && result === "wrong"   ? "quiz-option wrong"   :
              "quiz-option";

            return (
              <li key={idx}>
                <button
                  className={optClass}
                  onClick={() => handleChoice(idx)}
                  disabled={result === "correct"}
                  aria-pressed={isSelected}
                  style={{ width: "100%" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <span
                      style={{
                        width: 24, height: 24,
                        borderRadius: "var(--radius-full)",
                        border: "1.5px solid currentColor",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "var(--text-xs)", fontWeight: "var(--fw-bold)",
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Feedback */}
        {result === "correct" && (
          <div
            className="success"
            style={{ marginTop: "var(--space-4)", marginBottom: 0, textAlign: "center" }}
            role="status"
          >
            ✓ Correct! Resuming video…
          </div>
        )}
        {result === "wrong" && (
          <div
            className="error"
            style={{ marginTop: "var(--space-4)", marginBottom: 0, textAlign: "center" }}
            role="alert"
          >
            Try again
          </div>
        )}
      </div>
    </div>
  );
}
