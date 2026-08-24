import { BadRequestException } from '@nestjs/common';
import { CodeType } from '@prisma/client';

export interface EmergencyCodeState {
  readonly type: CodeType;
  readonly activeBy: string;
  readonly activationTime: Date;
  readonly location: string;
  readonly operatorId: string;
  readonly observations?: string | null;
  readonly isClosed?: boolean | null;
  readonly closedBy?: string | null;
  readonly closedAt?: Date | null;
  readonly event?: string | null;
  readonly police?: boolean | null;
  readonly team?: string | null;
  readonly emergencyDetail?: string | null;
  readonly COGRID?: boolean | null;
  readonly firefighterCalledTime?: Date | null;
  readonly patientName?: string | null;
  readonly patientDescription?: string | null;
}

type SpecificField =
  | 'event'
  | 'police'
  | 'team'
  | 'emergencyDetail'
  | 'COGRID'
  | 'firefighterCalledTime'
  | 'patientName'
  | 'patientDescription';

const allowedFieldsByType: Record<CodeType, readonly SpecificField[]> = {
  [CodeType.GREEN]: ['event', 'police'],
  [CodeType.BLUE]: ['team'],
  [CodeType.AIR]: ['emergencyDetail'],
  [CodeType.RED]: ['COGRID', 'firefighterCalledTime'],
  [CodeType.LEAK]: ['patientName', 'patientDescription'],
};

const specificFields: readonly SpecificField[] = [
  'event',
  'police',
  'team',
  'emergencyDetail',
  'COGRID',
  'firefighterCalledTime',
  'patientName',
  'patientDescription',
];

function isPresent(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
}

function requireField(state: EmergencyCodeState, field: SpecificField): void {
  if (!isPresent(state[field])) {
    throw new BadRequestException(`${field} is required for ${state.type}`);
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
      requireField(state, 'team');
      break;
    case CodeType.AIR:
      requireField(state, 'emergencyDetail');
      break;
    case CodeType.RED:
      requireField(state, 'COGRID');
      break;
    case CodeType.LEAK:
      requireField(state, 'patientDescription');
      break;
  }

  if (state.type !== CodeType.GREEN) {
    if (
      (state.isClosed !== null && state.isClosed !== undefined) ||
      isPresent(state.closedBy) ||
      isPresent(state.closedAt)
    ) {
      throw new BadRequestException('Only GREEN emergencies can be closed');
    }
    return;
  }

  if (state.isClosed === null || state.isClosed === undefined) {
    throw new BadRequestException('GREEN emergencies require isClosed');
  }

  if (!state.isClosed) {
    if (isPresent(state.closedBy) || isPresent(state.closedAt)) {
      throw new BadRequestException(
        'Open emergencies cannot have closure data',
      );
    }
    return;
  }

  if (!state.closedBy?.trim() || !state.closedAt) {
    throw new BadRequestException(
      'Closed emergencies require closedBy and closedAt',
    );
  }

  if (state.closedAt < state.activationTime) {
    throw new BadRequestException(
      'closedAt cannot be earlier than activationTime',
    );
  }
}
