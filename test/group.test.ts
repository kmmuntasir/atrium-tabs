import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import {
  Group,
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  deleteGroup,
  saveGroups
} from '../src/group';

// Simple in-memory localStorage mock
globalThis.localStorage = {
  _data: {} as Record<string, string>,
  getItem(key: string) { return this._data[key] || null; },
  setItem(key: string, value: string) { this._data[key] = value; },
  removeItem(key: string) { delete this._data[key]; },
  clear() { this._data = {}; },
} as Storage;

function clearGroups() {
  saveGroups([]);
}

describe('Group Model', () => {
  beforeEach(() => {
    clearGroups();
  });

  it('should create a group with all required fields', () => {
    const group = createGroup({
      name: 'Test Group',
      color: '#ff0000',
      icon: 'star',
      order: 1,
      lastActiveAt: new Date().toISOString(),
    });
    expect(group.id).toBeDefined();
    expect(group.name).toBe('Test Group');
    expect(group.color).toBe('#ff0000');
    expect(group.icon).toBe('star');
    expect(group.order).toBe(1);
    expect(group.createdAt).toBeDefined();
    expect(group.updatedAt).toBeDefined();
    expect(group.lastActiveAt).toBeDefined();
  });

  it('should get, update, and delete a group', () => {
    const group = createGroup({
      name: 'Test',
      color: '#000',
      icon: 'star',
      order: 2,
      lastActiveAt: new Date().toISOString(),
    });
    expect(getGroup(group.id)).toBeDefined();
    const updated = updateGroup(group.id, { name: 'Updated' });
    expect(updated?.name).toBe('Updated');
    expect(deleteGroup(group.id)).toBe(true);
    expect(getGroup(group.id)).toBeUndefined();
  });

  it('should persist and restore groups', () => {
    const group = createGroup({
      name: 'Persisted',
      color: '#123',
      icon: 'circle',
      order: 3,
      lastActiveAt: new Date().toISOString(),
    });
    // Simulate reload by reloading from localStorage
    const groups = getGroups();
    expect(groups.find(g => g.id === group.id)).toBeDefined();
  });
});