export const INACTIVITY_THRESHOLD_MS = 20000;

export type LogEventType =
  | "window_blur"
  | "window_focus"
  | "visibility_hidden"
  | "visibility_visible"
  | "fullscreen_exit"
  | "pagehide"
  | "inactive_start"
  | "inactive_end";

export type SectionType = "theory" | "practical";

export interface TabTrackerCallbacks {
  onEvent: (eventType: LogEventType, durationAwayMs?: number, questionId?: string) => void;
  onFullscreenExitWarning?: () => void;
  getCurrentQuestionId?: () => string | null;
  getCurrentSection?: () => SectionType;
  onTheoryViolation?: () => void;
}

let isAway = false;
let lastBlurTime: number | null = null;
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
let isInactive = false;
let inactiveStartTime: number | null = null;
let lastEventSent: { type: LogEventType; time: number } | null = null;
const DEDUPE_MS = 500;
const BLUR_DEDUPE_MS = 300;
const BLUR_LIKE: LogEventType[] = [
  "window_blur",
  "visibility_hidden",
  "fullscreen_exit",
  "pagehide",
];
const FOCUS_LIKE: LogEventType[] = ["window_focus", "visibility_visible", "inactive_end"];

function isBlurLike(t: LogEventType): boolean {
  return BLUR_LIKE.includes(t);
}

function isFocusLike(t: LogEventType): boolean {
  return FOCUS_LIKE.includes(t);
}

function sendEvent(eventType: LogEventType, durationAwayMs?: number) {
  const section = callbacks.getCurrentSection?.();
  const isTheory = section === "theory";

  if (isBlurLike(eventType) && isTheory && callbacks.onTheoryViolation) {
    callbacks.onTheoryViolation();
    return;
  }

  const questionId = callbacks.getCurrentQuestionId?.() ?? undefined;
  const now = Date.now();
  if (lastEventSent) {
    if (lastEventSent.type === eventType && now - lastEventSent.time < DEDUPE_MS) return;
    if (isBlurLike(eventType) && isBlurLike(lastEventSent.type) && now - lastEventSent.time < BLUR_DEDUPE_MS)
      return;
    if (isFocusLike(eventType) && isFocusLike(lastEventSent.type) && now - lastEventSent.time < BLUR_DEDUPE_MS)
      return;
  }
  lastEventSent = { type: eventType, time: now };
  callbacks.onEvent(eventType, durationAwayMs, questionId);
}

let callbacks: TabTrackerCallbacks = { onEvent: () => {} };

function resetInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  if (isInactive) {
    isInactive = false;
    const duration = inactiveStartTime ? Date.now() - inactiveStartTime : 0;
    sendEvent("inactive_end", duration);
    inactiveStartTime = null;
  }
  inactivityTimer = setTimeout(() => {
    inactivityTimer = null;
    if (!isAway) {
      isInactive = true;
      inactiveStartTime = Date.now();
      sendEvent("inactive_start");
    }
  }, INACTIVITY_THRESHOLD_MS);
}

export function initTabTracker(cb: TabTrackerCallbacks): () => void {
  callbacks = cb;

  const handleWindowBlur = () => {
    if (!isAway) {
      isAway = true;
      lastBlurTime = Date.now();
      sendEvent("window_blur");
    }
  };

  const handleWindowFocus = () => {
    if (isAway) {
      const duration = lastBlurTime ? Date.now() - lastBlurTime : 0;
      sendEvent("window_focus", duration);
      isAway = false;
      lastBlurTime = null;
    }
    resetInactivityTimer();
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      if (!isAway) {
        isAway = true;
        lastBlurTime = Date.now();
      }
      sendEvent("visibility_hidden");
    } else {
      if (isAway) {
        const duration = lastBlurTime ? Date.now() - lastBlurTime : 0;
        sendEvent("visibility_visible", duration);
        isAway = false;
        lastBlurTime = null;
      } else {
        sendEvent("visibility_visible");
      }
      resetInactivityTimer();
    }
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      sendEvent("fullscreen_exit");
      if (!isAway) {
        isAway = true;
        lastBlurTime = Date.now();
      }
      if (callbacks.onFullscreenExitWarning) {
        callbacks.onFullscreenExitWarning();
      }
    } else {
      resetInactivityTimer();
    }
  };

  const handlePageHide = () => {
    sendEvent("pagehide");
  };

  const handleActivity = () => {
    resetInactivityTimer();
  };

  window.addEventListener("blur", handleWindowBlur);
  window.addEventListener("focus", handleWindowFocus);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  window.addEventListener("pagehide", handlePageHide);
  document.addEventListener("mousemove", handleActivity);
  document.addEventListener("keydown", handleActivity);
  document.addEventListener("scroll", handleActivity);

  inactivityTimer = setTimeout(() => {
    inactivityTimer = null;
    if (!isAway) {
      isInactive = true;
      inactiveStartTime = Date.now();
      sendEvent("inactive_start");
    }
  }, INACTIVITY_THRESHOLD_MS);

  return () => {
    window.removeEventListener("blur", handleWindowBlur);
    window.removeEventListener("focus", handleWindowFocus);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    window.removeEventListener("pagehide", handlePageHide);
    document.removeEventListener("mousemove", handleActivity);
    document.removeEventListener("keydown", handleActivity);
    document.removeEventListener("scroll", handleActivity);
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
  };
}

export function requestExamFullscreen(): void {
  document.documentElement.requestFullscreen?.().catch(() => {});
}
