import {
    blitzFormulaCategories,
    blitzFormulas,
} from '../data/blitzFormulas'
import MathFormula from './MathFormula'
import './BlitzFormulaTrainer.css'


function BlitzFormulaList() {
    return (
        <section className="blitz-catalog">
            <nav
                aria-label="Разделы списка формул"
                className="blitz-catalog-navigation"
            >
                {blitzFormulaCategories.map(
                    (category, index) => (
                        <a
                            href={
                                '#blitz-formula-section-'
                                + (index + 1)
                            }
                            key={category}
                        >
                            {category}
                        </a>
                    ),
                )}
            </nav>

            <div className="blitz-catalog-sections">
                {blitzFormulaCategories.map(
                    (category, categoryIndex) => {
                        const formulas =
                            blitzFormulas.filter(
                                (formula) =>
                                    formula.category
                                    === category,
                            )

                        return (
                            <section
                                className="blitz-catalog-section"
                                id={
                                    'blitz-formula-section-'
                                    + (categoryIndex + 1)
                                }
                                key={category}
                            >
                                <header className="blitz-catalog-section-header">
                                    <div>
                                        <span>
                                            {
                                                String(
                                                    categoryIndex + 1,
                                                ).padStart(
                                                    2,
                                                    '0',
                                                )
                                            }
                                        </span>

                                        <h3>
                                            {category}
                                        </h3>
                                    </div>

                                    <p>
                                        {formulas.length}
                                        {' '}
                                        карточек
                                    </p>
                                </header>

                                <div className="blitz-catalog-items">
                                    {formulas.map(
                                        (formula) => (
                                            <article
                                                className="blitz-catalog-item"
                                                key={formula.id}
                                            >
                                                <h4>
                                                    {formula.title}
                                                </h4>

                                                <div className="blitz-formula-list blitz-formula-list--catalog">
                                                    {formula.formulas.map(
                                                        (
                                                            formulaLine,
                                                            index,
                                                        ) => (
                                                            <div
                                                                className="blitz-formula-panel"
                                                                key={
                                                                    formula.id
                                                                    + '-catalog-'
                                                                    + index
                                                                }
                                                            >
                                                                {formulaLine.label ? (
                                                                    <p className="blitz-formula-label">
                                                                        {
                                                                            formulaLine.label
                                                                        }
                                                                    </p>
                                                                ) : null}

                                                                <MathFormula
                                                                    tex={
                                                                        formulaLine.tex
                                                                    }
                                                                />
                                                            </div>
                                                        ),
                                                    )}
                                                </div>

                                                {formula.note ? (
                                                    <p className="blitz-formula-note">
                                                        {formula.note}
                                                    </p>
                                                ) : null}

                                                {formula.details ? (
                                                    <ul className="blitz-formula-details">
                                                        {formula.details.map(
                                                            (detail) => (
                                                                <li key={detail}>
                                                                    {detail}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                ) : null}
                                            </article>
                                        ),
                                    )}
                                </div>
                            </section>
                        )
                    },
                )}
            </div>
        </section>
    )
}


export default BlitzFormulaList
