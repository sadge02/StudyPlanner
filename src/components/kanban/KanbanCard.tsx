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

type KanbanCardProps = {
  task: Task;
};

const priorityColor = {
  HIGH: "text-red-500",
  MEDIUM: "text-yellow-500",
  LOW: "text-green-500",
};

// TODO: Add the color coding from design?
const KanbanCard = ({ task }: KanbanCardProps) => {
  return (
    <Card className="w-xs gap-2">
      <CardHeader>
        {task.subjectId && (
          <div className="flex flex-row items-center justify-between w-full">
            <Badge variant="outline" className="text-xs p-2">
              {task.subjectId.toUpperCase()}
            </Badge>
            <Pen size={16} className="cursor-pointer ml-auto" />
          </div>
        )}
        <CardTitle className="items-center flex">
          <Flag size={16} className={`${priorityColor[task.priority]} mr-2`} />
          {task.title}
          {!task.subjectId && (
            <Pen size={16} className="cursor-pointer ml-auto" />
          )}
        </CardTitle>
        <CardDescription>{task.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex gap-2 text-gray-500">
          <Calendar size={18} />
          {task.deadline
            ? new Date(task.deadline).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })
            : "No deadline set"}
        </div>
      </CardContent>
    </Card>
  );
};

export default KanbanCard;
