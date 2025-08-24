import axios from 'axios';
import { Skill } from '@/types/skill';

// --- For Admin Panel ---

export const getSkills = async (): Promise<Skill[]> => {
  const response = await axios.get<{ data: Skill[] }>('/api/admin/skills');
  return response.data.data;
};

export const createSkill = async (skillData: { name: string }): Promise<Skill> => {
  const response = await axios.post<{ data: Skill }>('/api/admin/skills', {
    skill: skillData,
  });
  return response.data.data;
};

export const updateSkill = async (id: string, skillData: { name: string }): Promise<Skill> => {
  const response = await axios.put<{ data: Skill }>(`/api/admin/skills/${id}`, {
    skill: skillData,
  });
  return response.data.data;
};

export const deleteSkill = async (id: string): Promise<void> => {
  await axios.delete(`/api/admin/skills/${id}`);
};

// --- For Public Autocomplete & Profile ---

export const searchSkills = async (searchTerm: string): Promise<Skill[]> => {
  if (!searchTerm) return [];
  const response = await axios.get<{ data: Skill[] }>(`/api/skills?search=${searchTerm}`);
  return response.data.data;
};

export const addUserSkill = async (name: string): Promise<Skill> => {
  const response = await axios.post<{ data: Skill }>('/api/skills', {
    skill: { name },
  });
  return response.data.data;
};
