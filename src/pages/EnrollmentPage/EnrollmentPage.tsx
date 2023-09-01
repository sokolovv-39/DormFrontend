import CalendarComp from '../../components/CalendarComp/CalendarComp'
import classes from './EnrollmentPage.module.scss'
import DormDescriptionComp from '../../components/DormDescription/DormDescriptionComp'
import { useEffect, useState, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { selectTime, showPopup } from '../../redux/globalSlice'
import {ReactComponent as BigSpinner} from './assets/BigSpinner.svg'

export default function EnrollmentPage() {
    const selectedTime = useRef<HTMLDivElement | null>(null)
    const registeredTime = useAppSelector(state => state.globalSlice.userData.timeSelected)
    const selectedDate = useAppSelector(state => state.globalSlice.userData.dateSelected)
    const freeTimesObj = useAppSelector(state => state.globalSlice.userData.freeTimes)
    const [timesArr, setTimesArr] = useState<Array<{
        time: string,
        isBusy: boolean
    }>>([])
    const dispatch = useAppDispatch()
    const isShowCheckIn = useAppSelector(state => state.globalSlice.serviceData.isCheckInPopup)
    const isBusyWarning = useAppSelector(state => state.globalSlice.serviceData.isBusyWarning)
    const isStudTimesLoad = useAppSelector(state=>state.globalSlice.serviceData.isStudTimesLoad)

    function checkTime(e: React.MouseEvent<HTMLDivElement, MouseEvent>, { time, isBusy }: {
        time: string,
        isBusy: boolean
    }) {
        if (isBusy) {
            dispatch(showPopup({
                event: e,
                isShow: true,
                type: 'busyWarning'
            }))
            return
        }
        if (selectedTime.current) selectedTime.current.classList.remove(`${classes.SelectedTime}`)
        if (e.currentTarget == selectedTime.current) {
            selectedTime.current = null
            dispatch(selectTime(null))
        }
        else {
            e.currentTarget.classList.add(`${classes.SelectedTime}`)
            selectedTime.current = e.currentTarget
            dispatch(selectTime(time))
        }
    }

    useEffect(() => {
        const date = selectedDate.substring(0, 2)
        setTimesArr(freeTimesObj[date])
    }, [selectedDate,freeTimesObj])

    useEffect(() => {
        if (selectedTime.current) {
            selectedTime.current.classList.remove(`${classes.SelectedTime}`)
            selectedTime.current = null
        }
    }, [selectedDate,freeTimesObj])

    return (
        <div className={classes.GridContainer}>
            <div className={classes.EnrollBlock}>
                <h1 className={classes.Title}>Выберите день и время регистрации на заселение</h1>
                <CalendarComp />
                {!isStudTimesLoad&&
                 <div className={classes.TimesBlock}>
                 <>
                     {timesArr.map(obj => {
                         return (
                             <div key={obj.time} className={obj.isBusy ? `${classes.BusyTime}` : registeredTime === obj.time ? `${classes.SelectedTime}` : `${classes.FreeTime}`} onClick={(e) => checkTime(e, obj)}>{obj.time}</div>
                         )
                     })}
                 </>
             </div>
                }
                {isStudTimesLoad&&
              <BigSpinner/>
                }
            </div>
            <DormDescriptionComp />
            {isShowCheckIn &&
                <div className={classes.Warning} onClick={(e) => dispatch(showPopup({ event: e, isShow: true, type: 'checkInPopup' }))}>
                    <h3>Заселение длится с 25 по 31 августа &#128521;</h3>
                </div>
            }
            {isBusyWarning &&
                <div className={classes.Warning} onClick={(e) => dispatch(showPopup({
                    event: e,
                    isShow: true,
                    type: 'busyWarning'
                }))}>
                    <h3>Это время уже занято &#128530;</h3>
                </div>
            }
        </div >
    )
}