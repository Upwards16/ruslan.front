import { $axios } from "../https/axiosInstance";
import { useAsync } from "react-async-hook";
import { CreateCleanSearchParams } from "../helpers/helpers";

export const ClientsService = {
  GetClientList(searchParams: any) {
    return useAsync(async () => {
      return await $axios.get(
        "/clients/" + CreateCleanSearchParams(searchParams)
      );
    }, [CreateCleanSearchParams(searchParams)]);
  },

  GetClientProjectList(searchParams: any) {
    return useAsync(async () => {
      return await $axios.get(
          "/projects/" + CreateCleanSearchParams(searchParams)
      );
    }, [CreateCleanSearchParams(searchParams)]);
  },
  GetClientByAsyncHook(id: string) {
    return useAsync(async () => {
      return await $axios.get(
          "/clients/" + id + "/"
      );
    }, [id]);
  },
  async CreateClient(data: any) {
    return await $axios.post("/clients/create/", data);
  },
  async GetClient(id: string) {
    return await $axios.get("/clients/" + id + "/");
  },
  async UpdateClient(data: any) {
    return await $axios.patch("/clients/update/" + data.id + "/", data);
  },
  async DeleteClient(id: string) {
    return await $axios.delete("/clients/" + id + "/");
  },
};
