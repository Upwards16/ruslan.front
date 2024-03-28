import {$axios} from "../https/axiosInstance";
import {useAsync} from "react-async-hook";
import {CreateCleanSearchParams} from "../helpers/helpers";

export const IncomesService = {
    IncomesList(searchParams: any) {
        return useAsync(async () => {
            return await $axios.get(
                "/cash/incomes/" + CreateCleanSearchParams(searchParams)
            );
        }, [CreateCleanSearchParams(searchParams)]);
    },
    async CreateIncomes(data: { amount: string; id: string; act_number: string }) {
        return await $axios.post("/cash/incomes/", data);
    },
    async UpdateIncomes(data: { amount: string; id: string; act_number: string }) {
        return await $axios.patch("/cash/incomes/" + data.id + "/", data);
    },
    async DeleteIncomes(id: string) {
        return await $axios.delete("/cash/incomes/" + id + "/");
    },
    GetPaymentTypesList() {
        return useAsync(async () => {
            return await $axios.get("/cash/payment-types/");
        }, []);
    },
    GetProjectList(searchParams: any) {
        return useAsync(async () => {
            return await $axios.get(
                "/projects/search/" + CreateCleanSearchParams(searchParams)
            );
        }, [CreateCleanSearchParams(searchParams)]);
    },
};
