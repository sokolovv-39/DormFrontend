type timeType = {
    time: string,
    isBusy: boolean
}
type freeTimesType = {
    [key: string]: Array<timeType>
}

export function createTimes(timesArr: Array<string>): freeTimesType {
    let freeTimes: freeTimesType = {
        '25': [],
        '26': [],
        '27': [],
        '28': [],
        '29': [],
        '30': [],
        '31': []
    }
    function createFullFree(): Array<timeType> {
        const fullFree: Array<timeType> = []
        for (let i = 9; i <= 17; i++) {
            for (let j = 0; j <= 45; j += 15) {
                fullFree.push({
                    time: `${i}:${j === 0 ? '00' : j}`,
                    isBusy: false
                })
            }
        }
        return fullFree
    }
    for (let key in freeTimes) {
        freeTimes[key] = createFullFree()
    }
    timesArr.forEach(timeBusy => {
        const date = timeBusy.substring(0, 2)
        const time = timeBusy.split(',')[1].slice(1, 6)
        const foundIndex = freeTimes[date].findIndex(val => val.time === time)
        if (foundIndex !== -1) {
            freeTimes[date][foundIndex].isBusy = true
        }
    })
    return freeTimes
}