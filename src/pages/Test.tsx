import { useState } from "react";
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
  type DragEndEvent,
} from "@/components/ui/shadcn-io/kanban";

type Item = { id: string; name: string; column: string };
type Col = { id: string; name: string };

const initialColumns: Col[] = [
  { id: "todo", name: "To do" },
  { id: "inprogress", name: "In progress" },
  { id: "done", name: "Done" },
];

const initialData: Item[] = [
  { id: "1", name: "Setup project", column: "todo" },
  { id: "2", name: "Design schema", column: "inprogress" },
  { id: "3", name: "Implement API", column: "inprogress" },
  { id: "4", name: "Write tests", column: "done" },
];

export default function KanbanPlayground() {
  const [data, setData] = useState<Item[]>(initialData);

  const handleChange = (next: Item[]) => setData(next);
  const handleDragEnd = (_e: DragEndEvent) => {
    // optional: console.log(_e);
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-semibold">Kanban Playground</h1>

      <KanbanProvider<Item, Col>
        columns={initialColumns}
        data={data}
        onDataChange={handleChange}
        onDragEnd={handleDragEnd}
        className="auto-cols-[minmax(280px,1fr)]"
      >
        {(col) => (
          <KanbanBoard key={col.id} id={col.id}>
            <KanbanHeader>{col.name}</KanbanHeader>

            {/* Tinggi area kartu biar enak discroll */}
            <div className="h-[70vh]">
              <KanbanCards<Item> id={col.id}>
                {(item) => (
                  <KanbanCard<Item> key={item.id} {...item}>
                    <div className="flex items-center justify-between">
                      <p className="m-0 text-sm font-medium">{item.name}</p>
                      <span className="text-xs opacity-60">#{item.id}</span>
                    </div>
                  </KanbanCard>
                )}
              </KanbanCards>
            </div>
          </KanbanBoard>
        )}
      </KanbanProvider>
    </div>
  );
}
