# JavaScript Modules Documentation

This directory contains the modularized JavaScript code for the Burger Heaven application.

## File Structure

### Core Modules

1. **config.js**
   - Contains application configuration constants
   - Defines `ADMIN_EMAIL` and other global settings
   - Exports `window.CONFIG` object

2. **modal.js**
   - Manages all modal functionality
   - Handles opening/closing of order and auth modals
   - Manages click-outside-to-close behavior
   - Exports: `openOrderForm()`, `closeOrderForm()`, `openAuthModal()`, `closeAuthModal()`

3. **auth.js**
   - Handles user authentication
   - Manages sign-up/sign-in toggle functionality
   - Processes login/signup form submissions
   - Handles user logout
   - Exports: `toggleAuthMode()`, `logoutUser()`, `AuthManager`

4. **order.js**
   - Manages order form submission
   - Handles order data collection and validation
   - Processes order API calls
   - Exports: `OrderManager`

5. **navigation.js**
   - Manages navigation UI updates
   - Handles session-based navbar changes
   - Controls hamburger menu functionality
   - Updates user display based on authentication status
   - Exports: `NavigationManager`

6. **main.js**
   - Main initialization file
   - Coordinates all module initialization
   - Sets up DOM ready event listeners

## Usage

Include all modules in your HTML file in the correct order:

```html
<script src="js/config.js"></script>
<script src="js/modal.js"></script>
<script src="js/auth.js"></script>
<script src="js/order.js"></script>
<script src="js/navigation.js"></script>
<script src="js/main.js"></script>
```

## Global Functions

The following functions are available globally for use in HTML onclick handlers:

- `openOrderForm()`
- `closeOrderForm()`
- `openAuthModal()`
- `closeAuthModal()`
- `toggleAuthMode()`
- `logoutUser()`

## Module Managers

The following manager objects are available globally:

- `window.CONFIG` - Configuration constants
- `window.AuthManager` - Authentication management
- `window.OrderManager` - Order management
- `window.NavigationManager` - Navigation and UI management

## Migration from script.js

The original `script.js` file has been replaced with this modular structure for better:
- Code organization
- Maintainability
- Debugging capabilities
- Feature separation
- Reusability

The legacy `script.js` file now serves as a compatibility layer that loads the modular files if needed.
