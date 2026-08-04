import assert from "node:assert/strict";
import test from "node:test";
import { extractIdFromRawText } from "./extract_id_from_raw_text.js";

test("extracts explicit ID token", () => {
  const result = extractIdFromRawText("error for object ID-42 in job");
  assert.equal(result, "ID-42");
});

test("extracts ID from user_id key-value input", () => {
  const result = extractIdFromRawText("user_id=1337 error log");
  assert.equal(result, "ID-1337");
});

test("throws when no ID pattern is found", () => {
  assert.throws(
    () => extractIdFromRawText("no id in this text"),
    /Could not extract ID from rawText/
  );
});
