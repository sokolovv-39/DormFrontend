import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { cleanupUserStore } from '../../redux/globalSlice'
import classes from './ProfileBlockComp.module.scss'
import UserIconSVG from './assets/user_icon.svg'
import { cleanupAdminStore } from '../../redux/adminSlice'

export default function ProfileBlockComp() {
    const email = useAppSelector(state => state.globalSlice.userData.email)
    const adminLogin = useAppSelector(state => state.adminSlice.adminLogin)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const userName = /admin/.test(window.location.href)?<p>{adminLogin}</p>:<p>{email?.slice(0,8)}<span className={classes.EmailPostfix}>{email?.slice(8)}</span></p>

    function exit(e: React.MouseEvent) {
        e.preventDefault()
        dispatch(cleanupUserStore())
        dispatch(cleanupAdminStore())
        navigate('/')
    }

    return (
        <div className={classes.Wrapper}>
            <img src={UserIconSVG} alt="user_icon" />
            <div className={classes.EmailExit}>
                {userName}
                <a onClick={(e) => exit(e)}>ВЫЙТИ</a>
            </div>
        </div>
    )
}