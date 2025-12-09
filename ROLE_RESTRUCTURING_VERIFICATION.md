# Role Restructuring Verification Checklist

Use this checklist to verify that all role restructuring changes are working correctly.

## Pre-Testing Setup

- [ ] Backend is running on `http://localhost:5000`
- [ ] Frontend is running on `http://localhost:3000`
- [ ] Database is accessible and up-to-date
- [ ] Environment variables are set (GITHUB_TOKEN_HR, DATABASE_URL, etc.)
- [ ] No compilation errors in backend or frontend

## Backend Verification

### 1. Employee Model Support
- [ ] Open `backend/models/models.py`
- [ ] Verify User model role comment includes: `'admin', 'interviewer', 'employee', 'candidate'`
- [ ] Verify role field is VARCHAR(32) with default 'candidate'

### 2. Employee Management Endpoints
- [ ] Verify `POST /api/hr/employees/register` exists in `hr_routes.py`
- [ ] Verify `GET /api/hr/employees` exists in `hr_routes.py`
- [ ] Verify `PUT /api/hr/employees/<int:employee_id>` exists in `hr_routes.py`
- [ ] Verify all three endpoints check for HR authorization (`user.role not in ['admin', 'interviewer']`)
- [ ] Verify password hashing is used in registration

### 3. Authorization Checks
- [ ] Document upload endpoint checks for HR role
- [ ] Document management endpoints check for HR role
- [ ] Chat endpoints allow both HR and employee roles
- [ ] Employee management endpoints check for HR role only

### 4. Backend Error Check
```bash
# Run in backend directory
python -m py_compile routes/hr_routes.py
python -m py_compile models/models.py
```
- [ ] No Python syntax errors
- [ ] No import errors

## Frontend Verification

### 1. Protected Route Component
- [ ] Open `frontend/src/components/ProtectedRoute.jsx`
- [ ] Verify component accepts both string and array for `requiredRole`
- [ ] Verify TypeScript definition file has updated types
- [ ] Test logic: `Array.isArray(requiredRole) ? requiredRole : [requiredRole]`

### 2. App Router
- [ ] Open `frontend/src/App.tsx`
- [ ] Verify `/hr-assistant` route has `requiredRole={["interviewer", "employee"]}`
- [ ] Verify route still uses ProtectedRoute wrapper

### 3. HR Assistant Component
- [ ] Open `frontend/src/pages/HRAssistant.js`
- [ ] Verify employee state variables exist (lines ~51-63)
- [ ] Verify employee management functions exist:
  - `loadEmployees()`
  - `handleRegisterEmployee()`
  - `handleToggleEmployeeStatus()`
- [ ] Verify third tab "Employee Management" is added
- [ ] Verify conditional rendering based on `userRole === 'interviewer'`
- [ ] Verify Employee Registration Dialog exists
- [ ] Verify employee list Grid component exists

### 4. API Service
- [ ] Open `frontend/src/services/api.js`
- [ ] Verify `hr.registerEmployee()` endpoint exists
- [ ] Verify `hr.getEmployees()` endpoint exists
- [ ] Verify `hr.updateEmployee()` endpoint exists

### 5. Frontend Error Check
```bash
# Run in frontend directory
npm run build
```
- [ ] Build completes successfully (ignore CSS type warnings)
- [ ] No TypeScript errors related to ProtectedRoute
- [ ] No React component errors

## Manual Testing - HR Official Flow

### Login as HR
- [ ] Start both backend and frontend
- [ ] Login with existing HR account (role: 'interviewer')
- [ ] Should redirect to dashboard or homepage

### Access HR Dashboard
- [ ] Navigate to `/dashboard`
- [ ] Should see "HR Dashboard" title
- [ ] Should see "Manage interviews, employees, and company documents" subtitle
- [ ] Should see "HR Assistant" button

### Access HR Assistant
- [ ] Click "HR Assistant" or navigate to `/hr-assistant`
- [ ] Should see "HR Assistant" title
- [ ] Should see THREE tabs:
  - [ ] Tab 1: "Chat Assistant" with bot icon
  - [ ] Tab 2: "Document Management" with document icon
  - [ ] Tab 3: "Employee Management" with person icon

### Test Chat Tab (HR)
- [ ] Click on "Chat Assistant" tab
- [ ] Should see empty chat interface
- [ ] Should see suggestion chips
- [ ] Type a message and send
- [ ] Should receive AI response (if documents uploaded)
- [ ] Message should appear in conversation

### Test Document Management Tab (HR)
- [ ] Click on "Document Management" tab
- [ ] Should see upload button
- [ ] Should see document statistics (if any docs uploaded)
- [ ] Click "Upload Document" button
- [ ] Fill in form: title, description, category, tags
- [ ] Select a PDF file
- [ ] Click "Upload"
- [ ] Should see progress bar with status messages
- [ ] After upload, document should appear in list
- [ ] Should see document card with metadata
- [ ] Click delete button (test only if safe)
- [ ] Document should be removed

### Test Employee Management Tab (HR)
- [ ] Click on "Employee Management" tab
- [ ] Should see "Employee Management" title
- [ ] Should see "Register New Employee" button
- [ ] Click "Register New Employee"
- [ ] Should see dialog with form fields:
  - [ ] Username (required)
  - [ ] Full Name (required)
  - [ ] Email (required)
  - [ ] Password (required)
  - [ ] Phone (optional)
- [ ] Fill in all required fields with test data:
  ```
  Username: test_employee
  Full Name: Test Employee
  Email: test@company.com
  Password: Test123!
  Phone: +1234567890
  ```
- [ ] Click "Register Employee" button
- [ ] Should see loading state
- [ ] Dialog should close on success
- [ ] New employee should appear in employee list
- [ ] Employee card should show:
  - [ ] Avatar with person icon
  - [ ] Full name and username
  - [ ] Email address
  - [ ] Phone number (if provided)
  - [ ] Join date
  - [ ] "Active" status chip (green)
  - [ ] "Deactivate" button

### Test Employee Status Toggle (HR)
- [ ] Find the test employee card
- [ ] Click "Deactivate" button
- [ ] Status chip should change to "Inactive" (gray)
- [ ] Button text should change to "Activate"
- [ ] Click "Activate" button
- [ ] Status chip should change back to "Active" (green)
- [ ] Button text should change back to "Deactivate"

## Manual Testing - Employee Flow

### Logout from HR Account
- [ ] Click logout button or navigate to `/login`
- [ ] Should be logged out
- [ ] LocalStorage should be cleared

### Login as Employee
- [ ] On login page, enter employee credentials:
  ```
  Username: test_employee
  Password: Test123!
  ```
- [ ] Click "Login"
- [ ] Should successfully authenticate

### Access HR Assistant as Employee
- [ ] Navigate to `/hr-assistant`
- [ ] Should be able to access (not redirected)
- [ ] Should see "Employee Portal" title
- [ ] Should see "Get answers about company policies and HR information" subtitle
- [ ] Should see header bar: "💬 Chat with HR Assistant"

### Verify Employee Restrictions
- [ ] Should NOT see tabs (no tab bar)
- [ ] Should NOT see "Document Management" option
- [ ] Should NOT see "Employee Management" option
- [ ] Should ONLY see chat interface

### Test Chat as Employee
- [ ] Should see chat interface directly
- [ ] Should see empty chat area
- [ ] Should see suggestion chips (if available)
- [ ] Type a message: "What is the leave policy?"
- [ ] Click "Send" button
- [ ] Should see message in chat
- [ ] Should receive AI response
- [ ] Response should be based on uploaded documents

### Test Unauthorized Access
- [ ] Try to navigate to `/dashboard`
- [ ] Should be redirected to `/` (unauthorized)
- [ ] Cannot access interviewer-only routes

## API Testing with Postman/cURL

### Setup
- [ ] Get JWT token by logging in as HR
- [ ] Save token for authorization header

### Test Employee Registration Endpoint
```bash
curl -X POST http://localhost:5000/api/hr/employees/register \
  -H "Authorization: Bearer YOUR_HR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "api_test_employee",
    "email": "apitest@company.com",
    "password": "ApiTest123!",
    "full_name": "API Test Employee",
    "phone": "+1234567890"
  }'
```
- [ ] Should return 201 status
- [ ] Response should contain employee object with id, username, email, full_name, role='employee'

### Test Get Employees Endpoint
```bash
curl -X GET http://localhost:5000/api/hr/employees \
  -H "Authorization: Bearer YOUR_HR_JWT_TOKEN"
```
- [ ] Should return 200 status
- [ ] Response should contain array of employees
- [ ] Should include previously registered employee

### Test Update Employee Endpoint
```bash
curl -X PUT http://localhost:5000/api/hr/employees/EMPLOYEE_ID \
  -H "Authorization: Bearer YOUR_HR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'
```
- [ ] Should return 200 status
- [ ] Response should show is_active=false

### Test Authorization Failure
```bash
# Get employee JWT token first by logging in as employee
curl -X POST http://localhost:5000/api/hr/employees/register \
  -H "Authorization: Bearer EMPLOYEE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "hack_attempt"}'
```
- [ ] Should return 403 status
- [ ] Error message should say "Unauthorized. Only HR officials can register employees."

## Database Verification

### Check User Table
```sql
-- Connect to your PostgreSQL database
SELECT id, username, email, full_name, role, is_active, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
```
- [ ] Should see newly registered employees
- [ ] Role should be 'employee'
- [ ] is_active should be TRUE (or FALSE if deactivated)

### Check Role Diversity
```sql
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;
```
- [ ] Should see at least 2 roles: 'interviewer' and 'employee'
- [ ] Possibly also 'admin' and 'candidate'

## Security Testing

### Test Password Security
- [ ] Register employee with weak password
- [ ] Should accept any password (validation on frontend if implemented)
- [ ] Check database: password_hash should be bcrypt/scrypt hash, not plaintext
- [ ] Should start with 'scrypt:' or similar prefix

### Test Duplicate Prevention
- [ ] Try to register employee with existing username
- [ ] Should get 400 error: "Username already exists"
- [ ] Try to register employee with existing email
- [ ] Should get 400 error: "Email already exists"

### Test JWT Expiry
- [ ] Use old/expired JWT token
- [ ] Should get 401 Unauthorized
- [ ] Should be redirected to login

### Test Missing JWT
- [ ] Call employee registration endpoint without Authorization header
```bash
curl -X POST http://localhost:5000/api/hr/employees/register \
  -H "Content-Type: application/json" \
  -d '{"username": "test"}'
```
- [ ] Should get 401 Unauthorized

## Edge Cases

### Test Empty Form Submission
- [ ] Try to submit employee registration with empty fields
- [ ] Frontend should disable submit button
- [ ] Backend should validate and return 400 if somehow submitted

### Test Special Characters
- [ ] Try username with spaces or special characters
- [ ] Should either sanitize or reject
- [ ] Email should validate format

### Test Long Values
- [ ] Try very long username (>80 chars)
- [ ] Try very long full_name (>100 chars)
- [ ] Should truncate or validate max length

## Performance Testing

### Test Employee List with Many Employees
- [ ] Register 10+ employees (can use API for speed)
- [ ] Navigate to Employee Management tab
- [ ] Page should load within 2 seconds
- [ ] All employee cards should render
- [ ] No lag when scrolling

### Test Chat Response Time
- [ ] Send message as employee
- [ ] Response should arrive within 5-10 seconds
- [ ] Progress indicator should show while waiting

## Documentation Verification

### Check Documentation Files
- [ ] `HR_ROLE_SYSTEM_GUIDE.md` exists
- [ ] `ROLE_RESTRUCTURING_SUMMARY.md` exists
- [ ] `HR_ROLE_ARCHITECTURE.md` exists
- [ ] `database/add_employee_role_migration.sql` exists

### Verify Documentation Accuracy
- [ ] API endpoints in docs match actual implementation
- [ ] Role definitions match code
- [ ] Access control matrix is accurate
- [ ] Example requests work as documented

## Final Checks

### Code Quality
- [ ] No console errors in browser
- [ ] No Python exceptions in backend logs
- [ ] No TypeScript errors (except pre-existing CSS import)
- [ ] Code follows existing patterns in project

### User Experience
- [ ] UI is intuitive and clear
- [ ] Loading states show appropriately
- [ ] Error messages are helpful
- [ ] Success feedback is visible

### Completeness
- [ ] All required features implemented
- [ ] HR can register employees ✓
- [ ] HR can view employee list ✓
- [ ] HR can activate/deactivate employees ✓
- [ ] Employees can access chat ✓
- [ ] Employees cannot access HR features ✓
- [ ] Role-based UI works correctly ✓

## Sign-Off

- [ ] All tests pass
- [ ] No critical bugs found
- [ ] Documentation is complete
- [ ] Ready for production deployment

**Tested by:** _________________
**Date:** _________________
**Notes:** _________________________________________________
