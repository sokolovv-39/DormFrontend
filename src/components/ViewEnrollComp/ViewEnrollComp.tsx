import classes from './ViewEnrollComp.module.scss'

type StudentElem = {
    email: string,
    fullname: string,
    gender: string,
    citizenship: string,
    educationLevel: string,
    recordDatetime: string
}

export default function ViewEnrollComp({ students }: { students: Array<StudentElem> | undefined }) {
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
                        </div>
                    )
                })
            }
        </div >
    )
}