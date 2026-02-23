export interface Question {
  id: string;
  type: "theory" | "practical";
  questionText: string;
  roleId: string;
  isActive: boolean;
}

export interface TheoryQuestion {
  id: string;
  roleId: string;
  questionText: string;
  isActive: boolean;
}

export interface PracticalQuestion {
  id: string;
  roleId: string;
  questionText: string;
  isActive: boolean;
}
