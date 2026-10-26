import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
});

export const createContentReaderSchema = z.object({
  name: z.string().trim().min(2).max(255),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z
    .string()
    .min(12, "Temporary password must be at least 12 characters")
    .max(128)
    .regex(/[a-z]/, "Add a lowercase letter")
    .regex(/[A-Z]/, "Add an uppercase letter")
    .regex(/[0-9]/, "Add a number")
    .regex(/[^A-Za-z0-9]/, "Add a symbol"),
});

export const updateContentReaderSchema = z
  .object({
    name: z.string().trim().min(2).max(255).optional(),
    email: z.string().trim().toLowerCase().email().max(255).optional(),
    isActive: z.boolean().optional(),
    temporaryPassword: z
      .string()
      .min(12, "Temporary password must be at least 12 characters")
      .max(128)
      .regex(/[a-z]/, "Add a lowercase letter")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[0-9]/, "Add a number")
      .regex(/[^A-Za-z0-9]/, "Add a symbol")
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "No changes supplied");

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters")
    .optional(),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .optional(),
  isActive: z.boolean().optional(),
  role: z.enum(["admin", "content_reader"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().default(false),
});

export const strongPasswordSchema = z
  .string()
  .min(12, "Use a password of at least 12 characters")
  .max(128)
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[0-9]/, "Add a number")
  .regex(/[^A-Za-z0-9]/, "Add a symbol");

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
