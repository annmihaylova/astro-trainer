import FlashcardTrainer from '../../components/FlashcardTrainer'
import MessierTrainer from '../../components/MessierTrainer'


function MessierPage() {
    return (
        <section className="nabla-content-page">
            <div className="nabla-intro">
                <h2>Объекты Мессье</h2>
            </div>

            <FlashcardTrainer kind="messier">
                <MessierTrainer />
            </FlashcardTrainer>
        </section>
    )
}


export default MessierPage
