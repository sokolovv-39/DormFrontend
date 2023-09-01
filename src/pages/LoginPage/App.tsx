import classes from './App.module.scss'
import HeaderLogoComp from '../../components/HeaderLogoComp/HeaderLogoComp';
import LoginComp from '../../components/LoginComp/LoginComp';
import TechSupportComp from '../../components/TechSupportComp/TechSupportComp';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { changeOnline, hideEmployeeLogin, showEmployeeLogin } from '../../redux/globalSlice';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileBackground from './assets/MobileBackground.png'
import { setAdminData } from '../../redux/adminSlice';
import { requestErrorHandler } from '../../utils/requestErrorsHandler';
import { ReactComponent as WhiteSpinner } from '../../assets/white_spinner.svg'
import { axiosRequest } from '../../configs/axiosConfig';
import NoOnlineComp from '../../components/NoOnlineComp/NoOnlineComp';

function App() {
  const isEmployeeLogin = useAppSelector(state => state.globalSlice.serviceData.isEmployeeLogin)
  const dispatch = useAppDispatch()
  const [isEmpEmailActive, setIsEmpEmailActive] = useState<boolean>(false)
  const [isPwdActive, setIsPwdActive] = useState<boolean>(false)
  const navigate = useNavigate()
  const [isWrongLogin, setIsWrongLogin] = useState<boolean>(false)
  const [isLoadingEmp, setIsLoadingEmp] = useState<boolean>(false)
const isOnline = useAppSelector(state=>state.globalSlice.serviceData.isOnline)

  async function employeeLogin(e: React.FormEvent<HTMLFormElement>) {
    dispatch(changeOnline(true))
    setIsLoadingEmp(true)
    setIsWrongLogin(false)
    e.preventDefault()
    if (!isEmpEmailActive || !isPwdActive) return
    else {
      const formData = new FormData(e.currentTarget)
      axiosRequest.post('/auth/login-admin', {
        login: formData.get('employee_login'),
        password: formData.get('employee_password')
      }).then(({ data: tokenData }) => {
        axiosRequest.get(`/admin/get-users?login=${formData.get('employee_login')}`, {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        }).then(({ data: adminData }) => {
          setIsLoadingEmp(false)
          dispatch(setAdminData({
            token: tokenData.access_token,
            adminLogin: formData.get('employee_login') as string,
            usersData: adminData
          }))
          navigate('/admin')
        }).catch(err => {
          if (err.code==='ERR_NETWORK') dispatch(changeOnline(false))
          setIsLoadingEmp(false)
          requestErrorHandler(err)
        })
      }).catch(err => {
        if (err.code==='ERR_NETWORK') dispatch(changeOnline(false))
        setIsLoadingEmp(false)
        requestErrorHandler(err)
        if (err.response) setIsWrongLogin(true)
      })
    }
  }

  return (
    <div className={isEmployeeLogin ? `${classes.AppOverlay}` : `${classes.App}`}>
      {!isOnline && <NoOnlineComp/>}
      <div className={classes.FlexContainer}>
        <div className={classes.LoginWrapper}>
          <div className={classes.HeaderWrapper}>
            <HeaderLogoComp />
          </div>
          <LoginComp />
          <TechSupportComp />
        </div>
      </div>
      <img src={MobileBackground} className={classes.LoginPhoto} />
      {isEmployeeLogin &&
        <div className={classes.EmployeeLogin}>
          <div className={classes.EmployeeWrapper}>
            <svg className={classes.Cross} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => dispatch(hideEmployeeLogin())}>
              <path d="M10.7581 21.2428L16.0011 15.9998L21.2441 21.2428M21.2441 10.7568L16.0001 15.9998L10.7581 10.7568" stroke="#2C3E50" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#2C3E50" strokeOpacity="0.12" />
            </svg>
            <h1>Вход для сотрудников</h1>
            <form id='employee_form' onSubmit={(e) => employeeLogin(e)}>
              <div className={classes.LoginInput}>
                <label htmlFor="employee_login">Логин</label>
                <input type="text" id='employee_login' name='employee_login' required autoFocus onChange={e => {
                  if (/.+/.test(e.currentTarget.value)) setIsEmpEmailActive(true)
                  else setIsEmpEmailActive(false)
                }
                } onFocus={() => setIsWrongLogin(false)} />
              </div>
              <div className={classes.PasswordInput}>
                <label htmlFor="employee_password">Пароль</label>
                <input type="password" id='employee_password' name='employee_password' required onChange={(e) => {
                  if (/.+/.test(e.currentTarget.value)) setIsPwdActive(true)
                  else setIsPwdActive(false)
                }} onFocus={() => setIsWrongLogin(false)} />
              </div>
              {isWrongLogin &&
                <p className={classes.WrongLogin}>Неправильный логин или пароль</p>
              }
              <button type='submit' className={isEmpEmailActive && isPwdActive ? 'DefaultButton_1' : 'DisabledButton'}>{isLoadingEmp ? <WhiteSpinner /> : 'Войти'}</button>
            </form>
          </div>
        </div>
      }
    </div>
  );
}

export default App;
