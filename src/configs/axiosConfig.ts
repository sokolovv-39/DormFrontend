import axios from "axios";

export const axiosRequest = axios.create({
    baseURL: 'https://pet-project39.ru/'
})