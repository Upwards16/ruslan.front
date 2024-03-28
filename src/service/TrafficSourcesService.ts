import { $axios } from "../https/axiosInstance";
import { useAsync } from "react-async-hook";

export const TrafficSourceService = {
  GetTrafficSourceList() {
    return useAsync(async () => {
      return await $axios.get("/clients/traffic-sources/");
    }, []);
  },
};
