import classes from './ViewEnrollComp.module.scss'
import { ReactComponent as EditSVG } from './assets/EditEnroll.svg'
import { ReactComponent as DeleteSVG } from './assets/DeleteIcon.svg'
import { SingleStudentType, saveDeletingUser } from '../../redux/adminSlice'
import { useAppDispatch } from '../../hooks'
import { checkShowAddEnroll, showNotify } from '../../redux/globalSlice'

export default function ViewEnrollComp({ students }: { students: Array<SingleStudentType> | undefined }) {
    const dispatch = useAppDispatch()

    return (
        <div className={classes.Wrapper}>
            <div className={`${classes.GridContainer} ${classes.TableHeader}`}>
                <p>ФИО</p>
                <p>Пол</p>
                <p>Страна</p>
                <p>Почтовый адрес</p>
                <p>Степень</p>
                <p>Время</p>
            </div>
            {
                students?.map(student => {
                    return (
                        <div key={student.email} className={classes.GridContainer}>
                            <p>{student.fullname}</p>
                            <p>{student.gender}</p>
                            <p>{student.citizenship}</p>
                            <p>{student.email}</p>
                            <p>{student.educationLevel}</p>
                            <p>{student.recordDatetime}</p>
                            <div className={classes.Icons}>
                                <EditSVG style={{ cursor: 'pointer' }} onClick={() => dispatch(checkShowAddEnroll({
                                    mode: 'edit',
                                    editData: student
                                }))} />
                                <DeleteSVG style={{ cursor: 'pointer'}} className={classes.DeleteIcon} onClick={(e) => {
                                    dispatch(showNotify({
                                        isShow: true,
                                        type: 'DeleteEnroll',
                                        event: e
                                    }))
                                    dispatch(saveDeletingUser(student))
                                }} />
                            </div>
                        </div>
                    )
                })
            }
        </div >
    )
}