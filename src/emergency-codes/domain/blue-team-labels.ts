import { BlueTeam } from '@prisma/client';

export const BLUE_TEAM_LABELS: Record<BlueTeam, string> = {
  [BlueTeam.EMERGENCY]: 'Urgencia',
  [BlueTeam.ICU]: 'UCI',
  [BlueTeam.PEDIATRIC_ICU]: 'UCI Pediátrica',
};

export function formatBlueTeams(teams: readonly BlueTeam[]): string {
  return teams.map((team) => BLUE_TEAM_LABELS[team]).join(', ');
}
