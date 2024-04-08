import { useContext } from "react";
import { ModalContext } from "../containers/ModalContext";

export function useModal() {
  return useContext(ModalContext);
}
