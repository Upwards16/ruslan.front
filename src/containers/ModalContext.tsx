import React, { createContext, useState } from "react";
import { Modal } from "@mui/material";
import clsx from "clsx";
import { Button } from "../components/UI/Button";

type DialogConfig = {
  submitButtonText?: string;
  submitVariant?: "outline" | "contained";
  onSubmit?: () => void;
  cancelButtonText?: string;
  cancelVariant?: "outline" | "contained";
  onCancel?: () => void;
};

type ModalContextType = {
  showModal: boolean;
  openModal: (node: React.ReactNode) => void;
  closeModal: () => void;
  openDialog: (title: string, config?: DialogConfig) => void;
  className?: string;
};

//@ts-ignore
export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
);

//@ts-ignore
export default function ModalProvider({ children }) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<any>(<h2>Hello Modal</h2>);

  const openModal = (node: React.ReactNode) => {
    setShowModal(true);
    setModalContent(node);
  };
  const closeModal = () => {
    setShowModal(false);
    setModalContent(<></>);
  };

  const openDialog = (title: string, config?: DialogConfig) => {
    setModalContent(
      <div className="w-[768px] py-[70px]">
        <h2 className="text-black text-[24px] text-center font-bold">
          {title}
        </h2>
        <div className="mt-[50px] flex justify-center items-center gap-[60px]">
          <Button
            onClick={() => {
              if (config && config.onCancel) {
                config.onCancel();
              } else {
                closeModal();
              }
            }}
            className="max-w-[220px]"
          >
            {config && config.cancelButtonText
              ? config.cancelButtonText
              : "Отменить"}
          </Button>
          <Button
            onClick={() => {
              if (config && config.onSubmit) {
                config.onSubmit();
              }
            }}
            className="max-w-[220px]"
          >
            {config && config.submitButtonText
              ? config.submitButtonText
              : "Подтвердить"}
          </Button>
        </div>
      </div>
    );
    setShowModal(true);
  };
  return (
    <ModalContext.Provider
      value={{
        showModal,
        closeModal,
        openModal,
        openDialog,
      }}
    >
      <Modal
        open={showModal}
        onClose={closeModal}
        sx={{
          "& .MuiModal-backdrop": {
            backgroundColor: "rgba(42, 40, 38,0.1)",
          },
        }}
        className="flex items-center justify-center !background-transparent backdrop-blur-sm"
      >
        <div
          className={clsx(
            "h-max max-h-[100%] w-max bg-beige_bg rounded-[10px] p-4 overflow-y-auto overflow-x-hidden"
          )}
        >
          {modalContent}
        </div>
      </Modal>
      {children}
    </ModalContext.Provider>
  );
}
