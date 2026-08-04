const explicitIdPattern = /\bID-(\d+)\b/i;
const keyValueIdPattern = /\b(?:user_)?id\s*[:=]\s*(\d+)\b/i;

export function extractIdFromRawText(rawText: string): string {
  const explicitMatch = rawText.match(explicitIdPattern);
  if (explicitMatch) {
    return `ID-${explicitMatch[1]}`;
  }

  const keyValueMatch = rawText.match(keyValueIdPattern);
  if (keyValueMatch) {
    return `ID-${keyValueMatch[1]}`;
  }

  throw new Error(
    "Could not extract ID from rawText. Expected patterns like 'ID-123' or 'user_id=123'."
  );
}
