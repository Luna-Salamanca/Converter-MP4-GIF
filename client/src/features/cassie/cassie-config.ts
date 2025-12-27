const CASSIE_PASSWORD = 'sharkie'

export function validatePassword(input: string): boolean {
  return input.trim() === CASSIE_PASSWORD
}

export const STORAGE_KEY = 'cassie_content_unlocked'
