import type { ReactNode } from "react";

function Svg({ children, size = 18, strokeWidth = 1.8 }: { children: ReactNode; size?: number; strokeWidth?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const DashboardIcon = (p: { size?: number }) => (
  <Svg size={p.size}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></Svg>
);

export const ReceiptIcon = (p: { size?: number }) => (
  <Svg size={p.size}><path d="M5 3h14v18l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L5 21V3Z" /><path d="M9 8.5h6M9 12h6M9 15.5h3.5" /></Svg>
);

export const BotIcon = (p: { size?: number }) => (
  <Svg size={p.size}><rect x="5" y="8" width="14" height="10" rx="2.5" /><path d="M12 8V4.5M9 13h.01M15 13h.01" /><path d="M3 12v3M21 12v3" /><circle cx="12" cy="4" r="1" /></Svg>
);

export const PlayIcon = (p: { size?: number }) => (
  <Svg size={p.size}><circle cx="12" cy="12" r="8.5" /><path d="M10 8.8v6.4l5.2-3.2L10 8.8Z" fill="currentColor" stroke="none" /></Svg>
);

export const BookIcon = (p: { size?: number }) => (
  <Svg size={p.size}><path d="M4 5.5A2 2 0 0 1 6 3.5h14v15H6.5A2.5 2.5 0 0 0 4 21V5.5Z" /><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" /><path d="M8.5 7.5h7" /></Svg>
);

export const PlugIcon = (p: { size?: number }) => (
  <Svg size={p.size}><path d="M9 7V3.5M15 7V3.5" /><path d="M7 7h10v4a5 5 0 0 1-10 0V7Z" /><path d="M12 16v4.5" /></Svg>
);

export const ShieldIcon = (p: { size?: number }) => (
  <Svg size={p.size}><path d="M12 3 5 5.8v5.4c0 4.3 3 7.4 7 9.3 4-1.9 7-5 7-9.3V5.8L12 3Z" /><path d="m9.2 11.8 2 2 3.6-3.8" /></Svg>
);

export const AuditIcon = (p: { size?: number }) => (
  <Svg size={p.size}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /><path d="M8.5 11h5M11 8.5v5" /></Svg>
);

export const SettingsIcon = (p: { size?: number }) => (
  <Svg size={p.size}><circle cx="12" cy="12" r="3.2" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.7a7 7 0 0 0-2.1 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.1 1.2L10 21h4l.5-2.7a7 7 0 0 0 2.1-1.2l2.3 1 2-3.4-2-1.5c.07-.4.1-.8.1-1.2Z" /></Svg>
);

export const SearchIcon = (p: { size?: number }) => (
  <Svg size={p.size}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></Svg>
);

export const BellIcon = (p: { size?: number }) => (
  <Svg size={p.size}><path d="M18 9.5a6 6 0 1 0-12 0c0 5-2 5.5-2 5.5h16s-2-.5-2-5.5" /><path d="M10 19a2.2 2.2 0 0 0 4 0" /></Svg>
);

export const HelpIcon = (p: { size?: number }) => (
  <Svg size={p.size}><circle cx="12" cy="12" r="8.5" /><path d="M9.5 9.2a2.6 2.6 0 0 1 5 .8c0 1.7-2.5 2-2.5 3.4" /><path d="M12 16.6h.01" /></Svg>
);

export const ChevronDownIcon = (p: { size?: number }) => (
  <Svg size={p.size ?? 14}><path d="m6 9.5 6 5.5 6-5.5" /></Svg>
);

export const MenuIcon = (p: { size?: number }) => (
  <Svg size={p.size ?? 20}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>
);

export const RefreshIcon = (p: { size?: number }) => (
  <Svg size={p.size ?? 15}><path d="M20 5v5h-5" /><path d="M4 19v-5h5" /><path d="M19.5 10a8 8 0 0 0-14.3-2.8M4.5 14a8 8 0 0 0 14.3 2.8" /></Svg>
);

export const ExpandIcon = (p: { size?: number }) => (
  <Svg size={p.size ?? 15}><path d="M14 4h6v6M10 20H4v-6" /><path d="M20 4 13.5 10.5M4 20l6.5-6.5" /></Svg>
);

export const CloseIcon = (p: { size?: number }) => (
  <Svg size={p.size ?? 16}><path d="M6 6l12 12M18 6 6 18" /></Svg>
);

export const PlusIcon = (p: { size?: number }) => (
  <Svg size={p.size ?? 14}><path d="M12 5v14M5 12h14" /></Svg>
);
