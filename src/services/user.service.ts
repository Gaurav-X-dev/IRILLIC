import { db } from "@/db";
import { users, type NewUser } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const userService = {
  async getAll() {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        avatar: users.avatar,
        mustChangePassword: users.mustChangePassword,
        createdAt: users.createdAt,
      })
      .from(users);

    return result;
  },

  async getById(id: string) {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id));

    return result[0] || null;
  },

  async createContentReader(data: {
    name: string;
    email: string;
    password: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const result = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: "content_reader",
        isActive: true,
        emailVerified: true,
        mustChangePassword: true,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        mustChangePassword: users.mustChangePassword,
        createdAt: users.createdAt,
      });

    return result[0];
  },

  async updateContentReader(
    id: string,
    data: {
      name?: string;
      email?: string;
      isActive?: boolean;
      temporaryPassword?: string;
    },
  ) {
    const password = data.temporaryPassword
      ? await bcrypt.hash(data.temporaryPassword, 12)
      : undefined;
    const result = await db
      .update(users)
      .set({
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.email !== undefined
          ? { email: data.email.toLowerCase() }
          : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(password
          ? { password, mustChangePassword: true, emailVerified: true }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        mustChangePassword: users.mustChangePassword,
        updatedAt: users.updatedAt,
      });
    return result[0] || null;
  },

  async update(id: string, data: Partial<Omit<NewUser, "id" | "password">>) {
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        updatedAt: users.updatedAt,
      });

    return result[0] || null;
  },

  async delete(id: string) {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    return result[0] || null;
  },

  async getByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email));

    return result[0] || null;
  },
};
