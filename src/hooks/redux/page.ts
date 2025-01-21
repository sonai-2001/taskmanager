import { useDispatch, useSelector, useStore } from 'react-redux'
import type { RootState, AppDispatch, AppStore } from '@/redux-toolkit/store/store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = useSelector<RootState>
export const useAppStore = () => useStore<AppStore>()