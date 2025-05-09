/**
 * Developer Time Log App
 * Core application functionality
 */

// Global app state
const AppState = {
    projects: [],
    currentProjectId: null,
    timerState: 'stopped', // 'running', 'paused', 'stopped'
    timerStart: null,
    timerElapsed: 0, // in milliseconds
    timerInterval: null
};

// Local Storage Keys
const STORAGE_KEYS = {
    PROJECTS: 'devTimeLog_projects',
    CURRENT_PROJECT: 'devTimeLog_currentProject'
};

// Utility Functions
const Utils = {
    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    /**
     * Format time in seconds to HH:MM:SS
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    formatTime: (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
        ].join(':');
    },

    /**
     * Format date to readable string
     * @param {Date} date - Date object
     * @returns {string} Formatted date string
     */
    formatDate: (date) => {
        return new Date(date).toLocaleDateString();
    },

    /**
     * Format time to readable string
     * @param {Date} date - Date object
     * @returns {string} Formatted time string
     */
    formatTimeOfDay: (date) => {
        return new Date(date).toLocaleTimeString();
    },

    /**
     * Show a modal dialog
     * @param {string} modalId - ID of the modal to show
     */
    showModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    },

    /**
     * Hide a modal dialog
     * @param {string} modalId - ID of the modal to hide
     */
    hideModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
};

// Project Management
const ProjectManager = {
    /**
     * Load projects from localStorage
     */
    loadProjects: () => {
        const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
        AppState.projects = storedProjects ? JSON.parse(storedProjects) : [];
        
        // Load current project
        const currentProject = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
        AppState.currentProjectId = currentProject || null;
    },

    /**
     * Save projects to localStorage
     */
    saveProjects: () => {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(AppState.projects));
    },

    /**
     * Set current project
     * @param {string} projectId - ID of the project to set as current
     */
    setCurrentProject: (projectId) => {
        AppState.currentProjectId = projectId;
        localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, projectId);
    },

    /**
     * Get current project
     * @returns {Object|null} Current project or null if none selected
     */
    getCurrentProject: () => {
        if (!AppState.currentProjectId) return null;
        return AppState.projects.find(p => p.id === AppState.currentProjectId) || null;
    },

    /**
     * Add a new project
     * @param {Object} project - Project data
     * @returns {string} ID of the new project
     */
    addProject: (project) => {
        const newProject = {
            id: Utils.generateId(),
            name: project.name,
            description: project.description || '',
            totalTime: 0, // in seconds
            logs: [],
            createdAt: Date.now()
        };
        
        AppState.projects.push(newProject);
        ProjectManager.saveProjects();
        return newProject.id;
    },

    /**
     * Update an existing project
     * @param {string} projectId - ID of the project to update
     * @param {Object} projectData - New project data
     * @returns {boolean} Success status
     */
    updateProject: (projectId, projectData) => {
        const index = AppState.projects.findIndex(p => p.id === projectId);
        if (index === -1) return false;
        
        AppState.projects[index] = {
            ...AppState.projects[index],
            name: projectData.name,
            description: projectData.description || ''
        };
        
        ProjectManager.saveProjects();
        return true;
    },

    /**
     * Delete a project
     * @param {string} projectId - ID of the project to delete
     * @returns {boolean} Success status
     */
    deleteProject: (projectId) => {
        const index = AppState.projects.findIndex(p => p.id === projectId);
        if (index === -1) return false;
        
        AppState.projects.splice(index, 1);
        
        // If current project is deleted, clear current project
        if (AppState.currentProjectId === projectId) {
            AppState.currentProjectId = null;
            localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
        }
        
        ProjectManager.saveProjects();
        return true;
    },

    /**
     * Add a time log to a project
     * @param {string} projectId - ID of the project
     * @param {Object} logData - Log data
     * @returns {boolean} Success status
     */
    addTimeLog: (projectId, logData) => {
        const project = AppState.projects.find(p => p.id === projectId);
        if (!project) return false;
        
        const newLog = {
            id: Utils.generateId(),
            startTime: logData.startTime,
            endTime: logData.endTime,
            duration: logData.duration, // in seconds
            notes: logData.notes || ''
        };
        
        project.logs.push(newLog);
        project.totalTime += newLog.duration;
        
        ProjectManager.saveProjects();
        return true;
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load projects from localStorage
    ProjectManager.loadProjects();
    
    // Set up modal close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                Utils.hideModal(modal.id);
            }
        });
    });
    
    // Close modal when clicking outside content
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                Utils.hideModal(modal.id);
            }
        });
    });
});
