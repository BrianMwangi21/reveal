export const ROOM_CODE_LENGTH = 6;
export const MAX_RETRIES = 5;

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateCode(): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
    code += CHARACTERS[randomIndex];
  }
  return code;
}

export async function generateUniqueRoomCode(
  checkExists: (code: string) => Promise<boolean>
): Promise<{ code: string; attempts: number }> {
  let code: string;
  let attempts = 0;

  for (attempts = 0; attempts < MAX_RETRIES; attempts++) {
    code = generateCode();
    const exists = await checkExists(code);
    
    if (!exists) {
      return { code: code!, attempts: attempts + 1 };
    }
  }

  throw new Error(`Failed to generate unique room code after ${MAX_RETRIES} attempts`);
}
