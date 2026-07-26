export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "auth/login",
    PROFILE: "auth/profile",
  },
  USERS: {
    LIST: "users",
    CREATE: "users",
    UPDATE: (id) => `users/${id}`,
    DELETE: (id) => `users/${id}`,
  },
  MODELS: {
    LIST: "models",
    CREATE: "models",
    UPDATE: (id) => `models/${id}`,
    DELETE: (id) => `models/${id}`,
  },
  PIECE_RATES: {
    LIST: "piece-rates",
    SAVE: "piece-rates",
  },
  WORK_LOGS: {
    LIST: "work-logs",
    CREATE: "work-logs",
    DELETE: (id) => `work-logs/${id}`,
  },
  REPORTS: {
    SALARY: "reports/salary",
    SUMMARY: "reports/summary",
  }
};
