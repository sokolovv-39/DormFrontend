export function requestErrorHandler(err: any) {
    if (err.response) {
        console.log('Response Error', err.response)
    }
    else if (err.request) {
        console.log('Request Error', err.request)
    }
    else {
        console.log('Request Config Error', err.message)
    }
}