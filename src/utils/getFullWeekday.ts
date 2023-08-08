export function getFullWeekday(shortWeekday: string) {
    switch (shortWeekday) {
        case 'пн':
            return 'Понедельник'
        case 'вт':
            return 'Вторник'
        case 'ср':
            return 'Среда'
        case 'чт':
            return 'Четверг'
        case 'пт':
            return 'Пятница'
        case 'сб':
            return 'Суббота'
        case 'вс':
            return 'Воскресенье'
    }
}