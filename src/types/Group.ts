export interface Group {
  uuid: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  color: string;
  icon: string;
  order: number;
  lastActiveAt: number;
  tabs: any[]; // Assuming tabs will be added later
  activeInWindowId?: number; // New property to store the window ID if the group is active
  isDeleted: boolean; // For soft delete
  deletedAt?: number; // Timestamp for soft delete
}