// Predefined categories with colors for organizing notes

export const categories = [
    { id: 'work', name: 'Work', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
    { id: 'personal', name: 'Personal', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)' },
    { id: 'ideas', name: 'Ideas', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
    { id: 'tasks', name: 'Tasks', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
    { id: 'meetings', name: 'Meetings', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.15)' },
    { id: 'learning', name: 'Learning', color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.15)' },
    { id: 'finance', name: 'Finance', color: '#84cc16', bgColor: 'rgba(132, 204, 22, 0.15)' },
    { id: 'health', name: 'Health', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
];

// Get category by ID
export const getCategoryById = (id) => {
    return categories.find(cat => cat.id === id);
};

// Get category color
export const getCategoryColor = (categoryId) => {
    const category = getCategoryById(categoryId);
    return category ? category.color : '#64748b';
};

// Get category background color
export const getCategoryBgColor = (categoryId) => {
    const category = getCategoryById(categoryId);
    return category ? category.bgColor : 'rgba(100, 116, 139, 0.15)';
};
