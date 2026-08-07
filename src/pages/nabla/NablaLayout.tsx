import { TourLayout } from '../../components/TourSection'
import { nablaSections } from '../../data/nablaSections'

import './nabla-page.css'
import './nabla-cleanup.css'


function NablaLayout() {
    return (
        <TourLayout
            basePath="/nabla"
            sections={nablaSections}
            theme="violet"
            title="Наблюдательный тур"
        />
    )
}


export default NablaLayout
