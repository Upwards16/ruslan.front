import {$axios} from "../https/axiosInstance";
import {useAsync} from "react-async-hook";

export const ManagerService = {
    GetManager() {
        return useAsync(async () => {
            return await $axios.get("/users/?position__slug=sales-manager");
        }, []);
    },
};
