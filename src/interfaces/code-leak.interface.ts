export interface ICodeLeak {
  id: string;
  activeBy: string;
  createdAt: string;
  location: string;
  operator: string;
  patientName?: string;
  patientDescription: string;
}
