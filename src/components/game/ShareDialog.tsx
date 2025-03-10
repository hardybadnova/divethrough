
import React from "react";
import { toast } from "@/hooks/use-toast";
import { Pool } from "@/types/game";
import { 
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ShareDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  gameUrl: string;
  pool: Pool;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  setOpen,
  gameUrl,
  pool,
}) => {
  const copyGameLink = () => {
    navigator.clipboard.writeText(gameUrl);
    toast({
      title: "Link Copied!",
      description: "Share this link with your friends to play together"
    });
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Invite Friends to Play</AlertDialogTitle>
          <AlertDialogDescription>
            Share this link with your friends so they can join the same game
            table. You'll be able to play together in real-time!
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center space-x-2 mt-2 mb-4">
          <input
            readOnly
            value={gameUrl}
            className="flex-1 px-3 py-2 border rounded-md bg-muted/30"
          />
          <Button onClick={copyGameLink} variant="outline">
            Copy
          </Button>
        </div>

        <div className="bg-muted/30 p-3 rounded-md mb-4">
          <p className="text-sm font-medium mb-1">
            Current players: {pool.currentPlayers}
          </p>
          <p className="text-xs text-muted-foreground">
            Maximum players: {pool.maxPlayers}
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ShareDialog;
