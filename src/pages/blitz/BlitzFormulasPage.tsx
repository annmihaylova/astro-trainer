import {
    useState,
} from 'react'

import BlitzFormulaList from '../../components/BlitzFormulaList'
import BlitzFormulaTrainer from '../../components/BlitzFormulaTrainer'


type FormulaView =
    | 'cards'
    | 'list'


const VIEW_STORAGE_KEY =
    'astro-trainer:blitz-formula-view:v1'


function loadView(): FormulaView {
    try {
        return localStorage.getItem(
            VIEW_STORAGE_KEY,
        ) === 'list'
            ? 'list'
            : 'cards'
    } catch {
        return 'cards'
    }
}


function BlitzFormulasPage() {
    const [view, setView] =
        useState<FormulaView>(
            loadView,
        )


    function changeView(
        nextView: FormulaView,
    ) {
        setView(nextView)

        try {
            localStorage.setItem(
                VIEW_STORAGE_KEY,
                nextView,
            )
        } catch {
            // Вид всё равно переключится.
        }
    }


    return (
        <section className="blitz-content-page">
            <div className="blitz-intro blitz-formulas-heading">
                <h2>Формулы</h2>

                <div
                    aria-label="Режим просмотра формул"
                    className="blitz-formula-view-switch"
                    role="group"
                >
                    <button
                        aria-pressed={
                            view === 'cards'
                        }
                        className={
                            view === 'cards'
                                ? (
                                    'blitz-formula-view-button '
                                    + 'blitz-formula-view-button--active'
                                )
                                : 'blitz-formula-view-button'
                        }
                        onClick={() => {
                            changeView('cards')
                        }}
                        type="button"
                    >
                        Карточки
                    </button>

                    <button
                        aria-pressed={
                            view === 'list'
                        }
                        className={
                            view === 'list'
                                ? (
                                    'blitz-formula-view-button '
                                    + 'blitz-formula-view-button--active'
                                )
                                : 'blitz-formula-view-button'
                        }
                        onClick={() => {
                            changeView('list')
                        }}
                        type="button"
                    >
                        Все формулы
                    </button>
                </div>
            </div>

            {view === 'cards' ? (
                <BlitzFormulaTrainer />
            ) : (
                <BlitzFormulaList />
            )}
        </section>
    )
}


export default BlitzFormulasPage
