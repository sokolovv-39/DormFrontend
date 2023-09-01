import { axiosRequest } from '../../configs/axiosConfig'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { changeBusyTime, changeUsersData } from '../../redux/adminSlice'
import { changeOnline, showNotify } from '../../redux/globalSlice'
import { requestErrorHandler } from '../../utils/requestErrorsHandler'
import classes from './NotifyComp.module.scss'
import { ReactComponent as WhiteSpinner } from '../../assets/white_spinner.svg'
import { useState } from 'react'

type PropsType = {
    type: 'CreateEnroll' | 'UpdateEnroll' | 'DeleteEnroll' | 'DeleteEnrollCompleted' |'TimeBusy'|'None'
}

export default function NotifyComp({ type }: PropsType) {
    const dispatch = useAppDispatch()
    const deletingUser = useAppSelector(state => state.adminSlice.deletingUser)
    const dateSelected = useAppSelector(state => state.globalSlice.userData.dateSelected)
    const dormSelected = useAppSelector(state => state.adminSlice.checkedDorm)
    const token = useAppSelector(state => state.adminSlice.token)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    let message = null
    switch (type) {
        
        case 'CreateEnroll':
            message = <h3>Запись создана &#9989;</h3>
            break;
        case 'UpdateEnroll':
            message = <h3>Запись обновлена &#9989;</h3>
            break;
        case 'DeleteEnroll':
            message = <h3>Вы удаляете запись студента. Он все еще сможет самостоятельно записаться. Продолжить?</h3>
            break;
        case 'DeleteEnrollCompleted':
            message = <h3>Запись удалена &#9989;</h3>
            break;
        case 'TimeBusy':
            message = <h3>Упс! Пока вы думали, кто то уже записался на это время &#128530; Обновили данные</h3>
    }

    function deleteEnroll() {
        dispatch(changeOnline(true))
        setIsLoading(true)
        axiosRequest.delete('/admin/delete-record', {
            data: {
                email: deletingUser.email
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(() => {
            setIsLoading(false)
            dispatch(changeUsersData({
                mode: 'delete',
                deletingUser,
                deletingDorm: dormSelected
            }))
            dispatch(changeBusyTime({
                mode: 'delete',
                dorm: dormSelected,
                deleteDateTime: `${parseInt(dateSelected)}.08.2023, ${deletingUser.recordDatetime}:00`
            }))
            dispatch(showNotify({
                isShow: true,
                type: 'DeleteEnrollCompleted'
            }))
        }).catch(err => {
            if (err.code==='ERR_NETWORK') dispatch(changeOnline(false))
            setIsLoading(false)
            requestErrorHandler(err)
        })
    }

    return (
        <div className={classes.Wrapper} onClick={(e) => dispatch(showNotify({
            isShow: true,
            type,
            event: e
        }))}>
            {message}
            {type === 'DeleteEnroll' &&
                <div className={classes.Buttons}>
                    <button className={`${classes.YesBtn} DefaultButton_1`} onClick={deleteEnroll}>{isLoading ? <WhiteSpinner /> : 'Да'}</button>
                    <button className={`${classes.NoBtn} DefaultButton_1`} onClick={(e) => dispatch(showNotify({
                        isShow: false,
                        type: 'None',
                        event: e
                    }))}>Отменить</button>
                </div>
            }
        </div>
    )
}