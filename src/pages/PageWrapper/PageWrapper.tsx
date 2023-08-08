import { useNavigate } from "react-router-dom";
import ControlPanelComp from "../../components/ControlPanel/ControlPanelComp";
import EnrollStepsComp from "../../components/EnrollStepsComp/EnrollStepsComp";
import HeaderEnrollComp from "../../components/HeaderEnrollComp/HeaderEnrollComp";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { hideCalendar, showAddEnroll, showPopup } from "../../redux/globalSlice";
import classes from './PageWrapper.module.scss';
import { ReactNode, useRef, useEffect, useState } from "react";
import axios from "axios";
import { requestErrorHandler } from "../../utils/requestErrorsHandler";
import { addNewStudent } from "../../redux/adminSlice";
import { ReactComponent as WhiteSpinner } from '../../assets/white_spinner.svg'
import { axiosRequest } from "../../configs/axiosConfig";

export default function PageWrapper({ children }: { children: ReactNode }) {
    const navigate = useNavigate()
    const wrapperRef = useRef<HTMLDivElement>(null)
    const dispatch = useAppDispatch()
    const isButtonsShow = /(registered|admin)/.test(window.location.href)
    const institute = useAppSelector(state => state.globalSlice.userData.faculty)
    const email = useAppSelector(state => state.globalSlice.userData.email)
    const adminToken = useAppSelector(state => state.adminSlice.token)
    const isNewEnroll = useAppSelector(state => state.globalSlice.serviceData.isAddEnroll)
    const [timesArr, setTimesArr] = useState<Array<{
        time: string,
        isBusy: boolean
    }>>([])
    const timeDetails = useAppSelector(state => state.adminSlice.timeDetails)
    const dormSelected = useAppSelector(state => state.adminSlice.checkedDorm)
    const dateSelected = useAppSelector(state => state.globalSlice.userData.dateSelected)
    const [newEnrollTime, setNewEnrollTime] = useState<string | undefined>(undefined)
    const selectedTimeRef = useRef<HTMLDivElement | null>(null)
    const [isWrongEmail, setIsWrongEmail] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isNumberValid, setIsNumberValid] = useState<boolean>(false)
    const [isFullname, setIsFullname] = useState<boolean>(false)

    function wrapperClick(e: React.MouseEvent) {
        dispatch(hideCalendar())
        dispatch(showPopup({ event: e, isShow: false, type: 'checkInPopup' }))
        dispatch(showPopup({
            event: e,
            isShow: false,
            type: 'busyWarning'
        }))
    }

    function addEnroll(e: React.FormEvent<HTMLFormElement>) {
        setIsLoading(true)
        e.preventDefault()
        if (isWrongEmail) return
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
        console.log('CREATE USER DATA', data)
        axiosRequest.post('/admin/create-user', data, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        }).then(({ data }) => {
            setIsLoading(false)
            console.log('CREATE USER SUCCEEDED', data)
            dispatch(addNewStudent({
                email: data.email,
                dorm: data.dorm_name,
                fullname: data.fullname,
                gender: data.gender,
                citizenship: data.citizenship,
                educationLevel: data.educationLevel,
                recordDatetime: data.recordDatetime
            }))
        }).catch(err => {
            setIsLoading(false)
            requestErrorHandler(err)
        })
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
        if (/registered/.test(window.location.href)) {
            console.log('faculty', institute)
            switch (institute) {
                case 'ИНМИН':
                    wrapperRef.current?.classList.add(`${classes.INMIN}`)
                    break;
                case 'ЭКОТЕХ':
                    wrapperRef.current?.classList.add(`${classes.EKOKEK}`)
                    break
                case 'ЭУПП':
                    wrapperRef.current?.classList.add(`${classes.EUPP}`)
                    break;
                case 'ИБО':
                    wrapperRef.current?.classList.add(`${classes.IBO}`)
                    break;
                case 'ИТКН':
                    wrapperRef.current?.classList.add(`${classes.ITKN}`)
                    break
                case 'ГОРНЫЙ':
                    wrapperRef.current?.classList.add(`${classes.GORNIY}`)
                    break
            }
        }
    }, [window.location.href])

    useEffect(() => {
        if (!/admin/.test(window.location.href)) {
            if (!email) {
                navigate("/")
            }
        }
        else {
            if (!adminToken) {
                navigate('/')
            }
        }
    }, [email, adminToken])

    useEffect(() => {
        setTimesArr(timeDetails[dormSelected][dateSelected.slice(0, 2)])
    }, [dateSelected, dormSelected])

    return (
        <div className={isNewEnroll ? `${classes.WrapperOverlay}` : `${classes.Wrapper}`} onClick={(e) => wrapperClick(e)} ref={wrapperRef}>
            <HeaderEnrollComp />
            {!/admin/.test(window.location.href) && <EnrollStepsComp />}
            <main>{children}</main>
            {!isButtonsShow && <ControlPanelComp />}
            {isNewEnroll &&
                <form id="new_enroll" className={classes.NewEnroll} onSubmit={e => addEnroll(e)}>
                    <svg className={classes.Cross} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => dispatch(showAddEnroll(false))}>
                        <path d="M10.7581 21.2428L16.0011 15.9998L21.2441 21.2428M21.2441 10.7568L16.0001 15.9998L10.7581 10.7568" stroke="#2C3E50" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#2C3E50" strokeOpacity="0.12" />
                    </svg>
                    <h3>Добавление новой записи</h3>
                    <div className={`${classes.InfoBlocks} ${classes.FullnameText}`}>
                        <label htmlFor="fullname">ФИО</label>
                        <input type="text" id="fullname" name="fullname" required autoFocus onChange={e => {
                            if (/.+/.test(e.currentTarget.value)) setIsFullname(true)
                            else setIsFullname(false)
                        }} />
                    </div>
                    <div className={classes.StudInfo}>
                        <div className={classes.InfoBlocks}>
                            <label htmlFor="email">Корпоративная почта</label>
                            <input type="text" id="email" name="email" className={classes.InfoInput} required placeholder="m2300000@edu.misis.ru" onChange={e => {
                                if (/^m\d{7}\@edu\.misis\.ru$/.test(e.currentTarget.value)) setIsWrongEmail(false)
                                else setIsWrongEmail(true)
                            }} />
                            {isWrongEmail &&
                                <p>Некорректная почта</p>
                            }
                        </div>
                        <div className={`${classes.InfoBlocks}`}>
                            <label>Пол</label>
                            <div className={classes.RadioButtons}>
                                <label htmlFor="male">
                                    <input type="radio" id="male" name="gender" value="Мужской" defaultChecked />
                                    М
                                </label>
                                <label htmlFor="female">
                                    <input type="radio" id="female" name="gender" value="Женский" />
                                    Ж
                                </label>
                            </div>
                        </div>
                        <div className={classes.InfoBlocks}>
                            <label htmlFor="country">Страна</label>
                            <select name="country" id="country" className={classes.InfoInput}>
                                <option value="Russian Federation" defaultChecked>Россия</option>
                                <option value="Australia">Австралия</option><option value="Austria">Австрия</option><option value="Azerbaijan">Азербайджан</option><option value="Albania">Албания</option><option value="Algeria">Алжир</option><option value="American Samoa">Американское Самоа</option><option value="Anguilla">Ангилья</option><option value="Angola">Ангола</option><option value="Andorra">Андорра</option><option value="Antarctica">Антарктика</option><option value="Antigua and Barbuda">Антигуа и Барбуда</option><option value="Argentina">Аргентина</option><option value="Armenia">Армения</option><option value="Aruba">Аруба</option><option value="Afghanistan">Афганистан</option><option value="Bahamas">Багамы</option><option value="Bangladesh">Бангладеш</option><option value="Barbados">Барбадос</option><option value="Bahrain">Бахрейн</option><option value="Belarus">Беларусь</option><option value="Belize">Белиз</option><option value="Belgium">Бельгия</option><option value="Benin">Бенин</option><option value="Bermuda">Бермуды</option><option value="Bulgaria">Болгария</option><option value="Bolivia">Боливия</option><option value="Bosnia and Herzegovina">Босния и Герцеговина</option><option value="Botswana">Ботсвана</option><option value="Brazil">Бразилия</option><option value="British Indian Ocean Territory">Британская территория Индийского океана</option><option value="Virgin Islands, British">Британские Виргинские острова</option><option value="Brunei Darussalam">Бруней-Даруссалам</option><option value="Burkina Faso">Буркина-Фасо</option><option value="Burundi">Бурунди</option><option value="Bhutan">Бутан</option><option value="Vanuatu">Вануату</option><option value="United Kingdom">Великобритания</option><option value="Hungary">Венгрия</option><option value="Venezuela">Венесуэла</option><option value="Virgin Islands, U.S.">Виргинские Острова, США</option><option value="Viet Nam">Вьетнам</option><option value="Gabon">Габон</option><option value="Haiti">Гаити</option><option value="Guyana">Гайана</option><option value="Gambia">Гамбия</option><option value="Ghana">Гана</option><option value="Guadeloupe">Гваделупа</option><option value="Guatemala">Гватемала</option><option value="Guinea">Гвинея</option><option value="Guinea-bissau">Гвинея-Бисау</option><option value="Germany">Германия</option><option value="Gibraltar">Гибралтар</option><option value="Honduras">Гондурас</option><option value="Hong Kong">Гонконг</option><option value="Grenada">Гренада</option><option value="Greenland">Гренландия</option><option value="Greece">Греция</option><option value="Georgia">Грузия</option><option value="Guam">Гуам</option><option value="Denmark">Дания</option><option value="Djibouti">Джибути</option><option value="Dominica">Доминика</option><option value="Dominican Republic">Доминиканская Республика</option><option value="Egypt">Египет</option><option value="Zambia">Замбия</option><option value="Western Sahara">Западная Сахара</option><option value="Zimbabwe">Зимбабве</option><option value="Israel">Израиль</option><option value="India">Индия</option><option value="Indonesia">Индонезия</option><option value="Jordan">Иордания</option><option value="Iraq">Ирак</option><option value="Iran, Islamic Republic of">Иран, Исламская Республика</option><option value="Ireland">Ирландия</option><option value="Iceland">Исландия</option><option value="Spain">Испания</option><option value="Italy">Италия</option><option value="Yemen">Йемен</option><option value="Cape Verde">Кабо-Верде</option><option value="Kazakhstan">Казахстан</option><option value="Cayman Islands">Каймановы острова</option><option value="Cambodia">Камбоджа</option><option value="Cameroon">Камерун</option><option value="Canada">Канада</option><option value="Qatar">Катар</option><option value="Kenya">Кения</option><option value="Cyprus">Кипр</option><option value="Kyrgyzstan">Киргизия</option><option value="Kiribati">Кирибати</option><option value="China">Китай</option><option value="Cocos (Keeling) Islands">Кокосовые острова (Килинг)</option><option value="Colombia">Колумбия</option><option value="Comoros">Коморы</option><option value="Congo">Конго</option><option value="Congo, The Democratic Republic of The">Конго, Демократическая Республика</option><option value="Korea, Democratic People's Republic of">Корея, Народно-демократическая Республика</option><option value="Korea, Republic of">Корея, Республика</option><option value="Costa Rica">Коста-Рика</option><option value="Cote D'ivoire">Кот д'Ивуар</option><option value="Cuba">Куба</option><option value="Kuwait">Кувейт</option><option value="Cook Islands">Куковы острова</option><option value="Lao People's Democratic Republic">Лаосская Народно-Демократическая Республика</option><option value="Latvia">Латвия</option><option value="Lesotho">Лесото</option><option value="Liberia">Либерия</option><option value="Lebanon">Ливан</option><option value="Libyan Arab Jamahiriya">Ливийская Арабская Джамахирия</option><option value="Lithuania">Литва</option><option value="Liechtenstein">Лихтенштейн</option><option value="Luxembourg">Люксембург</option><option value="Mauritius">Маврикий</option><option value="Mauritania">Мавритания</option><option value="Madagascar">Мадагаскар</option><option value="Mayotte">Майотта</option><option value="Macao">Макао</option><option value="Malawi">Малави</option><option value="Malaysia">Малайзия</option><option value="Mali">Мали</option><option value="United States Minor Outlying Islands">Малые Тихоокеанские Отдаленные Острова США</option><option value="Maldives">Мальдивы</option><option value="Malta">Мальта</option><option value="Morocco">Марокко</option><option value="Martinique">Мартиника</option><option value="Marshall Islands">Маршалловы Острова</option><option value="Mexico">Мексика</option><option value="Micronesia, Federated States of">Микронезия, Федеративные Штаты</option><option value="Mozambique">Мозамбик</option><option value="Moldova, Republic of">Молдова, Республика</option><option value="Monaco">Монако</option><option value="Mongolia">Монголия</option><option value="Montserrat">Монтсеррат</option><option value="Myanmar">Мьянма</option><option value="Namibia">Намибия</option><option value="Nauru">Науру</option><option value="Nepal">Непал</option><option value="Niger">Нигер</option><option value="Nigeria">Нигерия</option><option value="Netherlands Antilles">Нидерландские Антильские острова</option><option value="Netherlands">Нидерланды</option><option value="Nicaragua">Никарагуа</option><option value="Niue">Ниуэ</option><option value="New Zealand">Новая Зеландия</option><option value="New Caledonia">Новая Каледония</option><option value="Norway">Норвегия</option><option value="Tanzania, United Republic of">Объединенная Республика Танзания</option><option value="United Arab Emirates">Объединенные Арабские Эмираты</option><option value="Palestinian Territory, Occupied">Оккупированная Палестинская территория</option><option value="Oman">Оман</option><option value="Bouvet Island">Остров Буве</option><option value="Norfolk Island">Остров Норфолк</option><option value="Christmas Island">Остров Рождества</option><option value="Saint Helena">Остров Святой Елены</option><option value="Heard Island and Mcdonald Islands">Остров Херд и Макдональд</option><option value="Pakistan">Пакистан</option><option value="Palau">Палау</option><option value="Panama">Панама</option><option value="Papua New Guinea">Папуа — Новая Гвинея</option><option value="Paraguay">Парагвай</option><option value="Peru">Перу</option><option value="Pitcairn">Питкэрн</option><option value="Poland">Польша</option><option value="Portugal">Португалия</option><option value="Puerto Rico">Пуэрто-Рико</option><option value="Reunion">Реюньон</option><option value="Russian Federation">Российская Федерация</option><option value="Rwanda">Руанда</option><option value="Romania">Румыния</option><option value="El Salvador">Сальвадор</option><option value="Samoa">Самоа</option><option value="San Marino">Сан-Марино</option><option value="Sao Tome and Principe">Сан-Томе и Принсипи</option><option value="Saudi Arabia">Саудовская Аравия</option><option value="Swaziland">Свазиленд</option><option value="Holy See (Vatican City State)">Святой Престол (Государство-город Ватикан)</option><option value="North Macedonia">Северная Македония</option><option value="Northern Mariana Islands">Северные Марианские острова</option><option value="Seychelles">Сейшеллы</option><option value="Saint Pierre and Miquelon">Сен-Пьер и Микелон</option><option value="Senegal">Сенегал</option><option value="Saint Vincent and The Grenadines">Сент-Винсент и Гренадины</option><option value="Saint Kitts and Nevis">Сент-Китс и Невис</option><option value="Saint Lucia">Сент-Люсия</option><option value="Serbia and Montenegro">Сербия и Черногория</option><option value="Singapore">Сингапур</option><option value="Syrian Arab Republic">Сирийская Арабская Республика</option><option value="Slovakia">Словакия</option><option value="Slovenia">Словения</option><option value="United States">Соединенные Штаты</option><option value="Solomon Islands">Соломоновы Острова</option><option value="Somalia">Сомали</option><option value="Sudan">Судан</option><option value="Suriname">Суринам</option><option value="Sierra Leone">Сьерра-Леоне</option><option value="Tajikistan">Таджикистан</option><option value="Thailand">Таиланд</option><option value="Taiwan, Province of China">Тайвань, провинция Китая</option><option value="Turks and Caicos Islands">Теркс и Кайкос</option><option value="Timor-leste">Тимор-Лесте</option><option value="Togo">Того</option><option value="Tokelau">Токелау</option><option value="Tonga">Тонга</option><option value="Trinidad and Tobago">Тринидад и Тобаго</option><option value="Tuvalu">Тувалу</option><option value="Tunisia">Тунис</option><option value="Turkmenistan">Туркмения</option><option value="Turkey">Турция</option><option value="Uganda">Уганда</option><option value="Uzbekistan">Узбекистан</option><option value="Ukraine">Украина</option><option value="Wallis and Futuna">Уоллис и Футуна</option><option value="Uruguay">Уругвай</option><option value="Faroe Islands">Фарерские острова</option><option value="Fiji">Фиджи</option><option value="Philippines">Филиппины</option><option value="Finland">Финляндия</option><option value="Falkland Islands (Malvinas)">Фолклендские острова</option><option value="France">Франция</option><option value="French Guiana">Французская Гвиана</option><option value="French Polynesia">Французская Полинезия</option><option value="French Southern Territories">Французские Южные Территории</option><option value="Croatia">Хорватия</option><option value="Central African Republic">Центральноафриканская Республика</option><option value="Chad">Чад</option><option value="Czech Republic">Чехия</option><option value="Chile">Чили</option><option value="Switzerland">Швейцария</option><option value="Sweden">Швеция</option><option value="Svalbard and Jan Mayen">Шпицберген и Ян-Майен</option><option value="Sri Lanka">Шри-Ланка</option><option value="Ecuador">Эквадор</option><option value="Equatorial Guinea">Экваториальная Гвинея</option><option value="Eritrea">Эритрея</option><option value="Estonia">Эстония</option><option value="Ethiopia">Эфиопия</option><option value="South Africa">Южная Африка</option><option value="South Georgia and The South Sandwich Islands">Южная Георгия и Южные Сандвичевы острова</option><option value="Jamaica">Ямайка</option><option value="Japan">Япония</option>
                            </select>
                        </div>
                        <div className={`${classes.InfoBlocks}`}>
                            <label>Степень</label>
                            <div className={classes.RadioButtons}>
                                <label htmlFor="bachelor">
                                    <input type="radio" id="bachelor" name="degree" value="Бакалавр" defaultChecked />
                                    Бакалавр
                                </label>
                                <label htmlFor="master">
                                    <input type="radio" id="master" name="degree" value="Магистр" />
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
                                <option value="Горный институт">Горный институт</option>
                                <option value="ЭКОТЕХ">ЭКОТЕХ</option>
                            </select>
                        </div>
                    </div>

                    {<div className={classes.TimesContainer}>
                        <label>Время</label>
                        {timesArr.map(timeObj => {
                            if (!timeObj.isBusy)
                                return (
                                    <div key={timeObj.time} data-time={timeObj.time} className={classes.TimeBlock} onClick={e => selectTime(e)}>
                                        {timeObj.time}
                                    </div>
                                )
                        })
                        }
                    </div>}
                    <button className="DefaultButton_1">{isLoading ? <WhiteSpinner /> : 'Добавить новую запись'}</button>
                </form>
            }
        </div >
    )
}