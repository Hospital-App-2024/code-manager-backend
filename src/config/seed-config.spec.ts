import { loadSeedConfig } from './seed-config';

describe('loadSeedConfig', () => {
  it('rejects missing administrator seed credentials', () => {
    expect(() => loadSeedConfig({})).toThrow(
      'ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required',
    );
  });

  it('returns trimmed credentials supplied by the deployment environment', () => {
    expect(
      loadSeedConfig({
        ADMIN_SEED_EMAIL: ' admin@example.com ',
        ADMIN_SEED_PASSWORD: 'a-secure-password',
        ADMIN_SEED_NAME: ' Administrador ',
      }),
    ).toEqual({
      email: 'admin@example.com',
      password: 'a-secure-password',
      name: 'Administrador',
    });
  });
});
