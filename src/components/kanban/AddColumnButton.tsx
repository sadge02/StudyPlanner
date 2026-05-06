"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus } from "lucide-react";

type Props = { onAdd: (name: string) => void };

const AddColumnButton = ({ onAdd }: Props) => {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");

  const handleConfirm = () => {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
    setAdding(false);
  };

  if (!adding) {
    return (
      <Button
        variant="outline"
        className="h-10 border-dashed text-muted-foreground shrink-0 w-72 mt-8"
        onClick={() => setAdding(true)}
      >
        <Plus size={16} />
        Add column
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-72 shrink-0 mt-8">
      <Input
        autoFocus
        className="bg-white"
        placeholder="Column name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleConfirm();
          if (e.key === "Escape") setAdding(false);
        }}
      />
      <div className="flex gap-2 justify-end">
        <Button size="sm" onClick={handleConfirm}>
          Add
        </Button>
        <Button size="sm" variant="outline" onClick={() => setAdding(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AddColumnButton;
