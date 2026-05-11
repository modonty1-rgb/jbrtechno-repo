import arMessages from '@/messages/ar.json';

export const messages = arMessages;

export function getMessage(path: string): string | undefined {
  const segments = path.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = arMessages;

  for (const segment of segments) {
    if (current == null || typeof current !== 'object' || !(segment in current)) {
      return undefined;
    }
    current = current[segment];
  }

  return typeof current === 'string' ? current : undefined;
}








