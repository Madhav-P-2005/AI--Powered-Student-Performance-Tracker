// services/studentService.js — Student records API calls

import api from '../config/api';

/**
 * Create a new student record (study habits, lifestyle data).
 */
export const createRecord = (data) => {
  return api.post('/students/records/', data);
};

/**
 * Get all student records for the current user.
 */
export const getRecords = () => {
  return api.get('/students/records/');
};

/**
 * Get a single student record by ID.
 */
export const getRecord = (id) => {
  return api.get(`/students/records/${id}/`);
};
