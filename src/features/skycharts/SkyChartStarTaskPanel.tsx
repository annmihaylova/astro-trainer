import type { ChangeEvent } from 'react'
import type {
    Star,
} from '../../data/stars'
import {
    BAYER_GREEK_LETTERS,
    buildSimpleBayerDesignation,
    parseSimpleBayerDesignation,
} from './bayer'
import type {
    StarMarkerAnswer,
    StarsAnswer,
    StarsTask,
} from './exercise'


type StarMarkerPatch = Partial<Pick<
    StarMarkerAnswer,
    'selectedStarId' | 'selectedDesignation'
>>


type SkyChartStarTaskPanelProps = {
    task: StarsTask
    answer: StarsAnswer
    starDeckById: ReadonlyMap<string, Star>
    editingMarkerId: string | null
    onEditMarker: (marker: StarMarkerAnswer) => void
    onToggleAbsent: (starId: string) => void
    onUpdateMarker: (patch: StarMarkerPatch) => void
    onDeleteMarker: () => void
    onFinishEditing: () => void
}


function SkyChartStarTaskPanel({
    task,
    answer,
    starDeckById,
    editingMarkerId,
    onEditMarker,
    onToggleAbsent,
    onUpdateMarker,
    onDeleteMarker,
    onFinishEditing,
}: SkyChartStarTaskPanelProps) {
    const editingMarker = editingMarkerId
        ? answer.markers.find(
            (marker) => marker.id === editingMarkerId,
        ) ?? null
        : null

    const usedStarIds = new Set(
        answer.markers
            .filter((marker) => marker.id !== editingMarkerId)
            .map((marker) => marker.selectedStarId)
            .filter(Boolean),
    )

    const editingBayer = parseSimpleBayerDesignation(
        editingMarker?.selectedDesignation ?? '',
    )

    return (
        <div className="skychart-task-panel">
            <strong>
                Нажмите на звезду на карте, затем укажите её название
                и обозначение Байера
            </strong>

            {editingMarker && (
                <div className="skychart-star-editor">
                    <div className="skychart-star-editor-header">
                        <strong>Выбранная звезда на карте</strong>
                        <button
                            type="button"
                            onClick={onFinishEditing}
                        >
                            Готово
                        </button>
                    </div>

                    <label>
                        <span>Название звезды</span>
                        <select
                            value={editingMarker.selectedStarId}
                            onChange={(event: ChangeEvent<HTMLSelectElement>) => onUpdateMarker({
                                selectedStarId: event.target.value,
                            })}
                        >
                            <option value="">Выберите</option>
                            {task.starIds.map((starId) => {
                                const deckStar = starDeckById.get(starId)

                                if (!deckStar) {
                                    return null
                                }

                                return (
                                    <option
                                        key={starId}
                                        value={starId}
                                        disabled={usedStarIds.has(starId)}
                                    >
                                        {deckStar.name}
                                    </option>
                                )
                            })}
                        </select>
                    </label>

                    <div className="skychart-bayer-editor">
                        <label>
                            <span>Греческая буква</span>
                            <select
                                value={editingBayer.greekLetter}
                                disabled={!editingMarker.selectedStarId}
                                onChange={(event: ChangeEvent<HTMLSelectElement>) => onUpdateMarker({
                                    selectedDesignation:
                                        buildSimpleBayerDesignation(
                                            event.target.value,
                                            editingBayer.constellation,
                                        ),
                                })}
                            >
                                <option value="">—</option>
                                {BAYER_GREEK_LETTERS.map((letter) => (
                                    <option
                                        key={letter}
                                        value={letter}
                                    >
                                        {letter}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span>Созвездие</span>
                            <input
                                type="text"
                                maxLength={3}
                                placeholder="Ori"
                                autoComplete="off"
                                spellCheck={false}
                                value={editingBayer.constellation}
                                disabled={!editingMarker.selectedStarId}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                    const constellation = event.target.value
                                        .replace(/[^A-Za-z]/gu, '')
                                        .slice(0, 3)

                                    onUpdateMarker({
                                        selectedDesignation:
                                            buildSimpleBayerDesignation(
                                                editingBayer.greekLetter,
                                                constellation,
                                            ),
                                    })
                                }}
                            />
                        </label>
                    </div>

                    <button
                        type="button"
                        className="skychart-delete-marker-button"
                        onClick={onDeleteMarker}
                    >
                        Удалить эту отметку
                    </button>
                </div>
            )}

            {!editingMarker && (
                <p className="skychart-star-instruction">
                    Сначала нажмите на нужную звезду прямо на карте.
                </p>
            )}

            <div className="skychart-star-status-list">
                {task.starIds.map((starId) => {
                    const deckStar = starDeckById.get(starId)

                    if (!deckStar) {
                        return null
                    }

                    const marker = answer.markers.find(
                        (currentMarker) => (
                            currentMarker.selectedStarId === starId
                        ),
                    )
                    const absent = answer.absentStarIds.includes(starId)

                    return (
                        <div
                            className="skychart-star-status-row"
                            key={starId}
                        >
                            <button
                                type="button"
                                className="skychart-star-status-main"
                                disabled={!marker}
                                onClick={() => {
                                    if (marker) {
                                        onEditMarker(marker)
                                    }
                                }}
                            >
                                <span>{deckStar.name}</span>
                                <span>
                                    {marker
                                        ? '✓ отмечено'
                                        : absent
                                            ? 'нет на карте'
                                            : '—'}
                                </span>
                            </button>

                            <button
                                type="button"
                                className={
                                    absent
                                        ? (
                                            'skychart-absent-button '
                                            + 'skychart-absent-button--active'
                                        )
                                        : 'skychart-absent-button'
                                }
                                onClick={() => onToggleAbsent(starId)}
                            >
                                Нет на карте
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


export default SkyChartStarTaskPanel
