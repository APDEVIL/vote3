"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open:           boolean;
  onOpenChange:   (open: boolean) => void;
  title:          string;
  description:    string;
  confirmLabel?:  string;
  cancelLabel?:   string;
  variant?:       "default" | "destructive";
  isLoading?:     boolean;
  onConfirm:      () => void;
}

/**
 * Reusable confirmation dialog.
 *
 * Usage:
 *   <ConfirmDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="Cast your vote"
 *     description="You cannot change your vote after submitting."
 *     confirmLabel="Submit vote"
 *     onConfirm={handleVote}
 *   />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel  = "Cancel",
  variant      = "default",
  isLoading    = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
            className={
              variant === "default"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : undefined
            }
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}