import { useAppSelector } from '../../hooks'
import { getFullWeekday } from '../../utils/getFullWeekday'
import classes from './FinalPage.module.scss'
import CalendarSVG from './assets/CalendarBlack.svg'
import LocationSVG from './assets/Location.svg'
import ClockSVG from './assets/Clock.svg'
import DocsSVG from './assets/Docs.svg'
import PhoneSVG from './assets/Phone.svg'
import { getDormFullname } from '../../utils/getFullDorm'
import TechSupportComp from '../../components/TechSupportComp/TechSupportComp'

export default function FinalPage() {
    const dateSelected = useAppSelector(state => state.globalSlice.userData.dateSelected)
    const timeSelected = useAppSelector(state => state.globalSlice.userData.timeSelected)
    const contacts = useAppSelector(state=>state.globalSlice.userData.contacts)
    const dormitory = useAppSelector(state=>state.globalSlice.userData.dormitory)

    return (
        <div className={classes.Wrapper}>
            <h1>Поздравляем с завершением регистрации на заселение в общежитие!</h1>
            <div className={classes.GridContainer}>
                <div className={classes.GridEl}>
                    <img src={CalendarSVG} />
                    <p>{`${dateSelected.slice(0, dateSelected.length - 4)}, ${getFullWeekday(dateSelected.slice(-2))?.toLocaleLowerCase()}`}</p>
                </div>
                <div className={classes.GridEl}>
                    <img src={PhoneSVG} />
                    <div>
                        <a href={`tel:${contacts[0]?.phone}`} style={{
                            textDecoration: 'none',
                            color: '#000000'
                        }}>{contacts[0]?.phone}</a>
                        <p className={classes.Notes}>{`${contacts[0]?.position}, ${contacts[0]?.fullname}`}</p>
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
                        <p>{getDormFullname(dormitory.name as string,true)}</p>
                        <p className={`${classes.Notes} ${classes.DormAddress}`}>{dormitory.address}</p>
                    </div>
                </div>
                <div className={`${classes.LastEl} ${classes.Notes}`}>
                    <p>На вашу корпоративную почту придет письмо с данной информацией</p>
                    <p>Подробнее о заселении в общежитие можете узнать на <a href="https://misis.ru/applicants/accommodation/" target='_blank'>сайте</a></p>
                </div>
            </div>
            <div className={classes.SupportWrapper}>
            <TechSupportComp/>
            </div>
        </div>
    )
}