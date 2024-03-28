import {$axios} from "../https/axiosInstance";
import {useAsync} from "react-async-hook";
import {CreateCleanSearchParams} from "../helpers/helpers";

export const AnalyticsService = {
  GetCash(searchParams: any) {
    return useAsync(async () => {
      return await $axios.get("/cash/charts/" + CreateCleanSearchParams(searchParams));
    },[CreateCleanSearchParams(searchParams)])
  },
  GetProjects(searchParams: any) {
    return useAsync(async () => {
      return await $axios.get("/project/charts/" + CreateCleanSearchParams(searchParams));
    },[CreateCleanSearchParams(searchParams)])
  },
};
