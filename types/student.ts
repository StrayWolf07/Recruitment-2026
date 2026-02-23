export interface Student {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
}

export interface StudentProfile {
  name?: string | null;
  phone?: string | null;
  roleIds: string[];
}
