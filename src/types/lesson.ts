export interface Quiz {
  question: string;
  options: string[];
  answer: string;
  hint: string;
}

export interface LessonContent {
  explanation: string;
  quizzes: Quiz[];
}

export interface Lesson {
  id: string;
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  content: LessonContent;
  createdAt: Date;
}
