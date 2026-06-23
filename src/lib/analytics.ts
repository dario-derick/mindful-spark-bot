const POSTHOG_API_KEY =
  import.meta.env.VITE_POSTHOG_KEY || "phc_vfMeUyLq9Djr6d7EJ2VYanhzqW7JMQWhmzz724EyToZV";
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com").replace(
  /\/$/,
  "",
);

const STORAGE_KEYS = {
  anonymousId: "mindtrackai.analytics.anonymous_id",
  sessionId: "mindtrackai.analytics.session_id",
  firstSeenAt: "mindtrackai.analytics.first_seen_at",
  accountStartedAt: "mindtrackai.analytics.account_started_at",
  signupCompletedAt: "mindtrackai.analytics.signup_completed_at",
  homepageViewedSession: "mindtrackai.analytics.homepage_viewed_session",
};

type AnalyticsEventName =
  | "homepage_viewed"
  | "account_start_clicked"
  | "signup_mode_opened"
  | "signup_completed"
  | "first_check_in_completed";

type AnalyticsProperties = Record<string, boolean | number | string | null | undefined>;

function inBrowser() {
  return typeof window !== "undefined";
}

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}_${random}`;
}

function getStoredValue(storage: Storage, key: string) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function setStoredValue(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    // Tracking must never block the product flow.
  }
}

function getOrCreateStoredValue(storage: Storage, key: string, factory: () => string) {
  const existing = getStoredValue(storage, key);
  if (existing) return existing;
  const value = factory();
  setStoredValue(storage, key, value);
  return value;
}

function getAnonymousId() {
  if (!inBrowser()) return null;
  return getOrCreateStoredValue(localStorage, STORAGE_KEYS.anonymousId, () => randomId("anon"));
}

function getSessionId() {
  if (!inBrowser()) return null;
  return getOrCreateStoredValue(sessionStorage, STORAGE_KEYS.sessionId, () => randomId("session"));
}

function getFirstSeenAt() {
  if (!inBrowser()) return null;
  return getOrCreateStoredValue(localStorage, STORAGE_KEYS.firstSeenAt, nowIso);
}

function getStoredTimestamp(key: string) {
  if (!inBrowser()) return null;
  return getStoredValue(localStorage, key);
}

function secondsBetween(startIso: string | null, endIso: string) {
  if (!startIso) return null;
  const seconds = Math.round((Date.parse(endIso) - Date.parse(startIso)) / 1000);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
}

function referrerHost() {
  if (!inBrowser() || !document.referrer) return null;
  try {
    return new URL(document.referrer).host || null;
  } catch {
    return null;
  }
}

function urlParam(name: string) {
  if (!inBrowser()) return null;
  const value = new URL(window.location.href).searchParams.get(name);
  return value ? value.slice(0, 120) : null;
}

function sourceChannel(host: string | null) {
  const medium = urlParam("utm_medium")?.toLowerCase();
  if (medium && ["cpc", "paid", "ppc", "paid_social", "display"].includes(medium)) {
    return "paid";
  }
  if (medium && ["email", "newsletter"].includes(medium)) return "email";
  if (!host) return "direct";
  if (/google|bing|duckduckgo|yahoo|ecosia/i.test(host)) return "organic";
  return "referral";
}

function baseProperties(userId?: string | null): AnalyticsProperties {
  const anonymousId = getAnonymousId();
  const host = referrerHost();

  return {
    anonymous_id: anonymousId,
    session_id: getSessionId(),
    user_id: userId ?? null,
    linked_anonymous_id: userId ? anonymousId : null,
    event_status: "success",
    source_channel: sourceChannel(host),
    utm_source: urlParam("utm_source"),
    utm_medium: urlParam("utm_medium"),
    utm_campaign: urlParam("utm_campaign"),
    utm_content: urlParam("utm_content"),
    referrer_host: host,
    entry_path: inBrowser() ? window.location.pathname : null,
    first_seen_at: getFirstSeenAt(),
  };
}

function sendPostHogEvent(
  event: AnalyticsEventName,
  properties: AnalyticsProperties = {},
  userId?: string | null,
) {
  if (!inBrowser() || !POSTHOG_API_KEY || !POSTHOG_HOST) return;

  const anonymousId = getAnonymousId();
  const distinctId = userId || anonymousId;
  if (!distinctId) return;

  const payload = JSON.stringify({
    api_key: POSTHOG_API_KEY,
    event,
    properties: {
      ...baseProperties(userId),
      ...properties,
      distinct_id: distinctId,
    },
    timestamp: nowIso(),
  });

  const endpoint = `${POSTHOG_HOST}/capture/`;
  try {
    if ("sendBeacon" in navigator) {
      const body = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon(endpoint, body)) return;
    }
    void fetch(endpoint, {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      mode: "cors",
    });
  } catch {
    // Analytics should never block sign-up or mood logging.
  }
}

export function trackHomepageViewed() {
  if (!inBrowser()) return;
  const sessionKey = STORAGE_KEYS.homepageViewedSession;
  if (getStoredValue(sessionStorage, sessionKey)) return;
  setStoredValue(sessionStorage, sessionKey, nowIso());
  sendPostHogEvent("homepage_viewed");
}

export function trackAccountStartClicked(linkPlacement: string) {
  if (!inBrowser()) return;
  const clickedAt = nowIso();
  setStoredValue(localStorage, STORAGE_KEYS.accountStartedAt, clickedAt);
  sendPostHogEvent("account_start_clicked", {
    link_placement: linkPlacement,
    account_started_at: clickedAt,
  });
}

export function trackSignupModeOpened() {
  if (!inBrowser()) return;
  const accountStartedAt = getStoredTimestamp(STORAGE_KEYS.accountStartedAt) ?? nowIso();
  if (!getStoredTimestamp(STORAGE_KEYS.accountStartedAt)) {
    setStoredValue(localStorage, STORAGE_KEYS.accountStartedAt, accountStartedAt);
  }
  sendPostHogEvent("signup_mode_opened", {
    account_started_at: accountStartedAt,
  });
}

export function trackSignupCompleted(userId?: string | null) {
  if (!inBrowser()) return;
  const completedAt = nowIso();
  setStoredValue(localStorage, STORAGE_KEYS.signupCompletedAt, completedAt);
  sendPostHogEvent(
    "signup_completed",
    {
      signup_method: "email_password",
      signup_completed_at: completedAt,
      account_started_at: getStoredTimestamp(STORAGE_KEYS.accountStartedAt),
      seconds_from_homepage_to_signup: secondsBetween(
        getStoredTimestamp(STORAGE_KEYS.firstSeenAt),
        completedAt,
      ),
    },
    userId,
  );
}

export function trackFirstCheckInCompleted(input: {
  userId?: string | null;
  isFirstForUser?: boolean | null;
}) {
  if (!input.isFirstForUser) return;
  const completedAt = nowIso();
  const signupCompletedAt = getStoredTimestamp(STORAGE_KEYS.signupCompletedAt);
  const secondsFromSignup = secondsBetween(signupCompletedAt, completedAt);
  const withinSevenDays = secondsFromSignup === null ? null : secondsFromSignup <= 7 * 86_400;

  sendPostHogEvent(
    "first_check_in_completed",
    {
      first_check_in_completed_at: completedAt,
      signup_completed_at: signupCompletedAt,
      seconds_from_signup_to_first_check_in: secondsFromSignup,
      is_first_for_user: true,
      activation_window: "7d",
      activation_completed: withinSevenDays,
    },
    input.userId,
  );
}
