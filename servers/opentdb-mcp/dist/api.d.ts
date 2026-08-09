export declare class TriviaError extends Error {
}
export interface TriviaCategory {
    id: number;
    name: string;
}
export interface Question {
    category?: string;
    type?: string;
    difficulty?: string;
    question?: string;
    correct_answer?: string;
    incorrect_answers?: string[];
}
/** Decode common HTML entities in trivia text. */
export declare function decodeHtml(s: string): string;
export declare function getCategories(): Promise<TriviaCategory[]>;
export declare function getQuestions(amount?: number, category?: number, difficulty?: string, type?: string): Promise<Question[]>;
export declare function formatQuestion(q: Question, index?: number): string;
