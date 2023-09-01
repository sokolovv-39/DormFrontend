import { useRef, useState } from 'react';
import classes from './LoginComp.module.scss'
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { changeOnline, saveUserBasics, saveUserData, showEmployeeLogin, switchStep } from '../../redux/globalSlice';
import { ReactComponent as Spinner } from '../../assets/white_spinner.svg'
import { requestErrorHandler } from '../../utils/requestErrorsHandler';
import { axiosRequest } from '../../configs/axiosConfig';

export default function LoginComp() {
    const navigate = useNavigate()
    const [isStudActive, setIsStudActive] = useState(false)
    const dispatch = useAppDispatch()
    const [isCodeInput, setIsCodeInput] = useState(false)
    const [noEntry, setNoEntry] = useState(false)
    const [isActiveCode, setIsActiveCode] = useState(false)
    const userEmail = useRef('')
    const [isLoading, setIsLoading] = useState(false)
    const [isWrongCode, setIsWrongCode] = useState<boolean>(false)
    const [codeResendTimer,setCodeResendTimer] = useState<number>(60)
    const [resendCodeLoad,setResendCodeLoad] = useState<boolean>(false)
    const [isWait,setIsWait] = useState<boolean>(false)

    function validateInputs(e: React.ChangeEvent<HTMLInputElement>) {
        if (/^m\d{7}(@edu\.misis\.ru)?$/.test(e.currentTarget.value)) {
            setIsStudActive(true)
        }
        else setIsStudActive(false)
    }

    function sendEmail(e: React.FormEvent<HTMLFormElement>) {
        if (!isStudActive || isLoading) return
        else {
            e.preventDefault()
            dispatch(changeOnline(true))
        setNoEntry(false)
        setIsLoading(true)
            let email = (new FormData(e.currentTarget)).get('email') as string
            if (!/@/.test(email)) email += '@edu.misis.ru'
            axiosRequest.post('/auth/send-code', {
                email
            }).then(() => {
                setIsLoading(false)
                setIsCodeInput(true)
                userEmail.current = email
                codeTimer()
            }).catch(err => {
                if (err.code==='ERR_NETWORK') dispatch(changeOnline(false))
                setIsLoading(false)
                if (err.response) {
                    setIsCodeInput(false)
                    setNoEntry(true)
                }
                requestErrorHandler(err)
            })
        }
    }

    function sendCode(e: React.FormEvent<HTMLFormElement>) {
        dispatch(changeOnline(true))
        setIsWrongCode(false)
        setIsLoading(true)
        e.preventDefault()
        if (!isActiveCode || isLoading) return
        else {
            axiosRequest.post('/auth/login-user', {
                email: userEmail.current,
                code: (new FormData(e.currentTarget)).get('code')
            })
                .then(res => {
                    dispatch(saveUserBasics({
                        email: userEmail,
                        token: res.data.access_token
                    }))
                    axiosRequest.post('/start-recording', {
                        email: userEmail.current
                    }, {
                        headers: {
                            'Authorization': `Bearer ${res.data.access_token}`
                        }
                    }).then(res => {
                        setIsLoading(false)
                        dispatch(saveUserData(res.data))
                        if (res.data.takenTime) {
                            navigate('/enrollment')
                        }
                        else {
                            dispatch(switchStep(3))
                            navigate('/registered')
                        }
                    }).catch(err => {
                        if (err.code==='ERR_NETWORK') dispatch(changeOnline(false))
                        setIsLoading(false)
                        requestErrorHandler(err)
                    })
                }).catch(err => {
                    if (err.code==='ERR_NETWORK') dispatch(changeOnline(false))
                    setIsLoading(false)
                    if (err.response) {
                        setIsWrongCode(true)
                    }
                    requestErrorHandler(err)
                })
        }
    }

function resendCode(isFakeClick:boolean) {
    setResendCodeLoad(true)
    axiosRequest.post('/auth/send-code',{
        email: userEmail.current
    }).then(()=>{
setResendCodeLoad(false)
codeTimer()
    }).catch(err=>{
        setResendCodeLoad(false)
        if (err.code==='ERR_NETWORK') dispatch(changeOnline(false))
        requestErrorHandler(err)
    })
}

function codeTimer() {
    setIsWait(true)
let count = 0
let timerID = setInterval(()=>{
    count++
    setCodeResendTimer(codeResendTimer-count)
},1000)
setTimeout(()=>{
clearInterval(timerID)
setIsWait(false)
setCodeResendTimer(60)
},60000)
}

    return (
        <div className={classes.Wrapper}>
            <h1>Регистрация на заселение в общежитие</h1>
            <p className={classes.EmailInput}>Введите вашу корпоративную почту</p>
            <form className={classes.FormControls} onSubmit={(e) => { sendEmail(e) }}>
                <div className={classes.InputWrapper}>
                    <input type="text" placeholder='m2300000' name='email' required onChange={(e) => validateInputs(e)} />
                    <div className={classes.InputHint}><span>@edu.misis.ru</span></div>
                </div>
                {noEntry &&
                    <p className={classes.NoEntry}>Введенный адрес почты не найден. Проверьте и попробуйте снова или обратитесь в поддержку.</p>
                }
                {!isCodeInput &&
                    <button type="submit" className={isStudActive ? 'DefaultButton_1' : 'DisabledButton'} style={{
                        width: '100%'
                    }}>{isLoading ? <Spinner /> : 'Отправить код на почту'}</button>
                }
            </form>
            {isCodeInput &&
                <form id='sendCode' className={classes.EnterCode} onSubmit={(e) => sendCode(e)}>
                    <label htmlFor="code">Введите код с почты</label>
                    <input type="password" name='code' id='code' required onChange={(e) => {
                        if (/.+/.test(e.currentTarget.value)) setIsActiveCode(true)
                        else setIsActiveCode(false)
                    }} onFocus={() => setIsWrongCode(false)} />
                    {isWrongCode &&
                        <p className={classes.WrongCode}>Неверный код</p>
                    }
                    {!isWait&&
                    <a onClick={()=>resendCode(false)}>{resendCodeLoad?'ОТПРАВКА...':'ОТПРАВИТЬ КОД СНОВА'}</a>
                    }
                    {isWait&&
                    <p className={classes.ResendCode}>Отправить код повторно можно через {codeResendTimer===60?'1:00':codeResendTimer<10?`00:0${codeResendTimer}`:`00:${codeResendTimer}`}</p>
                    }
                    <button type="submit" className={isActiveCode ? 'DefaultButton_1' : 'DisabledButton'} style={{
                        width: '100%'
                    }}>{isLoading ? <Spinner /> : 'Войти'}</button>
                </form>
            }
            {!isCodeInput &&
                <button style={{
                    width: '100%'
                }} type="button" className={`DefaultButton_2 ${classes.EmployeeBtn}`} onClick={(e) => dispatch(showEmployeeLogin())}>Войти как сотрудник</button>
            }
        </div>
    )
}
