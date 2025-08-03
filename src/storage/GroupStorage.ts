import { Group } from '../types/Group';

const STORAGE_KEY = 'atrium_groups';

function getGroups(): Group[] {
  const groupsJson = localStorage.getItem(STORAGE_KEY);
  return groupsJson ? JSON.parse(groupsJson) : [];
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
  groups = groups.filter(group => group.uuid !== uuid);
  saveGroups(groups);
}