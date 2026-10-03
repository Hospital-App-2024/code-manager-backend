import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { BlueTeam, CodeType } from '@prisma/client';
import { CreateEmergencyCodeDto } from './create-emergency-code.dto';
import { UpdateEmergencyCodeDto } from './update-emergency-code.dto';

const validationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

const common = {
  activeBy: 'Central',
  activationTime: '2026-08-24T10:00:00.000Z',
  location: 'Urgencias',
  operatorId: 'operator-1',
};

const validateCreate = (body: Record<string, unknown>) =>
  validationPipe.transform(
    { ...common, ...body },
    { type: 'body', metatype: CreateEmergencyCodeDto },
  );

describe('Emergency code DTO contract', () => {
  it('accepts a leak emergency without patientName', async () => {
    await expect(
      validateCreate({
        type: CodeType.LEAK,
        patientDescription: 'Vestimenta azul',
      }),
    ).resolves.toBeInstanceOf(CreateEmergencyCodeDto);
  });

  it('rejects attempts to change type through the update DTO', async () => {
    await expect(
      validationPipe.transform(
        { type: CodeType.RED },
        { type: 'body', metatype: UpdateEmergencyCodeDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  describe('blue emergencies', () => {
    it('accepts one or several teams', async () => {
      await expect(
        validateCreate({ type: CodeType.BLUE, teams: [BlueTeam.ICU] }),
      ).resolves.toBeInstanceOf(CreateEmergencyCodeDto);
      await expect(
        validateCreate({
          type: CodeType.BLUE,
          teams: [BlueTeam.EMERGENCY, BlueTeam.PEDIATRIC_ICU],
        }),
      ).resolves.toBeInstanceOf(CreateEmergencyCodeDto);
    });

    it.each([
      ['missing', undefined],
      ['empty', []],
      ['duplicated', [BlueTeam.ICU, BlueTeam.ICU]],
      ['unknown', ['ONCOLOGY']],
      ['legacy free text', 'Equipo UCI'],
    ])('rejects teams that are %s', async (_label, teams) => {
      await expect(
        validateCreate({ type: CodeType.BLUE, teams }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('red emergencies', () => {
    it('accepts COGRID with and without a communication time', async () => {
      await expect(
        validateCreate({ type: CodeType.RED, cogridNotified: true }),
      ).resolves.toBeInstanceOf(CreateEmergencyCodeDto);

      const dto = await validateCreate({
        type: CodeType.RED,
        cogridNotified: true,
        cogridNotifiedAt: '2026-08-24T10:05:00.000Z',
      });
      expect(dto.cogridNotifiedAt).toEqual(
        new Date('2026-08-24T10:05:00.000Z'),
      );
    });

    it('requires the COGRID flag', async () => {
      await expect(
        validateCreate({ type: CodeType.RED }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('closure', () => {
    it('accepts closure data and parses closedAt as a date', async () => {
      const dto = await validateCreate({
        type: CodeType.GREEN,
        event: 'Incidente',
        police: false,
        closedBy: 'Dra. Pérez',
        closedAt: '2026-08-24T10:30:00.000Z',
        closedByOperatorId: 'operator-2',
      });

      expect(dto.closedAt).toBeInstanceOf(Date);
      expect(dto.closedByOperatorId).toBe('operator-2');
    });

    it('rejects the removed isClosed flag', async () => {
      await expect(
        validateCreate({
          type: CodeType.GREEN,
          event: 'Incidente',
          police: false,
          isClosed: true,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('lets the update DTO carry closure data', async () => {
      await expect(
        validationPipe.transform(
          {
            closedBy: 'Dra. Pérez',
            closedAt: '2026-08-24T10:30:00.000Z',
            closedByOperatorId: 'operator-2',
          },
          { type: 'body', metatype: UpdateEmergencyCodeDto },
        ),
      ).resolves.toBeInstanceOf(UpdateEmergencyCodeDto);
    });
  });
});
