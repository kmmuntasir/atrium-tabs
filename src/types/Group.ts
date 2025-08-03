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
}