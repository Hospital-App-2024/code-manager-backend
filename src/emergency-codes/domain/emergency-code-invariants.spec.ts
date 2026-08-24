import { BadRequestException } from '@nestjs/common';
import { CodeType } from '@prisma/client';
import {
  EmergencyCodeState,
  validateEmergencyCodeState,
} from './emergency-code-invariants';

const baseState: EmergencyCodeState = {
  type: CodeType.LEAK,
  activeBy: 'Operador de turno',
  activationTime: new Date('2026-08-24T10:00:00.000Z'),
  location: 'Urgencias',
  operatorId: 'operator-1',
  observations: null,
  isClosed: null,
  closedBy: null,
  closedAt: null,
  event: null,
  police: null,
  team: null,
  emergencyDetail: null,
  COGRID: null,
  firefighterCalledTime: null,
  patientName: null,
  patientDescription: 'Paciente con vestimenta azul',
};

describe('validateEmergencyCodeState', () => {
  it('accepts a leak emergency without a patient name', () => {
    expect(() => validateEmergencyCodeState(baseState)).not.toThrow();
  });

  it('rejects a leak emergency without a patient description', () => {
    expect(() =>
      validateEmergencyCodeState({
        ...baseState,
        patientDescription: null,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects fields that belong to another emergency type', () => {
    expect(() =>
      validateEmergencyCodeState({
        ...baseState,
        team: 'Equipo UCI',
      }),
    ).toThrow(BadRequestException);
  });

  it('requires closure identity and a closure date after activation', () => {
    expect(() =>
      validateEmergencyCodeState({
        ...baseState,
        type: CodeType.GREEN,
        event: 'Incidente de seguridad',
        police: false,
        patientDescription: null,
        isClosed: true,
        closedBy: null,
        closedAt: new Date('2026-08-24T09:59:00.000Z'),
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects closure data for non-green emergencies', () => {
    expect(() =>
      validateEmergencyCodeState({
        ...baseState,
        isClosed: true,
        closedBy: 'Supervisor',
        closedAt: new Date('2026-08-24T10:30:00.000Z'),
      }),
    ).toThrow(BadRequestException);
  });
});
