import axios from 'axios'

export const Requests = () => {
    const instance = axios.create({
        baseURL: 'http://localhost:5000/',
    })

    instance.interceptors.request.use(
        (config) => {
            // //debugger;
            // //console.log(environment);
            // //console.log('T0KEN', token);
            // let token = '';
            // //const token = localStorage.getItem('token');

            // //console.log(document.cookie);
            // let cookie = cookieToObject(document.cookie);
            // if (cookie.Authorization) {
            //     token = 'Bearer ' + cookie.Authorization;
            // }
            config.headers['Content-Type'] = 'application/json'
            config.headers['Access-Control-Allow-Origin'] = '*'
            config.headers.withCredentials = true
            // config.headers.Authorization = token ? token : '';
            return config
        },
        (error) => {
            return Promise.reject(error)
        },
    )
    instance.interceptors.response.use(
        (response) => {
            // console.log('INTERCEPRO,', response);
            return response
        },
        (error) => {
            // if (error.code == 'ERR_NETWORK') {
            //     return window.location.assign('/login');
            // }
            // if (error.config.headers.Authorization == '') {
            //     return window.location.assign('/login');
            // }
            // if (error.response.status == 401) {
            //     return window.location.assign('/login');
            // }
            return error.response
        },
    )
    const get = async (url, params = {}, config = {}) => {
        return await instance.get(url, { headers: { ...config }, params })
    }
    const post = async (url, params = {}, config = {}) =>
        await instance.post(url, {
            ...params,
            headers: { ...config },
        })
    const put = async (url, params = {}, config = {}) => await instance.put(url, { ...params }, { ...config })
    const del = async (url, params = {}, config = {}) => await instance.delete(url, { headers: { ...config }, params })
    return { get, post, put, del }
}
