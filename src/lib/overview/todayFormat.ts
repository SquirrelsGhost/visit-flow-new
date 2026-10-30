const DAY = new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "numeric", month: "long" });
const TIME = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" });

/** "Fr., 23. Oktober" */
export const formatDay = (date: Date): string => DAY.format(date);

/** "09:42" */
export const formatTime = (ms: number): string => TIME.format(new Date(ms));
