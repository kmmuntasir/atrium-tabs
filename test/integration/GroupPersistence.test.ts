import { Group } from '../../src/types/Group';
import * as GroupStorage from '../../src/storage/GroupStorage';

describe('Group Persistence Integration', () => {
  const MOCK_GROUP: Group = {
    uuid: 'test-uuid-persistance',
    name: 'Persistent Group',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    color: '#RRGGBB',
    icon: 'persisten-icon',
    order: 1,
    lastActiveAt: Date.now(),
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('should persist groups across reloads', () => {
    // Simulate initial load and group creation
    GroupStorage.createGroup(MOCK_GROUP);
    let groupsAfterFirstLoad = JSON.parse(localStorage.getItem('atrium_groups') || '[]');
    expect(groupsAfterFirstLoad.length).toBe(1);
    expect(groupsAfterFirstLoad[0]).toEqual(MOCK_GROUP);

    // Simulate a reload by clearing the in-memory state and re-getting from local storage
    // We don't need to call createGroup again, just verify it's there after a 'reload'
    const retrievedGroup = GroupStorage.getGroup(MOCK_GROUP.uuid);
    expect(retrievedGroup).toEqual(MOCK_GROUP);
  });

  it('should restore multiple groups correctly after reload', () => {
    const group1: Group = {
      uuid: 'uuid-1', name: 'Group 1', createdAt: Date.now(), updatedAt: Date.now(),
      color: '#111111', icon: 'icon1', order: 1, lastActiveAt: Date.now()
    };
    const group2: Group = {
      uuid: 'uuid-2', name: 'Group 2', createdAt: Date.now(), updatedAt: Date.now(),
      color: '#222222', icon: 'icon2', order: 2, lastActiveAt: Date.now()
    };

    GroupStorage.createGroup(group1);
    GroupStorage.createGroup(group2);

    let initialGroups = JSON.parse(localStorage.getItem('atrium_groups') || '[]');
    expect(initialGroups.length).toBe(2);

    // Simulate reload
    let restoredGroup1 = GroupStorage.getGroup(group1.uuid);
    let restoredGroup2 = GroupStorage.getGroup(group2.uuid);

    expect(restoredGroup1).toEqual(group1);
    expect(restoredGroup2).toEqual(group2);
  });
});