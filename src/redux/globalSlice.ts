import { PayloadAction, createSlice, current } from "@reduxjs/toolkit";
import { createTimes } from "../utils/timesCreation";
import { usersDataType } from "./adminSlice";
import { getTimeDate } from "../utils/getTimeDate";
import { SingleStudentType } from "./adminSlice";

type InitialStateType = {
    userData: {
        email: string | null,
        dormitory: {
            name: string | null,
            address: string | null,
            description: string | null
        },
        dateSelected: string,
        timeSelected: string | null,
        token: string | null,
        contacts: Array<{
            fullname: string,
            position: string,
            phone: string | null
        }>
        freeTimes: {
            [key: string]: Array<{
                time: string,
                isBusy: boolean
            }>
        },
        faculty?: string
    },
    serviceData: {
        isLoading: boolean,
        isError: boolean,
        isShowCalendar: boolean,
        enrollStep: number,
        isEmployeeLogin: boolean,
        isCheckInPopup: boolean,
        isBusyWarning: boolean,
        isShowNotify: {
            isShow: boolean,
            type: 'CreateEnroll' | 'UpdateEnroll' | 'DeleteEnroll' | 'DeleteEnrollCompleted' |'TimeBusy'|'None'
        }
        isShowAddEnroll: {
            isShow: boolean,
            mode: 'create' | 'edit' | 'none',
            editData?: SingleStudentType
        }
        isOnline: boolean,
        isStudTimesLoad: boolean //Stud - student
    }
}

const initialState: InitialStateType = {
    userData: {
        email: null,
        token: null,
        dormitory: {
            name: null,
            address: null,
            description: null
        },
        dateSelected: '25 августа, пт',
        timeSelected: null,
        contacts:[],
        freeTimes: {},
        faculty: ''
    },
    serviceData: {
        isError: false,
        isLoading: false,
        isShowCalendar: true,
        enrollStep: 1,
        isEmployeeLogin: false,
        isCheckInPopup: false,
        isBusyWarning: false,
        isShowNotify: {
            isShow: false,
            type: 'None'
        },
        isShowAddEnroll: {
            isShow: false,
            mode: 'none',
            editData: {
                email: '',
                fullname: '',
                gender: '',
                citizenship: '',
                educationLevel: '',
                recordDatetime: ''
            }
        },
        isOnline: true,
        isStudTimesLoad: false
    }
}

const globalSlice = createSlice({
    name: 'globalSlice',
    initialState,
    reducers: {
        hideCalendar(state) {
            state.serviceData.isShowCalendar = false
        },
        showCalendar(state, action: PayloadAction<{ event: React.MouseEvent<HTMLDivElement> }>) {
            action.payload.event.stopPropagation()
            state.serviceData.isShowCalendar = true
        },
        selectDate(state, action) {
            state.userData.dateSelected = action.payload
        },
        selectTime(state, action) {
            state.userData.timeSelected = action.payload
        },
        switchStep(state, action) {
            state.serviceData.enrollStep = action.payload
        },
        showEmployeeLogin(state) {
            state.serviceData.isEmployeeLogin = true
        },
        hideEmployeeLogin(state) {
            state.serviceData.isEmployeeLogin = false
        },
        saveUserBasics(state, action) {
            state.userData.token = action.payload.token
            state.userData.email = action.payload.email
        },
        saveUserData(state, action) {
            state.userData.email = action.payload.email
            state.userData.dormitory = action.payload.dormitory
            state.userData.contacts = action.payload.contacts
            if (action.payload.faculty) state.userData.faculty = action.payload.faculty
            if (action.payload.takenTime) {
                //@ts-ignore
                const normalizeArr = action.payload.takenTime.map(time => {
                    return getTimeDate(time).datetime
                })
                state.userData.freeTimes = createTimes(normalizeArr)
            }
            else {
                const normalizeDate = getTimeDate(action.payload.recordDatetime).datetime
                const date = normalizeDate.slice(0, 2)
                let shortWeekday = undefined
                switch (date) {
                    case '25':
                        shortWeekday = 'пт'
                        break;
                    case '26':
                        shortWeekday = 'сб'
                        break;
                    case '27':
                        shortWeekday = 'вс'
                        break;
                    case '28':
                        shortWeekday = 'пн'
                        break;
                    case '29':
                        shortWeekday = 'вт'
                        break;
                    case '30':
                        shortWeekday = 'ср'
                        break;
                    case '31':
                        shortWeekday = 'чт'
                        break;
                    default:
                        break;
                }
                state.userData.dateSelected = `${date} августа, ${shortWeekday}`
                const timeCheck = normalizeDate.split(' ')[1]
                if (/^\d{2}:\d{2}$/.test(timeCheck)) state.userData.timeSelected = timeCheck
                else state.userData.timeSelected = normalizeDate.split(',')[1].slice(1, -3)
            }
        },
        showPopup(state, action: PayloadAction<{ event: React.MouseEvent, isShow: boolean, type: string }>) {
            const dataObj = action.payload
            switch (dataObj.type) {
                case 'checkInPopup':
                    if (dataObj.isShow) {
                        dataObj.event.stopPropagation()
                        state.serviceData.isCheckInPopup = true
                    }
                    else {
                        state.serviceData.isCheckInPopup = false
                    }
                    break;
                case 'busyWarning':
                    if (dataObj.isShow) {
                        dataObj.event.stopPropagation()
                        state.serviceData.isBusyWarning = true
                    }
                    else {
                        state.serviceData.isBusyWarning = false
                    }
                    break;
            }
        },
        cleanupUserStore(state) {
            state = initialState
        },
        setFaculty(state, action) {
            state.userData.faculty = action.payload
        },
        checkShowAddEnroll(state, action: PayloadAction<{
            mode: 'create' | 'edit' | 'none'
            editData?: SingleStudentType
        }>) {
            if (action.payload.mode === 'none') {
                state.serviceData.isShowAddEnroll = {
                    isShow: false,
                    mode: 'none',
                    editData: initialState.serviceData.isShowAddEnroll.editData
                }
            }
            else if (action.payload.mode === 'create') {
                state.serviceData.isShowAddEnroll = {
                    isShow: true,
                    mode: 'create',
                    editData: initialState.serviceData.isShowAddEnroll.editData
                }
            }
            else if (action.payload.mode === 'edit') {
                state.serviceData.isShowAddEnroll = {
                    isShow: true,
                    mode: 'edit',
                    editData: action.payload.editData
                }
            }
        },
        showNotify(state, action: PayloadAction<{
            isShow: boolean,
            type: 'CreateEnroll' | 'UpdateEnroll' | 'DeleteEnroll' | 'DeleteEnrollCompleted' |'TimeBusy'|'None'
            event?: React.MouseEvent
        }>) {
            action.payload.event?.stopPropagation()
            state.serviceData.isShowNotify = {
                isShow: action.payload.isShow,
                type: action.payload.type
            }
        },
        changeOnline(state, action: PayloadAction<boolean>) {
            state.serviceData.isOnline = action.payload
        },
        changeStudTimesLoad(state, action:PayloadAction<boolean>) {
            state.serviceData.isStudTimesLoad = action.payload
        }
    }
})

export const { hideCalendar, showCalendar, selectDate, selectTime, switchStep, showEmployeeLogin,
    hideEmployeeLogin,
    saveUserBasics,
    saveUserData,
    showPopup,
    cleanupUserStore,
    setFaculty,
    checkShowAddEnroll,
    showNotify,
    changeOnline,
    changeStudTimesLoad
} = globalSlice.actions

export default globalSlice.reducer