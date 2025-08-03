import type { Group } from '../types/Group';

const STORAGE_KEY = 'atrium_groups';

export function getGroups(): Group[] {
  const groupsJson = localStorage.getItem(STORAGE_KEY);
  const allGroups: Group[] = groupsJson ? JSON.parse(groupsJson) : [];
  return allGroups.filter(group => !group.isDeleted);
}

function saveGroups(groups: Group[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

export function createGroup(group: Group): void {
  const groups = getGroups();
  groups.push(group);
  saveGroups(groups);
}

export function getGroup(uuid: string): Group | undefined {
  const groups = getGroups();
  return groups.find(group => group.uuid === uuid);
}

export function updateGroup(updatedGroup: Group): void {
  let groups = getGroups();
  groups = groups.map(group => group.uuid === updatedGroup.uuid ? updatedGroup : group);
  saveGroups(groups);
}

export function deleteGroup(uuid: string): void {
  let groups = getGroups();
  const groupToDelete = groups.find(group => group.uuid === uuid);
  if (groupToDelete) {
    groupToDelete.isDeleted = true;
    groupToDelete.deletedAt = Date.now();
    saveGroups(groups);
  }
}