export type BlitzFormulaLine = {
    label?: string
    tex: string
}

export type BlitzFormula = {
    id: string
    category: string
    title: string
    formulas: BlitzFormulaLine[]
    note?: string
    details?: string[]
}


export const blitzFormulas: readonly BlitzFormula[] = [
    {
        "id": "gravitation",
        "category": "Орбитальная механика",
        "title": "Закон всемирного тяготения",
        "formulas": [
            {
                "label": "Сила",
                "tex": "F=\\frac{GMm}{r^2}"
            }
        ]
    },
    {
        "id": "sphere-mass",
        "category": "Орбитальная механика",
        "title": "Масса однородного шара",
        "formulas": [
            {
                "label": "Масса",
                "tex": "M=\\frac{4\\pi}{3}\\rho R^3"
            },
            {
                "label": "Средняя плотность",
                "tex": "\\bar\\rho=\\frac{3M}{4\\pi R^3}"
            }
        ]
    },
    {
        "id": "surface-gravity",
        "category": "Орбитальная механика",
        "title": "Ускорение свободного падения",
        "formulas": [
            {
                "label": "На поверхности",
                "tex": "g=\\frac{GM}{R^2}"
            },
            {
                "label": "Через среднюю плотность",
                "tex": "g=\\frac{4\\pi}{3}G\\rho R"
            }
        ]
    },
    {
        "id": "gravity-potential",
        "category": "Орбитальная механика",
        "title": "Гравитационный потенциал и энергия",
        "formulas": [
            {
                "label": "Потенциал",
                "tex": "\\Phi(r)=-\\frac{GM}{r}"
            },
            {
                "label": "Потенциальная энергия",
                "tex": "U(r)=-\\frac{GMm}{r}"
            }
        ]
    },
    {
        "id": "circular-orbit",
        "category": "Орбитальная механика",
        "title": "Круговая орбита",
        "formulas": [
            {
                "label": "Скорость",
                "tex": "v_{\\rm circ}=\\sqrt{\\frac{GM}{r}}"
            },
            {
                "label": "Угловая скорость",
                "tex": "\\omega=\\sqrt{\\frac{GM}{r^3}}"
            },
            {
                "label": "Период",
                "tex": "T=2\\pi\\sqrt{\\frac{r^3}{GM}}"
            }
        ]
    },
    {
        "id": "kepler-third",
        "category": "Орбитальная механика",
        "title": "Третий закон Кеплера",
        "formulas": [
            {
                "label": "Общий вид",
                "tex": "T^2=\\frac{4\\pi^2a^3}{G(M_1+M_2)}"
            },
            {
                "label": "Для малой массы спутника",
                "tex": "T=2\\pi\\sqrt{\\frac{a^3}{GM}}"
            }
        ],
        "note": "Для Солнечной системы при a в а.е. и T в годах: T² ≈ a³."
    },
    {
        "id": "vis-viva",
        "category": "Орбитальная механика",
        "title": "Формула vis-viva",
        "formulas": [
            {
                "tex": "v^2=GM\\left(\\frac{2}{r}-\\frac{1}{a}\\right)"
            }
        ],
        "note": "Для гиперболы удобно считать a<0 или писать |a| отдельно."
    },
    {
        "id": "orbital-energy",
        "category": "Орбитальная механика",
        "title": "Энергия кеплеровой орбиты",
        "formulas": [
            {
                "label": "Удельная энергия",
                "tex": "\\varepsilon=\\frac{v^2}{2}-\\frac{GM}{r}=-\\frac{GM}{2a}"
            },
            {
                "label": "Полная энергия",
                "tex": "E=-\\frac{GMm}{2a}"
            }
        ]
    },
    {
        "id": "periapo",
        "category": "Орбитальная механика",
        "title": "Перицентр и апоцентр эллипса",
        "formulas": [
            {
                "label": "Расстояния",
                "tex": "r_{\\rm p}=a(1-e),\\qquad r_{\\rm a}=a(1+e)"
            },
            {
                "label": "Обратные формулы",
                "tex": "a=\\frac{r_{\\rm p}+r_{\\rm a}}{2},\\qquad e=\\frac{r_{\\rm a}-r_{\\rm p}}{r_{\\rm a}+r_{\\rm p}}"
            }
        ]
    },
    {
        "id": "conic-polar",
        "category": "Орбитальная механика",
        "title": "Орбита в полярных координатах",
        "formulas": [
            {
                "label": "Коническое сечение",
                "tex": "r=\\frac{p}{1+e\\cos\\nu}"
            },
            {
                "label": "Эллипс",
                "tex": "p=a(1-e^2)"
            },
            {
                "label": "Гипербола",
                "tex": "p=|a|(e^2-1)"
            }
        ]
    },
    {
        "id": "angular-momentum",
        "category": "Орбитальная механика",
        "title": "Удельный орбитальный момент",
        "formulas": [
            {
                "label": "Определение",
                "tex": "h=rv_\\perp=r^2\\dot\\nu"
            },
            {
                "label": "Кеплерова орбита",
                "tex": "h=\\sqrt{GMa(1-e^2)}"
            }
        ]
    },
    {
        "id": "areal-velocity",
        "category": "Орбитальная механика",
        "title": "Секториальная скорость",
        "formulas": [
            {
                "tex": "\\frac{dS}{dt}=\\frac{h}{2}=\\frac12\\,r^2\\dot\\nu"
            }
        ]
    },
    {
        "id": "orbital-components",
        "category": "Орбитальная механика",
        "title": "Радиальная и трансверсальная скорости на эллипсе",
        "formulas": [
            {
                "label": "Радиальная",
                "tex": "v_r=\\frac{GM}{h}\\,e\\sin\\nu"
            },
            {
                "label": "Трансверсальная",
                "tex": "v_\\nu=\\frac{GM}{h}\\,(1+e\\cos\\nu)"
            }
        ]
    },
    {
        "id": "escape-speed",
        "category": "Орбитальная механика",
        "title": "Вторая космическая скорость",
        "formulas": [
            {
                "tex": "v_{\\rm esc}=\\sqrt{\\frac{2GM}{r}}"
            }
        ]
    },
    {
        "id": "radial-fall",
        "category": "Орбитальная механика",
        "title": "Падение из покоя на точечную массу",
        "formulas": [
            {
                "label": "До центра из r₀",
                "tex": "t_{\\rm fall}=\\frac{\\pi}{2\\sqrt2}\\sqrt{\\frac{r_0^3}{GM}}"
            }
        ],
        "note": "Эквивалентно половине периода вырожденного эллипса с a=r₀/2."
    },
    {
        "id": "freefall-time",
        "category": "Орбитальная механика",
        "title": "Время свободного падения однородного облака",
        "formulas": [
            {
                "tex": "t_{\\rm ff}=\\sqrt{\\frac{3\\pi}{32G\\rho}}"
            }
        ]
    },
    {
        "id": "uniform-sphere-field",
        "category": "Орбитальная механика",
        "title": "Поле внутри однородного шара",
        "formulas": [
            {
                "label": "Масса внутри r",
                "tex": "M(r)=\\frac{4\\pi}{3}\\rho r^3"
            },
            {
                "label": "Ускорение",
                "tex": "g(r)=\\frac{4\\pi}{3}G\\rho\\,r"
            },
            {
                "label": "Круговая скорость",
                "tex": "v_c(r)=r\\sqrt{\\frac{4\\pi G\\rho}{3}}"
            }
        ]
    },
    {
        "id": "uniform-sphere-potential",
        "category": "Орбитальная механика",
        "title": "Потенциал однородного шара",
        "formulas": [
            {
                "label": "Внутри R",
                "tex": "\\Phi(r)=-2\\pi G\\rho\\left(R^2-\\frac{r^2}{3}\\right)"
            }
        ]
    },
    {
        "id": "gravity-tunnel",
        "category": "Орбитальная механика",
        "title": "Падение в шахте через однородный шар",
        "formulas": [
            {
                "label": "Частота",
                "tex": "\\omega=\\sqrt{\\frac{4\\pi G\\rho}{3}}"
            },
            {
                "label": "Период",
                "tex": "T=2\\pi\\sqrt{\\frac{3}{4\\pi G\\rho}}"
            },
            {
                "label": "Поверхность → центр",
                "tex": "t=\\frac{T}{4}=\\sqrt{\\frac{3\\pi}{16G\\rho}}"
            }
        ]
    },
    {
        "id": "binding-sphere",
        "category": "Орбитальная механика",
        "title": "Гравитационная энергия однородного шара",
        "formulas": [
            {
                "tex": "U=-\\frac{3GM^2}{5R}"
            }
        ]
    },
    {
        "id": "moment-inertia",
        "category": "Орбитальная механика",
        "title": "Моменты инерции шара и оболочки",
        "formulas": [
            {
                "label": "Сплошной шар",
                "tex": "I=\\frac25MR^2"
            },
            {
                "label": "Тонкая сферическая оболочка",
                "tex": "I=\\frac23MR^2"
            }
        ]
    },
    {
        "id": "rotation-energy",
        "category": "Орбитальная механика",
        "title": "Вращение твёрдого тела",
        "formulas": [
            {
                "label": "Момент импульса",
                "tex": "L=I\\omega"
            },
            {
                "label": "Кинетическая энергия",
                "tex": "E_{\\rm rot}=\\frac12I\\omega^2"
            },
            {
                "label": "Связь с периодом",
                "tex": "\\omega=\\frac{2\\pi}{T}"
            }
        ]
    },
    {
        "id": "centripetal",
        "category": "Орбитальная механика",
        "title": "Центростремительное ускорение",
        "formulas": [
            {
                "tex": "a_c=\\frac{v^2}{r}=\\omega^2r"
            }
        ]
    },
    {
        "id": "breakup-period",
        "category": "Орбитальная механика",
        "title": "Критическое вращение сферического тела",
        "formulas": [
            {
                "label": "На экваторе",
                "tex": "\\omega_{\\rm crit}=\\sqrt{\\frac{GM}{R^3}}"
            },
            {
                "label": "Период",
                "tex": "T_{\\rm crit}=2\\pi\\sqrt{\\frac{R^3}{GM}}=\\sqrt{\\frac{3\\pi}{G\\rho}}"
            }
        ]
    },
    {
        "id": "pendulum",
        "category": "Орбитальная механика",
        "title": "Математический маятник",
        "formulas": [
            {
                "tex": "T=2\\pi\\sqrt{\\frac{\\ell}{g}}"
            }
        ]
    },
    {
        "id": "rocket-tsiolkovsky",
        "category": "Орбитальная механика",
        "title": "Формула Циолковского",
        "formulas": [
            {
                "tex": "\\Delta v=u\\ln\\frac{m_0}{m_f}"
            }
        ]
    },
    {
        "id": "meshchersky",
        "category": "Орбитальная механика",
        "title": "Уравнение Мещерского",
        "formulas": [
            {
                "tex": "m\\frac{d\\vec v}{dt}=\\vec F+\\vec u_{\\rm rel}\\frac{dm}{dt}"
            }
        ]
    },
    {
        "id": "hohmann",
        "category": "Орбитальная механика",
        "title": "Гомановский переход",
        "formulas": [
            {
                "label": "Полуось переходной орбиты",
                "tex": "a_t=\\frac{r_1+r_2}{2}"
            },
            {
                "label": "Время перелёта",
                "tex": "\\Delta t=\\pi\\sqrt{\\frac{a_t^3}{GM}}"
            },
            {
                "label": "Первый импульс",
                "tex": "\\Delta v_1=\\sqrt{\\frac{GM}{r_1}}\\left(\\sqrt{\\frac{2r_2}{r_1+r_2}}-1\\right)"
            },
            {
                "label": "Второй импульс",
                "tex": "\\Delta v_2=\\sqrt{\\frac{GM}{r_2}}\\left(1-\\sqrt{\\frac{2r_1}{r_1+r_2}}\\right)"
            }
        ]
    },
    {
        "id": "plane-change",
        "category": "Орбитальная механика",
        "title": "Импульс для поворота плоскости орбиты",
        "formulas": [
            {
                "tex": "\\Delta v=2v\\sin\\frac{\\Delta i}{2}"
            }
        ],
        "note": "Для мгновенного чистого поворота вектора скорости без изменения его модуля."
    },
    {
        "id": "synodic-period",
        "category": "Орбитальная механика",
        "title": "Синодический период",
        "formulas": [
            {
                "tex": "\\frac1S=\\left|\\frac1{P_1}-\\frac1{P_2}\\right|"
            }
        ]
    },
    {
        "id": "hill-sphere",
        "category": "Орбитальная механика",
        "title": "Сфера Хилла",
        "formulas": [
            {
                "tex": "r_H\\simeq a(1-e)\\sqrt[3]{\\frac{m}{3M}}"
            }
        ],
        "note": "Для круговой орбиты e=0."
    },
    {
        "id": "roche-limit",
        "category": "Орбитальная механика",
        "title": "Предел Роша",
        "formulas": [
            {
                "label": "Через плотности",
                "tex": "d\\simeq 2.44\\,R_M\\left(\\frac{\\rho_M}{\\rho_m}\\right)^{1/3}"
            },
            {
                "label": "Грубая точечная оценка",
                "tex": "d\\simeq R_m\\left(\\frac{2M}{m}\\right)^{1/3}"
            }
        ],
        "note": "Коэффициент зависит от модели спутника; 2.44 — жидкий синхронный спутник."
    },
    {
        "id": "lagrange-l1l2",
        "category": "Орбитальная механика",
        "title": "Расстояние до L₁ и L₂ при m≪M",
        "formulas": [
            {
                "tex": "r_{L_1,L_2}\\simeq a\\sqrt[3]{\\frac{m}{3M}}"
            }
        ]
    },
    {
        "id": "tidal-acceleration",
        "category": "Орбитальная механика",
        "title": "Приливное ускорение",
        "formulas": [
            {
                "tex": "a_{\\rm tide}\\simeq \\frac{2GMR}{d^3}"
            }
        ]
    },
    {
        "id": "kepler-ellipse-anomalies",
        "category": "Орбитальная механика",
        "title": "Аномалии эллиптической орбиты",
        "formulas": [
            {
                "label": "Уравнение Кеплера",
                "tex": "M=E-e\\sin E"
            },
            {
                "label": "Средняя аномалия",
                "tex": "M=n(t-\\tau),\\qquad n=\\sqrt{\\frac{GM}{a^3}}"
            },
            {
                "label": "Истинная ↔ эксцентрическая",
                "tex": "\\tan\\frac{\\nu}{2}=\\sqrt{\\frac{1+e}{1-e}}\\tan\\frac{E}{2}"
            }
        ]
    },
    {
        "id": "kepler-hyperbola",
        "category": "Орбитальная механика",
        "title": "Аномалии гиперболической орбиты",
        "formulas": [
            {
                "label": "Уравнение Кеплера",
                "tex": "M=e\\sinh H-H"
            },
            {
                "label": "Средняя аномалия",
                "tex": "M=n(t-\\tau),\\qquad n=\\sqrt{\\frac{GM}{|a|^3}}"
            },
            {
                "label": "Истинная ↔ гиперболическая",
                "tex": "\\tan\\frac{\\nu}{2}=\\sqrt{\\frac{e+1}{e-1}}\\tanh\\frac{H}{2}"
            }
        ]
    },
    {
        "id": "barker",
        "category": "Орбитальная механика",
        "title": "Параболическая орбита: уравнение Баркера",
        "formulas": [
            {
                "label": "Баркеровская переменная",
                "tex": "D=\\tan\\frac{\\nu}{2}"
            },
            {
                "label": "Время",
                "tex": "t-\\tau=\\sqrt{\\frac{2q^3}{GM}}\\left(D+\\frac{D^3}{3}\\right)"
            }
        ]
    },
    {
        "id": "hyperbola-geometry",
        "category": "Орбитальная механика",
        "title": "Геометрия гиперболической орбиты",
        "formulas": [
            {
                "label": "Параметр",
                "tex": "p=|a|(e^2-1)"
            },
            {
                "label": "Прицельный параметр",
                "tex": "b=|a|\\sqrt{e^2-1}"
            },
            {
                "label": "Скорость на бесконечности",
                "tex": "v_\\infty=\\sqrt{\\frac{GM}{|a|}}"
            },
            {
                "label": "Момент",
                "tex": "h=bv_\\infty"
            }
        ]
    },
    {
        "id": "hyperbola-deflection",
        "category": "Орбитальная механика",
        "title": "Гравитационное рассеяние по гиперболе",
        "formulas": [
            {
                "label": "Асимптотическая аномалия",
                "tex": "\\cos\\nu_\\infty=-\\frac1e"
            },
            {
                "label": "Угол поворота скорости",
                "tex": "\\delta=2\\arcsin\\frac1e"
            }
        ]
    },
    {
        "id": "relative-speed",
        "category": "Орбитальная механика",
        "title": "Относительная скорость двух тел",
        "formulas": [
            {
                "tex": "v_{\\rm rel}=\\sqrt{v_1^2+v_2^2-2v_1v_2\\cos\\theta}"
            }
        ]
    },
    {
        "id": "conservative-mass-transfer",
        "category": "Орбитальная механика",
        "title": "Консервативный перенос массы в круговой двойной",
        "formulas": [
            {
                "label": "Орбитальный момент",
                "tex": "J=\\frac{M_1M_2}{M_1+M_2}\\sqrt{G(M_1+M_2)a}"
            },
            {
                "label": "При J и M₁+M₂ const",
                "tex": "a\\propto(M_1M_2)^{-2}"
            }
        ]
    },
    {
        "id": "hour-angle",
        "category": "Небесная сфера и время",
        "title": "Часовой угол",
        "formulas": [
            {
                "tex": "t=s-\\alpha"
            }
        ],
        "note": "В верхней кульминации t=0."
    },
    {
        "id": "sidereal-longitude",
        "category": "Небесная сфера и время",
        "title": "Звёздное время и долгота",
        "formulas": [
            {
                "tex": "s_1-s_2=\\lambda_1-\\lambda_2"
            }
        ]
    },
    {
        "id": "horizontal-altitude",
        "category": "Небесная сфера и время",
        "title": "Высота светила по φ, δ и часовому углу",
        "formulas": [
            {
                "tex": "\\sin h=\\sin\\varphi\\sin\\delta+\\cos\\varphi\\cos\\delta\\cos t"
            }
        ]
    },
    {
        "id": "horizontal-azimuth",
        "category": "Небесная сфера и время",
        "title": "Азимут светила",
        "formulas": [
            {
                "label": "Через h",
                "tex": "\\cos A=\\frac{\\sin\\delta-\\sin\\varphi\\sin h}{\\cos\\varphi\\cos h}"
            },
            {
                "label": "Дополнительно",
                "tex": "\\sin A=-\\frac{\\cos\\delta\\sin t}{\\cos h}"
            }
        ],
        "note": "Знак и отсчёт A зависят от принятого астрономического соглашения."
    },
    {
        "id": "rise-set",
        "category": "Небесная сфера и время",
        "title": "Часовой угол восхода и захода",
        "formulas": [
            {
                "tex": "\\cos t_0=-\\tan\\varphi\\tan\\delta"
            }
        ],
        "note": "Для геометрического горизонта h=0; с рефракцией подставляют эффективную высоту горизонта."
    },
    {
        "id": "culmination",
        "category": "Небесная сфера и время",
        "title": "Высота в верхней кульминации",
        "formulas": [
            {
                "tex": "h_{\\rm up}=90^\\circ-|\\varphi-\\delta|"
            }
        ]
    },
    {
        "id": "above-horizon-time",
        "category": "Небесная сфера и время",
        "title": "Время светила над горизонтом",
        "formulas": [
            {
                "tex": "\\Delta T_{\\rm above}=\\frac{2t_0}{15^\\circ/{\\rm h}}"
            }
        ]
    },
    {
        "id": "angular-distance",
        "category": "Небесная сфера и время",
        "title": "Угловое расстояние двух точек неба",
        "formulas": [
            {
                "tex": "\\cos\\theta=\\sin\\delta_1\\sin\\delta_2+\\cos\\delta_1\\cos\\delta_2\\cos(\\alpha_1-\\alpha_2)"
            }
        ]
    },
    {
        "id": "spherical-trig",
        "category": "Небесная сфера и время",
        "title": "Сферическая теорема косинусов и синусов",
        "formulas": [
            {
                "label": "Для сторон",
                "tex": "\\cos a=\\cos b\\cos c+\\sin b\\sin c\\cos A"
            },
            {
                "label": "Для углов",
                "tex": "\\cos A=-\\cos B\\cos C+\\sin B\\sin C\\cos a"
            },
            {
                "label": "Синусы",
                "tex": "\\frac{\\sin a}{\\sin A}=\\frac{\\sin b}{\\sin B}=\\frac{\\sin c}{\\sin C}"
            }
        ]
    },
    {
        "id": "sphere-cartesian",
        "category": "Небесная сфера и время",
        "title": "Координаты точки на сфере",
        "formulas": [
            {
                "tex": "\\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix}=R\\begin{pmatrix}\\cos\\varphi\\cos\\lambda\\\\\\cos\\varphi\\sin\\lambda\\\\\\sin\\varphi\\end{pmatrix}"
            }
        ]
    },
    {
        "id": "great-circle",
        "category": "Небесная сфера и время",
        "title": "Большой круг по координатам его полюса",
        "formulas": [
            {
                "tex": "\\cos(\\lambda-\\lambda_0)+\\tan\\varphi\\tan\\varphi_0=0"
            }
        ]
    },
    {
        "id": "arc-length",
        "category": "Небесная сфера и время",
        "title": "Длина дуги большого круга",
        "formulas": [
            {
                "tex": "\\ell=R\\theta=2\\pi R\\,\\frac{\\theta}{360^\\circ}"
            }
        ]
    },
    {
        "id": "ecliptic-equatorial",
        "category": "Небесная сфера и время",
        "title": "Эклиптические → экваториальные координаты",
        "formulas": [
            {
                "label": "Склонение",
                "tex": "\\sin\\delta=\\sin\\beta\\cos\\varepsilon+\\cos\\beta\\sin\\varepsilon\\sin\\lambda"
            },
            {
                "label": "Прямое восхождение",
                "tex": "\\tan\\alpha=\\frac{\\sin\\lambda\\cos\\varepsilon-\\tan\\beta\\sin\\varepsilon}{\\cos\\lambda}"
            }
        ],
        "note": "Для правильной четверти α лучше использовать atan2."
    },
    {
        "id": "equatorial-ecliptic",
        "category": "Небесная сфера и время",
        "title": "Экваториальные → эклиптические координаты",
        "formulas": [
            {
                "label": "Широта",
                "tex": "\\sin\\beta=\\sin\\delta\\cos\\varepsilon-\\cos\\delta\\sin\\varepsilon\\sin\\alpha"
            },
            {
                "label": "Долгота",
                "tex": "\\tan\\lambda=\\frac{\\sin\\alpha\\cos\\varepsilon+\\tan\\delta\\sin\\varepsilon}{\\cos\\alpha}"
            }
        ],
        "note": "Для правильной четверти λ лучше использовать atan2."
    },
    {
        "id": "sun-coordinates",
        "category": "Небесная сфера и время",
        "title": "Координаты Солнца по эклиптической долготе",
        "formulas": [
            {
                "label": "Склонение",
                "tex": "\\sin\\delta_\\odot=\\sin\\varepsilon\\sin\\lambda_\\odot"
            },
            {
                "label": "Прямое восхождение",
                "tex": "\\tan\\alpha_\\odot=\\cos\\varepsilon\\tan\\lambda_\\odot"
            }
        ]
    },
    {
        "id": "horizontal-parallax",
        "category": "Небесная сфера и время",
        "title": "Горизонтальный параллакс",
        "formulas": [
            {
                "label": "Точно",
                "tex": "\\sin p=\\frac{R}{\\Delta}"
            },
            {
                "label": "Малый угол",
                "tex": "p\\simeq\\frac{R}{\\Delta}"
            }
        ]
    },
    {
        "id": "annual-parallax",
        "category": "Небесная сфера и время",
        "title": "Годичный параллакс",
        "formulas": [
            {
                "tex": "p('')=\\frac{1}{d({\\rm pc})}"
            }
        ]
    },
    {
        "id": "proper-motion",
        "category": "Небесная сфера и время",
        "title": "Тангенциальная скорость по собственному движению",
        "formulas": [
            {
                "tex": "v_t=4.74047\\,\\mu(''/{\\rm yr})\\,d({\\rm pc})=4.74047\\,\\frac{\\mu}{p}\\ {\\rm km\\,s^{-1}}"
            }
        ]
    },
    {
        "id": "annual-aberration",
        "category": "Небесная сфера и время",
        "title": "Годичная аберрация",
        "formulas": [
            {
                "tex": "\\Delta\\theta\\simeq\\frac{v_\\oplus}{c}\\sin\\Theta"
            }
        ],
        "note": "Максимум для Земли ≈20.5″."
    },
    {
        "id": "refraction",
        "category": "Небесная сфера и время",
        "title": "Атмосферная рефракция",
        "formulas": [
            {
                "label": "Грубая оценка при нормальных условиях",
                "tex": "R\\simeq 60''\\tan z"
            },
            {
                "label": "Зависимость от состояния атмосферы",
                "tex": "R\\propto\\frac{P}{T}\\tan z"
            }
        ],
        "note": "Работает вдали от самого горизонта; T — абсолютная температура."
    },
    {
        "id": "sidereal-solar-day",
        "category": "Небесная сфера и время",
        "title": "Звёздные и солнечные сутки",
        "formulas": [
            {
                "label": "Прямое вращение",
                "tex": "\\frac1{P_{\\rm sol}}=\\frac1{P_{\\rm sid}}-\\frac1{P_{\\rm orb}}"
            },
            {
                "label": "Обратное вращение",
                "tex": "\\frac1{P_{\\rm sol}}=\\frac1{P_{\\rm sid}}+\\frac1{P_{\\rm orb}}"
            }
        ]
    },
    {
        "id": "equation-of-time",
        "category": "Небесная сфера и время",
        "title": "Уравнение времени: приближение",
        "formulas": [
            {
                "tex": "E\\simeq 7.53^{\\rm m}\\cos\\alpha_\\odot+1.50^{\\rm m}\\sin\\alpha_\\odot-9.87^{\\rm m}\\sin2\\alpha_\\odot"
            }
        ],
        "note": "Приближённая формула из конспекта; знак E зависит от соглашения «истинное − среднее» или наоборот."
    },
    {
        "id": "sun-annual-approx",
        "category": "Небесная сфера и время",
        "title": "Грубая оценка координат Солнца по дате",
        "formulas": [
            {
                "label": "Эклиптическая долгота",
                "tex": "\\lambda_\\odot\\simeq 360^\\circ\\frac{N-N_{\\rm eq}}{365.2422}"
            },
            {
                "label": "Дальше",
                "tex": "\\sin\\delta_\\odot=\\sin\\varepsilon\\sin\\lambda_\\odot,\\qquad \\tan\\alpha_\\odot=\\cos\\varepsilon\\tan\\lambda_\\odot"
            }
        ]
    },
    {
        "id": "satellite-slant-range",
        "category": "Небесная сфера и время",
        "title": "Спутник: дальность и видимая высота",
        "formulas": [
            {
                "label": "Дальность",
                "tex": "d=\\sqrt{r^2+R^2-2rR\\cos\\psi}"
            },
            {
                "label": "Высота",
                "tex": "\\sin h=\\frac{r\\cos\\psi-R}{d}"
            }
        ],
        "note": "r=R+H — расстояние спутника от центра планеты; ψ — центральный угол между наблюдателем и подспутниковой точкой."
    },
    {
        "id": "satellite-visible-cap",
        "category": "Небесная сфера и время",
        "title": "Сколько поверхности видно со спутника",
        "formulas": [
            {
                "label": "Угол до горизонта",
                "tex": "\\cos\\psi=\\frac{R}{R+H}"
            },
            {
                "label": "Площадь шапки",
                "tex": "S=2\\pi R^2(1-\\cos\\psi)"
            },
            {
                "label": "Доля всей поверхности",
                "tex": "\\frac{S}{4\\pi R^2}=\\frac{1-\\cos\\psi}{2}"
            }
        ]
    },
    {
        "id": "solid-angle",
        "category": "Небесная сфера и время",
        "title": "Телесный угол диска/шара",
        "formulas": [
            {
                "label": "Угловой радиус",
                "tex": "\\sin\\alpha=\\frac{R}{d}"
            },
            {
                "label": "Телесный угол",
                "tex": "\\Omega=2\\pi(1-\\cos\\alpha)\\simeq\\pi\\alpha^2"
            }
        ]
    },
    {
        "id": "small-angle",
        "category": "Небесная сфера и время",
        "title": "Формула малого угла",
        "formulas": [
            {
                "tex": "\\theta\\simeq\\frac{\\ell}{d},\\qquad \\ell\\simeq d\\theta"
            }
        ],
        "note": "θ в радианах."
    },
    {
        "id": "horizon-dip",
        "category": "Небесная сфера и время",
        "title": "Дальность и понижение горизонта",
        "formulas": [
            {
                "label": "Геометрия",
                "tex": "d\\simeq\\sqrt{2Rh}"
            },
            {
                "label": "Угол понижения",
                "tex": "\\theta\\simeq\\sqrt{\\frac{2h}{R}}"
            }
        ],
        "note": "Для h≪R."
    },
    {
        "id": "meteor-angular-speed",
        "category": "Небесная сфера и время",
        "title": "Угловая скорость объекта",
        "formulas": [
            {
                "tex": "\\omega=\\frac{v_\\perp}{d}"
            }
        ]
    },
    {
        "id": "star-drift",
        "category": "Небесная сфера и время",
        "title": "Дрейф звезды через поле зрения",
        "formulas": [
            {
                "label": "Скорость по параллели",
                "tex": "\\omega_{\\rm sky}=15^\\circ/{\\rm h}\\cdot\\cos\\delta"
            },
            {
                "label": "Поле по времени прохождения",
                "tex": "\\Theta\\simeq\\omega_{\\rm sky}\\Delta t"
            }
        ]
    },
    {
        "id": "obliquity-declination",
        "category": "Небесная сфера и время",
        "title": "Сезонное склонение звезды для наблюдателя на планете",
        "formulas": [
            {
                "tex": "\\sin\\delta_\\star=\\sin\\varepsilon\\,\\sin L"
            }
        ],
        "note": "Для звезды, лежащей в плоскости орбиты, при нулевой эклиптической широте; L — сезонная орбитальная фаза."
    },
    {
        "id": "inverse-square-flux",
        "category": "Фотометрия и звёзды",
        "title": "Светимость и поток",
        "formulas": [
            {
                "tex": "F=\\frac{L}{4\\pi d^2}"
            }
        ]
    },
    {
        "id": "pogson",
        "category": "Фотометрия и звёзды",
        "title": "Формула Погсона",
        "formulas": [
            {
                "label": "Разность величин",
                "tex": "m_1-m_2=-2.5\\log_{10}\\frac{F_1}{F_2}"
            },
            {
                "label": "Отношение потоков",
                "tex": "\\frac{F_1}{F_2}=10^{-0.4(m_1-m_2)}"
            }
        ]
    },
    {
        "id": "combined-magnitude",
        "category": "Фотометрия и звёзды",
        "title": "Суммарная звёздная величина",
        "formulas": [
            {
                "tex": "m_{\\rm tot}=-2.5\\log_{10}\\left(\\sum_i10^{-0.4m_i}\\right)"
            }
        ]
    },
    {
        "id": "distance-modulus",
        "category": "Фотометрия и звёзды",
        "title": "Модуль расстояния",
        "formulas": [
            {
                "label": "Без поглощения",
                "tex": "m-M=5\\log_{10}\\frac{d}{10\\,{\\rm pc}}"
            },
            {
                "label": "С поглощением",
                "tex": "m-M=5\\log_{10}\\frac{d}{10\\,{\\rm pc}}+A"
            }
        ]
    },
    {
        "id": "luminosity-magnitude",
        "category": "Фотометрия и звёзды",
        "title": "Абсолютная величина и светимость",
        "formulas": [
            {
                "tex": "M_1-M_2=-2.5\\log_{10}\\frac{L_1}{L_2}"
            },
            {
                "label": "Относительно Солнца",
                "tex": "\\frac{L}{L_\\odot}=10^{0.4(M_{{\\rm bol},\\odot}-M_{\\rm bol})}"
            }
        ]
    },
    {
        "id": "bolometric-correction",
        "category": "Фотометрия и звёзды",
        "title": "Болометрическая поправка",
        "formulas": [
            {
                "tex": "BC=M_{\\rm bol}-M_V"
            }
        ]
    },
    {
        "id": "color-excess",
        "category": "Фотометрия и звёзды",
        "title": "Цветовой избыток и поглощение",
        "formulas": [
            {
                "label": "Цветовой избыток",
                "tex": "E(B-V)=(B-V)-(B-V)_0=A_B-A_V"
            },
            {
                "label": "Стандартно в Млечном Пути",
                "tex": "A_V=R_VE(B-V),\\qquad R_V\\simeq3.1"
            }
        ]
    },
    {
        "id": "extinction-airmass",
        "category": "Фотометрия и звёзды",
        "title": "Атмосферное поглощение и воздушная масса",
        "formulas": [
            {
                "label": "Приближённо",
                "tex": "X\\simeq\\sec z=\\frac1{\\sin h}"
            },
            {
                "label": "В звёздных величинах",
                "tex": "m(X)=m_0+kX"
            },
            {
                "label": "Через оптическую толщину",
                "tex": "I=I_0e^{-\\tau X},\\qquad A=1.086\\,\\tau X"
            }
        ]
    },
    {
        "id": "surface-brightness",
        "category": "Фотометрия и звёзды",
        "title": "Поверхностная яркость и интегральная величина",
        "formulas": [
            {
                "tex": "m=\\mu-2.5\\log_{10}A_{\\rm arcsec^2}"
            }
        ],
        "note": "Для равномерной поверхностной яркости μ в mag/arcsec²."
    },
    {
        "id": "stefan-boltzmann",
        "category": "Фотометрия и звёзды",
        "title": "Закон Стефана–Больцмана",
        "formulas": [
            {
                "label": "Поток с поверхности",
                "tex": "F=\\sigma T^4"
            },
            {
                "label": "Светимость звезды",
                "tex": "L=4\\pi R^2\\sigma T_{\\rm eff}^4"
            },
            {
                "label": "Относительно Солнца",
                "tex": "\\frac{L}{L_\\odot}=\\left(\\frac{R}{R_\\odot}\\right)^2\\left(\\frac{T}{T_\\odot}\\right)^4"
            }
        ]
    },
    {
        "id": "wien",
        "category": "Фотометрия и звёзды",
        "title": "Закон смещения Вина",
        "formulas": [
            {
                "tex": "\\lambda_{\\max}T=b,\\qquad b\\simeq2.898\\times10^{-3}\\ {\\rm m\\,K}"
            }
        ]
    },
    {
        "id": "mass-luminosity",
        "category": "Фотометрия и звёзды",
        "title": "Масса–светимость на главной последовательности",
        "formulas": [
            {
                "label": "M<0.43M☉",
                "tex": "\\frac{L}{L_\\odot}\\simeq0.23\\left(\\frac{M}{M_\\odot}\\right)^{2.3}"
            },
            {
                "label": "0.43–2 M☉",
                "tex": "\\frac{L}{L_\\odot}\\simeq\\left(\\frac{M}{M_\\odot}\\right)^4"
            },
            {
                "label": "2–55 M☉",
                "tex": "\\frac{L}{L_\\odot}\\simeq1.4\\left(\\frac{M}{M_\\odot}\\right)^{3.5}"
            },
            {
                "label": "M>55M☉",
                "tex": "\\frac{L}{L_\\odot}\\simeq3.2\\times10^4\\left(\\frac{M}{M_\\odot}\\right)"
            }
        ],
        "note": "Приближённая кусочная зависимость; коэффициенты зависят от выбранной калибровки."
    },
    {
        "id": "main-sequence-lifetime",
        "category": "Фотометрия и звёзды",
        "title": "Время жизни на главной последовательности",
        "formulas": [
            {
                "label": "Оценка",
                "tex": "t_{\\rm MS}\\sim10^{10}{\\rm yr}\\,\\frac{M/M_\\odot}{L/L_\\odot}"
            },
            {
                "label": "Если L∝Mᵅ",
                "tex": "t_{\\rm MS}\\propto M^{1-\\alpha}"
            }
        ]
    },
    {
        "id": "kelvin-helmholtz",
        "category": "Фотометрия и звёзды",
        "title": "Время Кельвина–Гельмгольца",
        "formulas": [
            {
                "tex": "t_{\\rm KH}\\sim\\frac{GM^2}{RL}"
            }
        ],
        "note": "Точный коэффициент порядка единицы зависит от модели внутренней структуры."
    },
    {
        "id": "eddington",
        "category": "Фотометрия и звёзды",
        "title": "Предел Эддингтона",
        "formulas": [
            {
                "tex": "L_{\\rm Edd}=\\frac{4\\pi GMm_pc}{\\sigma_T}"
            }
        ],
        "note": "Для полностью ионизованного водорода и томсоновского рассеяния."
    },
    {
        "id": "thomson",
        "category": "Фотометрия и звёзды",
        "title": "Сечение Томсона",
        "formulas": [
            {
                "label": "Через классический радиус электрона",
                "tex": "\\sigma_T=\\frac{8\\pi}{3}r_e^2"
            },
            {
                "label": "Классический радиус",
                "tex": "r_e=\\frac{e^2}{4\\pi\\varepsilon_0m_ec^2}"
            }
        ]
    },
    {
        "id": "asteroid-H",
        "category": "Фотометрия и звёзды",
        "title": "Диаметр астероида, альбедо и абсолютная величина",
        "formulas": [
            {
                "tex": "D({\\rm km})=\\frac{1329}{\\sqrt{p_V}}\\,10^{-H/5}"
            }
        ],
        "note": "Стандартная фотометрическая оценка для геометрического альбедо p_V."
    },
    {
        "id": "metallicity",
        "category": "Фотометрия и звёзды",
        "title": "Металличность",
        "formulas": [
            {
                "tex": "[{\\rm X/Y}]=\\log_{10}\\left(\\frac{N_X/N_Y}{(N_X/N_Y)_\\odot}\\right)"
            },
            {
                "label": "Сложение индексов",
                "tex": "[{\\rm Mg/H}]=[{\\rm Mg/Fe}]+[{\\rm Fe/H}]"
            }
        ]
    },
    {
        "id": "tully-fisher",
        "category": "Фотометрия и звёзды",
        "title": "Соотношение Талли–Фишера",
        "formulas": [
            {
                "tex": "L\\propto v_{\\rm rot}^{\\,\\alpha}"
            }
        ],
        "note": "Показатель α зависит от фотометрической полосы и калибровки."
    },
    {
        "id": "cepheid-pl",
        "category": "Фотометрия и звёзды",
        "title": "Цефеиды: период–светимость",
        "formulas": [
            {
                "tex": "M=a\\log_{10}P+b"
            }
        ],
        "note": "Коэффициенты a и b зависят от полосы и конкретной калибровки; в задачах их могут задавать."
    },
    {
        "id": "phillips",
        "category": "Фотометрия и звёзды",
        "title": "Сверхновые Ia: соотношение Филлипса",
        "formulas": [
            {
                "tex": "M_{\\max}(B)=M_0+\\alpha\\,[\\Delta m_{15}(B)-1.1]"
            }
        ],
        "note": "Эмпирическая форма; численные коэффициенты зависят от калибровки."
    },
    {
        "id": "transit-depth",
        "category": "Фотометрия и звёзды",
        "title": "Глубина транзита экзопланеты",
        "formulas": [
            {
                "label": "По потоку",
                "tex": "\\delta=\\frac{\\Delta F}{F}\\simeq\\left(\\frac{R_p}{R_\\star}\\right)^2"
            },
            {
                "label": "В звёздных величинах",
                "tex": "\\Delta m=-2.5\\log_{10}(1-\\delta)"
            }
        ],
        "note": "Для центрального транзита и равномерного диска звезды."
    },
    {
        "id": "transit-duration",
        "category": "Фотометрия и звёзды",
        "title": "Длительность центрального транзита",
        "formulas": [
            {
                "label": "Грубая оценка",
                "tex": "t_{\\rm tr}\\simeq\\frac{P}{\\pi}\\arcsin\\frac{R_\\star+R_p}{a}"
            },
            {
                "label": "Малый угол",
                "tex": "t_{\\rm tr}\\simeq\\frac{P}{\\pi}\\frac{R_\\star+R_p}{a}"
            }
        ],
        "note": "Для круговой орбиты, i≈90° и центрального транзита."
    },
    {
        "id": "planet-equilibrium-temp",
        "category": "Фотометрия и звёзды",
        "title": "Равновесная температура планеты",
        "formulas": [
            {
                "tex": "T_{\\rm eq}=T_\\star\\left(\\frac{R_\\star}{2a}\\right)^{1/2}(1-A)^{1/4}"
            }
        ],
        "note": "Для полного перераспределения тепла и единичной излучательной способности."
    },
    {
        "id": "rv-semiamplitude",
        "category": "Фотометрия и звёзды",
        "title": "Лучевая скорость звезды из-за планеты",
        "formulas": [
            {
                "tex": "K=\\left(\\frac{2\\pi G}{P}\\right)^{1/3}\\frac{m_p\\sin i}{(M_\\star+m_p)^{2/3}}\\frac1{\\sqrt{1-e^2}}"
            }
        ]
    },
    {
        "id": "binary-mass-function",
        "category": "Фотометрия и звёзды",
        "title": "Функция масс спектрально-двойной",
        "formulas": [
            {
                "tex": "f(M)=\\frac{PK_1^3}{2\\pi G}(1-e^2)^{3/2}=\\frac{M_2^3\\sin^3i}{(M_1+M_2)^2}"
            }
        ]
    },
    {
        "id": "binary-rv-ratio",
        "category": "Фотометрия и звёзды",
        "title": "Двойная: отношения скоростей и масс",
        "formulas": [
            {
                "tex": "M_1K_1=M_2K_2,\\qquad \\frac{M_1}{M_2}=\\frac{K_2}{K_1}"
            }
        ]
    },
    {
        "id": "binary-relative-orbit",
        "category": "Фотометрия и звёзды",
        "title": "Двойная: масса по относительной орбите",
        "formulas": [
            {
                "tex": "M_1+M_2=\\frac{4\\pi^2a^3}{GP^2}"
            }
        ]
    },
    {
        "id": "stellar-jeans",
        "category": "Фотометрия и звёзды",
        "title": "Масса Джинса",
        "formulas": [
            {
                "label": "Масштаб",
                "tex": "M_J\\propto T^{3/2}\\rho^{-1/2}"
            },
            {
                "label": "Одна из стандартных форм",
                "tex": "M_J=\\frac{\\pi^{5/2}}{6}\\frac{c_s^3}{G^{3/2}\\rho^{1/2}}"
            }
        ]
    },
    {
        "id": "hydrostatic",
        "category": "Фотометрия и звёзды",
        "title": "Гидростатическое равновесие звезды",
        "formulas": [
            {
                "label": "По радиусу",
                "tex": "\\frac{dP}{dr}=-\\frac{GM(r)\\rho}{r^2}"
            },
            {
                "label": "По массе",
                "tex": "\\frac{dP}{dm}=-\\frac{Gm}{4\\pi r^4}"
            }
        ]
    },
    {
        "id": "stellar-continuity",
        "category": "Фотометрия и звёзды",
        "title": "Уравнение массы в звезде",
        "formulas": [
            {
                "tex": "\\frac{dM}{dr}=4\\pi r^2\\rho"
            }
        ]
    },
    {
        "id": "stellar-energy",
        "category": "Фотометрия и звёзды",
        "title": "Уравнение светимости в звезде",
        "formulas": [
            {
                "tex": "\\frac{dL}{dr}=4\\pi r^2\\rho\\,\\varepsilon"
            }
        ]
    },
    {
        "id": "radiative-gradient",
        "category": "Фотометрия и звёзды",
        "title": "Лучистый перенос энергии в звезде",
        "formulas": [
            {
                "tex": "\\frac{dT}{dr}=-\\frac{3\\kappa\\rho L}{16\\pi ac\\,T^3r^2}"
            }
        ],
        "note": "a=4σ/c — радиационная постоянная."
    },
    {
        "id": "opacity-mfp",
        "category": "Фотометрия и звёзды",
        "title": "Непрозрачность и длина свободного пробега фотона",
        "formulas": [
            {
                "tex": "\\ell=\\frac1{\\kappa\\rho},\\qquad \\kappa=\\frac1{\\rho\\ell}"
            }
        ]
    },
    {
        "id": "wolf-number",
        "category": "Фотометрия и звёзды",
        "title": "Число Вольфа",
        "formulas": [
            {
                "tex": "R=k(10g+s)"
            }
        ],
        "note": "g — число групп пятен, s — число отдельных пятен, k — коэффициент наблюдателя."
    },
    {
        "id": "mean-molecular-weight",
        "category": "Фотометрия и звёзды",
        "title": "Средний молекулярный вес полностью ионизованного газа",
        "formulas": [
            {
                "label": "Общий вид",
                "tex": "\\frac1\\mu=\\sum_i\\frac{X_i(1+Z_i)}{A_i}"
            },
            {
                "label": "H/He/Z смесь",
                "tex": "\\frac1\\mu\\simeq2X+\\frac34Y+\\frac12Z"
            }
        ]
    },
    {
        "id": "degenerate-pressure",
        "category": "Фотометрия и звёзды",
        "title": "Давление вырожденного электронного газа",
        "formulas": [
            {
                "label": "Нерелятивистский",
                "tex": "P\\propto\\rho^{5/3}"
            },
            {
                "label": "Ультрарелятивистский",
                "tex": "P\\propto\\rho^{4/3}"
            }
        ]
    },
    {
        "id": "chandrasekhar",
        "category": "Фотометрия и звёзды",
        "title": "Предел Чандрасекара",
        "formulas": [
            {
                "tex": "M_{\\rm Ch}\\simeq\\frac{5.83}{\\mu_e^2}M_\\odot\\simeq1.44M_\\odot\\quad(\\mu_e\\simeq2)"
            }
        ]
    },
    {
        "id": "stellar-radius-hr",
        "category": "Фотометрия и звёзды",
        "title": "Линии постоянного радиуса на H–R диаграмме",
        "formulas": [
            {
                "tex": "L=4\\pi\\sigma R^2T_{\\rm eff}^4\\quad\\Longrightarrow\\quad \\log L=2\\log R+4\\log T_{\\rm eff}+{\\rm const}"
            }
        ]
    },
    {
        "id": "thin-lens",
        "category": "Оптика и наблюдения",
        "title": "Формула тонкой линзы",
        "formulas": [
            {
                "tex": "\\frac1f=\\frac1a+\\frac1b"
            },
            {
                "label": "Линейное увеличение",
                "tex": "\\Gamma=-\\frac{b}{a}"
            }
        ]
    },
    {
        "id": "lensmaker",
        "category": "Оптика и наблюдения",
        "title": "Формула изготовителя линзы",
        "formulas": [
            {
                "tex": "\\frac1f=(n-1)\\left(\\frac1{R_1}-\\frac1{R_2}\\right)"
            }
        ],
        "note": "Для тонкой линзы в воздухе."
    },
    {
        "id": "lenses-contact",
        "category": "Оптика и наблюдения",
        "title": "Тонкие линзы в контакте",
        "formulas": [
            {
                "tex": "\\frac1F=\\sum_i\\frac1{f_i}"
            }
        ]
    },
    {
        "id": "optical-power",
        "category": "Оптика и наблюдения",
        "title": "Оптическая сила",
        "formulas": [
            {
                "tex": "D_{\\rm opt}=\\frac1{f({\\rm m})}"
            }
        ],
        "note": "Единица — диоптрия."
    },
    {
        "id": "telescope-magnification",
        "category": "Оптика и наблюдения",
        "title": "Угловое увеличение телескопа",
        "formulas": [
            {
                "tex": "\\Gamma=\\left|\\frac{F_{\\rm obj}}{f_{\\rm eye}}\\right|"
            }
        ]
    },
    {
        "id": "telescope-fov",
        "category": "Оптика и наблюдения",
        "title": "Истинное поле зрения телескопа",
        "formulas": [
            {
                "tex": "\\Theta_{\\rm true}\\simeq\\frac{\\Theta_{\\rm apparent}}{\\Gamma}"
            }
        ]
    },
    {
        "id": "plate-scale",
        "category": "Оптика и наблюдения",
        "title": "Пиксельный масштаб",
        "formulas": [
            {
                "label": "В радианах",
                "tex": "\\theta_{\\rm pix}\\simeq\\frac{p}{F}"
            },
            {
                "label": "В угловых секундах",
                "tex": "\\theta_{\\rm pix}('')=206265\\,\\frac{p}{F}"
            }
        ],
        "note": "p и F в одинаковых единицах."
    },
    {
        "id": "detector-fov",
        "category": "Оптика и наблюдения",
        "title": "Поле зрения матрицы",
        "formulas": [
            {
                "label": "Точно",
                "tex": "\\Theta=2\\arctan\\frac{d}{2F}"
            },
            {
                "label": "Малый угол",
                "tex": "\\Theta\\simeq\\frac{d}{F}"
            }
        ]
    },
    {
        "id": "focal-image-scale",
        "category": "Оптика и наблюдения",
        "title": "Размер изображения в фокальной плоскости",
        "formulas": [
            {
                "tex": "\\ell=F\\tan\\theta\\simeq F\\theta"
            }
        ]
    },
    {
        "id": "rayleigh",
        "category": "Оптика и наблюдения",
        "title": "Критерий Рэлея",
        "formulas": [
            {
                "tex": "\\theta_{\\rm min}=1.22\\frac{\\lambda}{D}"
            }
        ]
    },
    {
        "id": "airy-disk",
        "category": "Оптика и наблюдения",
        "title": "Диск Эйри в фокальной плоскости",
        "formulas": [
            {
                "label": "Радиус до первого минимума",
                "tex": "r_{\\rm Airy}=1.22\\,\\lambda\\frac{F}{D}"
            },
            {
                "label": "Диаметр",
                "tex": "d_{\\rm Airy}=2.44\\,\\lambda\\frac{F}{D}"
            }
        ]
    },
    {
        "id": "grating",
        "category": "Оптика и наблюдения",
        "title": "Дифракционная решётка",
        "formulas": [
            {
                "tex": "d\\sin\\theta_m=m\\lambda"
            }
        ]
    },
    {
        "id": "grating-resolution",
        "category": "Оптика и наблюдения",
        "title": "Разрешающая сила дифракционной решётки",
        "formulas": [
            {
                "tex": "\\mathcal R=\\frac{\\lambda}{\\Delta\\lambda}=mN"
            }
        ]
    },
    {
        "id": "grating-central-width",
        "category": "Оптика и наблюдения",
        "title": "Ширина центрального максимума решётки",
        "formulas": [
            {
                "tex": "\\Delta\\theta_{\\rm full}\\simeq\\frac{2\\lambda}{Nd\\cos\\theta}\\simeq\\frac{2\\lambda}{L\\cos\\theta}"
            }
        ],
        "note": "Полная угловая ширина между соседними первыми минимумами."
    },
    {
        "id": "spectral-resolution",
        "category": "Оптика и наблюдения",
        "title": "Спектральное разрешение и скорость",
        "formulas": [
            {
                "tex": "\\mathcal R=\\frac{\\lambda}{\\Delta\\lambda}\\simeq\\frac{c}{\\Delta v}"
            }
        ]
    },
    {
        "id": "interferometer-resolution",
        "category": "Оптика и наблюдения",
        "title": "Интерферометр: угловой масштаб",
        "formulas": [
            {
                "label": "Шаг полос",
                "tex": "\\Delta\\theta\\simeq\\frac{\\lambda}{B}"
            },
            {
                "label": "Полусдвиг полосы",
                "tex": "\\delta\\theta\\simeq\\frac{\\lambda}{2B}"
            }
        ]
    },
    {
        "id": "snell",
        "category": "Оптика и наблюдения",
        "title": "Закон Снеллиуса",
        "formulas": [
            {
                "tex": "n_1\\sin\\theta_1=n_2\\sin\\theta_2"
            }
        ]
    },
    {
        "id": "achromatic-doublet",
        "category": "Оптика и наблюдения",
        "title": "Ахроматическая склейка двух тонких линз",
        "formulas": [
            {
                "label": "Суммарная сила",
                "tex": "\\Phi=\\Phi_1+\\Phi_2"
            },
            {
                "label": "Условие ахроматизации",
                "tex": "\\frac{\\Phi_1}{V_1}+\\frac{\\Phi_2}{V_2}=0"
            }
        ],
        "note": "V — число Аббе; если в задаче даны n для двух цветов, условие эквивалентно равенству суммарной оптической силы для этих цветов."
    },
    {
        "id": "equivalent-width",
        "category": "Оптика и наблюдения",
        "title": "Эквивалентная ширина спектральной линии",
        "formulas": [
            {
                "label": "По длине волны",
                "tex": "W_\\lambda=\\int\\left(1-\\frac{F_\\lambda^L}{F_\\lambda^C}\\right)d\\lambda"
            },
            {
                "label": "По частоте",
                "tex": "W_\\nu=\\int\\left(1-\\frac{F_\\nu^L}{F_\\nu^C}\\right)d\\nu"
            },
            {
                "label": "Связь",
                "tex": "W_\\nu=\\frac{\\nu_0^2}{c}\\,W_\\lambda=\\frac{c}{\\lambda_0^2}\\,W_\\lambda"
            }
        ]
    },
    {
        "id": "radiometer",
        "category": "Оптика и наблюдения",
        "title": "Радиометрическое уравнение",
        "formulas": [
            {
                "tex": "\\Delta T=\\frac{T_{\\rm sys}}{\\sqrt{\\Delta\\nu\\,t}}"
            }
        ],
        "note": "Базовая форма для теплового шума радиоприёмника."
    },
    {
        "id": "antenna-flux-power",
        "category": "Оптика и наблюдения",
        "title": "Поток и мощность радиотелескопа",
        "formulas": [
            {
                "tex": "P=S_\\nu A_{\\rm eff}\\Delta\\nu"
            }
        ]
    },
    {
        "id": "ideal-gas",
        "category": "Газ, излучение и плазма",
        "title": "Уравнение идеального газа",
        "formulas": [
            {
                "tex": "pV=\\nu RT=NkT"
            }
        ]
    },
    {
        "id": "gas-density",
        "category": "Газ, излучение и плазма",
        "title": "Плотность идеального газа",
        "formulas": [
            {
                "tex": "\\rho=\\frac{p\\mu}{RT}=\\frac{pm}{kT}"
            }
        ]
    },
    {
        "id": "monoatomic-energy",
        "category": "Газ, излучение и плазма",
        "title": "Внутренняя энергия одноатомного идеального газа",
        "formulas": [
            {
                "tex": "U=\\frac32NkT=\\frac32\\nu RT"
            }
        ]
    },
    {
        "id": "rms-speed",
        "category": "Газ, излучение и плазма",
        "title": "Среднеквадратичная скорость молекул",
        "formulas": [
            {
                "tex": "v_{\\rm rms}=\\sqrt{\\frac{3kT}{m}}=\\sqrt{\\frac{3RT}{\\mu}}"
            }
        ]
    },
    {
        "id": "sound-speed",
        "category": "Газ, излучение и плазма",
        "title": "Скорость звука",
        "formulas": [
            {
                "tex": "c_s=\\sqrt{\\frac{\\gamma kT}{\\mu m_u}}=\\sqrt{\\frac{\\gamma RT}{\\mu_{\\rm mol}}}"
            }
        ]
    },
    {
        "id": "barometric",
        "category": "Газ, излучение и плазма",
        "title": "Барометрическая формула и высота шкалы",
        "formulas": [
            {
                "label": "Давление",
                "tex": "p(h)=p_0e^{-h/H}"
            },
            {
                "label": "Высота шкалы",
                "tex": "H=\\frac{kT}{mg}=\\frac{RT}{\\mu g}"
            }
        ]
    },
    {
        "id": "mean-free-path",
        "category": "Газ, излучение и плазма",
        "title": "Средняя длина свободного пробега",
        "formulas": [
            {
                "tex": "\\ell=\\frac1{\\sqrt2\\,n\\sigma}"
            }
        ]
    },
    {
        "id": "maxwell-1d",
        "category": "Газ, излучение и плазма",
        "title": "Одномерное распределение Максвелла",
        "formulas": [
            {
                "tex": "f(v_x)=\\sqrt{\\frac{m}{2\\pi kT}}\\exp\\left(-\\frac{mv_x^2}{2kT}\\right)"
            }
        ]
    },
    {
        "id": "maxwell-speed",
        "category": "Газ, излучение и плазма",
        "title": "Распределение Максвелла по модулю скорости",
        "formulas": [
            {
                "label": "Распределение по модулю скорости",
                "tex": "f(v)=4\\pi\\left(\\frac{m}{2\\pi kT}\\right)^{3/2}v^2e^{-mv^2/(2kT)}"
            },
            {
                "label": "Наиболее вероятная скорость",
                "tex": "v_{\\rm mp}=\\sqrt{\\frac{2kT}{m}}"
            },
            {
                "label": "Средняя скорость",
                "tex": "\\langle v\\rangle=\\sqrt{\\frac{8kT}{\\pi m}}"
            },
            {
                "label": "Среднеквадратичная скорость",
                "tex": "v_{\\rm rms}=\\sqrt{\\frac{3kT}{m}}"
            }
        ]
    },
    {
        "id": "boltzmann",
        "category": "Газ, излучение и плазма",
        "title": "Распределение Больцмана по уровням",
        "formulas": [
            {
                "tex": "\\frac{n_i}{n_j}=\\frac{g_i}{g_j}\\exp\\left(-\\frac{E_i-E_j}{kT}\\right)"
            }
        ]
    },
    {
        "id": "adiabat",
        "category": "Газ, излучение и плазма",
        "title": "Адиабата идеального газа",
        "formulas": [
            {
                "label": "Пуассон",
                "tex": "pV^\\gamma={\\rm const}"
            },
            {
                "label": "T–V",
                "tex": "TV^{\\gamma-1}={\\rm const}"
            },
            {
                "label": "T–p",
                "tex": "T^\\gamma p^{1-\\gamma}={\\rm const}"
            },
            {
                "label": "Показатель",
                "tex": "\\gamma=\\frac{C_p}{C_V}"
            }
        ]
    },
    {
        "id": "photon-energy",
        "category": "Газ, излучение и плазма",
        "title": "Энергия фотона",
        "formulas": [
            {
                "tex": "E=h\\nu=\\frac{hc}{\\lambda}"
            }
        ]
    },
    {
        "id": "photon-rate",
        "category": "Газ, излучение и плазма",
        "title": "Число фотонов по мощности",
        "formulas": [
            {
                "tex": "\\dot N=\\frac{P}{h\\nu}=\\frac{P\\lambda}{hc}"
            }
        ]
    },
    {
        "id": "radiation-constant",
        "category": "Газ, излучение и плазма",
        "title": "Плотность энергии чёрного излучения",
        "formulas": [
            {
                "label": "Радиационная постоянная",
                "tex": "a=\\frac{4\\sigma}{c}=\\frac{\\pi^2k_B^4}{15\\hbar^3c^3}"
            },
            {
                "label": "Плотность энергии",
                "tex": "u=aT^4=\\frac{4\\sigma}{c}T^4"
            }
        ]
    },
    {
        "id": "photon-gas-pressure",
        "category": "Газ, излучение и плазма",
        "title": "Давление фотонного газа",
        "formulas": [
            {
                "tex": "p_{\\rm rad}=\\frac{u}{3}=\\frac{4\\sigma}{3c}T^4"
            }
        ]
    },
    {
        "id": "planck-nu",
        "category": "Газ, излучение и плазма",
        "title": "Закон Планка по частоте",
        "formulas": [
            {
                "tex": "B_\\nu(T)=\\frac{2h\\nu^3}{c^2}\\frac1{e^{h\\nu/(kT)}-1}"
            }
        ]
    },
    {
        "id": "planck-lambda",
        "category": "Газ, излучение и плазма",
        "title": "Закон Планка по длине волны",
        "formulas": [
            {
                "tex": "B_\\lambda(T)=\\frac{2hc^2}{\\lambda^5}\\frac1{e^{hc/(\\lambda kT)}-1}"
            }
        ]
    },
    {
        "id": "rayleigh-jeans",
        "category": "Газ, излучение и плазма",
        "title": "Приближение Рэлея–Джинса",
        "formulas": [
            {
                "label": "По частоте",
                "tex": "B_\\nu\\simeq\\frac{2kT\\nu^2}{c^2}"
            },
            {
                "label": "По длине волны",
                "tex": "B_\\lambda\\simeq\\frac{2ckT}{\\lambda^4}"
            }
        ],
        "note": "При hν≪kT."
    },
    {
        "id": "brightness-temperature",
        "category": "Газ, излучение и плазма",
        "title": "Яркостная температура в приближении Рэлея–Джинса",
        "formulas": [
            {
                "label": "Через Iν",
                "tex": "T_b=\\frac{c^2I_\\nu}{2k\\nu^2}"
            },
            {
                "label": "Через Iλ",
                "tex": "T_b=\\frac{\\lambda^4 I_\\lambda}{2ck}"
            }
        ]
    },
    {
        "id": "specific-intensity",
        "category": "Газ, излучение и плазма",
        "title": "Интенсивность и поток",
        "formulas": [
            {
                "label": "Определение",
                "tex": "I_\\nu=\\frac{dE}{dA\\,dt\\,d\\nu\\,d\\Omega\\,\\cos\\theta}"
            },
            {
                "label": "Поток",
                "tex": "dF_\\nu=I_\\nu\\cos\\theta\\,d\\Omega"
            },
            {
                "label": "Равномерный малый источник",
                "tex": "F_\\nu\\simeq I_\\nu\\Omega"
            }
        ]
    },
    {
        "id": "optical-depth",
        "category": "Газ, излучение и плазма",
        "title": "Оптическая толщина и закон Бугера–Ламберта",
        "formulas": [
            {
                "label": "Оптическая толщина",
                "tex": "\\tau=\\int\\alpha_\\nu\\,ds\\simeq n\\sigma L"
            },
            {
                "label": "Ослабление",
                "tex": "I=I_0e^{-\\tau}"
            }
        ]
    },
    {
        "id": "radiative-transfer",
        "category": "Газ, излучение и плазма",
        "title": "Уравнение переноса излучения",
        "formulas": [
            {
                "label": "Обычная форма",
                "tex": "\\frac{dI_\\nu}{ds}=j_\\nu-\\alpha_\\nu I_\\nu"
            },
            {
                "label": "Через τ",
                "tex": "\\frac{dI_\\nu}{d\\tau_\\nu}=-I_\\nu+S_\\nu,\\qquad S_\\nu=\\frac{j_\\nu}{\\alpha_\\nu}"
            }
        ],
        "note": "Знак у формы через τ зависит от того, в какую сторону растёт τ; это соглашение надо проверять по условию."
    },
    {
        "id": "uniform-slab",
        "category": "Газ, излучение и плазма",
        "title": "Однородный изотермический слой",
        "formulas": [
            {
                "tex": "I_\\nu=I_{\\nu,0}e^{-\\tau_\\nu}+S_\\nu\\left(1-e^{-\\tau_\\nu}\\right)"
            }
        ],
        "note": "Если фон отсутствует: Iν=Sν(1−e^(−τν))."
    },
    {
        "id": "light-pressure",
        "category": "Газ, излучение и плазма",
        "title": "Давление света на поверхность",
        "formulas": [
            {
                "label": "Поглощение",
                "tex": "p=\\frac{I}{c}"
            },
            {
                "label": "Идеальное отражение",
                "tex": "p=\\frac{2I}{c}"
            },
            {
                "label": "Доля отражения",
                "tex": "p=\\frac{(1+\\mathcal R)I}{c}"
            }
        ]
    },
    {
        "id": "radiation-force",
        "category": "Газ, излучение и плазма",
        "title": "Сила светового давления",
        "formulas": [
            {
                "tex": "F=pS=\\frac{(1+\\mathcal R)LS}{4\\pi r^2c}"
            }
        ]
    },
    {
        "id": "stellar-wind-pressure",
        "category": "Газ, излучение и плазма",
        "title": "Динамическое давление звёздного ветра",
        "formulas": [
            {
                "tex": "p_{\\rm dyn}=\\rho v^2=nmv^2"
            }
        ]
    },
    {
        "id": "thermal-doppler",
        "category": "Газ, излучение и плазма",
        "title": "Тепловое доплеровское уширение",
        "formulas": [
            {
                "tex": "\\frac{\\Delta\\nu_{\\rm FWHM}}{\\nu_0}=\\sqrt{\\frac{8kT\\ln2}{mc^2}}"
            },
            {
                "label": "По длине волны",
                "tex": "\\frac{\\Delta\\lambda_{\\rm FWHM}}{\\lambda_0}=\\sqrt{\\frac{8kT\\ln2}{mc^2}}"
            }
        ]
    },
    {
        "id": "magnetic-pressure",
        "category": "Газ, излучение и плазма",
        "title": "Магнитное и тепловое давление плазмы",
        "formulas": [
            {
                "label": "Магнитное",
                "tex": "P_B=\\frac{B^2}{2\\mu_0}"
            },
            {
                "label": "Тепловое",
                "tex": "P_{\\rm th}=nkT"
            }
        ]
    },
    {
        "id": "debye-length",
        "category": "Газ, излучение и плазма",
        "title": "Дебаевская длина",
        "formulas": [
            {
                "tex": "\\lambda_D=\\sqrt{\\frac{\\varepsilon_0kT}{n_e e^2}}"
            }
        ]
    },
    {
        "id": "continuity-fluid",
        "category": "Газ, излучение и плазма",
        "title": "Уравнение неразрывности",
        "formulas": [
            {
                "tex": "\\frac{\\partial\\rho}{\\partial t}+\\nabla\\cdot(\\rho\\vec v)=0"
            }
        ]
    },
    {
        "id": "toomre-q",
        "category": "Газ, излучение и плазма",
        "title": "Критерий Тумре для газового диска",
        "formulas": [
            {
                "tex": "Q=\\frac{c_s\\kappa}{\\pi G\\Sigma}"
            }
        ],
        "note": "Локальная осесимметричная устойчивость газового диска: Q>1."
    },
    {
        "id": "snr",
        "category": "Газ, излучение и плазма",
        "title": "Сигнал/шум при фотометрии",
        "formulas": [
            {
                "tex": "{\\rm SNR}=\\frac{N_s}{\\sqrt{N_s+N_b+N_d+n_{\\rm pix}\\sigma_R^2}}"
            }
        ],
        "note": "Конкретная запись меняется с принятой моделью фона, тёмного тока и шума считывания."
    },
    {
        "id": "debroglie",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Длина волны де Бройля",
        "formulas": [
            {
                "tex": "\\lambda=\\frac{h}{p}\\simeq\\frac{h}{mv}"
            }
        ]
    },
    {
        "id": "bohr-angular",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Квантование момента в модели Бора",
        "formulas": [
            {
                "tex": "m_evr=n\\hbar"
            }
        ]
    },
    {
        "id": "bohr-levels",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Атом водорода: радиусы и энергии уровней",
        "formulas": [
            {
                "label": "Радиус",
                "tex": "r_n=a_0\\frac{n^2}{Z}"
            },
            {
                "label": "Энергия",
                "tex": "E_n=-13.6\\,{\\rm eV}\\,\\frac{Z^2}{n^2}"
            }
        ]
    },
    {
        "id": "rydberg",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Формула Ридберга",
        "formulas": [
            {
                "tex": "\\frac1\\lambda=R_\\infty Z^2\\left(\\frac1{n_1^2}-\\frac1{n_2^2}\\right),\\qquad n_2>n_1"
            }
        ]
    },
    {
        "id": "photoelectric",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Фотоэффект",
        "formulas": [
            {
                "label": "Уравнение Эйнштейна",
                "tex": "h\\nu=A+K_{\\max}"
            },
            {
                "label": "Запирающее напряжение",
                "tex": "K_{\\max}=eU_{\\rm stop}"
            },
            {
                "label": "Красная граница",
                "tex": "\\lambda_{\\rm red}=\\frac{hc}{A}"
            }
        ]
    },
    {
        "id": "photo-current",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Фототок насыщения",
        "formulas": [
            {
                "label": "Число фотонов",
                "tex": "\\dot N_\\gamma=\\frac{P}{h\\nu}"
            },
            {
                "label": "При квантовом выходе η",
                "tex": "I_{\\rm sat}=e\\eta\\dot N_\\gamma"
            }
        ]
    },
    {
        "id": "radioactive-decay",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Радиоактивный распад",
        "formulas": [
            {
                "label": "Закон",
                "tex": "N=N_0e^{-\\lambda t}"
            },
            {
                "label": "Среднее время жизни",
                "tex": "\\tau=\\frac1\\lambda"
            },
            {
                "label": "Период полураспада",
                "tex": "T_{1/2}=\\frac{\\ln2}{\\lambda}"
            }
        ]
    },
    {
        "id": "mass-energy",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Дефект массы и энергия связи",
        "formulas": [
            {
                "tex": "E=mc^2,\\qquad E_{\\rm bind}=\\Delta m\\,c^2"
            }
        ]
    },
    {
        "id": "alpha-beta",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Ядерные превращения",
        "formulas": [
            {
                "label": "α-распад",
                "tex": "{}^A_ZX\\to{}^{A-4}_{Z-2}Y+{}^4_2{\\rm He}"
            },
            {
                "label": "β⁻",
                "tex": "{}^A_ZX\\to{}^A_{Z+1}Y+e^-+\\bar\\nu_e"
            },
            {
                "label": "β⁺",
                "tex": "{}^A_ZX\\to{}^A_{Z-1}Y+e^++\\nu_e"
            },
            {
                "label": "Электронный захват",
                "tex": "{}^A_ZX+e^-\\to{}^A_{Z-1}Y+\\nu_e"
            }
        ]
    },
    {
        "id": "quantum-angular-momentum",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Орбитальный момент и спин",
        "formulas": [
            {
                "label": "Орбитальный момент",
                "tex": "L=\\sqrt{\\ell(\\ell+1)}\\,\\hbar"
            },
            {
                "label": "Проекция",
                "tex": "L_z=m_\\ell\\hbar"
            },
            {
                "label": "Спин",
                "tex": "S=\\sqrt{s(s+1)}\\,\\hbar"
            }
        ]
    },
    {
        "id": "compton",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Комптоновское рассеяние",
        "formulas": [
            {
                "tex": "\\Delta\\lambda=\\lambda'-\\lambda=\\frac{h}{m_ec}(1-\\cos\\varphi)=\\frac{2h}{m_ec}\\sin^2\\frac{\\varphi}{2}"
            }
        ]
    },
    {
        "id": "einstein-ab",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Коэффициенты Эйнштейна A и B",
        "formulas": [
            {
                "tex": "A_{21}=\\frac{8\\pi h\\nu^3}{c^3}B_{21}"
            }
        ],
        "note": "В записи через спектральную плотность энергии на единицу частоты."
    },
    {
        "id": "bohr-magneton",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Магнетон Бора",
        "formulas": [
            {
                "tex": "\\mu_B=\\frac{e\\hbar}{2m_e}=\\frac{eh}{4\\pi m_e}"
            }
        ]
    },
    {
        "id": "orbital-magnetic-moment",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Магнитный момент токового контура",
        "formulas": [
            {
                "label": "SI",
                "tex": "\\mu=IS"
            },
            {
                "label": "Орбитальный электрон",
                "tex": "\\vec\\mu_L=-\\frac{e}{2m_e}\\vec L"
            }
        ]
    },
    {
        "id": "zeeman-splitting",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Эффект Зеемана: энергетический масштаб",
        "formulas": [
            {
                "tex": "\\Delta E=g\\,m\\,\\mu_BB,\\qquad \\Delta\\nu=\\frac{\\Delta E}{h}"
            }
        ],
        "note": "g — фактор Ланде; конкретный рисунок компонент зависит от перехода."
    },
    {
        "id": "stokes",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Параметры Стокса",
        "formulas": [
            {
                "label": "Для полностью поляризованной волны",
                "tex": "I^2=Q^2+U^2+V^2"
            }
        ]
    },
    {
        "id": "oscillator-driven",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Связанный электрон в гармоническом поле",
        "formulas": [
            {
                "tex": "x(t)=\\frac{eE(t)}{m(\\omega_0^2-\\omega^2)}"
            }
        ],
        "note": "Без затухания; формула использовалась в задаче на классическую модель атома."
    },
    {
        "id": "coulomb-field",
        "category": "Электричество и магнетизм",
        "title": "Поле точечного заряда",
        "formulas": [
            {
                "tex": "\\vec E=\\frac{1}{4\\pi\\varepsilon_0}\\frac{q\\vec r}{r^3}"
            }
        ]
    },
    {
        "id": "moving-charge-b",
        "category": "Электричество и магнетизм",
        "title": "Магнитное поле движущегося заряда",
        "formulas": [
            {
                "tex": "\\vec B=\\frac{\\mu_0}{4\\pi}\\frac{q\\,\\vec v\\times\\vec r}{r^3}"
            }
        ]
    },
    {
        "id": "biot-savart",
        "category": "Электричество и магнетизм",
        "title": "Закон Био–Савара–Лапласа",
        "formulas": [
            {
                "tex": "d\\vec B=\\frac{\\mu_0}{4\\pi}\\frac{I\\,d\\vec\\ell\\times\\hat r}{r^2}"
            }
        ]
    },
    {
        "id": "lorentz-force",
        "category": "Электричество и магнетизм",
        "title": "Сила Лоренца",
        "formulas": [
            {
                "tex": "\\vec F=q(\\vec E+\\vec v\\times\\vec B)"
            },
            {
                "label": "Только магнитное поле",
                "tex": "F=|q|vB\\sin\\alpha"
            }
        ]
    },
    {
        "id": "larmor-radius",
        "category": "Электричество и магнетизм",
        "title": "Ларморовский радиус",
        "formulas": [
            {
                "tex": "r_L=\\frac{mv_\\perp}{|q|B}=\\frac{p_\\perp}{|q|B}"
            }
        ]
    },
    {
        "id": "cyclotron",
        "category": "Электричество и магнетизм",
        "title": "Циклотронная частота и энергия",
        "formulas": [
            {
                "label": "Угловая частота",
                "tex": "\\omega_c=\\frac{|q|B}{m}"
            },
            {
                "label": "Радиус",
                "tex": "r=\\frac{mv}{|q|B}"
            },
            {
                "label": "Энергия через r и B",
                "tex": "K=\\frac{q^2B^2r^2}{2m}"
            }
        ],
        "note": "Нерелятивистский предел."
    },
    {
        "id": "em-wave",
        "category": "Электричество и магнетизм",
        "title": "Плоская электромагнитная волна",
        "formulas": [
            {
                "label": "Амплитуды",
                "tex": "E_0=cB_0"
            },
            {
                "label": "Интенсивность",
                "tex": "I=\\frac12c\\varepsilon_0E_0^2=\\frac{c}{2\\mu_0}B_0^2"
            },
            {
                "label": "Плотность энергии",
                "tex": "u=\\varepsilon_0E^2=\\frac{B^2}{\\mu_0}"
            }
        ]
    },
    {
        "id": "blackbody-electric-field",
        "category": "Электричество и магнетизм",
        "title": "Электрическое поле теплового излучения",
        "formulas": [
            {
                "label": "Средняя плотность энергии",
                "tex": "u=aT^4"
            },
            {
                "label": "Среднее поле",
                "tex": "\\langle E^2\\rangle=\\frac{u}{\\varepsilon_0}"
            }
        ]
    },
    {
        "id": "gamma",
        "category": "СТО и ОТО",
        "title": "Лоренц-фактор",
        "formulas": [
            {
                "tex": "\\gamma=\\frac1{\\sqrt{1-\\beta^2}},\\qquad \\beta=\\frac vc"
            }
        ]
    },
    {
        "id": "time-length",
        "category": "СТО и ОТО",
        "title": "Замедление времени и сокращение длины",
        "formulas": [
            {
                "label": "Время",
                "tex": "\\Delta t=\\gamma\\Delta\\tau"
            },
            {
                "label": "Длина",
                "tex": "L=\\frac{L_0}{\\gamma}"
            }
        ]
    },
    {
        "id": "lorentz-transform",
        "category": "СТО и ОТО",
        "title": "Преобразования Лоренца",
        "formulas": [
            {
                "label": "Координата",
                "tex": "x'=\\gamma(x-vt)"
            },
            {
                "label": "Время",
                "tex": "t'=\\gamma\\left(t-\\frac{vx}{c^2}\\right)"
            }
        ]
    },
    {
        "id": "rel-energy-momentum",
        "category": "СТО и ОТО",
        "title": "Энергия и импульс в СТО",
        "formulas": [
            {
                "label": "Импульс",
                "tex": "p=\\gamma mv"
            },
            {
                "label": "Энергия",
                "tex": "E=\\gamma mc^2"
            },
            {
                "label": "Кинетическая",
                "tex": "K=(\\gamma-1)mc^2"
            },
            {
                "label": "Инвариант",
                "tex": "E^2=p^2c^2+m^2c^4"
            }
        ]
    },
    {
        "id": "energy-momentum-transform",
        "category": "СТО и ОТО",
        "title": "Преобразование энергии и импульса",
        "formulas": [
            {
                "label": "Импульс",
                "tex": "p_x'=\\gamma\\left(p_x-\\frac{vE}{c^2}\\right)"
            },
            {
                "label": "Энергия",
                "tex": "E'=\\gamma(E-vp_x)"
            }
        ]
    },
    {
        "id": "velocity-addition",
        "category": "СТО и ОТО",
        "title": "Сложение скоростей",
        "formulas": [
            {
                "label": "Продольная",
                "tex": "u_x'=\\frac{u_x-v}{1-u_xv/c^2}"
            },
            {
                "label": "Поперечная",
                "tex": "u_y'=\\frac{u_y}{\\gamma(1-u_xv/c^2)}"
            }
        ]
    },
    {
        "id": "rel-doppler",
        "category": "СТО и ОТО",
        "title": "Релятивистский продольный Доплер",
        "formulas": [
            {
                "label": "Частота при удалении",
                "tex": "\\frac{\\nu_{\\rm obs}}{\\nu_0}=\\sqrt{\\frac{1-\\beta}{1+\\beta}}"
            },
            {
                "label": "Длина волны при удалении",
                "tex": "\\frac{\\lambda_{\\rm obs}}{\\lambda_0}=\\sqrt{\\frac{1+\\beta}{1-\\beta}}"
            }
        ]
    },
    {
        "id": "transverse-doppler",
        "category": "СТО и ОТО",
        "title": "Поперечный релятивистский Доплер",
        "formulas": [
            {
                "tex": "\\nu_{\\rm obs}=\\frac{\\nu_0}{\\gamma}=\\nu_0\\sqrt{1-\\beta^2}"
            }
        ]
    },
    {
        "id": "redshift-beta",
        "category": "СТО и ОТО",
        "title": "Красное смещение и релятивистская скорость",
        "formulas": [
            {
                "label": "Определение",
                "tex": "1+z=\\frac{\\lambda_{\\rm obs}}{\\lambda_0}"
            },
            {
                "label": "Скорость",
                "tex": "\\beta=\\frac{(1+z)^2-1}{(1+z)^2+1}"
            }
        ]
    },
    {
        "id": "schwarzschild",
        "category": "СТО и ОТО",
        "title": "Радиус Шварцшильда",
        "formulas": [
            {
                "tex": "r_s=\\frac{2GM}{c^2}"
            }
        ]
    },
    {
        "id": "isco",
        "category": "СТО и ОТО",
        "title": "ISCO невращающейся чёрной дыры",
        "formulas": [
            {
                "tex": "r_{\\rm ISCO}=6\\frac{GM}{c^2}=3r_s"
            }
        ]
    },
    {
        "id": "grav-redshift",
        "category": "СТО и ОТО",
        "title": "Гравитационное красное смещение",
        "formulas": [
            {
                "label": "Шварцшильд",
                "tex": "1+z=\\left(1-\\frac{2GM}{rc^2}\\right)^{-1/2}"
            },
            {
                "label": "Слабое поле",
                "tex": "z\\simeq\\frac{GM}{rc^2}"
            }
        ]
    },
    {
        "id": "light-deflection",
        "category": "СТО и ОТО",
        "title": "Отклонение света в слабом поле",
        "formulas": [
            {
                "tex": "\\alpha=\\frac{4GM}{bc^2}"
            }
        ]
    },
    {
        "id": "hawking",
        "category": "СТО и ОТО",
        "title": "Температура Хокинга",
        "formulas": [
            {
                "tex": "T_H=\\frac{\\hbar c^3}{8\\pi G M k_B}"
            }
        ]
    },
    {
        "id": "hubble-law",
        "category": "Галактики и космология",
        "title": "Закон Хаббла",
        "formulas": [
            {
                "label": "Малые z",
                "tex": "v\\simeq H_0d"
            },
            {
                "label": "Красное смещение",
                "tex": "z\\simeq\\frac{H_0d}{c}"
            }
        ]
    },
    {
        "id": "redshift-definition",
        "category": "Галактики и космология",
        "title": "Красное смещение",
        "formulas": [
            {
                "tex": "z=\\frac{\\lambda_{\\rm obs}-\\lambda_0}{\\lambda_0},\\qquad 1+z=\\frac{\\lambda_{\\rm obs}}{\\lambda_0}"
            }
        ]
    },
    {
        "id": "critical-density",
        "category": "Галактики и космология",
        "title": "Критическая плотность Вселенной",
        "formulas": [
            {
                "tex": "\\rho_c=\\frac{3H^2}{8\\pi G}"
            }
        ]
    },
    {
        "id": "friedmann",
        "category": "Галактики и космология",
        "title": "Первое уравнение Фридмана",
        "formulas": [
            {
                "tex": "H^2=\\left(\\frac{\\dot a}{a}\\right)^2=\\frac{8\\pi G}{3}\\rho+\\frac{\\Lambda c^2}{3}-\\frac{kc^2}{a^2}"
            }
        ]
    },
    {
        "id": "omega-parameters",
        "category": "Галактики и космология",
        "title": "Параметры плотности",
        "formulas": [
            {
                "label": "Определение",
                "tex": "\\Omega_i=\\frac{\\rho_i}{\\rho_c}"
            },
            {
                "label": "Сумма",
                "tex": "\\Omega_r+\\Omega_m+\\Omega_\\Lambda+\\Omega_k=1"
            }
        ]
    },
    {
        "id": "cosmic-density-scaling",
        "category": "Галактики и космология",
        "title": "Как плотности меняются с масштабным фактором",
        "formulas": [
            {
                "label": "Излучение",
                "tex": "\\rho_r\\propto a^{-4}"
            },
            {
                "label": "Материя",
                "tex": "\\rho_m\\propto a^{-3}"
            },
            {
                "label": "Тёмная энергия",
                "tex": "\\rho_\\Lambda={\\rm const}"
            }
        ]
    },
    {
        "id": "scale-factor-eras",
        "category": "Галактики и космология",
        "title": "Масштабный фактор в основных эпохах",
        "formulas": [
            {
                "label": "Радиационная",
                "tex": "a(t)\\propto t^{1/2}"
            },
            {
                "label": "Материальная",
                "tex": "a(t)\\propto t^{2/3}"
            },
            {
                "label": "Λ-доминирование",
                "tex": "a(t)\\propto e^{Ht}"
            }
        ]
    },
    {
        "id": "redshift-scale-factor",
        "category": "Галактики и космология",
        "title": "Красное смещение и масштабный фактор",
        "formulas": [
            {
                "tex": "1+z=\\frac{a_0}{a}"
            }
        ]
    },
    {
        "id": "cmb-temperature",
        "category": "Галактики и космология",
        "title": "Температура реликтового излучения",
        "formulas": [
            {
                "tex": "T_{\\rm CMB}(z)=T_0(1+z)"
            }
        ]
    },
    {
        "id": "cosmo-distances",
        "category": "Галактики и космология",
        "title": "Космологические расстояния",
        "formulas": [
            {
                "label": "Светимостное ↔ поперечное сопутствующее",
                "tex": "D_L=(1+z)D_M"
            },
            {
                "label": "Светимостное ↔ углового диаметра",
                "tex": "D_L=(1+z)^2D_A"
            }
        ]
    },
    {
        "id": "rotation-mass",
        "category": "Галактики и космология",
        "title": "Масса по кривой вращения",
        "formulas": [
            {
                "tex": "M(<r)=\\frac{v_c^2r}{G}"
            }
        ],
        "note": "Для сферически-симметричного распределения массы."
    },
    {
        "id": "corotation",
        "category": "Галактики и космология",
        "title": "Радиус коротации",
        "formulas": [
            {
                "tex": "\\Omega_p=\\frac{v_c(R_{\\rm cor})}{R_{\\rm cor}}"
            }
        ]
    },
    {
        "id": "poisson-gravity",
        "category": "Галактики и космология",
        "title": "Уравнение Пуассона для гравитационного потенциала",
        "formulas": [
            {
                "label": "Обычное соглашение",
                "tex": "\\nabla^2\\Phi=4\\pi G\\rho"
            },
            {
                "label": "Сферическая симметрия",
                "tex": "\\nabla^2\\Phi=\\frac1{r^2}\\frac{d}{dr}\\left(r^2\\frac{d\\Phi}{dr}\\right)"
            }
        ]
    },
    {
        "id": "density-power-law",
        "category": "Галактики и космология",
        "title": "Степенной профиль плотности",
        "formulas": [
            {
                "label": "Если ρ=ρ₀(r₀/r)^α",
                "tex": "M(<r)=\\frac{4\\pi\\rho_0r_0^\\alpha}{3-\\alpha}\\,r^{3-\\alpha}"
            },
            {
                "label": "Круговая скорость",
                "tex": "v_c^2(r)=\\frac{4\\pi G\\rho_0r_0^\\alpha}{3-\\alpha}\\,r^{2-\\alpha}"
            }
        ],
        "note": "Для α<3."
    },
    {
        "id": "plummer",
        "category": "Галактики и космология",
        "title": "Потенциал и плотность Пламмера",
        "formulas": [
            {
                "label": "Потенциал",
                "tex": "\\Phi(r)=-\\frac{GM}{\\sqrt{r^2+b^2}}"
            },
            {
                "label": "Плотность",
                "tex": "\\rho(r)=\\frac{3M}{4\\pi b^3}\\left(1+\\frac{r^2}{b^2}\\right)^{-5/2}"
            }
        ]
    },
    {
        "id": "nfw-potential",
        "category": "Галактики и космология",
        "title": "Потенциал NFW",
        "formulas": [
            {
                "tex": "\\Phi(r)=-\\frac{GM_h}{r}\\ln\\left(1+\\frac{r}{r_s}\\right)"
            }
        ],
        "note": "Форма параметризации, использованная в тестах; нормировка M_h зависит от определения."
    },
    {
        "id": "faber-jackson",
        "category": "Галактики и космология",
        "title": "Соотношение Фабера–Джексона",
        "formulas": [
            {
                "tex": "L\\propto\\sigma^4"
            }
        ]
    },
    {
        "id": "mbh-sigma",
        "category": "Галактики и космология",
        "title": "Масса сверхмассивной ЧД и дисперсия скоростей",
        "formulas": [
            {
                "tex": "M_{\\rm BH}\\propto\\sigma^\\alpha,\\qquad \\alpha\\simeq4\\text{–}5"
            }
        ],
        "note": "Точная нормировка и показатель зависят от калибровки."
    },
    {
        "id": "einstein-ring",
        "category": "Галактики и космология",
        "title": "Кольцо Эйнштейна",
        "formulas": [
            {
                "label": "Угловой радиус",
                "tex": "\\theta_E=\\sqrt{\\frac{4GM}{c^2}\\frac{D_{ls}}{D_lD_s}}"
            },
            {
                "label": "Линейный радиус в плоскости линзы",
                "tex": "R_E=D_l\\theta_E"
            }
        ]
    },
    {
        "id": "orbital-resonance",
        "category": "Орбитальная механика",
        "title": "Орбитальный резонанс и полуоси",
        "formulas": [
            {
                "label": "Резонанс периодов",
                "tex": "\\frac{P_1}{P_2}=\\frac{p}{q}"
            },
            {
                "label": "Через полуоси",
                "tex": "\\frac{a_1}{a_2}=\\left(\\frac{P_1}{P_2}\\right)^{2/3}"
            }
        ],
        "note": "Для обращений вокруг одной и той же доминирующей массы."
    },
    {
        "id": "planet-phase",
        "category": "Фотометрия и звёзды",
        "title": "Освещённая фаза планеты/астероида",
        "formulas": [
            {
                "tex": "\\Phi=\\frac{1+\\cos\\alpha}{2}"
            }
        ],
        "note": "α — фазовый угол «источник света — объект — наблюдатель»."
    },
    {
        "id": "greatest-elongation",
        "category": "Небесная сфера и время",
        "title": "Наибольшая элонгация внутреннего объекта",
        "formulas": [
            {
                "tex": "\\sin\\varepsilon_{\\max}=\\frac{r_{\\rm inner}}{r_{\\rm observer}}"
            }
        ],
        "note": "Для круговых копланарных орбит."
    },
    {
        "id": "solar-incidence",
        "category": "Фотометрия и звёзды",
        "title": "Поток на горизонтальную площадку",
        "formulas": [
            {
                "label": "Поток у планеты",
                "tex": "F_\\star=\\frac{L_\\star}{4\\pi r^2}"
            },
            {
                "label": "На площадку",
                "tex": "P=SF_\\star\\max(0,\\sin h_\\star)"
            }
        ]
    },
    {
        "id": "first-vertical",
        "category": "Небесная сфера и время",
        "title": "Светило на первом вертикале",
        "formulas": [
            {
                "tex": "\\sin h=\\frac{\\sin\\delta}{\\sin\\varphi}"
            }
        ],
        "note": "При астрономическом азимуте A=±90°."
    },
    {
        "id": "rise-azimuth",
        "category": "Небесная сфера и время",
        "title": "Азимут восхода/захода",
        "formulas": [
            {
                "tex": "\\cos A_0=\\frac{\\sin\\delta}{\\cos\\varphi}"
            }
        ],
        "note": "Для h=0; знак/точное значение A зависит от системы отсчёта азимута."
    },
    {
        "id": "expectation",
        "category": "Математика и статистика",
        "title": "Плотность вероятности и математическое ожидание",
        "formulas": [
            {
                "label": "Нормировка",
                "tex": "\\int f(x)\\,dx=1"
            },
            {
                "label": "Ожидание",
                "tex": "\\mathbb E[X]=\\int x f(x)\\,dx"
            }
        ]
    },
    {
        "id": "mean-variance",
        "category": "Математика и статистика",
        "title": "Среднее, дисперсия, стандартное отклонение",
        "formulas": [
            {
                "label": "Среднее",
                "tex": "\\bar x=\\frac1N\\sum_{i=1}^{N}x_i"
            },
            {
                "label": "Дисперсия",
                "tex": "D=\\frac1N\\sum_{i=1}^{N}(x_i-\\bar x)^2"
            },
            {
                "label": "Выборочное σ",
                "tex": "s=\\sqrt{\\frac1{N-1}\\sum_{i=1}^{N}(x_i-\\bar x)^2}"
            }
        ]
    },
    {
        "id": "poisson-counting",
        "category": "Математика и статистика",
        "title": "Пуассоновская статистика счёта",
        "formulas": [
            {
                "label": "Стандарт",
                "tex": "\\sigma_N=\\sqrt N"
            },
            {
                "label": "Относительная ошибка",
                "tex": "\\frac{\\sigma_N}{N}=\\frac1{\\sqrt N}"
            }
        ]
    },
    {
        "id": "error-propagation",
        "category": "Математика и статистика",
        "title": "Распространение независимых погрешностей",
        "formulas": [
            {
                "tex": "\\sigma_f^2=\\sum_i\\left(\\frac{\\partial f}{\\partial x_i}\\right)^2\\sigma_{x_i}^2"
            }
        ]
    },
    {
        "id": "relative-error-power",
        "category": "Математика и статистика",
        "title": "Относительная погрешность степенной зависимости",
        "formulas": [
            {
                "label": "Для f=xᵃyᵇ…",
                "tex": "\\left(\\frac{\\sigma_f}{f}\\right)^2=a^2\\left(\\frac{\\sigma_x}{x}\\right)^2+b^2\\left(\\frac{\\sigma_y}{y}\\right)^2+\\cdots"
            }
        ]
    },
    {
        "id": "fourier-series",
        "category": "Математика и статистика",
        "title": "Ряд Фурье",
        "formulas": [
            {
                "label": "Разложение",
                "tex": "f(x)=\\frac{a_0}{2}+\\sum_{n=1}^{\\infty}\\left(a_n\\cos nx+b_n\\sin nx\\right)"
            },
            {
                "label": "Коэффициенты",
                "tex": "a_n=\\frac1\\pi\\int_{-\\pi}^{\\pi}f(x)\\cos nx\\,dx,\\qquad b_n=\\frac1\\pi\\int_{-\\pi}^{\\pi}f(x)\\sin nx\\,dx"
            }
        ],
        "note": "Чётная f ⇒ bₙ=0; нечётная f ⇒ aₙ=0."
    },
    {
        "id": "rotation-2d",
        "category": "Математика и статистика",
        "title": "Матрица поворота на плоскости",
        "formulas": [
            {
                "tex": "R(\\theta)=\\begin{pmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{pmatrix}"
            }
        ]
    },
    {
        "id": "rotation-3d",
        "category": "Математика и статистика",
        "title": "Матрицы поворота вокруг осей",
        "formulas": [
            {
                "label": "Вокруг x",
                "tex": "R_x(\\theta)=\\begin{pmatrix}1&0&0\\\\0&\\cos\\theta&-\\sin\\theta\\\\0&\\sin\\theta&\\cos\\theta\\end{pmatrix}"
            },
            {
                "label": "Вокруг y",
                "tex": "R_y(\\theta)=\\begin{pmatrix}\\cos\\theta&0&\\sin\\theta\\\\0&1&0\\\\-\\sin\\theta&0&\\cos\\theta\\end{pmatrix}"
            },
            {
                "label": "Вокруг z",
                "tex": "R_z(\\theta)=\\begin{pmatrix}\\cos\\theta&-\\sin\\theta&0\\\\\\sin\\theta&\\cos\\theta&0\\\\0&0&1\\end{pmatrix}"
            }
        ],
        "note": "При последовательных поворотах матрицы перемножаются в порядке применения к вектору."
    },
    {
        "id": "vector-products",
        "category": "Математика и статистика",
        "title": "Скалярное и векторное произведения",
        "formulas": [
            {
                "label": "Скалярное",
                "tex": "\\vec a\\cdot\\vec b=ab\\cos\\theta"
            },
            {
                "label": "Векторное",
                "tex": "|\\vec a\\times\\vec b|=ab\\sin\\theta"
            }
        ]
    },
    {
        "id": "line-integral",
        "category": "Математика и статистика",
        "title": "Криволинейный интеграл первого рода",
        "formulas": [
            {
                "label": "По графику y(x)",
                "tex": "\\int_C f\\,ds=\\int_{x_1}^{x_2}f(x,y(x))\\sqrt{1+\\left(\\frac{dy}{dx}\\right)^2}\\,dx"
            }
        ]
    },
    {
        "id": "simple-odes",
        "category": "Математика и статистика",
        "title": "Три базовых дифференциальных уравнения",
        "formulas": [
            {
                "label": "Экспоненциальный спад",
                "tex": "\\dot x+ax=0\\Rightarrow x=C e^{-at}"
            },
            {
                "label": "Гармонические колебания",
                "tex": "\\ddot x+\\omega^2x=0\\Rightarrow x=A\\cos(\\omega t+\\phi)"
            },
            {
                "label": "Экспоненты",
                "tex": "\\ddot x-a^2x=0\\Rightarrow x=C_1e^{at}+C_2e^{-at}"
            }
        ]
    },
    {
        "id": "triangle-laws",
        "category": "Математика и статистика",
        "title": "Плоский треугольник",
        "formulas": [
            {
                "label": "Косинусы",
                "tex": "c^2=a^2+b^2-2ab\\cos C"
            },
            {
                "label": "Синусы",
                "tex": "\\frac{a}{\\sin A}=\\frac{b}{\\sin B}=\\frac{c}{\\sin C}"
            }
        ]
    },
    {
        "id": "circle-overlap",
        "category": "Математика и статистика",
        "title": "Площадь пересечения двух одинаковых кругов",
        "formulas": [
            {
                "tex": "S=2R^2\\arccos\\frac{d}{2R}-\\frac d2\\sqrt{4R^2-d^2}"
            }
        ],
        "note": "Полезно для частичных затмений; d — расстояние между центрами дисков."
    },
    {
        "id": "sphere-geometry",
        "category": "Математика и статистика",
        "title": "Сфера и сферическая шапка",
        "formulas": [
            {
                "label": "Площадь сферы",
                "tex": "S=4\\pi R^2"
            },
            {
                "label": "Объём шара",
                "tex": "V=\\frac43\\pi R^3"
            },
            {
                "label": "Площадь шапки",
                "tex": "S_{\\rm cap}=2\\pi Rh"
            },
            {
                "label": "Объём шапки",
                "tex": "V_{\\rm cap}=\\frac{\\pi h^2}{3}(3R-h)"
            }
        ]
    },
    {
        "id": "rotating-effective-g",
        "category": "Орбитальная механика",
        "title": "Эффективная тяжесть на вращающемся теле",
        "formulas": [
            {
                "label": "На экваторе",
                "tex": "g_{\\rm eff}=g-\\omega^2R"
            },
            {
                "label": "На широте φ",
                "tex": "g_{\\rm eff,rad}\\simeq g-\\omega^2R\\cos^2\\varphi"
            }
        ],
        "note": "Сферическая модель, без учёта сплюснутости."
    },
    {
        "id": "vertical-launch",
        "category": "Орбитальная механика",
        "title": "Вертикальный подъём до заданной высоты",
        "formulas": [
            {
                "tex": "v_0=\\sqrt{2GM\\left(\\frac1R-\\frac1{R+h}\\right)}"
            }
        ]
    },
    {
        "id": "kozai-integral",
        "category": "Орбитальная механика",
        "title": "Интеграл Лидова–Козаи",
        "formulas": [
            {
                "tex": "\\sqrt{1-e^2}\\cos i={\\rm const}"
            }
        ],
        "note": "Квадрупольное приближение в иерархической тройной системе."
    },
    {
        "id": "basic-kinematics",
        "category": "Орбитальная механика",
        "title": "Равноускоренное движение",
        "formulas": [
            {
                "label": "Скорость",
                "tex": "v=v_0+at"
            },
            {
                "label": "Координата",
                "tex": "x=x_0+v_0t+\\frac12at^2"
            },
            {
                "label": "Без времени",
                "tex": "v^2-v_0^2=2a(x-x_0)"
            }
        ]
    },
    {
        "id": "momentum-conservation",
        "category": "Орбитальная механика",
        "title": "Импульс и его сохранение",
        "formulas": [
            {
                "label": "Импульс",
                "tex": "\\vec p=m\\vec v"
            },
            {
                "label": "Импульс силы",
                "tex": "\\Delta\\vec p=\\int\\vec F\\,dt"
            },
            {
                "label": "Замкнутая система",
                "tex": "\\sum\\vec p_{\\rm before}=\\sum\\vec p_{\\rm after}"
            },
            {
                "label": "Абсолютно неупругое столкновение",
                "tex": "(m_1+m_2)\\vec v= m_1\\vec v_1+m_2\\vec v_2"
            }
        ]
    },
    {
        "id": "kinetic-work-energy",
        "category": "Орбитальная механика",
        "title": "Кинетическая энергия и работа",
        "formulas": [
            {
                "label": "Кинетическая энергия",
                "tex": "K=\\frac{mv^2}{2}"
            },
            {
                "label": "Теорема о работе",
                "tex": "A_{\\rm net}=\\Delta K"
            },
            {
                "label": "Консервативная система",
                "tex": "E=K+U={\\rm const}"
            },
            {
                "label": "Медленное перемещение во внешнем поле",
                "tex": "A_{\\rm ext}=\\Delta U"
            }
        ]
    },
    {
        "id": "archimedes-force",
        "category": "Газ, излучение и плазма",
        "title": "Сила Архимеда",
        "formulas": [
            {
                "tex": "F_A=\\rho_{\\rm fluid}\\,g\\,V_{\\rm displaced}"
            }
        ]
    },
    {
        "id": "polar-acceleration",
        "category": "Математика и статистика",
        "title": "Ускорение в полярных координатах",
        "formulas": [
            {
                "label": "Радиальная компонента",
                "tex": "a_r=\\ddot r-r\\dot\\varphi^2"
            },
            {
                "label": "Трансверсальная компонента",
                "tex": "a_\\varphi=r\\ddot\\varphi+2\\dot r\\dot\\varphi"
            }
        ]
    },
    {
        "id": "spherical-jacobian",
        "category": "Математика и статистика",
        "title": "Якобиан сферических координат",
        "formulas": [
            {
                "label": "Якобиан",
                "tex": "J(r,\\theta,\\varphi)=r^2\\sin\\theta"
            },
            {
                "label": "Элемент объёма",
                "tex": "dV=r^2\\sin\\theta\\,dr\\,d\\theta\\,d\\varphi"
            }
        ],
        "note": "Здесь θ — полярный угол (или зенитное расстояние)."
    },
    {
        "id": "convection-gradient",
        "category": "Газ, излучение и плазма",
        "title": "Критерий конвекции в атмосфере",
        "formulas": [
            {
                "label": "Адиабатический градиент",
                "tex": "\\left|\\frac{dT}{dz}\\right|_{\\rm ad}=\\frac{\\gamma-1}{\\gamma}\\frac{\\bar m g}{k_B}"
            },
            {
                "label": "Конвективная неустойчивость",
                "tex": "\\left|\\frac{dT}{dz}\\right|>\\left|\\frac{dT}{dz}\\right|_{\\rm ad}"
            }
        ]
    },
    {
        "id": "stellar-eos-gas-radiation",
        "category": "Фотометрия и звёзды",
        "title": "Уравнение состояния в недрах звезды",
        "formulas": [
            {
                "tex": "P=P_{\\rm gas}+P_{\\rm rad}=\\frac{\\rho k_BT}{\\bar m}+\\frac13aT^4"
            },
            {
                "label": "Радиационная постоянная",
                "tex": "a=\\frac{4\\sigma}{c}"
            }
        ]
    },
    {
        "id": "planck-units",
        "category": "Атомная, квантовая и ядерная физика",
        "title": "Планковские единицы",
        "formulas": [
            {
                "label": "Масса",
                "tex": "m_{\\rm P}=\\sqrt{\\frac{\\hbar c}{G}}"
            },
            {
                "label": "Импульс",
                "tex": "p_{\\rm P}=\\sqrt{\\frac{\\hbar c^3}{G}}=m_{\\rm P}c"
            },
            {
                "label": "Плотность",
                "tex": "\\rho_{\\rm P}=\\frac{c^5}{\\hbar G^2}"
            },
            {
                "label": "Давление",
                "tex": "P_{\\rm P}=\\frac{c^7}{\\hbar G^2}"
            }
        ]
    },
    {
        "id": "blackbody-photon-number",
        "category": "Газ, излучение и плазма",
        "title": "Число фотонов чёрного излучения",
        "formulas": [
            {
                "label": "Концентрация фотонов",
                "tex": "n_\\gamma=\\frac{2\\zeta(3)}{\\pi^2}\\left(\\frac{k_BT}{\\hbar c}\\right)^3"
            },
            {
                "label": "Поток фотонов с поверхности АЧТ",
                "tex": "\\frac{\\dot N_\\gamma}{S}=\\frac{c}{4}n_\\gamma\\propto T^3"
            }
        ]
    },
    {
        "id": "rayleigh-scattering",
        "category": "Оптика и наблюдения",
        "title": "Рэлеевское рассеяние",
        "formulas": [
            {
                "tex": "I_{\\rm scat}\\propto\\lambda^{-4}"
            }
        ],
        "note": "Короткие волны рассеиваются намного сильнее длинных."
    },
    {
        "id": "brewster-critical-angle",
        "category": "Оптика и наблюдения",
        "title": "Угол Брюстера и полное внутреннее отражение",
        "formulas": [
            {
                "label": "Скорость света в среде",
                "tex": "v=\\frac{c}{n}"
            },
            {
                "label": "Критический угол, n₁>n₂",
                "tex": "\\sin\\theta_c=\\frac{n_2}{n_1}"
            },
            {
                "label": "Угол Брюстера",
                "tex": "\\tan\\theta_B=\\frac{n_2}{n_1}"
            }
        ]
    },
    {
        "id": "accretion-luminosity",
        "category": "Фотометрия и звёзды",
        "title": "Светимость аккреции",
        "formulas": [
            {
                "label": "Через эффективность",
                "tex": "L=\\eta\\dot M c^2"
            },
            {
                "label": "Ньютоновская оценка",
                "tex": "L_{\\rm acc}\\simeq\\frac{GM\\dot M}{R}"
            },
            {
                "label": "Эффективность в ньютоновской оценке",
                "tex": "\\eta\\simeq\\frac{GM}{Rc^2}"
            }
        ]
    },
    {
        "id": "tisserand-parameter",
        "category": "Орбитальная механика",
        "title": "Параметр Тиссерана",
        "formulas": [
            {
                "label": "По отношению к возмущающей планете",
                "tex": "T=\\frac{a_p}{a}+2\\sqrt{\\left(1+\\frac{m_p}{M_\\odot}\\right)\\frac{a}{a_p}(1-e^2)}\\cos i"
            },
            {
                "label": "Если mₚ≪M☉",
                "tex": "T\\simeq\\frac{a_p}{a}+2\\sqrt{\\frac{a}{a_p}(1-e^2)}\\cos i"
            }
        ]
    },
    {
        "id": "titius-bode",
        "category": "Орбитальная механика",
        "title": "Правило Тициуса–Боде",
        "formulas": [
            {
                "tex": "\\frac{a}{\\rm AU}=0.4+0.3\\cdot2^n"
            }
        ],
        "details": [
            "n = −∞ для Меркурия, n = 0 для Венеры, далее n = 1, 2, 3, …",
            "Это историческое эмпирическое правило, а не фундаментальный закон."
        ]
    },
    {
        "id": "laplace-runge-lenz",
        "category": "Орбитальная механика",
        "title": "Вектор Лапласа–Рунге–Ленца",
        "formulas": [
            {
                "label": "Через импульс p=m v",
                "tex": "\\vec A=\\vec p\\times(\\vec r\\times\\vec p)-GMm^2\\frac{\\vec r}{r}"
            },
            {
                "label": "Вектор эксцентриситета",
                "tex": "\\vec e=\\frac{\\vec v\\times\\vec h}{GM}-\\frac{\\vec r}{r}"
            }
        ]
    },
    {
        "id": "pulsar-braking-index",
        "category": "Фотометрия и звёзды",
        "title": "Индекс торможения пульсара",
        "formulas": [
            {
                "label": "Если I=const и ω̇=−Kωⁿ",
                "tex": "n=\\frac{\\omega\\ddot\\omega}{\\dot\\omega^2}"
            }
        ]
    },
    {
        "id": "fundamental-plane",
        "category": "Галактики и космология",
        "title": "Фундаментальная плоскость эллиптических галактик",
        "formulas": [
            {
                "tex": "\\log_{10}R_e=1.4\\log_{10}\\sigma_0+0.36\\,\\mu_B+{\\rm const}"
            }
        ],
        "note": "Эмпирическая калибровка в форме, использованной в OWAO."
    },
    {
        "id": "stellar-imf",
        "category": "Фотометрия и звёзды",
        "title": "Начальная функция масс звёзд",
        "formulas": [
            {
                "label": "Солпитер",
                "tex": "\\xi(M)\\propto M^{-2.35}"
            },
            {
                "label": "Крупа",
                "tex": "\\xi(m)\\propto m^{-\\alpha},\\qquad \\alpha=\\begin{cases}0.3,&m<0.08\\\\1.3,&0.08<m<0.5\\\\2.3,&m>0.5\\end{cases}"
            }
        ],
        "note": "Масса m выражена в M☉; границы и показатели — в форме, использованной в OWAO."
    },
    {
        "id": "mass-luminosity-function-transform",
        "category": "Фотометрия и звёзды",
        "title": "Из функции масс в функцию светимости",
        "formulas": [
            {
                "tex": "\\Phi(L)\\,dL=\\xi(M)\\,dM"
            },
            {
                "tex": "\\Phi(L)=\\xi(M)\\left|\\frac{dM}{dL}\\right|"
            }
        ]
    },
    {
        "id": "disk-mass-surface-density",
        "category": "Галактики и космология",
        "title": "Масса осесимметричного диска",
        "formulas": [
            {
                "tex": "M(<R)=2\\pi\\int_0^R\\Sigma(r)\\,r\\,dr"
            },
            {
                "label": "Экспоненциальный диск до бесконечности",
                "tex": "\\Sigma(r)=\\Sigma_0e^{-r/r_d}\\quad\\Rightarrow\\quad M_{\\rm tot}=2\\pi\\Sigma_0r_d^2"
            }
        ]
    },
    {
        "id": "isothermal-sheet",
        "category": "Галактики и космология",
        "title": "Самогравитирующий изотермический слой",
        "formulas": [
            {
                "tex": "I(z)=I_0\\operatorname{sech}^2\\!\\left(\\frac{z}{z_0}\\right)"
            }
        ]
    },
    {
        "id": "sphere-moving-triad",
        "category": "Небесная сфера и время",
        "title": "Подвижный базис на небесной сфере",
        "formulas": [
            {
                "label": "Вдоль параллели",
                "tex": "\\mathbf l^0=\\frac{\\mathbf z^0\\times\\mathbf r^0}{\\cos b}"
            },
            {
                "label": "Вдоль меридиана",
                "tex": "\\mathbf b^0=\\frac{\\mathbf z^0}{\\cos b}-\\mathbf r^0\\tan b"
            }
        ]
    },
    {
        "id": "first-law-thermodynamics",
        "category": "Газ, излучение и плазма",
        "title": "Первое начало термодинамики",
        "formulas": [
            {
                "label": "Работа совершена газом",
                "tex": "dU=\\delta Q-p\\,dV"
            },
            {
                "label": "Работа газа",
                "tex": "A=\\int p\\,dV"
            },
            {
                "label": "Замкнутый цикл",
                "tex": "\\Delta U_{\\rm cycle}=0,\\qquad A_{\\rm cycle}=Q_{\\rm net}"
            }
        ]
    },
    {
        "id": "heat-engine-efficiency",
        "category": "Газ, излучение и плазма",
        "title": "КПД теплового цикла",
        "formulas": [
            {
                "tex": "\\eta=\\frac{A}{Q_{\\rm hot}}=1-\\frac{Q_{\\rm cold}}{Q_{\\rm hot}}"
            }
        ]
    },
    {
        "id": "particle-current-density",
        "category": "Электричество и магнетизм",
        "title": "Плотность тока потока частиц",
        "formulas": [
            {
                "label": "Через концентрацию и скорость",
                "tex": "\\vec j=nq\\vec v"
            },
            {
                "label": "Через поток частиц ΦN",
                "tex": "j=q\\Phi_N"
            }
        ]
    },
    {
        "id": "radar-equation-scaling",
        "category": "Оптика и наблюдения",
        "title": "Радиолокация: закон четвёртой степени расстояния",
        "formulas": [
            {
                "label": "Моностатический радар",
                "tex": "P_r=\\frac{P_tG^2\\lambda^2\\sigma_{\\rm radar}}{(4\\pi)^3R^4}"
            },
            {
                "label": "При прочих равных",
                "tex": "P_r\\propto\\frac{P_t}{R^4}"
            }
        ]
    }
]


export const blitzFormulaCategories:
    readonly string[] = [
        ...new Set(
            blitzFormulas.map(
                (formula) =>
                    formula.category,
            ),
        ),
    ]
