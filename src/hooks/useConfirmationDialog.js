import { useState } from "react";

export const useConfirmationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    type: "default",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showConfirmation = ({
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "default",
  }) => {
    return new Promise((resolve) => {
      setDialogConfig({
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          setIsOpen(false);
          resolve(true);
        },
        onCancel: () => {
          setIsOpen(false);
          resolve(false);
        },
      });
      setIsOpen(true);
    });
  };

  const hideConfirmation = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    dialogConfig,
    showConfirmation,
    hideConfirmation,
  };
};
