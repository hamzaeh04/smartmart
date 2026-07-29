import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Menu, QrCode, Search, User as UserIcon, Settings, LogOut } from "lucide-react";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import { NotificationDropdown } from "@/features/notifications/NotificationDropdown";
import { useAuth } from "@/hooks/useAuth";
import { useUiStore } from "@/store/uiStore";
import { useScannerStore } from "@/store/scannerStore";
import { listProducts } from "@/services/productService";
import { formatCurrency, formatDate } from "@/utils/format";

export function TopNavbar() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const openScanner = useScannerStore((s) => s.open);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { data: searchResults } = useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: () => listProducts({ search: debouncedQuery, pageSize: 6 }),
    enabled: debouncedQuery.length > 1,
  });

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      <button
        onClick={() => setMobileNavOpen(true)}
        className="flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative flex-1 max-w-md" ref={searchRef}>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          type="text"
          placeholder="Search products, SKU, barcode..."
          aria-label="Global product search"
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        {searchOpen && debouncedQuery.length > 1 && (
          <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg">
            {searchResults?.items.length ? (
              searchResults.items.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery("");
                    navigate(`/products/${p.id}`);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50"
                >
                  <img src={p.image} alt="" className="size-9 shrink-0 rounded-md object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800">{p.name}</span>
                    <span className="block text-xs text-slate-400">{p.sku}</span>
                  </span>
                  <span className="shrink-0 text-sm font-medium text-slate-600">
                    {formatCurrency(p.sellingPrice)}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-slate-400">No products match "{debouncedQuery}"</p>
            )}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => openScanner("global")}
        leftIcon={<QrCode className="size-4" />}
        className="hidden sm:inline-flex"
      >
        Scan Product
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => openScanner("global")}
        aria-label="Scan product"
        className="sm:hidden"
      >
        <QrCode className="size-4" />
      </Button>

      <NotificationDropdown />

      <span className="hidden shrink-0 text-sm text-slate-500 md:block">{formatDate(new Date())}</span>

      <Dropdown
        align="right"
        trigger={
          <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            <img src={user?.avatar} alt="" className="size-8 rounded-full object-cover" />
          </button>
        }
      >
        <div className="px-3.5 py-2">
          <p className="text-sm font-semibold text-slate-900">{user?.fullName}</p>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>
        <DropdownSeparator />
        <DropdownItem onClick={() => navigate("/settings")}>
          <UserIcon className="size-4" /> My Profile
        </DropdownItem>
        {can("settings.manage") && (
          <DropdownItem onClick={() => navigate("/settings")}>
            <Settings className="size-4" /> Settings
          </DropdownItem>
        )}
        <DropdownSeparator />
        <DropdownItem destructive onClick={logout}>
          <LogOut className="size-4" /> Logout
        </DropdownItem>
      </Dropdown>
    </header>
  );
}
