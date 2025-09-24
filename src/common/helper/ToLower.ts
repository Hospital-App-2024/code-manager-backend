import { Transform } from 'class-transformer';

export function ToLower() {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  );
}
