export interface Notification {
  id: string;
  title?: string;
  message: string;

  // Toast specifics
  persist?: boolean;
  displayDuration?: number; // in milliseconds
  type?: "success" | "error" | "info" | "warning" | string;
  position?: "topleft" | "topright" | "bottomleft" | "bottomright" | "center" | string;
}
