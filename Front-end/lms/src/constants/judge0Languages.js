export const JUDGE0_LANGUAGES = [
    { id: 54, label: "C++ (GCC 9.2)" },
    { id: 63, label: "JavaScript (Node 12)" },
    { id: 71, label: "Python 3.8" },
    { id: 62, label: "Java (OpenJDK 13)" },
    { id: 50, label: "C (GCC 9.2)" },
    { id: 75, label: "C# (.NET 6.0)" },
    { id: 78, label: "Kotlin 1.3" },
];

export const JUDGE0_LANGUAGE_MAP = JUDGE0_LANGUAGES.reduce((acc, lang) => {
    acc[lang.id] = lang.label;
    return acc;
}, {});


