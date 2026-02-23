export type UserRole = "student" | "admin";

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}
