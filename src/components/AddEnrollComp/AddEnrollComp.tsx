import { useAppDispatch, useAppSelector } from '../../hooks'
import classes from './AddEnrollComp.module.scss'
import { useState, useRef, useEffect } from 'react'
import { axiosRequest } from '../../configs/axiosConfig'
import { changeUsersData, changeBusyTime } from '../../redux/adminSlice'
import { changeOnline, checkShowAddEnroll, showNotify } from '../../redux/globalSlice'
import { requestErrorHandler } from '../../utils/requestErrorsHandler'
import { ReactComponent as WhiteSpinner } from '../../assets/white_spinner.svg'

export default function AddEnrollComp() {
    const mode = useAppSelector(state => state.globalSlice.serviceData.isShowAddEnroll.mode)
    const dispatch = useAppDispatch()
    const adminToken = useAppSelector(state => state.adminSlice.token)
    const [timesArr, setTimesArr] = useState<Array<{
        time: string,
        isBusy: boolean
    }>>([])
    const timeDetails = useAppSelector(state => state.adminSlice.timeDetails)
    const dormSelected = useAppSelector(state => state.adminSlice.checkedDorm)
    const dateSelected = useAppSelector(state => state.globalSlice.userData.dateSelected)
    const [newEnrollTime, setNewEnrollTime] = useState<string | undefined>(undefined)
    const selectedTimeRef = useRef<HTMLDivElement | null>(null)
    const [isEmailValid, setIsEmailValid] = useState<boolean>(true)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isNumberValid, setIsNumberValid] = useState<boolean>(mode === 'edit' ? true : false)
    const [isFullnameValid, setIsFullnameValid] = useState<boolean>(mode === 'edit' ? true : false)
    const [isAlreadyExist, setIsAlreadyExist] = useState<boolean>(false)
    const editData = useAppSelector(state => state.globalSlice.serviceData.isShowAddEnroll.editData)
    const [fullnameValue, setFullnameValue] = useState<string>(mode === 'edit' ? `${editData?.fullname}` : '')
    const [emailValue, setEmailValue] = useState<string>(mode === 'edit' ? `${editData?.email}` : '')
    const countryRefs = useRef<Array<HTMLOptionElement | null>>([])

    function addEnroll(e: React.FormEvent<HTMLFormElement>) {
        dispatch(changeOnline(true))
        setIsAlreadyExist(false)
        e.preventDefault()
        if (!isEmailValid || !isNumberValid || !isFullnameValid || !newEnrollTime || !/^m\d{7}\@edu\.misis\.ru$/.test(emailValue)) return
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)
        const data = {
            personalNumber: formData.get('email')?.slice(1, 8),
            fullname: formData.get('fullname'),
            gender: formData.get('gender'),
            citizenship: formData.get('country'),
            faculty: formData.get('faculty'),
            phone: formData.get('phone'),
            educationLevel: formData.get('degree'),
            dormitory_name: dormSelected,
            recordDatetime: `2023-08-${parseInt(dateSelected)}T${newEnrollTime![0] === '9' ? `${'0' + newEnrollTime}` : newEnrollTime}:00`
        }
        if (mode === 'create') {
            axiosRequest.post('/admin/create-user', data, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            }).then(({ data }) => {
                setIsLoading(false)
                dispatch(changeUsersData({
                    newUserData: {
                        email: data.email,
                        dorm: data.dorm_name,
                        fullname: data.fullname,
                        gender: data.gender,
                        citizenship: data.citizenship,
                        educationLevel: data.educationLevel,
                        recordDatetime: data.recordDatetime,
                        faculty: data.faculty,
                        phone: data.phone,
                    },
                    mode: 'add'
                }))
                dispatch(changeBusyTime({
                    newDatetime: data.recordDatetime,
                    dorm: data.dorm_name,
                    mode: 'add'
                }))
                dispatch(checkShowAddEnroll({ mode: 'none' }))
                dispatch(showNotify({
                    isShow: true,
                    type: 'CreateEnroll'
                }))
            }).catch(err => {
                if (err.code==='ERR_NETWORK') dispatch(changeOnline(false))
                setIsLoading(false)
                if (err.response.data.statusCode === 400) {
                    setIsAlreadyExist(true)
                }
                requestErrorHandler(err)
            })
        }
        if (mode === 'edit') {
            axiosRequest.put('/admin/update-user', {
                email: formData.get('email'),
                fullname: formData.get('fullname'),
                gender: formData.get('gender'),
                citizenship: formData.get('country'),
                faculty: formData.get('faculty'),
                phone: formData.get('phone'),
                educationLevel: formData.get('degree'),
                dormitory_name: dormSelected,
                recordDatetime: `2023-08-${parseInt(dateSelected)}T${newEnrollTime![0] === '9' ? `${'0' + newEnrollTime}` : newEnrollTime}:00`
            }, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            }).then(({ data }) => {
                setIsLoading(false)
                dispatch(changeUsersData({
                    newUserData: {
                        email: data.email,
                        dorm: data.dorm_name,
                        fullname: data.fullname,
                        gender: data.gender,
                        citizenship: data.citizenship,
                        educationLevel: data.educationLevel,
                        recordDatetime: data.recordDatetime,
                        faculty: data.faculty,
                        phone: data.phone,
                    },
                    oldUserData: {
                        email: editData!.email,
                        dorm: dormSelected
                    },
                    mode: 'edit'
                }))
                dispatch(changeBusyTime({
                    newDatetime: data.recordDatetime,
                    oldDatetime: `${parseInt(dateSelected)}.08.2023, ${editData?.recordDatetime}:00`,
                    mode: 'edit',
                    dorm: dormSelected
                }))
                dispatch(checkShowAddEnroll({ mode: 'none' }))
                dispatch(showNotify({
                    isShow: true,
                    type: 'UpdateEnroll'
                }))
            }).catch(err => {
                if (err.code==='ERR_NETWORK') dispatch(changeOnline(false))
                setIsLoading(false)
                if (err.response?.data.statusCode === 400) {
                    setIsAlreadyExist(true)
                }
                requestErrorHandler(err)
            })
        }
    }

    function selectTime(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (e.currentTarget === selectedTimeRef.current) {
            setNewEnrollTime(undefined)
            selectedTimeRef.current.classList.remove(`${classes.SelectedTime}`)
            selectedTimeRef.current = null
        }
        else {
            if (selectedTimeRef.current) selectedTimeRef.current.classList.remove(`${classes.SelectedTime}`)
            selectedTimeRef.current = e.currentTarget
            selectedTimeRef.current.classList.add(`${classes.SelectedTime}`)
            setNewEnrollTime(selectedTimeRef.current.dataset.time)
        }
    }

    useEffect(() => {
        const data = timeDetails[dormSelected][dateSelected.slice(0, 2)]
        setTimesArr(data)
    }, [dateSelected, dormSelected, timeDetails])

    useEffect(() => {
        if (mode === 'edit' && countryRefs.current[0]) {
            const savedCountry = countryRefs.current.findIndex(el => {
                if (el?.value === editData?.citizenship) return true
                else return false
            })
            if (savedCountry !== -1) countryRefs.current[savedCountry]!.defaultSelected = true
        }
    }, [mode])

    return (
        <form id="new_enroll" className={classes.NewEnroll} onSubmit={e => addEnroll(e)}>
            <svg className={classes.Cross} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => dispatch(checkShowAddEnroll({
                mode: 'none'
            }))}>
                <path d="M10.7581 21.2428L16.0011 15.9998L21.2441 21.2428M21.2441 10.7568L16.0001 15.9998L10.7581 10.7568" stroke="#2C3E50" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#2C3E50" strokeOpacity="0.12" />
            </svg>
            <h3>{mode === 'create' ? 'Добавление новой записи' : 'Редактирование записи'}</h3>
            <div className={`${classes.InfoBlocks} ${classes.FullnameText}`}>
                <label htmlFor="fullname">ФИО</label>
                <input type="text" id="fullname" name="fullname" required autoFocus onChange={e => {
                    if (/.+/.test(e.currentTarget.value)) setIsFullnameValid(true)
                    else setIsFullnameValid(false)
                    setFullnameValue(e.currentTarget.value)
                }} value={fullnameValue} />
            </div>
            <div className={classes.StudInfo}>
                <div className={classes.InfoBlocks}>
                    <label htmlFor="email">Корпоративная почта</label>
                    <input type="text" id="email" name="email" className={classes.InfoInput} required placeholder="m2300000@edu.misis.ru" onChange={e => {
                        if (/^m\d{7}\@edu\.misis\.ru$/.test(e.currentTarget.value)) setIsEmailValid(true)
                        else setIsEmailValid(false)
                        setEmailValue(e.currentTarget.value)
                    }} onFocus={() => setIsAlreadyExist(false)} value={emailValue} />
                    {!isEmailValid &&
                        <p>Некорректная почта</p>
                    }
                </div>
                <div className={`${classes.InfoBlocks}`}>
                    <label>Пол</label>
                    <div className={classes.RadioButtons}>
                        <label htmlFor="male">
                            <input type="radio" id="male" name="gender" value="Мужской" defaultChecked={mode === 'edit' ? (editData?.gender === 'М' ? true : false) : true} />
                            М
                        </label>
                        <label htmlFor="female">
                            <input type="radio" id="female" name="gender" value="Женский" defaultChecked={mode === 'edit' ? (editData?.gender === 'Ж' ? true : false) : false} />
                            Ж
                        </label>
                    </div>
                </div>
                <div className={classes.InfoBlocks}>
                    <label htmlFor="country">Страна</label>
                    <select name="country" id="country" className={classes.InfoInput}>
                        <option ref={el => countryRefs.current[171] = el} value="Россия" defaultChecked={mode === 'edit' ? false : true}>Россия</option>
                        <option ref={el => countryRefs.current[0] = el} value="Австралия">Австралия</option>
                        <option ref={el => countryRefs.current[1] = el} value="Австрия">Австрия</option>
                        <option ref={el => countryRefs.current[2] = el} value="Азербайджан">Азербайджан</option>
                        <option ref={el => countryRefs.current[3] = el} value="Аландские о-ва">Аландские о-ва</option>
                        <option ref={el => countryRefs.current[4] = el} value="Албания">Албания</option>
                        <option ref={el => countryRefs.current[5] = el} value="Алжир">Алжир</option>
                        <option ref={el => countryRefs.current[6] = el} value="Американское Самоа">Американское Самоа</option>
                        <option ref={el => countryRefs.current[7] = el} value="Ангилья">Ангилья</option>
                        <option ref={el => countryRefs.current[8] = el} value="Ангола">Ангола</option>
                        <option ref={el => countryRefs.current[9] = el} value="Андорра">Андорра</option>
                        <option ref={el => countryRefs.current[10] = el} value="Антарктида">Антарктида</option>
                        <option ref={el => countryRefs.current[11] = el} value="Антигуа и Барбуда">Антигуа и Барбуда</option>
                        <option ref={el => countryRefs.current[12] = el} value="Аргентина">Аргентина</option>
                        <option ref={el => countryRefs.current[13] = el} value="Армения">Армения</option>
                        <option ref={el => countryRefs.current[14] = el} value="Аруба">Аруба</option>
                        <option ref={el => countryRefs.current[15] = el} value="Афганистан">Афганистан</option>
                        <option ref={el => countryRefs.current[16] = el} value="Багамы">Багамы</option>
                        <option ref={el => countryRefs.current[17] = el} value="Бангладеш">Бангладеш</option>
                        <option ref={el => countryRefs.current[18] = el} value="Барбадос">Барбадос</option>
                        <option ref={el => countryRefs.current[19] = el} value="Бахрейн">Бахрейн</option>
                        <option ref={el => countryRefs.current[20] = el} value="Беларусь">Беларусь</option>
                        <option ref={el => countryRefs.current[21] = el} value="Белиз">Белиз</option>
                        <option ref={el => countryRefs.current[22] = el} value="Бельгия">Бельгия</option>
                        <option ref={el => countryRefs.current[23] = el} value="Бенин">Бенин</option>
                        <option ref={el => countryRefs.current[24] = el} value="Бермудские о-ва">Бермудские о-ва</option>
                        <option ref={el => countryRefs.current[25] = el} value="Болгария">Болгария</option>
                        <option ref={el => countryRefs.current[26] = el} value="Боливия">Боливия</option>
                        <option ref={el => countryRefs.current[27] = el} value="Бонэйр, Синт-Эстатиус и Саба">Бонэйр, Синт-Эстатиус и Саба</option>
                        <option ref={el => countryRefs.current[28] = el} value="Босния и Герцеговина">Босния и Герцеговина</option>
                        <option ref={el => countryRefs.current[29] = el} value="Ботсвана">Ботсвана</option>
                        <option ref={el => countryRefs.current[30] = el} value="Бразилия">Бразилия</option>
                        <option ref={el => countryRefs.current[31] = el} value="Британская территория в Индийском океане">Британская территория в Индийском океане</option>
                        <option ref={el => countryRefs.current[32] = el} value="Бруней-Даруссалам">Бруней-Даруссалам</option>
                        <option ref={el => countryRefs.current[33] = el} value="Буркина-Фасо">Буркина-Фасо</option>
                        <option ref={el => countryRefs.current[34] = el} value="Бурунди">Бурунди</option>
                        <option ref={el => countryRefs.current[35] = el} value="Бутан">Бутан</option>
                        <option ref={el => countryRefs.current[36] = el} value="Вануату">Вануату</option>
                        <option ref={el => countryRefs.current[37] = el} value="Ватикан">Ватикан</option>
                        <option ref={el => countryRefs.current[38] = el} value="Великобритания">Великобритания</option>
                        <option ref={el => countryRefs.current[39] = el} value="Венгрия">Венгрия</option>
                        <option ref={el => countryRefs.current[40] = el} value="Венесуэла">Венесуэла</option>
                        <option ref={el => countryRefs.current[41] = el} value="Виргинские о-ва (Великобритания)">Виргинские о-ва (Великобритания)</option>
                        <option ref={el => countryRefs.current[42] = el} value="Виргинские о-ва (США)">Виргинские о-ва (США)</option>
                        <option ref={el => countryRefs.current[43] = el} value="Внешние малые о-ва (США)">Внешние малые о-ва (США)</option>
                        <option ref={el => countryRefs.current[44] = el} value="Восточный Тимор">Восточный Тимор</option>
                        <option ref={el => countryRefs.current[45] = el} value="Вьетнам">Вьетнам</option>
                        <option ref={el => countryRefs.current[46] = el} value="Габон">Габон</option>
                        <option ref={el => countryRefs.current[47] = el} value="Гаити">Гаити</option>
                        <option ref={el => countryRefs.current[48] = el} value="Гайана">Гайана</option>
                        <option ref={el => countryRefs.current[49] = el} value="Гамбия">Гамбия</option>
                        <option ref={el => countryRefs.current[50] = el} value="Гана">Гана</option>
                        <option ref={el => countryRefs.current[51] = el} value="Гваделупа">Гваделупа</option>
                        <option ref={el => countryRefs.current[52] = el} value="Гватемала">Гватемала</option>
                        <option ref={el => countryRefs.current[53] = el} value="Гвинея">Гвинея</option>
                        <option ref={el => countryRefs.current[54] = el} value="Гвинея-Бисау">Гвинея-Бисау</option>
                        <option ref={el => countryRefs.current[55] = el} value="Германия">Германия</option>
                        <option ref={el => countryRefs.current[56] = el} value="Гернси">Гернси</option>
                        <option ref={el => countryRefs.current[57] = el} value="Гибралтар">Гибралтар</option>
                        <option ref={el => countryRefs.current[58] = el} value="Гондурас">Гондурас</option>
                        <option ref={el => countryRefs.current[59] = el} value="Гонконг (САР)">Гонконг (САР)</option>
                        <option ref={el => countryRefs.current[60] = el} value="Гренада">Гренада</option>
                        <option ref={el => countryRefs.current[61] = el} value="Гренландия">Гренландия</option>
                        <option ref={el => countryRefs.current[62] = el} value="Греция">Греция</option>
                        <option ref={el => countryRefs.current[63] = el} value="Грузия">Грузия</option>
                        <option ref={el => countryRefs.current[64] = el} value="Гуам">Гуам</option>
                        <option ref={el => countryRefs.current[65] = el} value="Дания">Дания</option>
                        <option ref={el => countryRefs.current[66] = el} value="Джерси">Джерси</option>
                        <option ref={el => countryRefs.current[67] = el} value="Джибути">Джибути</option>
                        <option ref={el => countryRefs.current[68] = el} value="Доминика">Доминика</option>
                        <option ref={el => countryRefs.current[69] = el} value="Доминиканская Республика">Доминиканская Республика</option>
                        <option ref={el => countryRefs.current[70] = el} value="Египет">Египет</option>
                        <option ref={el => countryRefs.current[71] = el} value="Замбия">Замбия</option>
                        <option ref={el => countryRefs.current[72] = el} value="Западная Сахара">Западная Сахара</option>
                        <option ref={el => countryRefs.current[73] = el} value="Зимбабве">Зимбабве</option>
                        <option ref={el => countryRefs.current[74] = el} value="Израиль">Израиль</option>
                        <option ref={el => countryRefs.current[75] = el} value="Индия">Индия</option>
                        <option ref={el => countryRefs.current[76] = el} value="Индонезия">Индонезия</option>
                        <option ref={el => countryRefs.current[77] = el} value="Иордания">Иордания</option>
                        <option ref={el => countryRefs.current[78] = el} value="Ирак">Ирак</option>
                        <option ref={el => countryRefs.current[79] = el} value="Иран">Иран</option>
                        <option ref={el => countryRefs.current[80] = el} value="Ирландия">Ирландия</option>
                        <option ref={el => countryRefs.current[81] = el} value="Исландия">Исландия</option>
                        <option ref={el => countryRefs.current[82] = el} value="Испания">Испания</option>
                        <option ref={el => countryRefs.current[83] = el} value="Италия">Италия</option>
                        <option ref={el => countryRefs.current[84] = el} value="Йемен">Йемен</option>
                        <option ref={el => countryRefs.current[85] = el} value="Кабо-Верде">Кабо-Верде</option>
                        <option ref={el => countryRefs.current[86] = el} value="Казахстан">Казахстан</option>
                        <option ref={el => countryRefs.current[87] = el} value="Камбоджа">Камбоджа</option>
                        <option ref={el => countryRefs.current[88] = el} value="Камерун">Камерун</option>
                        <option ref={el => countryRefs.current[89] = el} value="Канада">Канада</option>
                        <option ref={el => countryRefs.current[90] = el} value="Катар">Катар</option>
                        <option ref={el => countryRefs.current[91] = el} value="Кения">Кения</option>
                        <option ref={el => countryRefs.current[92] = el} value="Кипр">Кипр</option>
                        <option ref={el => countryRefs.current[93] = el} value="Киргизия">Киргизия</option>
                        <option ref={el => countryRefs.current[94] = el} value="Кирибати">Кирибати</option>
                        <option ref={el => countryRefs.current[95] = el} value="Китай">Китай</option>
                        <option ref={el => countryRefs.current[96] = el} value="КНДР">КНДР</option>
                        <option ref={el => countryRefs.current[97] = el} value="Кокосовые о-ва">Кокосовые о-ва</option>
                        <option ref={el => countryRefs.current[98] = el} value="Колумбия">Колумбия</option>
                        <option ref={el => countryRefs.current[99] = el} value="Коморы">Коморы</option>
                        <option ref={el => countryRefs.current[100] = el} value="Конго - Браззавиль">Конго - Браззавиль</option>
                        <option ref={el => countryRefs.current[101] = el} value="Конго - Киншаса">Конго - Киншаса</option>
                        <option ref={el => countryRefs.current[102] = el} value="Коста-Рика">Коста-Рика</option>
                        <option ref={el => countryRefs.current[103] = el} value="Кот-д’Ивуар">Кот-д’Ивуар</option>
                        <option ref={el => countryRefs.current[104] = el} value="Куба">Куба</option>
                        <option ref={el => countryRefs.current[105] = el} value="Кувейт">Кувейт</option>
                        <option ref={el => countryRefs.current[106] = el} value="Кюрасао">Кюрасао</option>
                        <option ref={el => countryRefs.current[107] = el} value="Лаос">Лаос</option>
                        <option ref={el => countryRefs.current[108] = el} value="Латвия">Латвия</option>
                        <option ref={el => countryRefs.current[109] = el} value="Лесото">Лесото</option>
                        <option ref={el => countryRefs.current[110] = el} value="Либерия">Либерия</option>
                        <option ref={el => countryRefs.current[111] = el} value="Ливан">Ливан</option>
                        <option ref={el => countryRefs.current[112] = el} value="Ливия">Ливия</option>
                        <option ref={el => countryRefs.current[113] = el} value="Литва">Литва</option>
                        <option ref={el => countryRefs.current[114] = el} value="Лихтенштейн">Лихтенштейн</option>
                        <option ref={el => countryRefs.current[115] = el} value="Люксембург">Люксембург</option>
                        <option ref={el => countryRefs.current[116] = el} value="Маврикий">Маврикий</option>
                        <option ref={el => countryRefs.current[117] = el} value="Мавритания">Мавритания</option>
                        <option ref={el => countryRefs.current[118] = el} value="Мадагаскар">Мадагаскар</option>
                        <option ref={el => countryRefs.current[119] = el} value="Майотта">Майотта</option>
                        <option ref={el => countryRefs.current[120] = el} value="Макао (САР)">Макао (САР)</option>
                        <option ref={el => countryRefs.current[121] = el} value="Малави">Малави</option>
                        <option ref={el => countryRefs.current[122] = el} value="Малайзия">Малайзия</option>
                        <option ref={el => countryRefs.current[123] = el} value="Мали">Мали</option>
                        <option ref={el => countryRefs.current[124] = el} value="Мальдивы">Мальдивы</option>
                        <option ref={el => countryRefs.current[125] = el} value="Мальта">Мальта</option>
                        <option ref={el => countryRefs.current[126] = el} value="Марокко">Марокко</option>
                        <option ref={el => countryRefs.current[127] = el} value="Мартиника">Мартиника</option>
                        <option ref={el => countryRefs.current[128] = el} value="Маршалловы Острова">Маршалловы Острова</option>
                        <option ref={el => countryRefs.current[129] = el} value="Мексика">Мексика</option>
                        <option ref={el => countryRefs.current[130] = el} value="Мозамбик">Мозамбик</option>
                        <option ref={el => countryRefs.current[131] = el} value="Молдова">Молдова</option>
                        <option ref={el => countryRefs.current[132] = el} value="Монако">Монако</option>
                        <option ref={el => countryRefs.current[133] = el} value="Монголия">Монголия</option>
                        <option ref={el => countryRefs.current[134] = el} value="Монтсеррат">Монтсеррат</option>
                        <option ref={el => countryRefs.current[135] = el} value="Мьянма (Бирма)">Мьянма (Бирма)</option>
                        <option ref={el => countryRefs.current[136] = el} value="Намибия">Намибия</option>
                        <option ref={el => countryRefs.current[137] = el} value="Науру">Науру</option>
                        <option ref={el => countryRefs.current[138] = el} value="Непал">Непал</option>
                        <option ref={el => countryRefs.current[139] = el} value="Нигер">Нигер</option>
                        <option ref={el => countryRefs.current[140] = el} value="Нигерия">Нигерия</option>
                        <option ref={el => countryRefs.current[141] = el} value="Нидерланды">Нидерланды</option>
                        <option ref={el => countryRefs.current[142] = el} value="Никарагуа">Никарагуа</option>
                        <option ref={el => countryRefs.current[143] = el} value="Ниуэ">Ниуэ</option>
                        <option ref={el => countryRefs.current[144] = el} value="Новая Зеландия">Новая Зеландия</option>
                        <option ref={el => countryRefs.current[145] = el} value="Новая Каледония">Новая Каледония</option>
                        <option ref={el => countryRefs.current[146] = el} value="Норвегия">Норвегия</option>
                        <option ref={el => countryRefs.current[147] = el} value="о-в Буве">о-в Буве</option>
                        <option ref={el => countryRefs.current[148] = el} value="о-в Мэн">о-в Мэн</option>
                        <option ref={el => countryRefs.current[149] = el} value="о-в Норфолк">о-в Норфолк</option>
                        <option ref={el => countryRefs.current[150] = el} value="о-в Рождества">о-в Рождества</option>
                        <option ref={el => countryRefs.current[151] = el} value="о-в Св. Елены">о-в Св. Елены</option>
                        <option ref={el => countryRefs.current[152] = el} value="о-ва Питкэрн">о-ва Питкэрн</option>
                        <option ref={el => countryRefs.current[153] = el} value="о-ва Тёркс и Кайкос">о-ва Тёркс и Кайкос</option>
                        <option ref={el => countryRefs.current[154] = el} value="о-ва Херд и Макдональд">о-ва Херд и Макдональд</option>
                        <option ref={el => countryRefs.current[155] = el} value="ОАЭ">ОАЭ</option>
                        <option ref={el => countryRefs.current[156] = el} value="Оман">Оман</option>
                        <option ref={el => countryRefs.current[157] = el} value="Острова Кайман">Острова Кайман</option>
                        <option ref={el => countryRefs.current[158] = el} value="Острова Кука">Острова Кука</option>
                        <option ref={el => countryRefs.current[159] = el} value="Пакистан">Пакистан</option>
                        <option ref={el => countryRefs.current[160] = el} value="Палау">Палау</option>
                        <option ref={el => countryRefs.current[161] = el} value="Палестинские территории">Палестинские территории</option>
                        <option ref={el => countryRefs.current[162] = el} value="Панама">Панама</option>
                        <option ref={el => countryRefs.current[163] = el} value="Папуа — Новая Гвинея">Папуа — Новая Гвинея</option>
                        <option ref={el => countryRefs.current[164] = el} value="Парагвай">Парагвай</option>
                        <option ref={el => countryRefs.current[165] = el} value="Перу">Перу</option>
                        <option ref={el => countryRefs.current[166] = el} value="Польша">Польша</option>
                        <option ref={el => countryRefs.current[167] = el} value="Португалия">Португалия</option>
                        <option ref={el => countryRefs.current[168] = el} value="Пуэрто-Рико">Пуэрто-Рико</option>
                        <option ref={el => countryRefs.current[169] = el} value="Республика Корея">Республика Корея</option>
                        <option ref={el => countryRefs.current[170] = el} value="Реюньон">Реюньон</option>
                        <option ref={el => countryRefs.current[172] = el} value="Руанда">Руанда</option>
                        <option ref={el => countryRefs.current[173] = el} value="Румыния">Румыния</option>
                        <option ref={el => countryRefs.current[174] = el} value="Сальвадор">Сальвадор</option>
                        <option ref={el => countryRefs.current[175] = el} value="Самоа">Самоа</option>
                        <option ref={el => countryRefs.current[176] = el} value="Сан-Марино">Сан-Марино</option>
                        <option ref={el => countryRefs.current[177] = el} value="Сан-Томе и Принсипи">Сан-Томе и Принсипи</option>
                        <option ref={el => countryRefs.current[178] = el} value="Саудовская Аравия">Саудовская Аравия</option>
                        <option ref={el => countryRefs.current[179] = el} value="Северная Македония">Северная Македония</option>
                        <option ref={el => countryRefs.current[180] = el} value="Северные Марианские о-ва">Северные Марианские о-ва</option>
                        <option ref={el => countryRefs.current[181] = el} value="Сейшельские Острова">Сейшельские Острова</option>
                        <option ref={el => countryRefs.current[182] = el} value="Сен-Бартелеми">Сен-Бартелеми</option>
                        <option ref={el => countryRefs.current[183] = el} value="Сен-Мартен">Сен-Мартен</option>
                        <option ref={el => countryRefs.current[184] = el} value="Сен-Пьер и Микелон">Сен-Пьер и Микелон</option>
                        <option ref={el => countryRefs.current[185] = el} value="Сенегал">Сенегал</option>
                        <option ref={el => countryRefs.current[186] = el} value="Сент-Винсент и Гренадины">Сент-Винсент и Гренадины</option>
                        <option ref={el => countryRefs.current[187] = el} value="Сент-Китс и Невис">Сент-Китс и Невис</option>
                        <option ref={el => countryRefs.current[188] = el} value="Сент-Люсия">Сент-Люсия</option>
                        <option ref={el => countryRefs.current[189] = el} value="Сербия">Сербия</option>
                        <option ref={el => countryRefs.current[190] = el} value="Сингапур">Сингапур</option>
                        <option ref={el => countryRefs.current[191] = el} value="Синт-Мартен">Синт-Мартен</option>
                        <option ref={el => countryRefs.current[192] = el} value="Сирия">Сирия</option>
                        <option ref={el => countryRefs.current[193] = el} value="Словакия">Словакия</option>
                        <option ref={el => countryRefs.current[194] = el} value="Словения">Словения</option>
                        <option ref={el => countryRefs.current[195] = el} value="Соединенные Штаты">Соединенные Штаты</option>
                        <option ref={el => countryRefs.current[196] = el} value="Соломоновы Острова">Соломоновы Острова</option>
                        <option ref={el => countryRefs.current[197] = el} value="Сомали">Сомали</option>
                        <option ref={el => countryRefs.current[198] = el} value="Судан">Судан</option>
                        <option ref={el => countryRefs.current[199] = el} value="Суринам">Суринам</option>
                        <option ref={el => countryRefs.current[200] = el} value="Сьерра-Леоне">Сьерра-Леоне</option>
                        <option ref={el => countryRefs.current[201] = el} value="Таджикистан">Таджикистан</option>
                        <option ref={el => countryRefs.current[202] = el} value="Таиланд">Таиланд</option>
                        <option ref={el => countryRefs.current[203] = el} value="Тайвань">Тайвань</option>
                        <option ref={el => countryRefs.current[204] = el} value="Танзания">Танзания</option>
                        <option ref={el => countryRefs.current[205] = el} value="Того">Того</option>
                        <option ref={el => countryRefs.current[206] = el} value="Токелау">Токелау</option>
                        <option ref={el => countryRefs.current[207] = el} value="Тонга">Тонга</option>
                        <option ref={el => countryRefs.current[208] = el} value="Тринидад и Тобаго">Тринидад и Тобаго</option>
                        <option ref={el => countryRefs.current[209] = el} value="Тувалу">Тувалу</option>
                        <option ref={el => countryRefs.current[210] = el} value="Тунис">Тунис</option>
                        <option ref={el => countryRefs.current[211] = el} value="Туркменистан">Туркменистан</option>
                        <option ref={el => countryRefs.current[212] = el} value="Турция">Турция</option>
                        <option ref={el => countryRefs.current[213] = el} value="Уганда">Уганда</option>
                        <option ref={el => countryRefs.current[214] = el} value="Узбекистан">Узбекистан</option>
                        <option ref={el => countryRefs.current[215] = el} value="Украина">Украина</option>
                        <option ref={el => countryRefs.current[216] = el} value="Уоллис и Футуна">Уоллис и Футуна</option>
                        <option ref={el => countryRefs.current[217] = el} value="Уругвай">Уругвай</option>
                        <option ref={el => countryRefs.current[218] = el} value="Фарерские о-ва">Фарерские о-ва</option>
                        <option ref={el => countryRefs.current[219] = el} value="Федеративные Штаты Микронезии">Федеративные Штаты Микронезии</option>
                        <option ref={el => countryRefs.current[220] = el} value="Фиджи">Фиджи</option>
                        <option ref={el => countryRefs.current[221] = el} value="Филиппины">Филиппины</option>
                        <option ref={el => countryRefs.current[222] = el} value="Финляндия">Финляндия</option>
                        <option ref={el => countryRefs.current[223] = el} value="Фолклендские о-ва">Фолклендские о-ва</option>
                        <option ref={el => countryRefs.current[224] = el} value="Франция">Франция</option>
                        <option ref={el => countryRefs.current[225] = el} value="Французская Гвиана">Французская Гвиана</option>
                        <option ref={el => countryRefs.current[226] = el} value="Французская Полинезия">Французская Полинезия</option>
                        <option ref={el => countryRefs.current[227] = el} value="Французские Южные территории">Французские Южные территории</option>
                        <option ref={el => countryRefs.current[228] = el} value="Хорватия">Хорватия</option>
                        <option ref={el => countryRefs.current[229] = el} value="Центрально-Африканская Республика">Центрально-Африканская Республика</option>
                        <option ref={el => countryRefs.current[230] = el} value="Чад">Чад</option>
                        <option ref={el => countryRefs.current[231] = el} value="Черногория">Черногория</option>
                        <option ref={el => countryRefs.current[232] = el} value="Чехия">Чехия</option>
                        <option ref={el => countryRefs.current[233] = el} value="Чили">Чили</option>
                        <option ref={el => countryRefs.current[234] = el} value="Швейцария">Швейцария</option>
                        <option ref={el => countryRefs.current[235] = el} value="Швеция">Швеция</option>
                        <option ref={el => countryRefs.current[236] = el} value="Шпицберген и Ян-Майен">Шпицберген и Ян-Майен</option>
                        <option ref={el => countryRefs.current[237] = el} value="Шри-Ланка">Шри-Ланка</option>
                        <option ref={el => countryRefs.current[238] = el} value="Эквадор">Эквадор</option>
                        <option ref={el => countryRefs.current[239] = el} value="Экваториальная Гвинея">Экваториальная Гвинея</option>
                        <option ref={el => countryRefs.current[240] = el} value="Эритрея">Эритрея</option>
                        <option ref={el => countryRefs.current[241] = el} value="Эсватини">Эсватини</option>
                        <option ref={el => countryRefs.current[242] = el} value="Эстония">Эстония</option>
                        <option ref={el => countryRefs.current[243] = el} value="Эфиопия">Эфиопия</option>
                        <option ref={el => countryRefs.current[244] = el} value="Южная Георгия и Южные Сандвичевы о-ва">Южная Георгия и Южные Сандвичевы о-ва</option>
                        <option ref={el => countryRefs.current[245] = el} value="Южно-Африканская Республика">Южно-Африканская Республика</option>
                        <option ref={el => countryRefs.current[246] = el} value="Южный Судан">Южный Судан</option>
                        <option ref={el => countryRefs.current[247] = el} value="Ямайка">Ямайка</option>
                        <option ref={el => countryRefs.current[248] = el} value="Япония">Япония</option>
                    </select>
                </div>
                <div className={`${classes.InfoBlocks}`}>
                    <label>Степень</label>
                    <div className={classes.RadioButtons}>
                        <label htmlFor="bachelor">
                            <input type="radio" id="bachelor" name="degree" value="Бакалавр" defaultChecked={mode === 'edit' ? (editData?.educationLevel === 'Бакалавр' ? true : false) : true} />
                            Бакалавр
                        </label>
                        <label htmlFor="master">
                            <input type="radio" id="master" name="degree" value="Магистр" defaultChecked={mode === 'edit' ? (editData?.educationLevel === 'Магистр' ? true : false) : false} />
                            Магистр
                        </label>
                    </div>
                </div>
                <div className={classes.InfoBlocks}>
                    <label htmlFor="phone">Телефон</label>
                    <input type="tel" name="phone" id="phone" required className={classes.FullWidthInput} onChange={e => {
                        if (/^(\+7|8)?[\s-]?\(?(\d{3})\)?[\s-]?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})$/.test(e.currentTarget.value)) setIsNumberValid(true)
                        else setIsNumberValid(false)
                    }} />
                </div>
                <div className={classes.InfoBlocks}>
                    <label htmlFor="faculty">Институт</label>
                    <select name="faculty" id="faculty" className={classes.FullWidthInput}>
                        <option value="ИНМИН" defaultChecked>ИНМИН</option>
                        <option value="ИТКН">ИТКН</option>
                        <option value="ЭУПП">ЭУПП</option>
                        <option value="ИБО">ИБО</option>
                        <option value="ГИ">Горный институт</option>
                        <option value="ЭкоТех">ЭкоТех</option>
                    </select>
                </div>
            </div>
            {mode === 'edit' &&
                <p className={classes.CurrentEnrollTime}>Сейчас пользователь записан на <span
                    style={{
                        color: '#1D92F8'
                    }}
                >{editData?.recordDatetime}</span></p>
            }
            <label className={classes.TimeTitle}>Время</label>
            {<div className={classes.TimesContainer}>
                {timesArr.map(timeObj => {
                    if (!timeObj.isBusy)
                        return (
                            <div key={timeObj.time} data-time={timeObj.time} className={mode === 'edit' ? (timeObj.time === editData?.recordDatetime ? `${classes.SelectedTime} ${classes.TimeBlock}` : `${classes.TimeBlock}`) : `${classes.TimeBlock}`} onClick={e => selectTime(e)}>
                                {timeObj.time}
                            </div>
                        )
                })
                }
            </div>}
            {isAlreadyExist &&
                <p className="AlertText">На это время уже есть запись, или пользователь с такой почтой уже зарегистрирован</p>
            }
            <button className={(!isEmailValid || !isNumberValid || !isFullnameValid || !newEnrollTime || !/^m\d{7}\@edu\.misis\.ru$/.test(emailValue)) ? `DisabledButton` : 'DefaultButton_1'}
                style={{
                    cursor: (!isEmailValid || !isNumberValid || !isFullnameValid || !newEnrollTime || !/^m\d{7}\@edu\.misis\.ru$/.test(emailValue)) ? 'auto' : 'pointer'
                }}
            >{isLoading ? <WhiteSpinner /> : (mode === 'edit' ?
                'Редактировать' : 'Добавить новую запись')}</button>
        </form>
    )
}