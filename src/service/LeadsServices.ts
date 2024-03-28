import {$axios} from "../https/axiosInstance";
import {useAsync} from "react-async-hook";
import {CreateCleanSearchParams} from "../helpers/helpers";

export const LeadsService = {
    LeadsList(searchParams: any) {
        return useAsync(async () => {
            return await $axios.get(
                "/leads/" + CreateCleanSearchParams(searchParams)
            );
        }, [CreateCleanSearchParams(searchParams)]);
    },
    async CreateLeads(data: { id: string; }) {
        return await $axios.post("/leads/", data);
    },

    async UpdateLeads(data: { id: string; }) {
        return await $axios.patch("/leads/" + data.id + "/", data);
    },

    async GetLeads(id: string) {
        return await $axios.get("/leads/" + id + "/");
    },
    GetLeadNyAsyncHook(id: string) {
        return useAsync(async () => {
            return await $axios.get(
                "/leads/" + id + "/"
            );
        }, [id]);
    },

    async DeleteLeads(id: string) {
        return await $axios.delete("/leads/" + id + "/");
    },

    GetLeadsStatusesList() {
        return useAsync(async () => {
            return await $axios.get("/leads/statuses/");
        }, []);
    },

    async GetCallHistory(id: string) {
        return await $axios.get("/leads/call-history/" + id + "/");
    },
    async EditCall(data: any) {
        return await $axios.patch("/leads/call-history/" + data.id + "/", data);
    },
    async CreateCall(data: any) {
        return await $axios.post("/leads/call-history/", data);
    },
    async DeleteCall(id: any) {
        return await $axios.delete("/leads/call-history/" + id + "/");
    },
};
