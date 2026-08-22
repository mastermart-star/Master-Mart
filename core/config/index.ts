// Client-safe surface ONLY.
// `env` is deliberately NOT re-exported — it holds server secrets.
// Import it as `@/core/config/env`, from server code only.
export * from "./site";
