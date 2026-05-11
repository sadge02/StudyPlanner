"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { joinProject } from "@/lib/actions/project.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function JoinProjectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setCode("");
    setErrorMessage(null);
  };

  const handleSubmit = () => {
    setErrorMessage(null);

    if (!code.trim()) {
      setErrorMessage("Please enter an invite code");
      return;
    }

    startTransition(async () => {
      const response = await joinProject(code.trim());

      if (!response.success) {
        setErrorMessage(response.message ?? "Failed to join project");
        return;
      }

      toast.success(`Joined project: ${response.data!.name}`);
      resetForm();
      setOpen(false);
      router.refresh();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isPending) {
      handleSubmit();
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Users className="size-4" />
        Join Project
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen && !isPending) {
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join project</DialogTitle>
            <DialogDescription>
              Enter the invite code to join a shared workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-code">Invite code</Label>
              <Input
                id="invite-code"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  setErrorMessage(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. ABC123XYZ"
                disabled={isPending}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Invite codes are case-insensitive. Ask the project admin for a code.
              </p>
            </div>

            {errorMessage ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Joining..." : "Join"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
