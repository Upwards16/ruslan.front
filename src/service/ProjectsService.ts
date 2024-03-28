import {$axios} from "../https/axiosInstance";
import {useAsync} from "react-async-hook";
import {CreateCleanSearchParams} from "../helpers/helpers";

export const ProjectsService = {
    GetProjectList(searchParams: any) {
        return useAsync(async () => {
            return await $axios.get(
                "/projects/" + CreateCleanSearchParams(searchParams)
            );
        }, [CreateCleanSearchParams(searchParams)]);
    },
    GetProjectParticipantsListBySearch(searchParams: any) {
        return useAsync(async () => {
            return await $axios.get(
                "/projects/participants/search/" + CreateCleanSearchParams(searchParams)
            );
        }, [CreateCleanSearchParams(searchParams)]);
    },
    GetProjectStatuses() {
        return useAsync(async () => {
            return await $axios.get(
                "/projects/statuses/"
            );
        }, []);
    },
    GetProjectClients() {
        return useAsync(async () => {
            return await $axios.get(
                "/clients/all/"
            );
        }, []);
    },
    GetProjectByAsyncHook(id: string) {
        return useAsync(async () => {
            return await $axios.get(
                "/projects/" + id + "/"
            );
        }, [id]);
    },
    async UpdateProject(data: any) {
        const newData = data
        let form_data = new FormData()
        for (let key in newData) {
            if (newData[key] === '') {
                delete newData[key]
            }
            else{
                form_data.append(key, newData[key]);
            }
        }
        return await $axios.patch("/projects/update/" + data.id + "/", form_data);
    },
    async CreateProject(data: any) {
        const newData = data
        let form_data = new FormData()
        for (let key in newData) {
            if (newData[key] === '') {
                delete newData[key]
            }
            else{
                form_data.append(key, newData[key]);
            }
        }
        return await $axios.post("/projects/create/", form_data);
    },
    async DeleteProject(id: string) {
        return await $axios.delete("/projects/" + id + "/");
    },
    async CreateParticipants(data: any) {
        return await $axios.post("/projects/participants/", data);
    },
    async DeleteParticipants(data: any) {
        return await $axios.post("/projects/participants/delete/",data);
    },
    async CreateWorkStep(data: any) {
        return await $axios.post("/projects/work-steps/", data);
    },
    async UpdateWorkStep(data: any, project: any) {
        return await $axios.patch("/projects/work-steps/" + project + "/", data);
    },
    async DeleteWorkStep(id: any) {
        return await $axios.delete("/projects/work-steps/" + id + "/");
    },
};
