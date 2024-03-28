import {$axios} from "../https/axiosInstance";
import {useAsync} from "react-async-hook";
import {CreateCleanSearchParams} from "../helpers/helpers";

export const TasksService = {
    async GetTaskList(searchParams: any) {
        return await $axios.get(
            "/tasks/tasks/" + CreateCleanSearchParams(searchParams)
        );
    },
    GetTaskColumns() {
        return useAsync(async () => {
            return await $axios.get(
                "/tasks/columns/"
            );
        }, []);
    },
    GetTaskMarks() {
        return useAsync(async () => {
            return await $axios.get(
                "/tasks/marks/"
            );
        }, []);
    },
    GetTaskParticipants(searchParams: any) {
        return useAsync(async () => {
            return await $axios.get(
                "/tasks/participants/" + CreateCleanSearchParams(searchParams)
            );
        }, [CreateCleanSearchParams(searchParams)]);
    },
    async CreateTask(data: any) {
        const newData = data
        let form_data = new FormData()
        for (let key in newData) {
            if (Array.isArray(newData[key])) {
                for (let i=0;i<newData[key].length;i++){
                    form_data.append(key, newData[key][i]);
                }
            }
            else{
                form_data.append(key, newData[key]);
            }
        }
        return await $axios.post("/tasks/tasks/create/", form_data);
    },
    async UpdateTask(data: any) {
        const newData = data
        let form_data = new FormData()
        for (let key in newData) {
            if (Array.isArray(newData[key])) {
                for (let i=0;i<newData[key].length;i++){
                    form_data.append(key, newData[key][i]);
                }
            }
            else{
                form_data.append(key, newData[key]);
            }
        }
        return await $axios.patch("/tasks/tasks/update/" + data.id + "/", form_data);
    },
    async DeleteTask(id: string) {
        return await $axios.delete("/tasks/tasks/" + id + "/");
    },
    async UpdatePosition(data: any) {
        return await $axios.post("/tasks/move/", data);
    },
};
