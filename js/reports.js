/**
 * Developer Time Log App
 * Reports page functionality
 */

// DOM Elements
const reportProjectSelect = document.getElementById('report-project-select');
const projectDetails = document.getElementById('project-details');
const totalTimeDisplay = document.getElementById('total-time');
const sessionCountDisplay = document.getElementById('session-count');
const noLogsMessage = document.getElementById('no-logs-message');
const logsTable = document.getElementById('logs-table');
const logsBody = document.getElementById('logs-body');

/**
 * Load projects into the select dropdown
 */
function loadProjectsDropdown() {
    // Clear existing options except the default one
    while (reportProjectSelect.options.length > 1) {
        reportProjectSelect.remove(1);
    }
    
    // Add projects to dropdown
    AppState.projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        reportProjectSelect.appendChild(option);
    });
    
    // Set current project if available
    if (AppState.currentProjectId) {
        reportProjectSelect.value = AppState.currentProjectId;
        loadProjectReport(AppState.currentProjectId);
    }
}

/**
 * Load project report
 * @param {string} projectId - ID of the project to load report for
 */
function loadProjectReport(projectId) {
    const project = AppState.projects.find(p => p.id === projectId);
    if (!project) {
        clearReport();
        return;
    }
    
    // Update project details
    projectDetails.innerHTML = `
        <h4>${project.name}</h4>
        <p>${project.description || 'No description'}</p>
    `;
    
    // Update summary
    totalTimeDisplay.textContent = Utils.formatTime(project.totalTime);
    sessionCountDisplay.textContent = project.logs.length;
    
    // Update logs table
    renderLogs(project);
}

/**
 * Render time logs for a project
 * @param {Object} project - Project to render logs for
 */
function renderLogs(project) {
    // Clear existing logs
    while (logsBody.firstChild) {
        logsBody.removeChild(logsBody.firstChild);
    }
    
    // Show/hide no logs message and table
    if (project.logs.length === 0) {
        noLogsMessage.style.display = 'block';
        logsTable.style.display = 'none';
        return;
    } else {
        noLogsMessage.style.display = 'none';
        logsTable.style.display = 'table';
    }
    
    // Sort logs by start time (newest first)
    const sortedLogs = [...project.logs].sort((a, b) => b.startTime - a.startTime);
    
    // Render each log
    sortedLogs.forEach(log => {
        const row = document.createElement('tr');
        
        const startDate = new Date(log.startTime);
        const endDate = new Date(log.endTime);
        
        row.innerHTML = `
            <td>${Utils.formatDate(startDate)}</td>
            <td>${Utils.formatTimeOfDay(startDate)}</td>
            <td>${Utils.formatTimeOfDay(endDate)}</td>
            <td>${Utils.formatTime(log.duration)}</td>
            <td>${log.notes || '-'}</td>
        `;
        
        logsBody.appendChild(row);
    });
}

/**
 * Clear the report display
 */
function clearReport() {
    projectDetails.innerHTML = '<p>Select a project to view details</p>';
    totalTimeDisplay.textContent = '00:00:00';
    sessionCountDisplay.textContent = '0';
    noLogsMessage.style.display = 'block';
    logsTable.style.display = 'none';
    
    // Clear logs table
    while (logsBody.firstChild) {
        logsBody.removeChild(logsBody.firstChild);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load projects
    loadProjectsDropdown();
    
    // Project selection change
    if (reportProjectSelect) {
        reportProjectSelect.addEventListener('change', () => {
            const projectId = reportProjectSelect.value;
            if (projectId) {
                loadProjectReport(projectId);
            } else {
                clearReport();
            }
        });
    }
});
