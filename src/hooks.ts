import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './redux/index'
import { getFullWeekday } from './utils/getFullWeekday'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export function useCPDateTime() {
    const dateSelected = useAppSelector(state => state.globalSlice.userData.dateSelected)
    const timeSelected = useAppSelector(state => state.globalSlice.userData.timeSelected)

    const date = dateSelected.split(',')[0]
    const shortWeekday = dateSelected.split(',')[1].slice(1)
    if (!timeSelected) return []
    else return [`${getFullWeekday(shortWeekday)}, ${date}, ${timeSelected}`, parseInt(date).toString(), timeSelected.toString()]
}

export function useConfDateTime() {
    const dateSelected = useAppSelector(state => state.globalSlice.userData.dateSelected)
    const timeSelected = useAppSelector(state => state.globalSlice.userData.timeSelected)

    const date = dateSelected.split(',')[0]
    const shortWeekday = dateSelected.split(',')[1].slice(1)
    return `${date} в ${timeSelected} (${getFullWeekday(shortWeekday)})`
}