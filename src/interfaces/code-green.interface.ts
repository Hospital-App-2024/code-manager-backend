export interface ICodeGreen {
  activeBy: string;
  createdAt: string;
  event: string;
  id: string;
  location: string;
  operator: string;
  police: string;
  isClosed: boolean;
  observations?: string;
  closedBy?: string;
  closedAt?: string;
}
