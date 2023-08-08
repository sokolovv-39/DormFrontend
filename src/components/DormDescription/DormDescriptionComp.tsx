import { useAppSelector } from "../../hooks"

export default function DormDescriptionComp() {
    const dormitory = useAppSelector(state => state.globalSlice.userData.dormitory)
    const contacts = useAppSelector(state => state.globalSlice.userData.contacts)

    return (
        <div>
            <h3>Вы распределены в общежитие {dormitory.name}</h3>
            <div>
                <div>
                    <p>Студгородок &#171;{dormitory.name}&#187;</p>
                    <p>{dormitory.address}</p>
                </div>
                <div>
                    {contacts}
                </div>
            </div>
            <div>
                <p>{dormitory.description}</p>
            </div>
        </div>
    )
}