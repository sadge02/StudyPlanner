"use client";

import { Task } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Calendar, Pen, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import CreateTaskDialog from "./CreateTaskDialog";

type KanbanCardProps = {
  task: Task;
  onDelete?: (taskId: string) => void;
};

const priorityColor = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
};

const KanbanCard = ({ task, onDelete }: KanbanCardProps) => {
  const [editOpen, setEditOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const icons = (
    <div className="flex gap-3 ml-auto">
      <Pen
        size={15}
        className="cursor-pointer text-muted-foreground hover:text-foreground"
        onClick={(e) => {
          e.stopPropagation();
          setEditOpen(true);
        }}
      />
      <Trash2
        size={15}
        className="cursor-pointer text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(task.id);
        }}
      />
    </div>
  );

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="w-xs gap-2 cursor-grab active:cursor-grabbing shadow-sm"
      >
        <CardHeader>
          {task.subjectId ? (
            <>
              <div className="flex flex-row items-center w-full">
                <Badge variant="outline" className="text-xs p-2">
                  {task.subjectId.toUpperCase()}
                </Badge>
                {icons}
              </div>
              <CardTitle>{task.title}</CardTitle>
            </>
          ) : (
            <div className="flex flex-row items-center w-full">
              <CardTitle>{task.title}</CardTitle>
              {icons}
            </div>
          )}
          <CardDescription>{task.description}</CardDescription>
        </CardHeader>

        <CardContent className="flex items-center justify-between">
          <div className="flex gap-2 text-gray-500 text-sm">
            <Calendar size={18} />
            {task.deadline
              ? new Date(task.deadline).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })
              : "No deadline set"}
          </div>
          <Badge
            variant="secondary"
            className={`text-xs shadow-sm ${priorityColor[task.priority]}`}
          >
            {task.priority}
          </Badge>
        </CardContent>
      </Card>

      <CreateTaskDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        task={task}
      />
    </>
  );
};

export default KanbanCard;
