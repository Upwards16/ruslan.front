import { $axios } from "../https/axiosInstance";
import {useAsync} from "react-async-hook";

export const AuthService = {
  async GetToken(email: any, password: any) {
    return await $axios.post("/token/", {
      email: email,
      password: password,
    });
  },
  GetUser() {
    return useAsync(async () => {
      return await $axios.get("/me/");
    },[])
  },
};
