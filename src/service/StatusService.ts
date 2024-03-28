import { $axios } from "../https/axiosInstance";
import { useAsync } from "react-async-hook";

export const StatusService = {
  GetStatusList() {
    return useAsync(async () => {
      return await $axios.get("/user/statuses/");
    }, []);
  },
};
