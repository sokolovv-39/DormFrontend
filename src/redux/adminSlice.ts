import { PayloadAction, createSlice, current } from "@reduxjs/toolkit";
import { createTimes } from "../utils/timesCreation";

type SingleStudentType = {
    email: string,
    fullname: string,
    gender: string,
    citizenship: string,
    educationLevel: string,
    recordDatetime: string
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
    checkedDorm: DormListType
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
    checkedDorm: 'М-1'
}

const adminSlice = createSlice({
    name: 'adminSlice',
    initialState,
    reducers: {
        setAdminData(state, action: PayloadAction<{ token: string, usersData: usersDataType, adminLogin: string }>) {
            state.token = action.payload.token
            state.usersData = action.payload.usersData
            state.adminLogin = action.payload.adminLogin
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
        addNewStudent(state, action: PayloadAction<SingleStudentType & {
            dorm: string
        }>) {
            const data = action.payload
            const dataObj = {
                email: data.email,
                fullname: data.fullname,
                citizenship: data.citizenship,
                gender: data.gender,
                educationLevel: data.educationLevel,
                recordDatetime: data.recordDatetime
            }
            state.usersData[data.dorm].push(dataObj)
            console.log('STATE IS CHANGED', current(state.usersData))
        }
    }
})

export const {
    setAdminData,
    changeDorm,
    cleanupAdminStore,
    addNewStudent
} = adminSlice.actions

export default adminSlice.reducer