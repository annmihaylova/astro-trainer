import fs from 'node:fs'

const path = 'src/pages/nabla/SkyChartsPage.tsx'

function fail(message) {
    throw new Error(
        message
        + '\nНичего больше не меняй и пришли мне вывод этой ошибки.',
    )
}

let text = fs.readFileSync(path, 'utf8')

// 1. После новой системы слоёв этот тип больше не нужен прямо в Page.
text = text.replace(
`import type {
    SkyChartMarker,
} from '../../features/skycharts/SkyChartSvg'
`,
'',
)

// 2. Дособираем answerMarkers: теперь они строятся из ВСЕХ заданий,
// а не только из activeAnswer.
const answerStart = text.indexOf(
    '    const answerMarkers = useMemo',
)
const pointSelectionStart = text.indexOf(
    '    const pointSelectionEnabled = (',
    answerStart,
)

if (answerStart < 0 || pointSelectionStart < 0) {
    fail('Не удалось найти блок answerMarkers.')
}

const answerBlock = `    const answerMarkers = useMemo(() => (
        session && activeTask
            ? buildSkyChartAnswerMarkers({
                session,
                activeTask,
                projectedStarsById,
                starDeckById,
            })
            : []
    ), [
        activeTask,
        projectedStarsById,
        session,
        starDeckById,
    ])

`

text = (
    text.slice(0, answerStart)
    + answerBlock
    + text.slice(pointSelectionStart)
)

// 3. Полностью меняем старый неудобный UI звёзд на новый:
// клик -> имя -> буква Байера -> созвездие.
const renderStart = text.indexOf(
    '    function renderTaskPanel()',
)
const starStart = text.indexOf(
`        if (
            activeTask.kind === 'stars'`,
    renderStart,
)
const messierStart = text.indexOf(
`        if (
            activeTask.kind === 'messier'`,
    starStart,
)

if (renderStart < 0 || starStart < 0 || messierStart < 0) {
    fail('Не удалось найти старый блок задания со звёздами.')
}

const starBlock = `        if (
            activeTask.kind === 'stars'
            && activeAnswer.kind === 'stars'
        ) {
            return (
                <SkyChartStarTaskPanel
                    task={activeTask}
                    answer={activeAnswer}
                    starDeckById={starDeckById}
                    editingMarkerId={editingStarMarkerId}
                    onEditMarker={(marker) => {
                        setEditingStarMarkerId(marker.id)
                        setSelectedStarId(marker.catalogStarId)
                    }}
                    onToggleAbsent={toggleStarAbsent}
                    onUpdateMarker={updateEditingStarMarker}
                    onDeleteMarker={deleteEditingStarMarker}
                    onFinishEditing={finishEditingStarMarker}
                />
            )
        }

`

text = (
    text.slice(0, starStart)
    + starBlock
    + text.slice(messierStart)
)

// 4. Астеризмы больше не исчезают при смене задания.
if (text.includes('lines={shownLines}')) {
    text = text.replace(
        '                                lines={shownLines}',
`                                lines={lines}
                                linesActive={
                                    activeTask?.kind === 'asterisms'
                                }`,
    )
} else if (!text.includes('linesActive=')) {
    fail('Не удалось найти lines={shownLines}.')
}

// 5. Обновляем подсказку, если старый текст ещё остался.
text = text.replace(
`                                Переключайте задания слева. Ответы каждого задания
                                сохраняются отдельно и не исчезают при переключении.
                                Точки и объекты ставятся обычным кликом по карте,
                                звёзды привязываются к ближайшему кликабельному маркеру,
                                а в задании на астеризмы работает прежнее рисование линий.`,
`                                Переключайте задания слева. Всё уже нанесённое остаётся
                                на общей карте: активный слой показывается полностью,
                                остальные — полупрозрачно. Точки и объекты ставятся
                                обычным кликом, звёзды привязываются к ближайшей
                                кликабельной звезде, а астеризмы рисуются линиями.`,
)

fs.writeFileSync(path, text, 'utf8')

console.log('SkyChartsPage.tsx repaired.')
console.log('Теперь запусти: npm run build')
