import { useEffect, useRef, useState } from 'react';
import classes from './CalendarComp.module.scss'
import CalendarSVG from './assets/Calendar.svg'
import { useAppDispatch, useAppSelector } from '../../hooks';
import { hideCalendar, selectDate, selectTime, showCalendar, showPopup } from '../../redux/globalSlice';

export default function CalendarComp() {
    const selectedDate = useAppSelector(state => state.globalSlice.userData.dateSelected)
    const isShowCalendar = useAppSelector(state => state.globalSlice.serviceData.isShowCalendar)
    const dispatch = useAppDispatch()
    const activeDate = useRef<HTMLDivElement | null>(null)

    const numberClass = `${classes.Numbers}`
    const selectedNumberClass = numberClass + ` ${classes.Selected}`
    const unavaliableNumberClass = numberClass + ` ${classes.Unavaliable}`

    const calendarDates: JSX.Element[] = []
    for (let i = 0; i <= 41; i++) {
        if (i <= 6) {
            switch (i) {
                case 0:
                    calendarDates.push(<>пн</>)
                    break;
                case 1:
                    calendarDates.push(<>вт</>)
                    break;
                case 2:
                    calendarDates.push(<>ср</>)
                    break
                case 3:
                    calendarDates.push(<>чт</>)
                    break
                case 4:
                    calendarDates.push(<>пт</>)
                    break;
                case 5:
                    calendarDates.push(<>сб</>)
                    break;
                case 6:
                    calendarDates.push(<>вс</>)
                    break
            }
        }
        else {
            if (i === 7 || i === 39 || i === 40 || i === 41) calendarDates.push(<></>)
            else calendarDates.push(<>{i - 7}</>)
        }
    }

    function checkDate(e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) {
        if (index <= 7) return
        else if (index <= 31) {
            dispatch(showPopup({ event: e, isShow: true, type: 'checkInPopup' }))
        }
        else if (index>=39) return
        else {
            dispatch(selectTime(null))
            if (activeDate.current) activeDate.current.classList.remove(`${classes.Selected}`)
            activeDate.current = e.currentTarget
            activeDate.current.classList.add(`${classes.Selected}`)
            const dayN = index % 7
            let weekDay = undefined
            switch (dayN) {
                case 0:
                    weekDay = 'пн'
                    break;
                case 1:
                    weekDay = 'вт'
                    break;
                case 2:
                    weekDay = 'ср'
                    break;
                case 3:
                    weekDay = 'чт'
                    break;
                case 4:
                    weekDay = 'пт'
                    break;
                case 5:
                    weekDay = 'сб'
                    break;
                case 6:
                    weekDay = 'вс'
                    break;
            }
            dispatch(selectDate(`${index - 7} августа, ${weekDay}`))
        }
    }

    return (
        <div className={`${classes.Wrapper}`}>
            <div className={`${classes.CalendarPreview}`} onClick={(e) => isShowCalendar ? dispatch(hideCalendar()) : dispatch(showCalendar({ event: e }))}>
                <p>{selectedDate}</p>
                <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 3V1M13 3V5M13 3H8.5M1 9V18C1 18.5304 1.21071 19.0391 1.58579 19.4142C1.96086 19.7893 2.46957 20 3 20H17C17.5304 20 18.0391 19.7893 18.4142 19.4142C18.7893 19.0391 19 18.5304 19 18V9M1 9H19M1 9V5C1 4.46957 1.21071 3.96086 1.58579 3.58579C1.96086 3.21071 2.46957 3 3 3H5M19 9V5C19 4.46957 18.7893 3.96086 18.4142 3.58579C18.0391 3.21071 17.5304 3 17 3H16.5M5 1V5" stroke="#2C3E50" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            {
                isShowCalendar && <div className={`${classes.FullCalendar}`} onClick={(e) => dispatch(showCalendar({ event: e }))}>
                    <h6 className={classes.Month}>АВГУСТ <span>2023</span></h6>
                    <div className={classes.Calendar}>
                        {calendarDates.map((el, index) => {
                            return (
                                <div key={index} className={index <= 7 ? classes.Weekdays : (index <= 31 ? unavaliableNumberClass : (index === parseInt(selectedDate) + 7 ? selectedNumberClass : numberClass))}
                                    onClick={(e) => checkDate(e, index)} ref={index === 32 ? activeDate : null}
                                    style={{
                                        cursor:index>=39?'auto':''
                                    }}>
                                        {el}
                                </div>
                            )
                        })}
                    </div>
                </div>
            }
        </div >
    )
}