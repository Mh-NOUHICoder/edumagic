
/**
 * API Key Manager - EduMagic
 * Handles automatic rotation of API keys when quotas are exceeded (HTTP 429).
 */

export function getApiKeys(prefix: string): string[] {
  const keys: string[] = [];
  
  // Also check the base prefix without a number
  if (process.env[prefix]) {
    keys.push(process.env[prefix] as string);
  }

  // Check for numbered versions (e.g., GEMINI_API_KEY1, GEMINI_API_KEY2)
  for (let i = 1; i <= 10; i++) {
    const keyWithNum = `${prefix}${i}`;
    if (process.env[keyWithNum]) {
      keys.push(process.env[keyWithNum] as string);
    }
    
    // Also check with underscore (e.g., GEMINI_API_KEY_1)
    const keyWithUnderscore = `${prefix}_${i}`;
    if (process.env[keyWithUnderscore]) {
      keys.push(process.env[keyWithUnderscore] as string);
    }
  }

  // Remove duplicates and empty values
  return [...new Set(keys)].filter(Boolean);
}

/**
 * Executes a function with automatic key rotation
 * @param keyPrefix The prefix of the environment variables (e.g., 'GEMINI_API_KEY')
 * @param execute The function to run, receives the current key
 */
export async function withKeyRotation<T>(
  keyPrefix: string,
  execute: (key: string) => Promise<T>
): Promise<T> {
  const keys = getApiKeys(keyPrefix);
  
  if (keys.length === 0) {
    throw new Error(`No API keys found for prefix: ${keyPrefix}`);
  }

  let lastError: unknown = null;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      return await execute(key);
    } catch (error: unknown) {
      lastError = error;
      
      const err = error as Record<string, unknown>;
      const errorMessage = (err?.message as string)?.toLowerCase() || "";
      
      // We rotate on almost any error that suggests the key itself is the problem
      // (Quota, Invalid, Rate Limit, Authentication, etc.)
      const shouldRotate = 
        keys.length > 1 && 
        i < keys.length - 1; // Only rotate if we have more keys to try

      if (shouldRotate) {
        console.warn(`[KeyManager] Key ${i + 1} for ${keyPrefix} failed. Error: ${errorMessage.substring(0, 50)}... Rotating to next key.`);
        continue; 
      }
      
      // If it's the last key, we throw
      throw error;
    }
  }

  throw lastError || new Error(`All API keys for ${keyPrefix} failed.`);
}
