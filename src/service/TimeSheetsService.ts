import {$axios} from "../https/axiosInstance";
import {useAsync} from "react-async-hook";
import {CreateCleanSearchParams} from "../helpers/helpers";

export const TimeSheetsService = {
    TimeSheetsList(searchParams: any) {
        return useAsync(async () => {
            return await $axios.get(
                "/time-sheets/sheets/" + CreateCleanSearchParams(searchParams)
            );
        }, [CreateCleanSearchParams(searchParams)]);
    },

    async CreateTimeSheets(data: { amount: string; id: string; }) {
        return await $axios.post("/time-sheets/sheets/", data);
    },

    async UpdateTimeSheets(data: { amount: string; id: string; }) {
        return await $axios.patch("/time-sheets/sheets/" + data.id + "/", data);
    },

    async DeleteTimeSheets(id: string) {
        return await $axios.delete("/time-sheets/sheets/" + id + "/");
    },

    GetProjectList(searchParams: any) {
        return useAsync(async () => {
            return await $axios.get("/time-sheets/sheets/projects/" + CreateCleanSearchParams(searchParams));
        }, [CreateCleanSearchParams(searchParams)]);
    },

    GetTaskList(searchParams: any) {
        return useAsync(async () => {
            return await $axios.get("/time-sheets/sheets/tasks/" + CreateCleanSearchParams(searchParams));
        }, [CreateCleanSearchParams(searchParams)]);
    },
};
