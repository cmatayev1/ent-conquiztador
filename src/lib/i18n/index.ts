import type { Lang } from "@/lib/game/types";

/** All UI strings for the race, strictly typed so `t.title` is a string. */
export interface RaceStrings {
  title: string;
  subtitle: string;
  tagline: string;
  chooseSubjects: string;
  chooseSubjectsHint: string;
  chooseMode: string;
  vsAI: string;
  hotseat: string;
  soon: string;
  start: string;
  needSubject: string;
  you: string;
  timeLeft: string;
  sec: string;
  correct: string;
  wrong: string;
  timeout: string;
  correctAnswer: string;
  question: string;
  of: string;
  nextQuestion: string;
  seeResults: string;
  finish: string;
  raceOver: string;
  winner: string;
  draw: string;
  standings: string;
  correctAnswers: string;
  distance: string;
  playAgain: string;
  backToMenu: string;
  subjects: Record<string, string>;
}

export const I18N: Record<Lang, RaceStrings> = {
  ru: {
    title: "ENT-Бәйге",
    subtitle: "Скачки по степи знаний",
    tagline: "Отвечай быстро и верно — и твой скакун обгонит соперников на пути через Казахстан.",
    chooseSubjects: "Выберите предметы",
    chooseSubjectsHint: "Можно выбрать несколько",
    chooseMode: "Режим",
    vsAI: "Против ИИ",
    hotseat: "Несколько игроков",
    soon: "скоро",
    start: "На старт",
    needSubject: "Выберите хотя бы один предмет",
    you: "Вы",
    timeLeft: "Время",
    sec: "с",
    correct: "Верно!",
    wrong: "Неверно",
    timeout: "Время вышло",
    correctAnswer: "Правильный ответ:",
    question: "Вопрос",
    of: "из",
    nextQuestion: "Следующий вопрос",
    seeResults: "Итоги скачек",
    finish: "Финиш",
    raceOver: "Скачки окончены",
    winner: "Победитель",
    draw: "Ничья",
    standings: "Результаты",
    correctAnswers: "верных ответов",
    distance: "дистанция",
    playAgain: "Ещё заезд",
    backToMenu: "В меню",
    subjects: {
      history_kz: "История Казахстана",
      math: "Математика",
      reading: "Русский язык",
      physics: "Физика",
      chemistry: "Химия",
      biology: "Биология",
      geography: "География",
      english: "Английский язык",
      world_history: "Всемирная история",
      informatics: "Информатика",
    },
  },
  kk: {
    title: "ҰБТ-Бәйге",
    subtitle: "Білім даласындағы бәйге",
    tagline: "Жылдам әрі дұрыс жауап бер — тұлпарың Қазақстан даласында бәсекелестерді басып озады.",
    chooseSubjects: "Пәндерді таңдаңыз",
    chooseSubjectsHint: "Бірнешеуін таңдауға болады",
    chooseMode: "Режим",
    vsAI: "ЖИ-ге қарсы",
    hotseat: "Бірнеше ойыншы",
    soon: "жақында",
    start: "Бастау",
    needSubject: "Кемінде бір пән таңдаңыз",
    you: "Сіз",
    timeLeft: "Уақыт",
    sec: "с",
    correct: "Дұрыс!",
    wrong: "Қате",
    timeout: "Уақыт бітті",
    correctAnswer: "Дұрыс жауап:",
    question: "Сұрақ",
    of: "/",
    nextQuestion: "Келесі сұрақ",
    seeResults: "Бәйге қорытындысы",
    finish: "Мәре",
    raceOver: "Бәйге аяқталды",
    winner: "Жеңімпаз",
    draw: "Тең",
    standings: "Нәтижелер",
    correctAnswers: "дұрыс жауап",
    distance: "қашықтық",
    playAgain: "Тағы бір бәйге",
    backToMenu: "Мәзірге",
    subjects: {
      history_kz: "Қазақстан тарихы",
      math: "Математика",
      reading: "Орыс тілі",
      physics: "Физика",
      chemistry: "Химия",
      biology: "Биология",
      geography: "География",
      english: "Ағылшын тілі",
      world_history: "Дүниежүзі тарихы",
      informatics: "Информатика",
    },
  },
};
