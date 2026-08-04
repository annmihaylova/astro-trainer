import FlashcardTrainer from '../../components/FlashcardTrainer'
import StarsTrainer from '../../components/StarsTrainer'


function StarsPage() {
    return (
        <section className="nabla-content-page">
            <div className="nabla-intro">
                <h2>Звёзды</h2>
            </div>

            <FlashcardTrainer kind="stars">
                <StarsTrainer />
            </FlashcardTrainer>
        </section>
    )
}


export default StarsPage
