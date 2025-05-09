# TimeLogApp System Patterns

## Architecture Overview
Client-side web application with:
- Multiple HTML entry points
- Modular JavaScript organization
- Shared CSS styling

## File Structure
```
/
├── index.html        # Main landing page
├── timer.html        # Timer interface
├── reports.html      # Reports interface
├── css/
│   └── styles.css    # Shared styles
└── js/
    ├── app.js        # Core application logic
    ├── timer.js      # Timer functionality
    ├── projects.js   # Project management
    └── reports.js    # Reporting functionality
```

## Component Relationships
1. **Core Components**
   - app.js: Shared application state and utilities
   - styles.css: Global styling

2. **Feature Components**
   - timer.html + timer.js: Timer functionality
   - projects.js: Project management
   - reports.html + reports.js: Reporting

## Key Technical Decisions
1. **Separation of Concerns**
   - Features split across multiple HTML/JS files
   - Shared functionality in app.js

2. **State Management**
   - Likely using browser localStorage (to be confirmed)
   - No backend server required

3. **UI Approach**
   - Vanilla JavaScript DOM manipulation
   - No external frameworks
