import MisisLogoSVG from './assets/MISIS_logo.svg'
import BlackLogoSVG from './assets/LogoBlack.svg'
import classes from './HeaderLogoComp.module.scss'

export default function HeaderLogoComp() {
const isRegistered= /registered/.test(window.location.href)

function logoClick() {
    window.open('https://misis.ru/', '_blank')
}

    return (
        <div className={classes.Header}>
            {!isRegistered&&
                <img src={MisisLogoSVG} alt='MISIS_logo' onClick={logoClick} style={{cursor: 'pointer'}}/>
            }
            {isRegistered&&
            <img src={BlackLogoSVG} alt='MISIS_logo' onClick={logoClick} style={{cursor: 'pointer'}}/>
            }
        </div>
    )
}