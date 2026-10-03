import { BadRequestException } from '@nestjs/common';
import { BlueTeam, CodeType } from '@prisma/client';

export interface EmergencyCodeState {
  readonly type: CodeType;
  readonly activeBy: string;
  readonly activationTime: Date;
  readonly location: string;
  readonly operatorId: string;
  readonly observations?: string | null;
  readonly closedBy?: string | null;
  readonly closedAt?: Date | null;
  readonly closedByOperatorId?: string | null;
  readonly event?: string | null;
  readonly police?: boolean | null;
  readonly teams?: readonly BlueTeam[] | null;
  readonly emergencyDetail?: string | null;
  readonly cogridNotified?: boolean | null;
  readonly cogridNotifiedAt?: Date | null;
  readonly firefighterCalledTime?: Date | null;
  readonly patientName?: string | null;
  readonly patientDescription?: string | null;
}

type SpecificField =
  | 'event'
  | 'police'
  | 'teams'
  | 'emergencyDetail'
  | 'cogridNotified'
  | 'cogridNotifiedAt'
  | 'firefighterCalledTime'
  | 'patientName'
  | 'patientDescription';

const allowedFieldsByType: Record<CodeType, readonly SpecificField[]> = {
  [CodeType.GREEN]: ['event', 'police'],
  [CodeType.BLUE]: ['teams'],
  [CodeType.AIR]: ['emergencyDetail'],
  [CodeType.RED]: [
    'cogridNotified',
    'cogridNotifiedAt',
    'firefighterCalledTime',
  ],
  [CodeType.LEAK]: ['patientName', 'patientDescription'],
};

const specificFields: readonly SpecificField[] = [
  'event',
  'police',
  'teams',
  'emergencyDetail',
  'cogridNotified',
  'cogridNotifiedAt',
  'firefighterCalledTime',
  'patientName',
  'patientDescription',
];

// Prisma devuelve `teams: []` para los tipos que no son BLUE, por lo que una
// lista vacía cuenta como ausente.
function isPresent(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== null && value !== undefined && value !== '';
}

function requireField(state: EmergencyCodeState, field: SpecificField): void {
  if (!isPresent(state[field])) {
    throw new BadRequestException(`${field} is required for ${state.type}`);
  }
}

function validateBlueTeams(teams: readonly BlueTeam[]): void {
  const knownTeams: readonly string[] = Object.values(BlueTeam);

  if (teams.some((team) => !knownTeams.includes(team))) {
    throw new BadRequestException('teams contains an unknown team');
  }

  if (new Set(teams).size !== teams.length) {
    throw new BadRequestException('teams must not contain duplicates');
  }
}

function validateRedState(state: EmergencyCodeState): void {
  if (isPresent(state.cogridNotifiedAt)) {
    if (state.cogridNotified !== true) {
      throw new BadRequestException(
        'cogridNotifiedAt requires cogridNotified to be true',
      );
    }

    if (state.cogridNotifiedAt! < state.activationTime) {
      throw new BadRequestException(
        'cogridNotifiedAt cannot be earlier than activationTime',
      );
    }
  }
}

function validateClosure(state: EmergencyCodeState): void {
  const hasClosureData =
    isPresent(state.closedBy) ||
    isPresent(state.closedAt) ||
    isPresent(state.closedByOperatorId);

  if (state.type !== CodeType.GREEN) {
    if (hasClosureData) {
      throw new BadRequestException('Only GREEN emergencies can be closed');
    }
    return;
  }

  // Un código verde está abierto mientras no tenga datos de cierre.
  if (!hasClosureData) {
    return;
  }

  if (
    !state.closedBy?.trim() ||
    !state.closedAt ||
    !isPresent(state.closedByOperatorId)
  ) {
    throw new BadRequestException(
      'Closing an emergency requires closedBy, closedAt and closedByOperatorId',
    );
  }

  if (state.closedAt < state.activationTime) {
    throw new BadRequestException(
      'closedAt cannot be earlier than activationTime',
    );
  }
}

export function validateEmergencyCodeState(state: EmergencyCodeState): void {
  const allowedFields = allowedFieldsByType[state.type];

  for (const field of specificFields) {
    if (!allowedFields.includes(field) && isPresent(state[field])) {
      throw new BadRequestException(
        `${field} is not allowed for ${state.type}`,
      );
    }
  }

  switch (state.type) {
    case CodeType.GREEN:
      requireField(state, 'event');
      requireField(state, 'police');
      break;
    case CodeType.BLUE:
      requireField(state, 'teams');
      validateBlueTeams(state.teams!);
      break;
    case CodeType.AIR:
      requireField(state, 'emergencyDetail');
      break;
    case CodeType.RED:
      requireField(state, 'cogridNotified');
      validateRedState(state);
      break;
    case CodeType.LEAK:
      requireField(state, 'patientDescription');
      break;
  }

  validateClosure(state);
}
