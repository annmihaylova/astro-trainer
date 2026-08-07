export const blitzSections = [
    {
        number: '01',
        title: 'Основные формулы',
        shortTitle: 'Формулы',
        path: '/blitz/formulas',
        type: 'Карточки',
        description:
            'Быстрое повторение формул, которые постоянно используются на отборах.',
    },
    {
        number: '02',
        title: 'Матаппарат',
        shortTitle: 'Матаппарат',
        path: '/blitz/math',
        type: 'Конспекты',
        description:
            'Векторы, матрицы и другие короткие математические инструменты, которые нужно помнить без раздумий.',
    },
] as const


export const practiceSections = [
    {
        number: '01',
        title: 'Python-шпаргалка',
        shortTitle: 'Python',
        path: '/practice/python',
        type: 'Справочник',
        description:
            'NumPy, Astropy, SciPy, curve_fit, optimize и основной функционал для практического тура.',
    },
    {
        number: '02',
        title: 'Старые практические туры',
        shortTitle: 'Старые праки',
        path: '/practice/archive',
        type: 'Решения',
        description:
            'Задачи предыдущих лет с решениями, кодом и разбором основных приёмов.',
    },
] as const


export const theorySections = [
    {
        number: '01',
        title: 'Астрономический дивертисмент',
        shortTitle: 'Дивертисмент',
        path: '/theory/divertissement',
        type: 'Материалы',
        description:
            'Основной теоретический материал для систематического повторения астрономии.',
    },
    {
        number: '02',
        title: 'Решения старых квалификаций',
        shortTitle: 'Квалы',
        path: '/theory/qualifiers',
        type: 'Решения',
        description:
            'Разбор задач квалификационных туров предыдущих лет.',
    },
    {
        number: '03',
        title: 'Конспекты по темам',
        shortTitle: 'Конспекты',
        path: '/theory/notes',
        type: 'Конспекты',
        description:
            'Короткие материалы по темам, которые удобно быстро повторить перед отбором.',
    },
] as const
