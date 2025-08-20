import axios from 'axios';
import { Company, CompanySummary } from '@/types/company';

// --- For Admin Panel ---

/**
 * Fetches all companies for the admin panel.
 */
export const getCompanies = async (): Promise<Company[]> => {
  const response = await axios.get<{ data: Company[] }>('/api/admin/companies');
  return response.data.data;
};

/**
 * Creates a new company.
 */
export const createCompany = async (companyData: Omit<Company, 'id'>): Promise<Company> => {
  const response = await axios.post<{ data: Company }>('/api/admin/companies', {
    company: companyData,
  });
  return response.data.data;
};

/**
 * Updates an existing company.
 */
export const updateCompany = async (
  id: string,
  companyData: Partial<Omit<Company, 'id'>>,
): Promise<Company> => {
  const response = await axios.put<{ data: Company }>(`/api/admin/companies/${id}`, {
    company: companyData,
  });
  return response.data.data;
};

/**
 * Deletes a company.
 */
export const deleteCompany = async (id: string): Promise<void> => {
  await axios.delete(`/api/admin/companies/${id}`);
};

// --- For Public Autocomplete ---

/**
 * Searches for companies by name for autocomplete functionality.
 */
export const searchCompanies = async (searchTerm: string): Promise<CompanySummary[]> => {
  if (!searchTerm) return [];
  const response = await axios.get<{ data: CompanySummary[] }>(
    `/api/companies?search=${searchTerm}`,
  );
  return response.data.data;
};

/**
 * Fetches a single company by its ID.
 */
export const getCompanyById = async (id: string): Promise<Company> => {
  const response = await axios.get<{ data: Company }>(`/api/companies/${id}`);
  return response.data.data;
};

/**
 * Follows a company for the current user.
 */
export const followCompany = async (id: string): Promise<void> => {
  await axios.post(`/api/companies/${id}/follow`);
};

/**
 * Unfollows a company for the current user.
 */
export const unfollowCompany = async (id: string): Promise<void> => {
  await axios.delete(`/api/companies/${id}/follow`);
};
