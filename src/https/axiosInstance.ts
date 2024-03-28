import axios from "axios";
import {getCookie, removeCookie, setCookie} from "typescript-cookie";
import jwtDecode from "jwt-decode";

export const $axios = axios.create({
    withCredentials: false,
    baseURL: "http://178.128.112.102:8000/api",
});

export const access_token_name = "upwards_access_token";
export const refresh_token_name = "upwards_refresh_token";
export const position = "upwards_position";

const access_token = getCookie(access_token_name);
const refresh_token = getCookie(access_token_name);
const userPosition = getCookie(position);

export const Logout = () => {
    const confirmLogout = window.confirm("Вы уверены, что хотите выйти ?");

    if (confirmLogout) {
        removeCookie(access_token_name);
        removeCookie(refresh_token_name);
        removeCookie(position);
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
};

$axios.interceptors.request.use(
    (config) => {
        if (
            typeof access_token !== "undefined" &&
            typeof refresh_token !== "undefined" &&
            typeof userPosition !== "undefined"
        ) {
            config.headers.Authorization = `JWT ${access_token}`;
            if (
                config.url?.includes("/users/create/") ||
                config.url?.includes("/users/update/") ||
                config.url?.includes("/projects/update/") ||
                config.url?.includes("/projects/create/") ||
                config.url?.includes("/tasks/tasks/create/") ||
                config.url?.includes("/tasks/tasks/update/") ||
                config.url?.includes("/cash/expenses/")
            ) {
                config.headers["Content-Type"] = "multipart/form-data";
            } else {
                config.headers["Content-Type"] = "application/json";
            }
            return config;
        } else {
            return config;
        }
    },
    (error) => {
        return error;
    }
);

$axios.interceptors.response.use(
    (config) => {
        return config;
    },
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response.status === 401 &&
            !error.config.url?.includes("/token/") &&
            error.config &&
            !error.config._isRetry
        ) {
            originalRequest._isRetry = true;
            if (
                typeof access_token !== "undefined" &&
                typeof refresh_token !== "undefined" &&
                typeof userPosition !== "undefined"
            ) {
                try {
                    const response = await axios.post(
                        "/token/refresh/",
                        JSON.stringify({refresh: refresh_token}),
                        {
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    // Get the current time in seconds
                    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

                    const accessDecode: any = jwtDecode(response.data.access);

                    const accessExpirationInSeconds = accessDecode.exp;

                    // Calculate the difference in seconds
                    const accessDifferenceInSeconds =
                        accessExpirationInSeconds - currentTimeInSeconds;

                    // Convert the difference in seconds to days
                    const accessDifferenceInDays = Math.ceil(
                        accessDifferenceInSeconds / (60 * 60 * 24)
                    );

                    setCookie(access_token_name, response.data.access, {
                        expires: accessDifferenceInDays,
                    });
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                    return $axios.request(originalRequest);
                } catch (e) {
                    Logout();
                }
            } else {
                Logout();
            }
            throw error;
        } else {
            return Promise.reject(error);
        }
    }
);
