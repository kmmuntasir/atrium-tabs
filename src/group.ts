import { v4 as uuidv4 } from 'uuid';

export interface Group {
  id: string; // UUID
  name: string;
  createdAt: string;
  updatedAt: string;
  color: string;
  icon: string;
  order: number;
  lastActiveAt: string;
  deleted?: boolean; // soft delete flag
}

const GROUPS_KEY = 'atrium_groups';

export function getGroups(): Group[] {
  const data = localStorage.getItem(GROUPS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveGroups(groups: Group[]): void {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

export function createGroup(group: Omit<Group, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>): Group {
  const now = new Date().toISOString();
  const newGroup: Group = {
    ...group,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    deleted: false,
  };
  const groups = getGroups();
  saveGroups([...groups, newGroup]);
  return newGroup;
}

export function updateGroup(id: string, updates: Partial<Omit<Group, 'id' | 'createdAt'>>): Group | null {
  const groups = getGroups();
  const idx = groups.findIndex(g => g.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString();
  const updated = { ...groups[idx], ...updates, updatedAt: now };
  groups[idx] = updated;
  saveGroups(groups);
  return updated;
}

export function deleteGroup(id: string): boolean {
  const groups = getGroups();
  const filtered = groups.filter(g => g.id !== id);
  if (filtered.length === groups.length) return false;
  saveGroups(filtered);
  return true;
}

export function softDeleteGroup(id: string): boolean {
  const groups = getGroups();
  const idx = groups.findIndex(g => g.id === id);
  if (idx === -1) return false;
  groups[idx].deleted = true;
  groups[idx].updatedAt = new Date().toISOString();
  saveGroups(groups);
  return true;
}

export function restoreGroup(id: string): boolean {
  const groups = getGroups();
  const idx = groups.findIndex(g => g.id === id);
  if (idx === -1) return false;
  groups[idx].deleted = false;
  groups[idx].updatedAt = new Date().toISOString();
  saveGroups(groups);
  return true;
}

export function getGroup(id: string): Group | undefined {
  return getGroups().find(g => g.id === id);
}