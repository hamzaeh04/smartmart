import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Debounced search input — calls onChange 300ms after the user stops typing. */
export function ProductSearch({ value, onChange, placeholder = "Search by name, SKU, or barcode...", className }: ProductSearchProps) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (local !== value) onChange(local);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <Input
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      leftIcon={<Search className="size-4" />}
      placeholder={placeholder}
      containerClassName={className}
      aria-label="Search products"
    />
  );
}
