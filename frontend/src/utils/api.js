import axios from "axios";
import qs from "qs";
import config from "../config/config";


const api = axios.create({
    baseURL: config.API_URL,
    withCredentials: true,
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
})

export default api;