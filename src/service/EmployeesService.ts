import {$axios} from "../https/axiosInstance";
import {useAsync} from "react-async-hook";
import {CreateCleanSearchParams} from "../helpers/helpers";
import {employeeI} from "../models/employeeModel";

export const EmployeesService = {
    GetEmployeeList(searchParams: any) {
        return useAsync(async () => {
            return await $axios.get(
                "/users/" + CreateCleanSearchParams(searchParams)
            );
        }, [CreateCleanSearchParams(searchParams)]);
    },
    async CreateEmployee(data: employeeI) {
        return await $axios.post("/users/create/", data);
    },
    async GetEmployee(id: string) {
        return await $axios.get("/users/" + id + "/");
    },
    async UpdateEmployee(data: employeeI) {
        return await $axios.patch("/users/update/" + data.id + "/", data);
    },
    async DeleteEmployee(id: string) {
        return await $axios.delete("/users/" + id + "/");
    },

    GetEmployeeByAsyncHook(id: string) {
        return useAsync(async () => {
            return await $axios.get(
                "/users/" + id + "/"
            );
        }, [id]);
    },

};
