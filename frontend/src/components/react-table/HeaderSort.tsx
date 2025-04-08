import { ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Column } from "@tanstack/react-table";

const SortType = {
  ASC: "asc",
  DESC: "desc",
} as const;

type SortType = (typeof SortType)[keyof typeof SortType];

interface SortTogglerProps {
  type?: SortType;
}

const SortToggler = ({ type }: SortTogglerProps) => {
  return (
    <div className="text-secondary-light">
      <ChevronUp
        className={cn(
          "h-3 w-3",
          type === SortType.ASC
            ? "text-foreground brightness-200"
            : "text-muted-foreground brightness-50",
        )}
      />
      <ChevronDown
        className={cn(
          "h-3 w-3 -mt-0.5",
          type === SortType.DESC
            ? "text-foreground brightness-200"
            : "text-muted-foreground brightness-50",
        )}
      />
    </div>
  );
};

interface HeaderSortProps<T> {
  column: Column<T, unknown>;
  sort?: boolean;
}

const HeaderSort = <T,>({ column, sort }: HeaderSortProps<T>) => {
  const sortType = column.getIsSorted();

  return (
    <div
      {...(sort && {
        onClick: column.getToggleSortingHandler(),
        className: "cursor-pointer select-none",
      })}
    >
      {sortType ? <SortToggler type={sortType} /> : <SortToggler />}
    </div>
  );
};

export default HeaderSort;
