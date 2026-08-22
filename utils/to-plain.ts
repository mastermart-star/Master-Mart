/**
 * Serializes mongoose documents (ObjectId, Date, …) into plain JSON before
 * they cross the RSC boundary. The type parameter states the PLAIN shape —
 * e.g. `toPlain<Product[]>(docs)` — since the runtime shape changes
 * (ObjectId → string, Date → ISO string).
 */
export function toPlain<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
