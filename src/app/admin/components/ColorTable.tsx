"use client";

import { Pencil, Trash2 } from "lucide-react";

export interface Color {
  id: number;
  name: string;
  slug: string;
  hexCode: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ColorTableProps {
  colors: Color[];
  onEdit: (color: Color) => void;
  onDelete: (id: number) => void;
}

export default function ColorTable({
  colors,
  onEdit,
  onDelete,
}: ColorTableProps) {
  if (colors.length === 0) {
    return (
      <div className="border border-border px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No colors found.
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
              Color
            </th>

            <th className="px-4 py-3 text-left font-medium">
              Slug
            </th>

            <th className="px-4 py-3 text-left font-medium">
              Hex
            </th>

            <th className="px-4 py-3 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {colors.map((color) => (
            <tr
              key={color.id}
              className="border-b border-border last:border-0"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-6 w-6 rounded-full border border-border"
                    style={{
                      backgroundColor:
                        color.hexCode ?? "transparent",
                    }}
                  />

                  <span>{color.name}</span>
                </div>
              </td>

              <td className="px-4 py-3 text-muted-foreground">
                {color.slug}
              </td>

              <td className="px-4 py-3 font-mono text-xs">
                {color.hexCode ?? "—"}
              </td>

              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(color)}
                    className="flex h-8 w-8 items-center justify-center hover:bg-secondary"
                    aria-label={`Edit ${color.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(color.id)}
                    className="flex h-8 w-8 items-center justify-center text-destructive hover:bg-secondary"
                    aria-label={`Delete ${color.name}`}
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
