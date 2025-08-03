import type { Group } from '../types/Group';

const STORAGE_KEY = 'atrium-groups';

export const getGroups = (includeDeleted: boolean = false): Group[] => {
  const storedGroups = localStorage.getItem(STORAGE_KEY);
  if (storedGroups) {
    const parsedGroups: Group[] = JSON.parse(storedGroups);
    return includeDeleted ? parsedGroups : parsedGroups.filter(group => !group.isDeleted);
  }
  return [];
};

export const saveGroups = (groupsToSave: Group[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groupsToSave));
};

export const getGroup = (uuid: string): Group | undefined => {
  return getGroups(true).find(group => group.uuid === uuid);
};

export const createGroup = (newGroup: Group) => {
  const currentGroups = getGroups(true);
  saveGroups([...currentGroups, newGroup]);
};

export const updateGroup = (updatedGroup: Group) => {
  let currentGroups = getGroups(true);
  currentGroups = currentGroups.map(group =>
    group.uuid === updatedGroup.uuid ? { ...group, ...updatedGroup, updatedAt: Date.now() } : group
  );
  saveGroups(currentGroups);
};

export const deleteGroup = (uuid: string) => {
  let currentGroups = getGroups(true);
  currentGroups = currentGroups.map(group =>
    group.uuid === uuid ? { ...group, isDeleted: true, deletedAt: Date.now() } : group
  );
  saveGroups(currentGroups);
};

export const restoreGroup = (uuid: string) => {
  let currentGroups = getGroups(true);
  currentGroups = currentGroups.map(group =>
    group.uuid === uuid ? { ...group, isDeleted: false, deletedAt: undefined } : group
  );
  saveGroups(currentGroups);
};

const ACTIVE_GROUP_WINDOW_PREFIX = 'atrium-active-group-window-';

export const setActiveGroupForWindow = (windowId: number, groupId: string | null) => {
  const currentGroups = getGroups(true);
  let groupsToSave = currentGroups.map(group => {
    if (group.uuid === groupId) {
      return { ...group, activeInWindowId: windowId };
    } else if (group.activeInWindowId === windowId) {
      // If another group was active in this window, clear its activeInWindowId
      return { ...group, activeInWindowId: undefined };
    }
    return group;
  });
  saveGroups(groupsToSave);
};

export const getActiveGroupForWindow = (windowId: number): string | null => {
  const groups = getGroups();
  const activeGroup = groups.find(group => group.activeInWindowId === windowId);
  return activeGroup ? activeGroup.uuid : null;
};

export const getWindowIdForActiveGroup = (groupId: string): number | null => {
  const groups = getGroups();
  const activeGroup = groups.find(group => group.uuid === groupId && group.activeInWindowId !== undefined);
  return activeGroup ? activeGroup.activeInWindowId || null : null;
};

export const removeActiveGroupForWindow = (windowId: number) => {
  const currentGroups = getGroups(true);
  const groupsToSave = currentGroups.map(group => {
    if (group.activeInWindowId === windowId) {
      return { ...group, activeInWindowId: undefined };
    }
    return group;
  });
  saveGroups(groupsToSave);
};