import { Group } from '../../src/types/Group';
import { createGroup, getGroup, updateGroup, deleteGroup } from '../../src/storage/GroupStorage';

describe('Group Model and Storage', () => {
  const MOCK_GROUP: Group = {
    uuid: 'test-uuid-1',
    name: 'Test Group',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    color: '#FFFFFF',
    icon: 'default-icon',
    order: 1,
    lastActiveAt: Date.now(),
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('should create a new group', () => {
    createGroup(MOCK_GROUP);
    const groups = JSON.parse(localStorage.getItem('atrium_groups') || '[]');
    expect(groups.length).toBe(1);
    expect(groups[0]).toEqual(MOCK_GROUP);
  });

  it('should retrieve an existing group by UUID', () => {
    createGroup(MOCK_GROUP);
    const retrievedGroup = getGroup(MOCK_GROUP.uuid);
    expect(retrievedGroup).toEqual(MOCK_GROUP);
  });

  it('should return undefined for a non-existent group', () => {
    const retrievedGroup = getGroup('non-existent-uuid');
    expect(retrievedGroup).toBeUndefined();
  });

  it('should update an existing group', () => {
    createGroup(MOCK_GROUP);
    const updatedGroup = { ...MOCK_GROUP, name: 'Updated Group Name' };
    updateGroup(updatedGroup);
    const groups = JSON.parse(localStorage.getItem('atrium_groups') || '[]');
    expect(groups.length).toBe(1);
    expect(groups[0].name).toBe('Updated Group Name');
  });

  it('should delete a group by UUID', () => {
    createGroup(MOCK_GROUP);
    deleteGroup(MOCK_GROUP.uuid);
    const groups = JSON.parse(localStorage.getItem('atrium_groups') || '[]');
    expect(groups.length).toBe(0);
  });

  it('should handle multiple groups correctly', () => {
    const group2: Group = {
      uuid: 'test-uuid-2',
      name: 'Another Group',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      color: '#000000',
      icon: 'another-icon',
      order: 2,
      lastActiveAt: Date.now(),
    };
    createGroup(MOCK_GROUP);
    createGroup(group2);

    let groups = JSON.parse(localStorage.getItem('atrium_groups') || '[]');
    expect(groups.length).toBe(2);

    deleteGroup(MOCK_GROUP.uuid);
    groups = JSON.parse(localStorage.getItem('atrium_groups') || '[]');
    expect(groups.length).toBe(1);
    expect(groups[0].uuid).toBe(group2.uuid);
  });
});