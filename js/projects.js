/**
 * Developer Time Log App
 * Projects page functionality
 */

// DOM Elements
const projectsList = document.getElementById('projects-list');
const noProjectsMessage = document.getElementById('no-projects-message');
const addProjectBtn = document.getElementById('add-project-btn');
const projectModal = document.getElementById('project-modal');
const projectForm = document.getElementById('project-form');
const projectIdInput = document.getElementById('project-id');
const projectNameInput = document.getElementById('project-name');
const projectDescriptionInput = document.getElementById('project-description');
const modalTitle = document.getElementById('modal-title');
const cancelBtn = document.getElementById('cancel-btn');
const confirmModal = document.getElementById('confirm-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

// Current project being edited or deleted
let currentActionProjectId = null;

/**
 * Render the list of projects
 */
function renderProjects() {
    // Clear the list
    while (projectsList.firstChild) {
        if (projectsList.firstChild === noProjectsMessage) break;
        projectsList.removeChild(projectsList.firstChild);
    }
    
    // Show/hide no projects message
    if (AppState.projects.length === 0) {
        noProjectsMessage.style.display = 'block';
        return;
    } else {
        noProjectsMessage.style.display = 'none';
    }
    
    // Render each project
    AppState.projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.dataset.id = project.id;
        
        const formattedTime = Utils.formatTime(project.totalTime);
        
        projectCard.innerHTML = `
            <div class="project-header">
                <h3>${project.name}</h3>
                <div class="project-actions">
                    <button class="btn edit-project" data-id="${project.id}">Edit</button>
                    <button class="btn danger delete-project" data-id="${project.id}">Delete</button>
                </div>
            </div>
            <p>${project.description || 'No description'}</p>
            <div class="project-time">Total time: ${formattedTime}</div>
        `;
        
        projectsList.appendChild(projectCard);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-project').forEach(button => {
        button.addEventListener('click', handleEditProject);
    });
    
    document.querySelectorAll('.delete-project').forEach(button => {
        button.addEventListener('click', handleDeleteProject);
    });
}

/**
 * Handle adding a new project
 */
function handleAddProject() {
    // Reset form
    projectForm.reset();
    projectIdInput.value = '';
    modalTitle.textContent = 'Add New Project';
    
    // Show modal
    Utils.showModal('project-modal');
}

/**
 * Handle editing a project
 * @param {Event} e - Click event
 */
function handleEditProject(e) {
    const projectId = e.target.dataset.id;
    const project = AppState.projects.find(p => p.id === projectId);
    
    if (!project) return;
    
    // Fill form with project data
    projectIdInput.value = project.id;
    projectNameInput.value = project.name;
    projectDescriptionInput.value = project.description || '';
    modalTitle.textContent = 'Edit Project';
    
    // Show modal
    Utils.showModal('project-modal');
}

/**
 * Handle deleting a project
 * @param {Event} e - Click event
 */
function handleDeleteProject(e) {
    const projectId = e.target.dataset.id;
    currentActionProjectId = projectId;
    
    // Show confirmation modal
    Utils.showModal('confirm-modal');
}

/**
 * Handle form submission for adding/editing a project
 * @param {Event} e - Submit event
 */
function handleProjectFormSubmit(e) {
    e.preventDefault();
    
    const projectData = {
        name: projectNameInput.value.trim(),
        description: projectDescriptionInput.value.trim()
    };
    
    if (!projectData.name) {
        alert('Project name is required');
        return;
    }
    
    const projectId = projectIdInput.value;
    
    if (projectId) {
        // Update existing project
        ProjectManager.updateProject(projectId, projectData);
    } else {
        // Add new project
        ProjectManager.addProject(projectData);
    }
    
    // Hide modal and render projects
    Utils.hideModal('project-modal');
    renderProjects();
}

/**
 * Confirm project deletion
 */
function confirmDeleteProject() {
    if (!currentActionProjectId) return;
    
    ProjectManager.deleteProject(currentActionProjectId);
    currentActionProjectId = null;
    
    // Hide modal and render projects
    Utils.hideModal('confirm-modal');
    renderProjects();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Render projects
    renderProjects();
    
    // Add project button
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', handleAddProject);
    }
    
    // Project form submission
    if (projectForm) {
        projectForm.addEventListener('submit', handleProjectFormSubmit);
    }
    
    // Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            Utils.hideModal('project-modal');
        });
    }
    
    // Confirm delete button
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteProject);
    }
    
    // Cancel delete button
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            currentActionProjectId = null;
            Utils.hideModal('confirm-modal');
        });
    }
});
