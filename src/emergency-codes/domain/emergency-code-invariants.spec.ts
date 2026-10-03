import { BadRequestException } from '@nestjs/common';
import { BlueTeam, CodeType } from '@prisma/client';
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
  closedBy: null,
  closedAt: null,
  closedByOperatorId: null,
  event: null,
  police: null,
  teams: [],
  emergencyDetail: null,
  cogridNotified: null,
  cogridNotifiedAt: null,
  firefighterCalledTime: null,
  patientName: null,
  patientDescription: 'Paciente con vestimenta azul',
};

const blueState: EmergencyCodeState = {
  ...baseState,
  type: CodeType.BLUE,
  patientDescription: null,
  teams: [BlueTeam.EMERGENCY],
};

const redState: EmergencyCodeState = {
  ...baseState,
  type: CodeType.RED,
  patientDescription: null,
  cogridNotified: true,
};

const openGreenState: EmergencyCodeState = {
  ...baseState,
  type: CodeType.GREEN,
  patientDescription: null,
  event: 'Incidente de seguridad',
  police: false,
};

const closedGreenState: EmergencyCodeState = {
  ...openGreenState,
  closedBy: 'Dra. Pérez',
  closedAt: new Date('2026-08-24T10:30:00.000Z'),
  closedByOperatorId: 'operator-2',
};

describe('validateEmergencyCodeState', () => {
  describe('type-specific fields', () => {
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
          teams: [BlueTeam.ICU],
        }),
      ).toThrow(BadRequestException);
    });

    it('treats an empty teams list on non-blue emergencies as absent', () => {
      expect(() =>
        validateEmergencyCodeState({ ...openGreenState, teams: [] }),
      ).not.toThrow();
    });
  });

  describe('blue emergencies', () => {
    it('accepts one or several teams at once', () => {
      expect(() => validateEmergencyCodeState(blueState)).not.toThrow();
      expect(() =>
        validateEmergencyCodeState({
          ...blueState,
          teams: [BlueTeam.EMERGENCY, BlueTeam.ICU, BlueTeam.PEDIATRIC_ICU],
        }),
      ).not.toThrow();
    });

    it('requires at least one team', () => {
      expect(() =>
        validateEmergencyCodeState({ ...blueState, teams: [] }),
      ).toThrow(BadRequestException);
      expect(() =>
        validateEmergencyCodeState({ ...blueState, teams: null }),
      ).toThrow(BadRequestException);
    });

    it('rejects duplicated teams', () => {
      expect(() =>
        validateEmergencyCodeState({
          ...blueState,
          teams: [BlueTeam.ICU, BlueTeam.ICU],
        }),
      ).toThrow('teams must not contain duplicates');
    });

    it('rejects unknown teams', () => {
      expect(() =>
        validateEmergencyCodeState({
          ...blueState,
          teams: ['ONCOLOGY' as BlueTeam],
        }),
      ).toThrow('teams contains an unknown team');
    });
  });

  describe('red emergencies', () => {
    it('accepts COGRID without a communication time', () => {
      expect(() => validateEmergencyCodeState(redState)).not.toThrow();
      expect(() =>
        validateEmergencyCodeState({ ...redState, cogridNotified: false }),
      ).not.toThrow();
    });

    it('requires the COGRID flag', () => {
      expect(() =>
        validateEmergencyCodeState({ ...redState, cogridNotified: null }),
      ).toThrow(BadRequestException);
    });

    it('accepts a COGRID communication time after activation', () => {
      expect(() =>
        validateEmergencyCodeState({
          ...redState,
          cogridNotifiedAt: new Date('2026-08-24T10:05:00.000Z'),
        }),
      ).not.toThrow();
    });

    it('rejects a COGRID time when COGRID was not notified', () => {
      expect(() =>
        validateEmergencyCodeState({
          ...redState,
          cogridNotified: false,
          cogridNotifiedAt: new Date('2026-08-24T10:05:00.000Z'),
        }),
      ).toThrow('cogridNotifiedAt requires cogridNotified to be true');
    });

    it('rejects a COGRID time earlier than activation', () => {
      expect(() =>
        validateEmergencyCodeState({
          ...redState,
          cogridNotifiedAt: new Date('2026-08-24T09:59:00.000Z'),
        }),
      ).toThrow('cogridNotifiedAt cannot be earlier than activationTime');
    });

    it('rejects a COGRID time on other emergency types', () => {
      expect(() =>
        validateEmergencyCodeState({
          ...baseState,
          cogridNotifiedAt: new Date('2026-08-24T10:05:00.000Z'),
        }),
      ).toThrow(BadRequestException);
    });
  });

  describe('closure', () => {
    it('accepts an open green emergency', () => {
      expect(() => validateEmergencyCodeState(openGreenState)).not.toThrow();
    });

    it('accepts a green emergency closed with caller, time and operator', () => {
      expect(() => validateEmergencyCodeState(closedGreenState)).not.toThrow();
    });

    it.each([
      ['closedBy', { closedBy: null }],
      ['closedBy (blank)', { closedBy: '   ' }],
      ['closedAt', { closedAt: null }],
      ['closedByOperatorId', { closedByOperatorId: null }],
    ])('rejects a closure without %s', (_label, override) => {
      expect(() =>
        validateEmergencyCodeState({ ...closedGreenState, ...override }),
      ).toThrow(
        'Closing an emergency requires closedBy, closedAt and closedByOperatorId',
      );
    });

    it('rejects a closure date earlier than activation', () => {
      expect(() =>
        validateEmergencyCodeState({
          ...closedGreenState,
          closedAt: new Date('2026-08-24T09:59:00.000Z'),
        }),
      ).toThrow('closedAt cannot be earlier than activationTime');
    });

    it('rejects closure data for non-green emergencies', () => {
      expect(() =>
        validateEmergencyCodeState({
          ...baseState,
          closedBy: 'Supervisor',
          closedAt: new Date('2026-08-24T10:30:00.000Z'),
          closedByOperatorId: 'operator-2',
        }),
      ).toThrow('Only GREEN emergencies can be closed');
    });
  });
});
