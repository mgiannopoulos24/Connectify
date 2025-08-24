import axios from 'axios';
import { Company, CompanySummary } from '@/types/company';

// --- Admin Panel ---

export const getCompanies = async (): Promise<Company[]> => {
  const response = await axios.get<{ data: Company[] }>('/api/admin/companies');
  return response.data.data;
};

export const createCompany = async (companyData: Omit<Company, 'id'>): Promise<Company> => {
  const response = await axios.post<{ data: Company }>('/api/admin/companies', {
    company: companyData,
  });
  return response.data.data;
};

export const updateCompany = async (
  id: string,
  companyData: Partial<Omit<Company, 'id'>>,
): Promise<Company> => {
  const response = await axios.put<{ data: Company }>(`/api/admin/companies/${id}`, {
    company: companyData,
  });
  return response.data.data;
};

export const deleteCompany = async (id: string): Promise<void> => {
  await axios.delete(`/api/admin/companies/${id}`);
};

// --- For Public Autocomplete ---

export const searchCompanies = async (searchTerm: string): Promise<CompanySummary[]> => {
  if (!searchTerm) return [];
  const response = await axios.get<{ data: CompanySummary[] }>(
    `/api/companies?search=${searchTerm}`,
  );
  return response.data.data;
};

export const getCompanyById = async (id: string): Promise<Company> => {
  const response = await axios.get<{ data: Company }>(`/api/companies/${id}`);
  return response.data.data;
};

export const followCompany = async (id: string): Promise<void> => {
  await axios.post(`/api/companies/${id}/follow`);
};

export const unfollowCompany = async (id: string): Promise<void> => {
  await axios.delete(`/api/companies/${id}/follow`);
};
