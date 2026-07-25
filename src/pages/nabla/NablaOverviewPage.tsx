import { Link } from 'react-router'
import { nablaSections } from '../../data/nablaSections'

function NablaOverviewPage() {
    return (
        <section className="nabla-overview">
            <div className="nabla-intro">
                <p className="module-kicker">Подразделы</p>
                <h2>Выбери режим подготовки</h2>
                <p>
                    Карточки предназначены для регулярного повторения, теория —
                    для быстрого восстановления материала, а скайчарты — для
                    практической тренировки.
                </p>
            </div>

            <div className="nabla-grid">
                {nablaSections.map((section) => (
                    <Link
                        className="nabla-module-card"
                        key={section.path}
                        to={section.path}
                    >
                        <div className="nabla-module-top">
                            <span>{section.number}</span>
                            <span>{section.type}</span>
                        </div>

                        <h3>{section.title}</h3>
                        <p>{section.description}</p>

                        <span className="nabla-module-arrow">
                            Открыть →
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    )
}

export default NablaOverviewPage