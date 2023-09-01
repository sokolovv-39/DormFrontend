import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector, useCPDateTime } from '../../hooks'
import classes from './ControlPanelComp.module.scss'
import { changeOnline, changeStudTimesLoad, saveUserData, selectTime, setFaculty, showNotify, switchStep } from '../../redux/globalSlice'
import axios from 'axios'
import { useState } from 'react'
import { ReactComponent as Spinner } from '../../assets/white_spinner.svg'
import { ReactComponent as BlueSpinner } from '../../assets/blue_spinner.svg'
import {ReactComponent as WhiteSpinner} from '../../assets/white_spinner.svg'
import { requestErrorHandler } from '../../utils/requestErrorsHandler'
import { axiosRequest } from '../../configs/axiosConfig'

export default function ControlPanelComp() {
    const [dateTime, date, time] = useCPDateTime()
    const navigate = useNavigate()
    const isEnrollmentPage = /enrollment/.test(window.location.href)
    const dispatch = useAppDispatch()
    const email = useAppSelector(state => state.globalSlice.userData.email)
    const token = useAppSelector(state => state.globalSlice.userData.token)
    const [isLoadingNekst, setIsLoadingNekst] = useState<boolean>(false)
    const [isLoadingBack, setIsLoadingBack] = useState<boolean>(false)
    const timeSelected = useAppSelector(state => state.globalSlice.userData.timeSelected)
    const [isBackBtnHover,setIsBackBtnHover] = useState<boolean>(false)

    const timeSummary = <p className={classes.TimeSummary}>{dateTime ? dateTime : 'Выберите время'}</p>
    const backButton = <button className={`DefaultButton_2 ${classes.BackButton}`} onClick={() => {
        dispatch(changeOnline(true))
        setIsLoadingBack(true)
        axiosRequest.put('/free-time', {
            email
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then((res) => {
            setIsLoadingBack(false)
            dispatch(saveUserData(res.data))
            dispatch(switchStep(1))
            navigate('/enrollment')
        }).catch(err => {
            if (err.code==='ERR_NETWORK') dispatch(changeOnline(false))
            setIsLoadingBack(false)
            requestErrorHandler(err)
        })
    }} onMouseEnter={()=>setIsBackBtnHover(true)} onMouseLeave={()=>setIsBackBtnHover(false)}>{isLoadingBack ? (isBackBtnHover?<WhiteSpinner/>:<BlueSpinner/>) : 'Назад'}</button>

    function switchPage(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        dispatch(changeOnline(true))
        if (!time) return
        setIsLoadingNekst(true)
        if (isEnrollmentPage) {
            const recordDatetime = `2023-08-${date}T${time}:00`
            axiosRequest.post('/take-time', {
                email,
                recordDatetime
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(({ data }) => {
                setIsLoadingNekst(false)
                dispatch(setFaculty(data.faculty))
                navigate('/confirmation')
                dispatch(switchStep(2))
            }).catch(err => {
                if(err.response?.status===400) {
                    dispatch(changeStudTimesLoad(true))
                    dispatch(showNotify({
                    isShow: true,
                    type: 'TimeBusy'
                }))
                axiosRequest.post('/start-recording', {
                    email
                },{
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).then(({data})=>{
                    dispatch(changeStudTimesLoad(false))
                    dispatch(saveUserData(data))
                }).catch(err=>{
                    dispatch(changeStudTimesLoad(false))
                    if (err.code==='ERR_NETWORK') dispatch(changeOnline(false))
                        requestErrorHandler(err)
                })
            }
                if (err.code==='ERR_NETWORK') dispatch(changeOnline(false))
                setIsLoadingNekst(false)
                requestErrorHandler(err)
            })
        }
        else {
            axiosRequest.post('/confirm-mail', {
                email
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(() => {
                setIsLoadingNekst(false)
                navigate('/registered')
                dispatch(switchStep(3))
            }).catch(err => {
                if (err.code==='ERR_NETWORK') dispatch(changeOnline(false))
                setIsLoadingNekst(false)
                requestErrorHandler(err)
            })
        }
    }

    return (
        <div className={classes.Wrapper}>
            {isEnrollmentPage ? timeSummary : backButton}
            <button type="button" onClick={(e) => switchPage(e)} className={timeSelected ? 'DefaultButton_1' : 'DisabledButton'} style={{
                width: isEnrollmentPage ? '104px' : '143px',
                cursor: timeSelected ? 'pointer' : 'auto'
            }}>{isLoadingNekst ? <Spinner /> : isEnrollmentPage ? "Далее" : "Подтвердить"}</button>
        </div>
    )
}