
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface ExitDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  gameState: "pre-game" | "in-progress" | "completed";
  confirmExit: () => Promise<void>;
}

const ExitDialog: React.FC<ExitDialogProps> = ({
  open,
  setOpen,
  gameState,
  confirmExit,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Exit Game?</AlertDialogTitle>
          <AlertDialogDescription>
            {gameState === "pre-game"
              ? "You are about to leave this table. Your entry fee will be refunded."
              : "You are about to forfeit this game. Your entry fee will not be refunded."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmExit}>
            Exit Game
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExitDialog;
