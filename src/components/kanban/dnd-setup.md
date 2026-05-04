# Kanban Drag and Drop — Pattern Documentation

> **Status:** Mock data implemented. Pending: `getTasks`/`updateTask` server actions from M1.

## Libraries Used

- `@dnd-kit/core` — core drag and drop context and sensors
- `@dnd-kit/sortable` — sortable list primitives
- `@dnd-kit/utilities` — CSS transform utilities

---

## Architecture Overview

```
DndContext          (KanbanBoardClient.tsx) — owns all drag state
└── SortableContext (KanbanColumn.tsx)      — defines sortable list per column
    └── useSortable (KanbanCard.tsx)        — makes each card draggable
```

---

## File Responsibilities

### `useKanbanDnd.ts` (`src/hooks/`)

- Owns `tasks` and `activeTask` state
- Contains all drag handlers: `handleDragStart`, `handleDragOver`, `handleDragEnd`
- Exposes `getTasksForColumn` utility
- Single source of truth for all DnD logic

### `KanbanBoard.tsx`

- Consumes `useKanbanDnd` hook
- Sets up sensors and `DndContext`
- Renders columns and `DragOverlay`
- No drag logic lives here

### `KanbanColumn.tsx`

- Uses `useDroppable` to register itself as a drop target
- Wraps card list in `SortableContext` with task ids

### `KanbanCard.tsx`

- Uses `useSortable` hook to become draggable
- Applies `transform` and `transition` styles from dnd-kit
- Passes `ref`, `attributes`, and `listeners` to the card element

---

## Key Implementation Details

### Sensor configuration

```ts
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }),
);
```

The `distance: 5` threshold distinguishes a click from a drag. Without it, clicking a card triggers a drag immediately.

### All drag logic lives in `useKanbanDnd` hook

`src/hooks/useKanbanDnd.ts` owns all state and handlers. `KanbanBoard.tsx` just consumes it:

```ts
const {
  tasks,
  activeTask,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  getTasksForColumn,
} = useKanbanDnd(initialTasks, columns);
```

### `handleDragStart`

Finds the task being dragged and sets it as `activeTask` for the `DragOverlay`.

### `handleDragOver` — core logic

Fires continuously during drag. Handles both same-column reordering and cross-column moves with correct insertion position.

Key rules:

- `over.id` can be a column id or a task id — always resolve to a column first
- Both same-column and cross-column cases use `arrayMove` / `splice` for position
- Downward movement within a column needs `newIndex + 1` compensation because removing the card from above shifts indices down
- `isBelowLastItem` check ensures dropping below the last card goes to the end

```ts
const isBelowLastItem =
  overTask &&
  overTasks.findIndex((t) => t.id === overId) === overTasks.length - 1;

const newIndex = overTask
  ? isBelowLastItem
    ? overTasks.length
    : overTasks.findIndex((t) => t.id === overId)
  : overTasks.length; // empty column — append at end
```

### `handleDragEnd`

Only clears `activeTask`. All position/status updates happen in `handleDragOver` — do not move logic here or you'll get double updates and position bugs.

```ts
const handleDragEnd = () => {
  setActiveTask(null);
};
```

### DragOverlay

Renders a floating copy of the card under the cursor. Without it, the original card snaps and blurs when hovering over other columns.

```tsx
<DragOverlay>
  {activeTask ? <KanbanCard task={activeTask} /> : null}
</DragOverlay>
```

### SSR / Hydration

dnd-kit generates internal IDs that differ between server and client, causing hydration errors. Fix: pass a static `id` to `DndContext` and empty accessibility announcements — this keeps IDs stable across server and client renders. `KanbanBoard.tsx` must have `"use client"` at the top.

### Stable DndContext ID

Pass a static `id` to `DndContext` to prevent mismatching aria attributes:

```tsx
<DndContext id="kanban-dnd" ...>
```

### Accessibility

dnd-kit requires announcement handlers. Use empty functions to satisfy the type without screen reader announcements (add real strings later if needed):

```tsx
accessibility={{
  announcements: {
    onDragStart: () => "",
    onDragOver: () => "",
    onDragEnd: () => "",
    onDragCancel: () => "",
  },
}}
```

---

---

## Wiring to Real Data (pending M1 server actions)

### Fetching tasks

`KanbanBoard.tsx` (or its page) should become a server component that fetches and passes tasks down:

```ts
// app/dashboard/kanban/page.tsx
import { getTasks } from "@/lib/actions/task.actions";

export default async function KanbanPage() {
  const tasks = await getTasks(); // replaces mockTasks
  return <KanbanBoard initialColumns={mockColumns} initialTasks={tasks} />;
}
```

No changes needed inside `KanbanBoardClient`, `KanbanColumn`, or `KanbanCard` — they already accept `Task[]`.

### Persisting drag updates

Update `handleDragEnd` in `KanbanBoardClient.tsx` to call `updateTask` after updating local state.
Always update local state first (optimistic update) so the UI feels instant:

```ts
import { updateTask } from "@/lib/actions/task.actions";

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over) return;

  const taskId = active.id as string;
  const overId = over.id as string;

  const targetColumnId = columns.find((col) => col.id === overId)
    ? overId
    : tasks.find((t) => t.id === overId)?.status;

  if (!targetColumnId) return;

  // 1. Update UI immediately
  setTasks((prev) =>
    prev.map((task) =>
      task.id === taskId ? { ...task, status: targetColumnId } : task,
    ),
  );

  // 2. Persist to DB (fire and forget for now)
  updateTask(taskId, { status: targetColumnId });
};
```

---

## Drag Feedback and Animations

### Card drag styles

`useSortable` provides `isDragging` — use it in `KanbanCard.tsx`:

```tsx
const { isDragging, ... } = useSortable({ id: task.id });

const style = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0.4 : 1,
};
```

Add visual feedback via className:

```tsx
<Card
  className={`cursor-grab active:cursor-grabbing ${isDragging ? "shadow-lg scale-105" : ""}`}
>
```

### Smooth reordering within a column

Install `arrayMove` from `@dnd-kit/sortable` to animate reordering when dragging within the same column:

```ts
import { arrayMove } from "@dnd-kit/sortable";

// Inside handleDragEnd, before the status update:
const activeTask = tasks.find((t) => t.id === taskId);
if (activeTask?.status === targetColumnId) {
  // Reordering within same column
  const columnTasks = tasks.filter((t) => t.status === targetColumnId);
  const oldIndex = columnTasks.findIndex((t) => t.id === taskId);
  const newIndex = columnTasks.findIndex((t) => t.id === overId);
  const reordered = arrayMove(columnTasks, oldIndex, newIndex);
  // merge reordered back into full task list
  setTasks((prev) => [
    ...prev.filter((t) => t.status !== targetColumnId),
    ...reordered,
  ]);
  return;
}
```

---

## Adding a New Droppable Area

1. Call `useDroppable({ id: "your-id" })` in the target component
2. Attach `setNodeRef` to the container element
3. Make sure `"your-id"` is handled in `handleDragEnd` in `KanbanBoardClient.tsx`

## Adding a New Draggable Item

1. Call `useSortable({ id: item.id })` in the item component
2. Apply `ref={setNodeRef}`, `style`, `{...attributes}`, `{...listeners}` to the root element
3. Make sure the item's id exists in the parent `SortableContext` items array
