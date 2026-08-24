import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CodeType } from '@prisma/client';
import { CreateEmergencyCodeDto } from './create-emergency-code.dto';
import { UpdateEmergencyCodeDto } from './update-emergency-code.dto';

const validationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

describe('Emergency code DTO contract', () => {
  it('accepts a leak emergency without patientName', async () => {
    await expect(
      validationPipe.transform(
        {
          type: CodeType.LEAK,
          activeBy: 'Central',
          activationTime: '2026-08-24T10:00:00.000Z',
          location: 'Urgencias',
          operatorId: 'operator-1',
          patientDescription: 'Vestimenta azul',
        },
        { type: 'body', metatype: CreateEmergencyCodeDto },
      ),
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
});
