export const APP_NAME = "IRILLIC";
export const APP_DESCRIPTION = "IRILLIC - Modern Web Application";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  API: {
    HEALTH: "/api/health",
    USERS: "/api/v1/users",
  },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  MODERATOR: "moderator",
} as const;
