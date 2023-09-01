import { PayloadAction, createAsyncThunk, createSlice, current } from "@reduxjs/toolkit";
import { createTimes } from "../utils/timesCreation";
import { requestErrorHandler } from "../utils/requestErrorsHandler";
import { getTimeDate } from "../utils/getTimeDate";

export type SingleStudentType = {
    email: string,
    fullname: string,
    gender: string,
    citizenship: string,
    educationLevel: string,
    recordDatetime: string,
    faculty?: string,
    phone?: string
}

export type usersDataType = {
    [key: string]: Array<SingleStudentType>
}

export type DormListType = 'М-1' | 'М-2' | 'М-3' | 'М-4' | 'Г-1' | 'Г-2' | 'ДСГ' | 'ДК'

type TimeDetailsType = Record<DormListType, {
    [keyof: string]: Array<{
        time: string,
        isBusy: boolean
    }>
}>

type InitStateType = {
    token: string,
    usersData: usersDataType,
    adminLogin: string,
    timeDetails: TimeDetailsType,
    checkedDorm: DormListType,
    deletingUser: SingleStudentType
}

const initialState: InitStateType = {
    token: '',
    adminLogin: '',
    usersData: {},
    timeDetails: {
        'М-1': {},
        'М-2': {},
        'М-3': {},
        'М-4': {},
        'Г-1': {},
        'Г-2': {},
        'ДСГ': {},
        'ДК': {}
    },
    checkedDorm: 'М-1',
    deletingUser: {
        email: '',
        fullname: '',
        gender: '',
        citizenship: '',
        educationLevel: '',
        recordDatetime: '',
        faculty: '',
        phone: ''
    }
}

const adminSlice = createSlice({
    name: 'adminSlice',
    initialState,
    reducers: {
        setAdminData(state, action: PayloadAction<{ token: string, usersData: usersDataType, adminLogin: string }>) {
            state.token = action.payload.token
            state.adminLogin = action.payload.adminLogin
            const normalizeUsersData: usersDataType = {
                'М-1': [],
                'М-2': [],
                'М-3': [],
                'М-4': [],
                'Г-1': [],
                'Г-2': [],
                'ДСГ': [],
                'ДК': []
            }
            for (let key in normalizeUsersData) {
                normalizeUsersData[key] = action.payload.usersData[key].map(studObj => {
                    return {
                        ...studObj,
                        recordDatetime: getTimeDate(studObj.recordDatetime).datetime
                    }
                })
            }
            state.usersData = normalizeUsersData
            for (let key in state.timeDetails) {
                const normalizeArray = state.usersData[key].map(enroll => {
                    return enroll.recordDatetime
                })
                state.timeDetails[key as keyof TimeDetailsType] = createTimes(normalizeArray)
            }
        },
        cleanupAdminStore(state) {
            state = initialState
        },
        changeDorm(state, action: PayloadAction<DormListType>) {
            state.checkedDorm = action.payload
        },
        changeUsersData(state, action: PayloadAction<{
            newUserData?: SingleStudentType & { dorm: string }
            mode: 'add' | 'edit' | 'delete',
            oldUserData?: {
                email: string,
                dorm: string
            },
            deletingUser?: SingleStudentType,
            deletingDorm?: string
        }>) {
            if (action.payload.newUserData) {
                const newUser = action.payload.newUserData
                const newUserObj = {
                    email: newUser.email,
                    fullname: newUser.fullname,
                    citizenship: newUser.citizenship,
                    gender: newUser.gender,
                    educationLevel: newUser.educationLevel,
                    recordDatetime: getTimeDate(newUser.recordDatetime).datetime,
                    phone: newUser.phone,
                    faculty: newUser.faculty
                }
                switch (action.payload.mode) {
                    case 'add':
                        state.usersData[newUser.dorm].push(newUserObj)
                        break;

                    case 'edit':
                        state.usersData[newUser.dorm].push(newUserObj)

                        const oldUser = action.payload.oldUserData
                        const oldUserInd = state.usersData[oldUser!.dorm].findIndex(user => {
                            if (user.email === oldUser?.email) return true
                            else return false
                        })
                        state.usersData[oldUser!.dorm].splice(oldUserInd, 1)
                        break;
                }
            }
            else {
                const deletedEnrollInd = state.usersData[action.payload.deletingDorm!].findIndex(enroll => {
                    if (enroll.email === action.payload.deletingUser?.email) return true
                    else return false
                })
                state.usersData[action.payload.deletingDorm!].splice(deletedEnrollInd, 1)
            }
        },
        changeBusyTime(state, action: PayloadAction<{
            newDatetime?: string,
            dorm: DormListType,
            mode: 'add' | 'edit' | 'delete',
            oldDatetime?: string,
            deleteDateTime?: string
        }>) {
            if (action.payload.newDatetime) {
                const newDatetimeObj = getTimeDate(action.payload.newDatetime)
                const newTime = newDatetimeObj.time
                const newDate = newDatetimeObj.date
                const mode = action.payload.mode
                switch (mode) {
                    case 'add':
                        const updatedArr = state.timeDetails[action.payload.dorm][newDate].map(timeObj => {
                            if (timeObj.time === newTime) {
                                return {
                                    time: timeObj.time,
                                    isBusy: true
                                }
                            }
                            else return timeObj
                        })
                        state.timeDetails[action.payload.dorm][newDate] = updatedArr
                        break;
                    case 'edit':
                        const oldDatetimeObj = getTimeDate(action.payload.oldDatetime!)
                        const oldTime = oldDatetimeObj.time
                        const oldDate = oldDatetimeObj.date

                        const addedTimeInd = state.timeDetails[action.payload.dorm][newDate].findIndex(timeObj => {
                            if (timeObj.time === newTime) return true
                            else return false
                        })
                        state.timeDetails[action.payload.dorm][newDate][addedTimeInd].isBusy = true
                        const removedTimeInd = state.timeDetails[action.payload.dorm][oldDate].findIndex(timeObj => {
                            if (timeObj.time === oldTime) return true
                            else return false
                        })
                        state.timeDetails[action.payload.dorm][oldDate][removedTimeInd].isBusy = false
                }
            }
            else {
                const deleteDateTimeObj = getTimeDate(action.payload.deleteDateTime!)
                const time = deleteDateTimeObj.time
                const date = deleteDateTimeObj.date

                const delIndex = state.timeDetails[action.payload.dorm][date].findIndex(timeObj => {
                    if (timeObj.time === time) return true
                    else return false
                })
                state.timeDetails[action.payload.dorm][date][delIndex].isBusy = false
            }
        },
        saveDeletingUser(state, action: PayloadAction<SingleStudentType>) {
            state.deletingUser = action.payload
        }
    }
})

export const {
    setAdminData,
    changeDorm,
    cleanupAdminStore,
    changeUsersData,
    changeBusyTime,
    saveDeletingUser
} = adminSlice.actions

export default adminSlice.reducer