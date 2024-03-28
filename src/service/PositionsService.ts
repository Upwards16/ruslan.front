import { $axios } from "../https/axiosInstance";
import { useAsync } from "react-async-hook";

export const PositionsService = {
  GetPositionList() {
    return useAsync(async () => {
      return await $axios.get("/user/positions/");
    }, []);
  },
};
