/**
 * Developer Time Log App
 * Timer page functionality
 */

// DOM Elements
const projectSelect = document.getElementById('project-select');
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const saveBtn = document.getElementById('save-btn');
const timerStatus = document.getElementById('timer-status');
const currentProject = document.getElementById('current-project');
const saveModal = document.getElementById('save-modal');
const saveForm = document.getElementById('save-form');
const timeSpentInput = document.getElementById('time-spent');
const logNotesInput = document.getElementById('log-notes');
const cancelSaveBtn = document.getElementById('cancel-save-btn');

// Timer variables
let timerStartTime = 0;
let timerElapsedTime = 0;
let timerInterval = null;

/**
 * Load projects into the select dropdown
 */
function loadProjectsDropdown() {
    // Clear existing options except the default one
    while (projectSelect.options.length > 1) {
        projectSelect.remove(1);
    }
    
    // Add projects to dropdown
    AppState.projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        projectSelect.appendChild(option);
    });
    
    // Set current project if available
    if (AppState.currentProjectId) {
        projectSelect.value = AppState.currentProjectId;
        updateCurrentProjectDisplay();
    }
}

/**
 * Update the current project display
 */
function updateCurrentProjectDisplay() {
    const project = ProjectManager.getCurrentProject();
    if (project) {
        currentProject.textContent = `Current project: ${project.name}`;
    } else {
        currentProject.textContent = 'No project selected';
    }
}

/**
 * Update timer display
 */
function updateTimerDisplay() {
    const currentTime = AppState.timerState === 'running' ? Date.now() : 0;
    const elapsedMilliseconds = AppState.timerState === 'running' 
        ? timerElapsedTime + (currentTime - timerStartTime)
        : timerElapsedTime;
    
    const totalSeconds = Math.floor(elapsedMilliseconds / 1000);
    timeDisplay.textContent = Utils.formatTime(totalSeconds);
}

/**
 * Start the timer
 */
function startTimer() {
    if (AppState.timerState === 'running') return;
    
    // Check if a project is selected
    if (!projectSelect.value) {
        alert('Please select a project first');
        return;
    }
    
    // Set current project
    ProjectManager.setCurrentProject(projectSelect.value);
    updateCurrentProjectDisplay();
    
    // Update timer state
    if (AppState.timerState !== 'paused') {
        timerElapsedTime = 0;
    }
    AppState.timerState = 'running';
    localStorage.setItem('timerState', 'running');
    localStorage.setItem('currentProjectId', projectSelect.value);
    
    timerStartTime = Date.now();
    localStorage.setItem('timerStartTime', timerStartTime);
    localStorage.setItem('timerElapsedTime', timerElapsedTime);
    
    // Update UI
    timerStatus.textContent = 'Timer running';
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    saveBtn.disabled = false;
    projectSelect.disabled = true;
    
    // Start interval to update display
    timerInterval = setInterval(updateTimerDisplay, 1000);
}

/**
 * Pause the timer
 */
function pauseTimer() {
    if (AppState.timerState !== 'running') return;
    
    // Update elapsed time
    const currentTime = Date.now();
    timerElapsedTime += (currentTime - timerStartTime);
    localStorage.setItem('timerElapsedTime', timerElapsedTime);
    
    // Update timer state
    AppState.timerState = 'paused';
    localStorage.setItem('timerState', 'paused');
    
    // Update UI
    timerStatus.textContent = 'Timer paused';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    // Clear interval
    clearInterval(timerInterval);
}

/**
 * Save the timer
 */
function saveTimer() {
    // Pause timer if running
    if (AppState.timerState === 'running') {
        pauseTimer();
    }
    
    // Calculate total time
    const totalSeconds = Math.floor(timerElapsedTime / 1000);
    if (totalSeconds === 0) {
        alert('No time to save');
        return;
    }
    
    // Fill save form
    timeSpentInput.value = Utils.formatTime(totalSeconds);
    logNotesInput.value = '';
    
    // Show save modal
    Utils.showModal('save-modal');
}

/**
 * Reset the timer
 */
function resetTimer() {
    // Clear interval
    clearInterval(timerInterval);
    
    // Reset timer variables
    timerStartTime = 0;
    timerElapsedTime = 0;
    localStorage.removeItem('timerStartTime');
    localStorage.removeItem('timerElapsedTime');
    
    // Update timer state
    AppState.timerState = 'stopped';
    localStorage.removeItem('timerState');
    
    // Update UI
    timeDisplay.textContent = '00:00:00';
    timerStatus.textContent = 'Timer stopped';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    saveBtn.disabled = true;
    projectSelect.disabled = false;
}

/**
 * Handle save form submission
 * @param {Event} e - Submit event
 */
function handleSaveFormSubmit(e) {
    e.preventDefault();
    
    const projectId = ProjectManager.getCurrentProject()?.id;
    if (!projectId) {
        alert('No project selected');
        return;
    }
    
    // Create log data
    const totalSeconds = Math.floor(timerElapsedTime / 1000);
    const endTime = Date.now();
    const startTime = endTime - (totalSeconds * 1000);
    
    const logData = {
        startTime: startTime,
        endTime: endTime,
        duration: totalSeconds,
        notes: logNotesInput.value.trim()
    };
    
    // Add time log to project
    ProjectManager.addTimeLog(projectId, logData);
    
    // Hide modal and reset timer
    Utils.hideModal('save-modal');
    resetTimer();
}

// Save timer state when page unloads
window.addEventListener('beforeunload', () => {
    if (AppState.timerState === 'running') {
        const currentTime = Date.now();
        timerElapsedTime += (currentTime - timerStartTime);
        localStorage.setItem('timerElapsedTime', timerElapsedTime);
        localStorage.setItem('timerStartTime', Date.now());
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Restore timer state from localStorage
    AppState.currentProjectId = localStorage.getItem('currentProjectId');
    const storedStart = localStorage.getItem('timerStartTime');
    const storedElapsed = localStorage.getItem('timerElapsedTime');
    const storedState = localStorage.getItem('timerState');
    
    // Always calculate elapsed time from storage regardless of state
    if (storedStart && storedElapsed) {
        timerStartTime = parseInt(storedStart);
        timerElapsedTime = parseInt(storedElapsed);
        AppState.timerState = storedState || 'stopped';
        
        // Calculate actual elapsed time using current timestamp
        const currentTime = Date.now();
        timerElapsedTime += (currentTime - timerStartTime);
        
        if (storedState === 'running') {
            // Reset start time to now for accurate future calculations
            timerStartTime = Date.now();
            localStorage.setItem('timerStartTime', timerStartTime);
            
            timerInterval = setInterval(updateTimerDisplay, 1000);
            updateTimerDisplay();
            timerStatus.textContent = 'Timer running';
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            saveBtn.disabled = false;
            projectSelect.disabled = true;
        } else {
            // Update display with calculated elapsed time
            updateTimerDisplay();
        }
    }
    
    // Load projects
    loadProjectsDropdown();
    
    // Project selection change
    if (projectSelect) {
        projectSelect.addEventListener('change', () => {
            if (projectSelect.value) {
                ProjectManager.setCurrentProject(projectSelect.value);
                updateCurrentProjectDisplay();
            }
        });
    }
    
    // Timer control buttons
    if (startBtn) {
        startBtn.addEventListener('click', startTimer);
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseTimer);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveTimer);
    }
    
    // Save form
    if (saveForm) {
        saveForm.addEventListener('submit', handleSaveFormSubmit);
    }
    
    // Cancel save button
    if (cancelSaveBtn) {
        cancelSaveBtn.addEventListener('click', () => {
            Utils.hideModal('save-modal');
        });
    }
});
