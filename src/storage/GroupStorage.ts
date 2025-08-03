import type { Group } from '../types/Group';

const STORAGE_KEY = 'atrium_groups';
const ACTIVE_GROUPS_STORAGE_KEY = 'atrium_active_groups_by_window';

interface ActiveGroupMap {
  [windowId: number]: string; // Maps windowId to groupId
}

let activeGroupsByWindow: ActiveGroupMap = {};

function loadActiveGroups(): void {
  const activeGroupsJson = localStorage.getItem(ACTIVE_GROUPS_STORAGE_KEY);
  if (activeGroupsJson) {
    activeGroupsByWindow = JSON.parse(activeGroupsJson);
  }
}

function saveActiveGroups(): void {
  localStorage.setItem(ACTIVE_GROUPS_STORAGE_KEY, JSON.stringify(activeGroupsByWindow));
}

// Load initial state when the module is loaded
loadActiveGroups();

export function getGroups(includeDeleted: boolean = false): Group[] {
  const groupsJson = localStorage.getItem(STORAGE_KEY);
  const allGroups: Group[] = groupsJson ? JSON.parse(groupsJson) : [];
  return includeDeleted ? allGroups : allGroups.filter(group => !group.isDeleted);
}

function saveGroups(groups: Group[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

export function createGroup(group: Group): void {
  const groups = getGroups(true); // Get all groups including deleted ones
  groups.push(group);
  saveGroups(groups);
}

export function getGroup(uuid: string): Group | undefined {
  const groups = getGroups(true); // Get all groups including deleted ones
  return groups.find(group => group.uuid === uuid);
}

export function updateGroup(updatedGroup: Group): void {
  let groups = getGroups(true); // Get all groups including deleted ones
  groups = groups.map(group => group.uuid === updatedGroup.uuid ? updatedGroup : group);
  saveGroups(groups);
}

export function deleteGroup(uuid: string): void {
  let groups = getGroups(true); // Get all groups including deleted ones
  const groupToDelete = groups.find(group => group.uuid === uuid);
  if (groupToDelete) {
    groupToDelete.isDeleted = true;
    groupToDelete.deletedAt = Date.now();
    saveGroups(groups);
  }
}

export function restoreGroup(uuid: string): void {
  let groups = getGroups(true); // Get all groups including deleted ones
  const groupToRestore = groups.find(group => group.uuid === uuid);
  if (groupToRestore) {
    groupToRestore.isDeleted = false;
    delete groupToRestore.deletedAt; // Remove the deletedAt property
    saveGroups(groups);
  }
}

export function setActiveGroupForWindow(windowId: number, groupId: string): void {
  activeGroupsByWindow[windowId] = groupId;
  saveActiveGroups();
}

export function getActiveGroupForWindow(windowId: number): string | undefined {
  return activeGroupsByWindow[windowId];
}

export function getWindowIdForActiveGroup(groupId: string): number | undefined {
  for (const windowId in activeGroupsByWindow) {
    if (activeGroupsByWindow[windowId] === groupId) {
      return parseInt(windowId, 10);
    }
  }
  return undefined;
}

export function removeActiveGroupForWindow(windowId: number): void {
  delete activeGroupsByWindow[windowId];
  saveActiveGroups();
}