"use client";

import { Task } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Calendar, Flag, Pen } from "lucide-react";
import { Badge } from "../ui/badge";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type KanbanCardProps = {
  task: Task;
};

const priorityColor = {
  HIGH: "text-red-500",
  MEDIUM: "text-yellow-500",
  LOW: "text-green-500",
};

const KanbanCard = ({ task }: KanbanCardProps) => {
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-xs gap-2 cursor-grab active:cursor-grabbing"
    >
      <CardHeader>
        {task.subjectId && (
          <div className="flex flex-row items-center justify-between w-full">
            <Badge variant="outline" className="text-xs p-2">
              {task.subjectId.toUpperCase()}
            </Badge>
            <Pen size={15} className="cursor-pointer ml-auto" />
          </div>
        )}
        <CardTitle className="items-center flex">
          {task.title}
          {!task.subjectId && (
            <Pen size={15} className="cursor-pointer ml-auto" />
          )}
        </CardTitle>
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
        <Flag size={15} className={`ml-auto ${priorityColor[task.priority]}`} />
      </CardContent>
    </Card>
  );
};

export default KanbanCard;
