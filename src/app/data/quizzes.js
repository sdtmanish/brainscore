// app/data/quizzes.js

export const QUIZZES = [
  {
    slug: "frontend-basics",
    title: "Frontend Basics",
    description: "HTML, CSS, and JS fundamentals.",
    questions: [
      {
        question: "Which HTML tag is used to include JavaScript code?",
        image: "/assets/image.jpeg",
        options: ["<javascript>", "<script>", "<code>", "<js>"],
        correctIndex: 1,
      },
      {
        question: "Which CSS property is used to change the text color?",
        image: "/assets/qq.jpg",
        options: ["font-style", "text-color", "color", "font-color"],
        correctIndex: 2,
      },
      {
        question: "Which of these is NOT a semantic HTML tag?",
        image: "/assets/image.jpeg",
        options: ["<article>", "<footer>", "<bold>", "<section>"],
        correctIndex: 2,
      },
    ],
  },
  {
    slug: "javascript-essentials",
    title: "JavaScript Essentials",
    description: "Variables, types, and core JS concepts.",
    questions: [
      {
        question: "Which keyword declares a constant variable?",
        options: ["let", "const", "var", "static"],
        correctIndex: 1,
      },
      {
        question: "What is the result of typeof null in JavaScript?",
        options: ["\"null\"", "\"object\"", "\"undefined\"", "\"number\""],
        correctIndex: 1,
      },
      {
        question: "Which array method creates a new array with elements that pass a test?",
        options: ["map()", "forEach()", "filter()", "reduce()"],
        correctIndex: 2,
      },
    ],
  },
  {
    slug: "react-fundamentals",
    title: "React Fundamentals",
    description: "Components, props, and hooks.",
    questions: [
      {
        question: "Which hook is used to manage state in a function component?",
        options: ["useEffect", "useState", "useMemo", "useRef"],
        correctIndex: 1,
      },
      {
        question: "Props in React are:",
        options: [
          "Mutable data",
          "Used only with class components",
          "Read-only inputs to a component",
          "Only for styling",
        ],
        correctIndex: 2,
      },
      {
        question: "What should be used as a key when rendering a list?",
        options: [
          "The array index, always",
          "Random number",
          "A unique stable identifier",
          "CSS class name",
        ],
        correctIndex: 2,
      },
    ],
  },
];
