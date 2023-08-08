import { useAppSelector } from '../../hooks'
import { getFullWeekday } from '../../utils/getFullWeekday'
import classes from './FinalPage.module.scss'
import CalendarSVG from './assets/CalendarBlack.svg'
import LocationSVG from './assets/Location.svg'
import ClockSVG from './assets/Clock.svg'
import DocsSVG from './assets/Docs.svg'
import PhoneSVG from './assets/Phone.svg'
import { useRef } from 'react'

export default function FinalPage() {
    const dateSelected = useAppSelector(state => state.globalSlice.userData.dateSelected)
    const timeSelected = useAppSelector(state => state.globalSlice.userData.timeSelected)

    return (
        <div className={classes.Wrapper}>
            <h1>Поздравляем с завершением регистрации на заселениев общежитие!</h1>
            <div className={classes.GridContainer}>
                <div className={classes.GridEl}>
                    <img src={CalendarSVG} />
                    <p>{`${dateSelected.slice(0, dateSelected.length - 4)}, ${getFullWeekday(dateSelected.slice(-2))?.toLocaleLowerCase()}`}</p>
                </div>
                <div className={classes.GridEl}>
                    <img src={PhoneSVG} />
                    <div>
                        <a href="tel:+7 950 654 20 20" style={{
                            textDecoration: 'none',
                            color: '#000000'
                        }}>+7 950 654 20 20</a>
                        <p className={classes.Notes}>Администратор М-3, Айвазова Инга Рубеновна</p>
                    </div>
                </div>
                <div className={classes.GridEl}>
                    <img src={ClockSVG} />
                    <p>{timeSelected}</p>
                </div>
                <div className={classes.GridEl}>
                    <img src={DocsSVG} />
                    <p>Не забудьте <a href="https://misis.ru/applicants/accommodation/zaselenievobsh_ezhitiepervokusn/neobhodimyedokumenty/" target='_blank' style={{ color: '#000000' }}>необходимые документы</a></p>
                </div>
                <div className={classes.GridEl}>
                    <img src={LocationSVG} style={{ alignSelf: 'flex-start' }} />
                    <div>
                        <p>Студгородок &#171;Металлург&#187; &#40;Корпус 3&#41;</p>
                        <p className={classes.Notes}>Москва, улица Профсоюзная, д. 83, корпуса 1,2,3</p>
                        <p className={classes.Notes}>&#40;станция метро Беляево&#41;</p>
                    </div>
                </div>
                <div className={`${classes.LastEl} ${classes.Notes}`}>
                    <p>На вашу корпоративную почту придет письмо с данной информацией</p>
                    <p>Подробнее о заселении в общежитие можете узнать на <a href="https://misis.ru/applicants/accommodation/" target='_blank'>сайте</a></p>
                </div>
            </div>
        </div>
    )
}