export interface SeedConfig {
  readonly email: string;
  readonly password: string;
  readonly name: string;
}

export function loadSeedConfig(
  environment: Readonly<Record<string, string | undefined>>,
): SeedConfig {
  const email = environment.ADMIN_SEED_EMAIL?.trim();
  const password = environment.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required');
  }

  return {
    email,
    password,
    name: environment.ADMIN_SEED_NAME?.trim() || 'Administrador Inicial',
  };
}
