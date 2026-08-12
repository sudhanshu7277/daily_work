// cmd to run tests locally

npx vitest run --coverage



// Option 1: Global Character Replacement (Recommended)
//Replace /=/g globally instead of matching anchored trailing 
// sequences. Base64 characters never contain = in the payload body, 
// making global replacement safe and ReDoS-free:



// src/utils/auth.test.ts

// Build a fake JWT whose payload is base64url-encoded JSON.
function makeToken(payload: Record<string, unknown>): string {
  const b64 = (obj: unknown) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

  return `${b64({ alg: 'none' })}.${b64(payload)}.sig`;
}