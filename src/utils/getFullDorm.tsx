export function getDormFullname(dorm:string, isVerbose: boolean): JSX.Element {
    let verbose = null
    switch (dorm) {
        case 'М-1':
            verbose = <span>(студенческий городок &#171;Металлург&#187;)</span>
            return <p>Металлург-1 {isVerbose?verbose:null}</p>
        case 'М-2':
            verbose = <span>(студенческий городок &#171;Металлург&#187;)</span>
           return <p>Металлург-2 {isVerbose?verbose:null}</p>
        case 'М-3':
            verbose = <span>(студенческий городок &#171;Металлург&#187;)</span>
            return <p>Металлург-3 {isVerbose?verbose:null}</p>
        case 'М-4':
            verbose = <span>(студенческий городок &#171;Металлург&#187;)</span>
           return <p>Металлург-4 {isVerbose?verbose:null}</p>
        case 'Г-1':
            verbose = <span>(студенческий городок &#171;Горняк&#187;)</span>
            return <p>Горняк-1 {isVerbose?verbose:null}</p>
        case 'Г-2':
            verbose = <span>(студенческий городок &#171;Горняк&#187;)</span>
            return <p>Горняк-2 {isVerbose?verbose:null}</p>
        case 'ДСГ-5,6':
            verbose = <span>(Дорогомиловский студенческий городок)</span>
            return <p>ДСГ-5,6 {isVerbose?verbose:null}</p>
        case 'ДК':
            return <p>Дом-коммуна</p>
        default:
            return <></>
    }
}