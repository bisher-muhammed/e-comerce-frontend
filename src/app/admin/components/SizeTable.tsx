"use client";

import { Pencil, Trash2 } from "lucide-react";

export interface Size {
  id: number;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface SizeTableProps {
  sizes: Size[];
  onEdit: (size: Size) => void;
  onDelete: (id: number) => void;
}

export default function SizeTable({
  sizes,
  onEdit,
  onDelete,
}: SizeTableProps) {
  if (sizes.length === 0) {
    return (
      <div className="border border-border px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No sizes found.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/40">
            <th className="px-4 py-3 text-left font-medium">
              Size
            </th>

            <th className="px-4 py-3 text-left font-medium">
              Display Order
            </th>

            <th className="px-4 py-3 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {sizes.map((size) => (
            <tr
              key={size.id}
              className="border-b border-border last:border-0"
            >
              <td className="px-4 py-3 font-medium">
                {size.name}
              </td>

              <td className="px-4 py-3 text-muted-foreground">
                {size.sortOrder}
              </td>

              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(size)}
                    className="flex h-8 w-8 items-center justify-center hover:bg-secondary"
                    aria-label={`Edit ${size.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(size.id)}
                    className="flex h-8 w-8 items-center justify-center text-destructive hover:bg-secondary"
                    aria-label={`Delete ${size.name}`}
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
