import axios from "axios";

// Create an Axios instance with a pre-configured base URL for the FastAPI backend
const API = axios.create({
  baseURL: "http://localhost:8000", // Replace with your FastAPI backend URL in production
});

// ==========================================
// AUTHENTICATION API REQUESTS
// ==========================================

/**
 * Authenticates user credentials with the backend.
 * Uses URLSearchParams to match OAuth2 form-data requirements in FastAPI.
 */
export const loginUser = (username, password) => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  return API.post("/login", formData);
};

/**
 * Registers a new user account with a JSON payload.
 */
export const registerUser = (username, password) => {
  return API.post("/register", { username, password });
};

/**
 * Deletes the currently authenticated user's account and all associated data.
 */
export const deleteAccount = (token) => {
  return API.delete('/users/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ==========================================
// TASKS CRUD API REQUESTS
// ==========================================

/**
 * Fetches all tasks belonging to the authenticated user.
 */
export const getTasks = (token) => {
  return API.get("/tasks", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Creates a new task for the authenticated user.
 */
export const createTask = (title, token) => {
  return API.post("/tasks", { title: title, done: false }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Updates an existing task's title or completion status by ID.
 */
export const updateTask = (taskid, title, done, token) => {
  return API.put(`/tasks/${taskid}`, { title: title, done: done }, {
    headers: { 
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Deletes a specific task by ID for the authenticated user.
 */
export const deleteTask = (taskid, token) => {
  return API.delete(`/tasks/${taskid}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};