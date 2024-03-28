import {$axios} from "../https/axiosInstance";
import {useAsync} from "react-async-hook";
import {CreateCleanSearchParams} from "../helpers/helpers";

export const ExpensesService = {
    ExpensesList(searchParams: any) {
        return useAsync(async () => {
            return await $axios.get(
                "/cash/expenses/" + CreateCleanSearchParams(searchParams)
            );
        }, [CreateCleanSearchParams(searchParams)]);
    },
    async CreateExpenses(data: { amount: string; id: string; }) {
        return await $axios.post("/cash/expenses/", data);
    },

    async UpdateExpenses(data: { amount: string; id: string; }) {
        return await $axios.patch("/cash/expenses/" + data.id + "/", data);
    },

    async GetExpenses(id: string) {
        return await $axios.get("/cash/expenses/" + id + "/");
    },

    async DeleteExpenses(id: string) {
        return await $axios.delete("/cash/expenses/" + id + "/");
    },

    GetExpensesTypeList() {
        return useAsync(async () => {
            return await $axios.get("/cash/expense-types/");
        }, []);
    },

};
