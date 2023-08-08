import axios from "axios";

export const axiosRequest = axios.create({
    baseURL: 'http://95.163.235.163:4200/'
})