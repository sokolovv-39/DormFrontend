// Unix/Windows specific datetime

export function getTimeDate(datetime: string): {
    date: string,
    time: string,
    datetime: string
} {
    if (/\//.test(datetime)) {
        const date = datetime.split('/')[1]
        const type = datetime.split(' ')[2]
        let time = datetime.split(' ')[1]
        if (time[1] === ':') time = '0' + time.slice(0, -3)
        else time = time.slice(0, -3)
        if (type === 'PM') {
            let hour = null
            if (parseInt(time) !== 12) hour = 12 + parseInt(time)
            else hour = 12
            time = hour.toString() + time.slice(2)
        }
        return {
            date,
            time,
            datetime: `${date}.08.2023, ${time[0] === '9' ? '0' + time : time}`
        }
    }
    else {
        const date = datetime.slice(0, 2)
        const time = datetime.split(' ')[1].slice(0, -3)
        return {
            date,
            time,
            datetime: `${date}.08.2023, ${time[0] === '9' ? '0' + time : time}`
        }
    }
}
