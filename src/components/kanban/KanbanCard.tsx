"use client";

import { Task } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Calendar, Pen } from "lucide-react";
import { Badge } from "../ui/badge";

type KanbanCardProps = {
  task: Task;
};

// TODO: Add the color coding from design?
const KanbanCard = ({ task }: KanbanCardProps) => {
  return (
    <Card className="w-sm">
      <CardHeader>
        {task.subjectId && (
          <div className="flex flex-row items-center justify-between w-full mb-2">
            <Badge variant="outline" className="text-md p-3">
              {task.subjectId.toUpperCase()}
            </Badge>
            <Pen className="size-4 cursor-pointer ml-auto" />
          </div>
        )}
        <CardTitle className="items-center flex">
          {task.title}
          {!task.subjectId && <Pen className="size-4 cursor-pointer ml-auto" />}
        </CardTitle>
        <CardDescription>{task.description}</CardDescription>
      </CardHeader>

      <CardContent>
        {task.deadline && (
          <div className="flex gap-2 items-center text-gray-500">
            <Calendar />
            {task.deadline}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KanbanCard;
