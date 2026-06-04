1. Code Style Rules
All functions MUST be written using arrow function syntax only.
❌ function getUser() {}
✅ const getUser = () => {}
This applies to:
React components
Utility functions
API handlers
Callbacks
Traditional function declarations are not allowed unless explicitly required by a library constraint.