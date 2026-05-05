"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema, CreateTaskFormInput } from "@/schemas/task.schema";
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus: string;
  task?: Task; // optional — if provided, dialog is in edit mode
};

const CreateTaskDialog = ({
  open,
  onOpenChange,
  defaultStatus,
  task,
}: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormInput>({
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

  const onSubmit = (data: CreateTaskFormInput) => {
    if (task) {
      // await updateTask(task.id, data);
      console.log("UPDATING", { ...data, id: task.id });
    } else {
      // await createTask({ ...data, status: defaultStatus });
      console.log("CREATING", { ...data, status: defaultStatus });
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

          <div className="priority-deadline flex gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <Select
                defaultValue={"MEDIUM"}
                name="priority"
                onValueChange={(val) =>
                  setValue("priority", val as TaskPriority)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="pl-2">
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
              <Input type="date" {...register("deadline")} />
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
