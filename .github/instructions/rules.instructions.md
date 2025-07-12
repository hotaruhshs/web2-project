---
applyTo: '**'
---
# Copilot Rules for Clothing Shop Project

## Task Management and Documentation

1. **Check Task Status First:**  
   Before starting any new feature or fix, always review the following:
   - `main-task-list.md` for overall project progress.
   - The `C:\Users\carme\Documents\web 2\project-task-docs` directory for logs of similar or completed tasks.

2. **Update Documentation After Completion:**  
   After finishing a task:
   - Mark the task as completed in `main-task-list.md` (update status and date).
   - Create a detailed log in `C:\Users\carme\Documents\web 2\task-completion-logs` (e.g., `Task_Add_Cart_Functionality_Log.md`) including:
     - Task description and ID.
     - Completion date.
     - Summary of actions and code snippets.
     - Challenges and solutions.
     - Relevant links or references.

3. **Reference PROJECT_OVERVIEW.md:**  
   For questions about scope, tech stack, or architecture, refer to `PROJECT_OVERVIEW.md`.

## Code Quality and Best Practices

1. **Clean, Maintainable Code:**  
   - Use clear, descriptive names for variables, functions, and classes.
   - Keep functions focused and modular.
   - Comment complex logic.
   - Maintain consistent formatting (indentation, spacing).

2. **HTML Structure:**  
   - Use semantic HTML tags.
   - Ensure accessibility (alt attributes, labels).

3. **CSS Styling (Bootstrap-First Approach):**  
   - **Always use Bootstrap 5.3.0** for layout, components, and utilities.
   - Include Bootstrap CDN in all HTML files: `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">`
   - Include Bootstrap JS bundle: `<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>`
   - Use Bootstrap classes first, custom CSS only for brand-specific styling.
   - Organize custom styles in `css/styles.css` after Bootstrap import.
   - Avoid inline styles; prefer Bootstrap utility classes or custom CSS classes.

4. **JavaScript Logic:**  
   - Separate logic from presentation.
   - Use event listeners for user actions.
   - Handle errors gracefully (e.g., failed AJAX requests).
   - Avoid global variables; use modules or IIFEs.

5. **AJAX and Data Handling:**  
   - Use `XMLHttpRequest` for asynchronous communication.
   - Send/receive data in JSON format.
   - Validate and sanitize data before sending to server.

6. **XML Data:**  
   - Structure XML files clearly for products/orders.
   - Validate XML before use.

7. **PHP Server-Side:**  
   - Sanitize and validate all incoming data.
   - Handle errors and provide user-friendly feedback.
   - Never expose sensitive information in responses.

8. **Environment Variables:**  
   - Store sensitive info (e.g., DB credentials) in environment variables.
   - Add `.env` files to `.gitignore`.

## Bootstrap Framework Guidelines

1. **Bootstrap Implementation:**  
   - Use Bootstrap 5.3.0 consistently across all HTML pages.
   - Always include both Bootstrap CSS and JS bundle.
   - Load Bootstrap before custom CSS files.

2. **Layout Structure:**  
   - Use Bootstrap container system: `.container` or `.container-fluid`.
   - Apply Bootstrap grid system: `.row` and `.col-*` classes.
   - Use Bootstrap spacing utilities: `m-*`, `p-*`, `mt-*`, etc.

3. **Components:**  
   - Prefer Bootstrap components: `.card`, `.navbar`, `.btn`, `.form-control`.
   - Use Bootstrap utility classes for common styling: `.text-center`, `.bg-*`, `.text-*`.
   - Apply Bootstrap responsive classes: `.d-none`, `.d-md-block`, etc.

4. **Custom CSS Best Practices:**  
   - Keep custom CSS minimal and focused on brand-specific styling.
   - Use `!important` sparingly and only when overriding Bootstrap defaults.
   - Maintain consistent naming: `.hero-section`, `.product-card`, etc.
   - Add smooth transitions and hover effects to enhance Bootstrap components.

5. **Responsive Design:**  
   - Leverage Bootstrap's mobile-first responsive grid.
   - Use Bootstrap breakpoint classes: `.col-sm-*`, `.col-md-*`, `.col-lg-*`.
   - Test layouts on different screen sizes using Bootstrap's responsive utilities.

## Tool Usage

1. **File Edits:**  
   - Use appropriate tools for file changes.
   - Prefer absolute paths when referencing files.

2. **Terminal Commands:**  
   - Use terminal for running scripts or commands as needed.

## Communication

1. **Clarification:**  
   - Ask for details if a request is unclear.

2. **Conciseness:**  
   - Keep responses brief but complete.

## Tech Stack Reference

| Purpose          | Technology                      | Why It's Needed                                  |
| ---------------- | ------------------------------- | ------------------------------------------------ |
| 🖥️ Web page     | **HTML**                        | For the structure of your website                |
| 🎨 Styling       | **Bootstrap 5.3.0 + CSS**      | Bootstrap for responsive layout/components, CSS for brand styling |
| 🧠 Logic         | **JavaScript**                  | To handle cart actions, AJAX requests, and JSON  |
| 📄 Data          | **XML**                         | To store product data or orders                  |
| 📄 Data format   | **JSON**                        | To send cart/order data to server                |
| 🔁 Communication | **AJAX** using `XMLHttpRequest` | To send/receive data without refreshing the page |
| 🖥️ Server-side  | **PHP**                         | To receive and process