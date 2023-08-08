import { configureStore } from '@reduxjs/toolkit'
import globalSliceReducer from './globalSlice'
import adminSliceReducer from './adminSlice'

const store = configureStore({
    reducer: {
        globalSlice: globalSliceReducer,
        adminSlice: adminSliceReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['globalSlice/hideCalendar', 'globalSlice/showCalendar', 'globalSlice/showPopup']
            }
        })
})

export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch