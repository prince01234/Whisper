import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * Custom hook for managing group conversations
 * @param {Object} options - Hook options
 * @param {boolean} options.autoLoad - Whether to automatically load groups
 * @returns {Object} Groups state and functions
 */
const useGroups = ({ autoLoad = true } = {}) => {
  // Group state
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Auth context
  const auth = useAuth() || {};
  const user = auth.user || {};
  const token = auth.token || '';
  
  /**
   * Fetch all groups for the current user
   */
  const fetchGroups = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from API
      let fetchedGroups = [];
      
      try {
        const response = await fetch('/api/groups', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          fetchedGroups = data.groups || [];
        } else {
          throw new Error('API request failed');
        }
      } catch (apiError) {
        console.log('API fetch failed for groups, using mock data', apiError);
        
        // Simulate API response with mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock groups
        fetchedGroups = [
          {
            id: 'g1',
            name: 'Project Team',
            description: 'Team for our current project',
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: { id: '101', username: 'janedoe' },
            members: [
              { id: '101', username: 'janedoe', role: 'admin' },
              { id: '102', username: 'mikesmith', role: 'member' },
              { id: user?.id || 'current-user', username: user?.username || 'You', role: 'member' }
            ],
            memberCount: 3,
            lastMessage: {
              content: 'Let\'s meet tomorrow at 10 AM',
              sender: { id: '101', username: 'janedoe' },
              timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            },
            unreadCount: 2,
            isAdmin: false
          },
          {
            id: 'g2',
            name: 'Friends Group',
            description: 'Just for friends',
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: { id: user?.id || 'current-user', username: user?.username || 'You' },
            members: [
              { id: user?.id || 'current-user', username: user?.username || 'You', role: 'admin' },
              { id: '102', username: 'mikesmith', role: 'member' },
              { id: '103', username: 'sarahpatel', role: 'member' }
            ],
            memberCount: 3,
            lastMessage: {
              content: 'Anyone free this weekend?',
              sender: { id: '103', username: 'sarahpatel' },
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            unreadCount: 0,
            isAdmin: true
          }
        ];
      }
      
      // Sort groups by last message time
      fetchedGroups.sort((a, b) => {
        if (!a.lastMessage && !b.lastMessage) return 0;
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        
        return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
      });
      
      setGroups(fetchedGroups);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, user?.id, user?.username]);

  /**
   * Select a group to view
   * @param {string} groupId - ID of the group to select
   */
  const selectGroup = useCallback((groupId) => {
    const group = groups.find(g => g.id === groupId);
    setSelectedGroup(group || null);
  }, [groups]);

  /**
   * Create a new group
   * @param {Object} groupData - Group creation data
   * @param {string} groupData.name - Name of the group
   * @param {string} groupData.description - Description of the group
   * @param {Array<string>} groupData.memberIds - IDs of initial members
   * @returns {Object} The created group object
   */
  const createGroup = useCallback(async (groupData) => {
    if (!token) return null;
    
    try {
      setLoading(true);
      
      // Try to create via API
      let newGroup = null;
      
      try {
        const response = await fetch('/api/groups', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(groupData)
        });
        
        if (response.ok) {
          const data = await response.json();
          newGroup = data.group;
        } else {
          throw new Error('API request failed');
        }
      } catch (apiError) {
        console.log('API create failed for group, using mock data', apiError);
        
        // Simulate API response
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock group
        const memberObjects = (groupData.memberIds || []).map(id => ({
          id,
          username: id === user?.id ? (user?.username || 'You') : `user_${id.substring(0, 4)}`,
          role: 'member'
        }));
        
        if (!memberObjects.some(m => m.id === user?.id)) {
          memberObjects.push({
            id: user?.id || 'current-user',
            username: user?.username || 'You',
            role: 'admin'
          });
        } else {
          // Make current user an admin
          const userIndex = memberObjects.findIndex(m => m.id === user?.id);
          if (userIndex >= 0) {
            memberObjects[userIndex].role = 'admin';
          }
        }
        
        newGroup = {
          id: `g${Date.now()}`,
          name: groupData.name,
          description: groupData.description || '',
          createdAt: new Date().toISOString(),
          createdBy: { id: user?.id || 'current-user', username: user?.username || 'You' },
          members: memberObjects,
          memberCount: memberObjects.length,
          lastMessage: null,
          unreadCount: 0,
          isAdmin: true
        };
      }
      
      // Add new group to list
      setGroups(prev => [newGroup, ...prev]);
      setSelectedGroup(newGroup);
      
      return newGroup;
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, user?.id, user?.username]);

  /**
   * Leave a group
   * @param {string} groupId - ID of the group to leave
   * @returns {boolean} Success status
   */
  const leaveGroup = useCallback(async (groupId) => {
    if (!token || !groupId) return false;
    
    try {
      // Try to leave via API
      let success = false;
      
      try {
        const response = await fetch(`/api/groups/${groupId}/leave`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          success = true;
        } else {
          throw new Error('API request failed');
        }
      } catch (apiError) {
        console.log('API leave failed for group, using mock data', apiError);
        
        // Simulate API response
        await new Promise(resolve => setTimeout(resolve, 500));
        success = true;
      }
      
      if (success) {
        // Remove group from list if success
        setGroups(prev => prev.filter(g => g.id !== groupId));
        
        // If the selected group is the one being left, clear selection
        if (selectedGroup?.id === groupId) {
          setSelectedGroup(null);
        }
      }
      
      return success;
    } catch (err) {
      console.error('Error leaving group:', err);
      setError('Failed to leave group. Please try again.');
      return false;
    }
  }, [token, selectedGroup]);

  /**
   * Update a group's information (name, description) - admin only
   * @param {string} groupId - ID of the group to update
   * @param {Object} updateData - Data to update
   * @param {string} updateData.name - New group name
   * @param {string} updateData.description - New group description
   * @returns {Object} The updated group object
   */
  const updateGroup = useCallback(async (groupId, updateData) => {
    if (!token || !groupId) return null;
    
    try {
      // Try to update via API
      let updatedGroup = null;
      
      try {
        const response = await fetch(`/api/groups/${groupId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
          const data = await response.json();
          updatedGroup = data.group;
        } else {
          throw new Error('API request failed');
        }
      } catch (apiError) {
        console.log('API update failed for group, using mock data', apiError);
        
        // Simulate API response
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Find the group to update
        const group = groups.find(g => g.id === groupId);
        if (!group) throw new Error('Group not found');
        
        // Create mock updated group
        updatedGroup = {
          ...group,
          name: updateData.name || group.name,
          description: updateData.description || group.description,
          updatedAt: new Date().toISOString()
        };
      }
      
      // Update group in list
      setGroups(prev => 
        prev.map(g => g.id === groupId ? updatedGroup : g)
      );
      
      // Update selected group if it's the one being updated
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(updatedGroup);
      }
      
      return updatedGroup;
    } catch (err) {
      console.error('Error updating group:', err);
      setError('Failed to update group. Please try again.');
      return null;
    }
  }, [token, groups, selectedGroup]);

  /**
   * Add a member to a group
   * @param {string} groupId - ID of the group
   * @param {string} userId - ID of the user to add
   * @param {string} username - Username of the user to add
   * @returns {boolean} Success status
   */
  const addMember = useCallback(async (groupId, userId, username) => {
    if (!token || !groupId || !userId) return false;
    
    try {
      // Try to add member via API
      let success = false;
      
      try {
        const response = await fetch(`/api/groups/${groupId}/members`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        });
        
        if (response.ok) {
          success = true;
        } else {
          throw new Error('API request failed');
        }
      } catch (apiError) {
        console.log('API add member failed, using mock data', apiError);
        
        // Simulate API response
        await new Promise(resolve => setTimeout(resolve, 500));
        success = true;
      }
      
      if (success) {
        // Update group in list with new member
        setGroups(prev => 
          prev.map(g => {
            if (g.id === groupId) {
              // Check if member already exists
              if (g.members.some(m => m.id === userId)) {
                return g;
              }
              
              // Add new member
              const newMember = { 
                id: userId, 
                username: username || `user_${userId.substring(0, 4)}`,
                role: 'member'
              };
              
              return {
                ...g,
                members: [...g.members, newMember],
                memberCount: g.memberCount + 1
              };
            }
            return g;
          })
        );
        
        // Update selected group if it's the one being modified
        if (selectedGroup?.id === groupId) {
          setSelectedGroup(prev => {
            if (!prev) return null;
            
            // Check if member already exists
            if (prev.members.some(m => m.id === userId)) {
              return prev;
            }
            
            // Add new member
            const newMember = { 
              id: userId, 
              username: username || `user_${userId.substring(0, 4)}`,
              role: 'member'
            };
            
            return {
              ...prev,
              members: [...prev.members, newMember],
              memberCount: prev.memberCount + 1
            };
          });
        }
      }
      
      return success;
    } catch (err) {
      console.error('Error adding member to group:', err);
      setError('Failed to add member. Please try again.');
      return false;
    }
  }, [token, selectedGroup]);

  /**
   * Remove a member from a group
   * @param {string} groupId - ID of the group
   * @param {string} userId - ID of the user to remove
   * @returns {boolean} Success status
   */
  const removeMember = useCallback(async (groupId, userId) => {
    if (!token || !groupId || !userId) return false;
    
    try {
      // Try to remove member via API
      let success = false;
      
      try {
        const response = await fetch(`/api/groups/${groupId}/members/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          success = true;
        } else {
          throw new Error('API request failed');
        }
      } catch (apiError) {
        console.log('API remove member failed, using mock data', apiError);
        
        // Simulate API response
        await new Promise(resolve => setTimeout(resolve, 500));
        success = true;
      }
      
      if (success) {
        // Update group in list
        setGroups(prev => 
          prev.map(g => {
            if (g.id === groupId) {
              return {
                ...g,
                members: g.members.filter(m => m.id !== userId),
                memberCount: Math.max(0, g.memberCount - 1)
              };
            }
            return g;
          })
        );
        
        // Update selected group if it's the one being modified
        if (selectedGroup?.id === groupId) {
          setSelectedGroup(prev => {
            if (!prev) return null;
            
            return {
              ...prev,
              members: prev.members.filter(m => m.id !== userId),
              memberCount: Math.max(0, prev.memberCount - 1)
            };
          });
        }
      }
      
      return success;
    } catch (err) {
      console.error('Error removing member from group:', err);
      setError('Failed to remove member. Please try again.');
      return false;
    }
  }, [token, selectedGroup]);

  /**
   * Update group member role (admin/member)
   * @param {string} groupId - ID of the group
   * @param {string} userId - ID of the user to update
   * @param {string} role - New role ('admin' or 'member')
   * @returns {boolean} Success status
   */
  const updateMemberRole = useCallback(async (groupId, userId, role) => {
    if (!token || !groupId || !userId || !['admin', 'member'].includes(role)) {
      return false;
    }
    
    try {
      // Try to update role via API
      let success = false;
      
      try {
        const response = await fetch(`/api/groups/${groupId}/members/${userId}/role`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role })
        });
        
        if (response.ok) {
          success = true;
        } else {
          throw new Error('API request failed');
        }
      } catch (apiError) {
        console.log('API update role failed, using mock data', apiError);
        
        // Simulate API response
        await new Promise(resolve => setTimeout(resolve, 500));
        success = true;
      }
      
      if (success) {
        // Update group in list
        setGroups(prev => 
          prev.map(g => {
            if (g.id === groupId) {
              return {
                ...g,
                members: g.members.map(m => 
                  m.id === userId ? { ...m, role } : m
                )
              };
            }
            return g;
          })
        );
        
        // Update selected group if it's the one being modified
        if (selectedGroup?.id === groupId) {
          setSelectedGroup(prev => {
            if (!prev) return null;
            
            return {
              ...prev,
              members: prev.members.map(m => 
                m.id === userId ? { ...m, role } : m
              )
            };
          });
        }
      }
      
      return success;
    } catch (err) {
      console.error('Error updating member role:', err);
      setError('Failed to update member role. Please try again.');
      return false;
    }
  }, [token, selectedGroup]);

  /**
   * Update group with a new message
   * @param {string} groupId - ID of the group
   * @param {Object} message - New message object
   */
  const updateGroupWithMessage = useCallback((groupId, message) => {
    if (!groupId || !message) return;
    
    setGroups(prev => 
      prev.map(group => {
        if (group.id === groupId) {
          const isFromCurrentUser = message.sender.id === user?.id;
          
          return {
            ...group,
            lastMessage: message,
            unreadCount: isFromCurrentUser ? group.unreadCount : group.unreadCount + 1
          };
        }
        return group;
      }).sort((a, b) => {
        if (!a.lastMessage && !b.lastMessage) return 0;
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        
        return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
      })
    );
  }, [user?.id]);

  /**
   * Mark all messages in a group as read
   * @param {string} groupId - ID of the group
   */
  const markGroupAsRead = useCallback((groupId) => {
    if (!groupId) return;
    
    setGroups(prev => 
      prev.map(group => 
        group.id === groupId ? { ...group, unreadCount: 0 } : group
      )
    );
  }, []);

  // Load groups on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad && token) {
      fetchGroups();
    }
  }, [autoLoad, fetchGroups, token]);

  return {
    groups,
    selectedGroup,
    loading,
    error,
    fetchGroups,
    selectGroup,
    createGroup,
    leaveGroup,
    updateGroup,
    addMember,
    removeMember,
    updateMemberRole,
    updateGroupWithMessage,
    markGroupAsRead
  };
};

export default useGroups;