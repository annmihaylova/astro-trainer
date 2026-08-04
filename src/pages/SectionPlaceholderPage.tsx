import { Link } from 'react-router'


type SectionPlaceholderPageProps = {
    title: string
    description: string
}


function SectionPlaceholderPage({
    title,
    description,
}: SectionPlaceholderPageProps) {
    return (
        <div className="simple-page">
            <header className="simple-page-header">
                <Link className="brand" to="/">
                    <span
                        aria-hidden="true"
                        className="brand-mark"
                    >
                        ✦
                    </span>

                    <span>Astro Trainer</span>
                </Link>
            </header>

            <main className="simple-page-content">
                <h1>{title}</h1>
                <p>{description}</p>

                <Link
                    className="button button-secondary"
                    to="/"
                >
                    ← Вернуться на главную
                </Link>
            </main>
        </div>
    )
}


export default SectionPlaceholderPage
