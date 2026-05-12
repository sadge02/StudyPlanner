"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { createTaskSchema } from "@/schemas/task.schema";

type FormInput = z.input<typeof createTaskSchema>;
type FormOutput = z.output<typeof createTaskSchema>;
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Task, TaskPriority } from "@/types";
import { createTask, updateTask } from "@/lib/actions/task.actions";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task & {
    endTime: string;
  }; // optional — if provided, dialog is in edit mode
  projectId?: string;
};

const CreateTaskDialog = ({ open, onOpenChange, task, projectId }: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: task?.priority ?? "MEDIUM",
      title: task?.title ?? "",
      description: task?.description ?? "",
      deadline: task?.deadline
        ? new Date(task.deadline).toISOString().split("T")[0]
        : null,
    },
  });

  const onSubmit = async (data: FormOutput) => {
    let response;
    if (task) {
      response = await updateTask(task.id, {
        ...data,
        projectId: projectId,
        deadline: data.deadline ?? null,
      });
    } else {
      response = await createTask({
        ...data,
        projectId: projectId,
        deadline: data.deadline ?? null,
      });
    }

    if (response.success) {
      toast.success(
        `Task ${response.data!.title} ${task ? "updated" : "created"}`,
      );
    } else {
      toast.error(
        response.message ??
          "Failed to " + (task ? "update" : "create") + " task",
      );
    }

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Input placeholder="Task title" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Textarea
              placeholder="Add description..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="priority-deadline flex gap-4 flex-col">
            <div className="flex items-center gap-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <Select
                defaultValue={task?.priority ?? "MEDIUM"}
                name="priority"
                onValueChange={(val) =>
                  setValue("priority", val as TaskPriority)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={"LOW"}>Low</SelectItem>
                  <SelectItem value={"MEDIUM"}>Medium</SelectItem>
                  <SelectItem value={"HIGH"}>High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="deadline" className="text-sm font-medium">
                Deadline
              </label>
              <Input type="date" {...register("deadline")} className="w-fit" />
              {errors.deadline && (
                <p className="text-xs text-red-500">
                  {errors.deadline.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button className="bg-blue-600" type="submit">
              {task ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
