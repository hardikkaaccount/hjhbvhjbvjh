import api from './api';
import { Problem } from '../data/dsaProblems';

// Get all problems
export const fetchProblems = async (): Promise<Problem[]> => {
  try {
    const { data } = await api.get('/problems');
    return data.map((problem: any) => ({
      id: problem.id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      sampleTests: problem.sampleTests,
      hiddenTests: problem.hiddenTests,
      starterCode: problem.starterCode,
      suggestedApproach: problem.suggestedApproach
    }));
  } catch (error) {
    console.error('Error fetching problems:', error);
    throw error;
  }
};

// Get problem by ID
export const fetchProblemById = async (id: string): Promise<Problem> => {
  try {
    const { data } = await api.get(`/problems/${id}`);
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      sampleTests: data.sampleTests,
      hiddenTests: data.hiddenTests,
      starterCode: data.starterCode,
      suggestedApproach: data.suggestedApproach
    };
  } catch (error) {
    console.error(`Error fetching problem ${id}:`, error);
    throw error;
  }
};

// For admin use - create problem
export const createProblem = async (problem: Problem, token: string): Promise<Problem> => {
  try {
    const { data } = await api.post('/problems', problem);
    return data;
  } catch (error) {
    console.error('Error creating problem:', error);
    throw error;
  }
};

// For admin use - update problem
export const updateProblem = async (id: string, problem: Problem, token: string): Promise<Problem> => {
  try {
    const { data } = await api.put(`/problems/${id}`, problem);
    return data;
  } catch (error) {
    console.error(`Error updating problem ${id}:`, error);
    throw error;
  }
};

// For admin use - delete problem
export const deleteProblem = async (id: string, token: string): Promise<void> => {
  try {
    await api.delete(`/problems/${id}`);
  } catch (error) {
    console.error(`Error deleting problem ${id}:`, error);
    throw error;
  }
}; 