"use client";

import { UserButton } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";

export default function DashboardPage() {
  const tasks = useQuery(api.functions.tasks.list);

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Tasks</h2>
        {tasks === undefined ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-muted-foreground">No tasks yet.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task._id}
                className="flex items-center gap-3 rounded-lg border border-border p-4"
              >
                <span
                  className={`h-2 w-2 rounded-full ${task.isCompleted ? "bg-green-500" : "bg-amber-500"}`}
                />
                <span className={task.isCompleted ? "line-through text-muted-foreground" : ""}>
                  {task.text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
