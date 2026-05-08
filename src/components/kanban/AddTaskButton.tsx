"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import CreateTaskDialog from "./CreateTaskDialog";

type Props = {
  projectId?: string;
};

const AddTaskButton = ({ projectId }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="w-full mt-1 border-dashed text-muted-foreground h-10"
        onClick={() => setDialogOpen(true)}
      >
        <Plus size={16} />
        Add task
      </Button>

      <CreateTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projectId={projectId}
      />
    </>
  );
};

export default AddTaskButton;
