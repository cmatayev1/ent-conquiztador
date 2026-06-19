import type { Question } from "@/lib/game/types";

/**
 * PLACEHOLDER question bank. Swap this out for the real ENT bank (227 Qs) later
 * by replacing the QUESTIONS array — keep the same shape.
 * Subjects: history_kz, math, reading, physics, chemistry, biology,
 *           geography, english, world_history, informatics
 */
export const QUESTIONS: Question[] = [
  { s: "history_kz", t: "Государственность", q: "В каком году была принята действующая Конституция РК?", a: ["1993", "1995", "1991", "1998"], c: 1 },
  { s: "history_kz", t: "Казахское ханство", q: "Кто был первым ханом Казахского ханства?", a: ["Керей", "Жанибек", "Касым", "Абылай"], c: 0 },
  { s: "history_kz", t: "Независимость", q: "В каком году Казахстан обрёл независимость?", a: ["1989", "1990", "1991", "1992"], c: 2 },

  { s: "math", t: "Проценты", q: "Сколько будет 15% от 200?", a: ["30", "25", "40", "20"], c: 0 },
  { s: "math", t: "Уравнения", q: "Решите: 2x + 6 = 14. Чему равен x?", a: ["2", "3", "4", "5"], c: 2 },
  { s: "math", t: "Степени", q: "Чему равно 3⁴ × 3²?", a: ["3⁶", "3⁸", "3²", "729"], c: 0 },

  { s: "reading", t: "Типы текста", q: "Главная мысль текста-рассуждения — это:", a: ["Описание места", "Тезис автора", "Хронология", "Диалог"], c: 1 },
  { s: "reading", t: "Лексика", q: "Синоним слова «быстрый»:", a: ["медленный", "скорый", "тихий", "тёмный"], c: 1 },

  { s: "physics", t: "Механика", q: "Единица измерения силы в системе СИ:", a: ["Джоуль", "Ватт", "Ньютон", "Паскаль"], c: 2 },
  { s: "physics", t: "Электричество", q: "Единица измерения электрического сопротивления:", a: ["Вольт", "Ампер", "Ом", "Ватт"], c: 2 },

  { s: "chemistry", t: "Символы", q: "Химический символ золота:", a: ["Go", "Au", "Ag", "Gd"], c: 1 },
  { s: "chemistry", t: "Вода", q: "Химическая формула воды:", a: ["CO₂", "H₂O", "O₂", "NaCl"], c: 1 },

  { s: "biology", t: "Растения", q: "Какой газ выделяют растения при фотосинтезе?", a: ["CO₂", "O₂", "N₂", "H₂"], c: 1 },
  { s: "biology", t: "Клетка", q: "Какая часть клетки содержит ДНК?", a: ["Мембрана", "Ядро", "Цитоплазма", "Рибосома"], c: 1 },

  { s: "geography", t: "Озёра", q: "Самое глубокое озеро в мире:", a: ["Каспий", "Иссык-Куль", "Балхаш", "Байкал"], c: 3 },
  { s: "geography", t: "Столицы", q: "Столица Казахстана:", a: ["Алматы", "Астана", "Шымкент", "Караганда"], c: 1 },

  { s: "english", t: "Grammar", q: "Choose the correct form: She ___ to school every day.", a: ["go", "goes", "going", "gone"], c: 1 },
  { s: "english", t: "Vocabulary", q: "Choose the antonym of \"hot\":", a: ["warm", "cold", "boiling", "mild"], c: 1 },

  { s: "world_history", t: "20th century", q: "В каком году началась Вторая мировая война?", a: ["1939", "1941", "1914", "1945"], c: 0 },
  { s: "world_history", t: "Revolutions", q: "В каком году произошла Французская революция?", a: ["1689", "1789", "1812", "1848"], c: 1 },

  { s: "informatics", t: "Системы счисления", q: "Сколько бит в одном байте?", a: ["4", "8", "16", "32"], c: 1 },
  { s: "informatics", t: "Алгоритмы", q: "Что означает «алгоритм»?", a: ["Ошибка", "Последовательность шагов", "Программа", "Язык"], c: 1 },
];

/** All distinct subject ids present in the bank. */
export const SUBJECTS = [
  "history_kz", "math", "reading", "physics", "chemistry",
  "biology", "geography", "english", "world_history", "informatics",
] as const;

export type Subject = (typeof SUBJECTS)[number];

/** Count of questions available for a subject. */
export function countBySubject(subject: string): number {
  return QUESTIONS.filter((q) => q.s === subject).length;
}

/** Pick a random question for a subject (or null if none). */
export function pickQuestion(subject: string): Question | null {
  const pool = QUESTIONS.filter((q) => q.s === subject);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
