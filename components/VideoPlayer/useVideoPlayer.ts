"use client";

import { useState, useRef, useCallback } from "react";

export interface QuizMarker {
  id: string;
  timeSeconds: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface TimestampNote {
  id: string;
  timeSeconds: number;
  text: string;
  createdAt: number;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  activeQuiz: QuizMarker | null;
  answeredQuizIds: Set<string>;
  isGated: boolean;
  gateUpTo: number;
  notes: TimestampNote[];
  showNotes: boolean;
}

const INITIAL_STATE: VideoPlayerState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  activeQuiz: null,
  answeredQuizIds: new Set(),
  isGated: false,
  gateUpTo: 0,
  notes: [],
  showNotes: true,
};

export function useVideoPlayer(quizMarkers: QuizMarker[] = []) {
  const [state, setState] = useState<VideoPlayerState>(INITIAL_STATE);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastCheckedTime = useRef<number>(-1);

  /** Called by the YouTube IFrame API postMessage listener */
  const onTimeUpdate = useCallback(
    (currentTime: number) => {
      if (Math.abs(currentTime - lastCheckedTime.current) < 0.5) return;
      lastCheckedTime.current = currentTime;

      // Check quiz markers — fire quiz if we hit a new one
      const pending = quizMarkers.find(
        (m) =>
          !state.answeredQuizIds.has(m.id) &&
          currentTime >= m.timeSeconds &&
          currentTime < m.timeSeconds + 2
      );

      setState((prev) => ({
        ...prev,
        currentTime,
        activeQuiz: pending ?? prev.activeQuiz,
        isGated: pending ? true : prev.isGated,
      }));
    },
    [quizMarkers, state.answeredQuizIds]
  );

  const onDurationChange = useCallback((duration: number) => {
    setState((prev) => ({ ...prev, duration }));
  }, []);

  const onPlayStateChange = useCallback((isPlaying: boolean) => {
    setState((prev) => ({ ...prev, isPlaying }));
  }, []);

  /** Answer quiz — correct: resume + unlock gate. Wrong: allow retry. */
  const answerQuiz = useCallback(
    (quizId: string, chosenIndex: number): boolean => {
      const marker = quizMarkers.find((m) => m.id === quizId);
      if (!marker) return false;
      const correct = chosenIndex === marker.correctIndex;

      if (correct) {
        setState((prev) => ({
          ...prev,
          activeQuiz: null,
          isGated: false,
          gateUpTo: marker.timeSeconds,
          answeredQuizIds: new Set([...prev.answeredQuizIds, quizId]),
        }));
      }
      return correct;
    },
    [quizMarkers]
  );

  /** Add a timestamped note */
  const addNote = useCallback((text: string, timeSeconds: number) => {
    const note: TimestampNote = {
      id: `note-${Date.now()}`,
      timeSeconds,
      text,
      createdAt: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      notes: [note, ...prev.notes].sort((a, b) => a.timeSeconds - b.timeSeconds),
    }));
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== noteId),
    }));
  }, []);

  const toggleNotes = useCallback(() => {
    setState((prev) => ({ ...prev, showNotes: !prev.showNotes }));
  }, []);

  /** Format seconds → MM:SS */
  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return {
    state,
    iframeRef,
    onTimeUpdate,
    onDurationChange,
    onPlayStateChange,
    answerQuiz,
    addNote,
    deleteNote,
    toggleNotes,
    formatTime,
  };
}
