export type ActiveTab = 'socratic' | 'materials' | 'planner' | 'analytics';
export type UserRole = 'student' | 'parent';

export interface SocraticStep {
  id: string;
  stageNumber: number;
  title: string;
  concept: string;
  guidanceQuestion: string;
  hints: string[];
  detailedExplanation: string;
  formula?: string;
  casioTip?: string;
  analogy?: string;
  userReflection?: string;
  isCompleted?: boolean;
}

export interface SocraticProblem {
  id: string;
  title: string;
  subject: string;
  summary: string;
  steps: SocraticStep[];
  source?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  referencedStepTitle?: string;
  selectedText?: string;
}

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  contextExample: string;
  category: string;
  masteryLevel?: 'new' | 'learning' | 'mastered';
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanationCorrect: string;
  explanationWrong?: Record<string, string>;
  userAnswer?: string;
  isAnswered?: boolean;
}

export interface MaterialsSummary {
  keyTakeaways: string[];
  comparisonTable: {
    title: string;
    headers: string[];
    rows: string[][];
  };
}

export interface ExtractedMaterials {
  title: string;
  overview: string;
  flashcards: Flashcard[];
  quizzes: QuizQuestion[];
  summary: MaterialsSummary;
}

export interface DailyTask {
  id: string;
  dayNumber: number;
  dateOffsetDays: number;
  topic: string;
  taskName: string;
  type: 'theory' | 'practice' | 'review' | 'mock_test';
  estimatedMinutes: number;
  priority: 'high' | 'medium';
  actionDetails: string;
  completed: boolean;
  missed: boolean;
}

export interface ExamPlan {
  examName: string;
  targetDate: string;
  dailyMinutes: number;
  totalWeeks: number;
  strategyNote: string;
  dailyTasks: DailyTask[];
}

export interface TopicMastery {
  subject: string;
  score: number; // 0 - 100
  questionsAnswered: number;
  status: 'good' | 'average' | 'needs_work';
}

export interface KnowledgeGap {
  id: string;
  topic: string;
  subject: string;
  currentAccuracy: number;
  recommendation: string;
  suggestedAction: string;
}
