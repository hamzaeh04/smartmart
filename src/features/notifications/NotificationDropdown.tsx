import { useNavigate } from "react-router-dom";
import { Bell, Boxes, CheckCheck, PackageX, Receipt, ShoppingBag, TrendingDown } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatRelativeTime } from "@/utils/format";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "./hooks";
import type { AppNotification, NotificationType } from "@/types";
import { cn } from "@/utils/cn";

const ICONS: Record<NotificationType, typeof Bell> = {
  "low-stock": TrendingDown,
  "out-of-stock": PackageX,
  "purchase-completed": ShoppingBag,
  "sale-completed": Receipt,
  "inventory-adjusted": Boxes,
};

const ICON_COLORS: Record<NotificationType, string> = {
  "low-stock": "bg-warning-50 text-warning-600",
  "out-of-stock": "bg-danger-50 text-danger-600",
  "purchase-completed": "bg-info-50 text-info-600",
  "sale-completed": "bg-brand-50 text-brand-600",
  "inventory-adjusted": "bg-slate-100 text-slate-600",
};

export function NotificationDropdown() {
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleSelect(n: AppNotification) {
    if (!n.read) markRead.mutate(n.id);
    if (n.link) navigate(n.link);
  }

  return (
    <Dropdown
      align="right"
      className="w-[22rem] p-0"
      trigger={
        <button
          className="relative flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-danger-500 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      }
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">Notifications</p>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            <CheckCheck className="size-3.5" />
            Mark all as read
          </button>
        )}
      </div>
      <div className="scrollbar-thin max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <EmptyState icon={<Bell className="size-6" />} title="You're all caught up" />
        ) : (
          notifications.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <DropdownItem key={n.id} onClick={() => handleSelect(n)} className="items-start py-3">
                <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full", ICON_COLORS[n.type])}>
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={cn("text-sm", n.read ? "font-medium text-slate-600" : "font-semibold text-slate-900")}>
                      {n.title}
                    </span>
                    {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-brand-500" />}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">{n.message}</span>
                  <span className="mt-1 block text-[11px] text-slate-400">{formatRelativeTime(n.createdAt)}</span>
                </span>
              </DropdownItem>
            );
          })
        )}
      </div>
    </Dropdown>
  );
}
