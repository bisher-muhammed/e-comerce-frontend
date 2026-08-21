"use client";

import { Pencil, Trash2 } from "lucide-react";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (category: Category) => void;
}

export default function CategoryTable({
  categories,
  onEdit,
  onDelete,
  onToggleStatus,
}: CategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="border border-border bg-background px-6 py-12 text-center">
        <p className="text-sm font-medium">
          No categories found
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Create your first category to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full min-w-[700px] text-sm">
        <thead className="border-b border-border bg-secondary/40">
          <tr>
            <th className="px-4 py-3 text-left font-medium">
              Name
            </th>

            <th className="px-4 py-3 text-left font-medium">
              Slug
            </th>

            <th className="px-4 py-3 text-left font-medium">
              Description
            </th>

            <th className="px-4 py-3 text-left font-medium">
              Status
            </th>

            <th className="px-4 py-3 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {categories.map((category) => (
            <tr
              key={category.id}
              className="border-b border-border last:border-b-0"
            >
              <td className="px-4 py-4 font-medium">
                {category.name}
              </td>

              <td className="px-4 py-4 text-muted-foreground">
                {category.slug}
              </td>

              <td className="max-w-[300px] px-4 py-4 text-muted-foreground">
                <span className="line-clamp-2">
                  {category.description || "—"}
                </span>
              </td>

              <td className="px-4 py-4">
                <button
                  type="button"
                  onClick={() => onToggleStatus(category)}
                  className={
                    category.isActive
                      ? "text-xs font-medium text-green-600"
                      : "text-xs font-medium text-red-600"
                  }
                >
                  {category.isActive
                    ? "Active"
                    : "Blocked"}
                </button>
              </td>

              <td className="px-4 py-4">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    aria-label={`Edit ${category.name}`}
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(category.id)}
                    aria-label={`Delete ${category.name}`}
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
