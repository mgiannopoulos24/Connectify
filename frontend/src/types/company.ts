export interface CompanySummary {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface Company extends CompanySummary {
  description: string | null;
}
