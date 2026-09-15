"use client";

import { useEffect, useRef, useCallback } from "react";
import { useVideoPlayer, type QuizMarker } from "./useVideoPlayer";
import { QuizOverlay } from "./QuizOverlay";
import { TimestampedNotes } from "./TimestampedNotes";
import { XPBurst } from "@/components/Gamification/XPBurst";

interface VideoPlayerProps {
  /** YouTube video ID */
  youtubeId: string;
  /** Title for accessibility */
  title: string;
  /** Static quiz markers for this video */
  quizMarkers?: QuizMarker[];
  /** XP awarded per quiz completion */
  xpPerQuiz?: number;
}

/**
 * Interactive YouTube video player with:
 * - Quiz overlays (static markers, pauses video)
 * - Gated scrubbing (can't skip past unanswered quiz)
 * - Timestamped notes
 * - XP burst on quiz completion
 */
export function VideoPlayer({
  youtubeId,
  title,
  quizMarkers = [],
  xpPerQuiz = 25,
}: VideoPlayerProps) {
  const {
    state,
    iframeRef,
    onTimeUpdate,
    onDurationChange,
    onPlayStateChange,
    answerQuiz,
    addNote,
    deleteNote,
    formatTime,
  } = useVideoPlayer(quizMarkers);

  const xpBurstRef = useRef<{ trigger: (x: number, y: number) => void }>(null);
  // playerRef reserved for future @types/youtube direct API integration
  const playerRef = useRef<null>(null);
  const pollRef = useRef<number | null>(null);

  // Build the YouTube embed URL
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&modestbranding=1&rel=0&origin=${typeof window !== "undefined" ? window.location.origin : ""}`;

  // Poll YouTube IFrame API for currentTime every 500ms
  useEffect(() => {
    function poll() {
      try {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentWindow) return;
        // We use postMessage for YouTube IFrame API
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
          "*"
        );
      } catch (_) {}
    }

    const id = window.setInterval(poll, 500);
    pollRef.current = id;
    return () => window.clearInterval(id);
  }, [iframeRef]);

  // Listen to YouTube postMessage events
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (!data) return;
        if (data.event === "infoDelivery" && data.info) {
          if (typeof data.info.currentTime === "number") {
            onTimeUpdate(data.info.currentTime);
          }
          if (typeof data.info.duration === "number") {
            onDurationChange(data.info.duration);
          }
          if (typeof data.info.playerState === "number") {
            // YT.PlayerState: 1 = playing, 2 = paused
            onPlayStateChange(data.info.playerState === 1);
          }
        }
      } catch (_) {}
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onTimeUpdate, onDurationChange, onPlayStateChange]);

  /** Seek YouTube player to given time via postMessage */
  const seekTo = useCallback((time: number) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func: "seekTo",
        args: [time, true],
      }),
      "*"
    );
  }, [iframeRef]);

  /** Called when user answers quiz */
  function handleAnswer(quizId: string, chosenIndex: number): boolean {
    const correct = answerQuiz(quizId, chosenIndex);
    if (correct) {
      // Trigger XP burst at center of screen
      xpBurstRef.current?.trigger(
        window.innerWidth / 2,
        window.innerHeight / 2
      );
      // Resume video after short delay
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: [] }),
          "*"
        );
      }, 800);
    }
    return correct;
  }

  return (
    <div>
      {/* Player + Quiz overlay */}
      <div className="video-player-wrapper" style={{ marginBottom: "var(--space-5)" }}>
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }}
        />

        {/* Quiz overlay — shown when activeQuiz is set */}
        {state.activeQuiz && (
          <QuizOverlay
            quizId={state.activeQuiz.id}
            question={state.activeQuiz.question}
            options={state.activeQuiz.options}
            onAnswer={handleAnswer}
          />
        )}
      </div>

      {/* Status bar */}
      {quizMarkers.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            marginBottom: "var(--space-4)",
            flexWrap: "wrap",
          }}
        >
          <span className="badge badge-brand">
            ✦ {quizMarkers.length} quiz{quizMarkers.length !== 1 ? "zes" : ""} in this lesson
          </span>
          <span className="badge badge-success">
            ✓ {state.answeredQuizIds.size} completed
          </span>
          {state.isGated && (
            <span className="badge" style={{ background: "var(--color-error-soft)", color: "var(--color-error)", border: "1px solid var(--color-error-border)" }}>
              ⚠ Answer the quiz to continue
            </span>
          )}
        </div>
      )}

      {/* Notes panel */}
      <TimestampedNotes
        notes={state.notes}
        currentTime={state.currentTime}
        onAddNote={addNote}
        onDeleteNote={deleteNote}
        onSeekTo={seekTo}
        formatTime={formatTime}
      />

      {/* XP burst overlay */}
      <XPBurst ref={xpBurstRef} xp={xpPerQuiz} />
    </div>
  );
}
