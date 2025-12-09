# HR Role System - Implementation Guide

## Overview
The IntelliHire system now supports a comprehensive role-based access control (RBAC) system with separate HR and Employee roles for the HR Assistant module.

## Role Definitions

### 1. Admin (`admin`)
- **Access**: Full system access
- **Capabilities**:
  - Manage all users
  - Create and manage job postings
  - Access all interviews and reports
  - Upload HR documents
  - Chat with HR Assistant
  - Manage employees

### 2. HR Official (`interviewer`)
- **Access**: HR Dashboard and HR Assistant
- **Capabilities**:
  - Create and manage interviews
  - Upload and manage HR policy documents
  - Register new employees
  - View and manage employee list
  - Activate/deactivate employees
  - Chat with HR Assistant (access to all documents)

**Note**: In the backend, this role is stored as `'interviewer'` but displayed as "HR" or "HR Official" in the frontend UI for clarity.

### 3. Employee (`employee`)
- **Access**: Employee Portal (HR Assistant chat only)
- **Capabilities**:
  - Chat with HR Assistant
  - Ask questions about company policies, benefits, procedures
  - View AI-generated answers based on uploaded documents
  - Access conversation history

**Restrictions**: Cannot upload or manage documents, cannot view employee list

### 4. Candidate (`candidate`)
- **Access**: Interview portal via unique link
- **Capabilities**:
  - Attend scheduled interviews
  - Answer interview questions
  - View own interview results

**Note**: This role is separate from the HR Assistant module and is used only for the interview system.

## Access Control Matrix

| Feature | Admin | HR Official | Employee | Candidate |
|---------|-------|-------------|----------|-----------|
| HR Dashboard | ✅ | ✅ | ❌ | ❌ |
| Create Jobs | ✅ | ✅ | ❌ | ❌ |
| Upload Documents | ✅ | ✅ | ❌ | ❌ |
| Manage Documents | ✅ | ✅ | ❌ | ❌ |
| Register Employees | ✅ | ✅ | ❌ | ❌ |
| View Employee List | ✅ | ✅ | ❌ | ❌ |
| Chat with HR Bot | ✅ | ✅ | ✅ | ❌ |
| Attend Interviews | ❌ | ❌ | ❌ | ✅ |

## API Endpoints

### Employee Management (HR Only)

#### Register New Employee
```http
POST /api/hr/employees/register
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@company.com",
  "password": "SecurePassword123",
  "full_name": "John Doe",
  "phone": "+1234567890"  // Optional
}
```

**Response:**
```json
{
  "message": "Employee registered successfully",
  "employee": {
    "id": 5,
    "username": "john_doe",
    "email": "john@company.com",
    "full_name": "John Doe",
    "role": "employee",
    "created_at": "2024-01-15T10:30:00"
  }
}
```

#### Get All Employees
```http
GET /api/hr/employees
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "employees": [
    {
      "id": 5,
      "username": "john_doe",
      "email": "john@company.com",
      "full_name": "John Doe",
      "phone": "+1234567890",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "total": 1
}
```

#### Update Employee Status
```http
PUT /api/hr/employees/{employee_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "is_active": false,  // Deactivate employee
  "full_name": "John Doe Jr.",  // Optional
  "email": "johnjr@company.com",  // Optional
  "phone": "+1234567891"  // Optional
}
```

## Frontend Components

### Protected Routes
Routes are protected using the `ProtectedRoute` component which now supports multiple roles:

```jsx
// Single role
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>

// Multiple roles
<ProtectedRoute requiredRole={["interviewer", "employee"]}>
  <HRAssistant />
</ProtectedRoute>
```

### HR Assistant Component
The `HRAssistant` component adapts its UI based on user role:

**For HR Officials (`interviewer`):**
- Shows 3 tabs:
  1. Chat Assistant
  2. Document Management
  3. Employee Management

**For Employees (`employee`):**
- Shows chat interface only
- No document management or employee management access
- Page title changes to "Employee Portal"

## User Flow

### HR Official Flow
1. Login with HR credentials (`role: 'interviewer'`)
2. Access HR Dashboard
3. Navigate to HR Assistant
4. Can switch between:
   - **Chat Tab**: Ask and answer questions
   - **Documents Tab**: Upload/manage policy documents
   - **Employees Tab**: Register and manage employees

### Employee Flow
1. HR registers employee account
2. Employee receives credentials
3. Employee logs in (`role: 'employee'`)
4. Employee navigates to HR Assistant
5. Employee can only access chat interface
6. Employee asks questions about policies, benefits, etc.
7. AI responds using company documents uploaded by HR

## Implementation Details

### Backend Role Checks
All HR-exclusive endpoints check for authorization:

```python
current_user_id = get_jwt_identity()
user = User.query.get(current_user_id)

if user.role not in ['admin', 'interviewer']:
    return jsonify({'error': 'Unauthorized. Only HR officials can access this.'}), 403
```

### Frontend Role Detection
```javascript
const [userRole, setUserRole] = useState('');

useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  setUserRole(user.role || 'employee');
}, []);
```

### Conditional Rendering
```javascript
{userRole === 'interviewer' ? (
  <Tabs>
    <Tab label="Chat" />
    <Tab label="Documents" />
    <Tab label="Employees" />
  </Tabs>
) : (
  <Box>Chat Interface Only</Box>
)}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(32) NOT NULL DEFAULT 'candidate',
    -- role can be: 'admin', 'interviewer', 'employee', 'candidate'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

### Test HR Employee Registration
1. Login as HR official
2. Navigate to HR Assistant → Employee Management tab
3. Click "Register New Employee"
4. Fill in employee details
5. Submit form
6. Verify employee appears in list

### Test Employee Access
1. Logout from HR account
2. Login with newly created employee credentials
3. Verify redirect to HR Assistant with chat-only access
4. Verify no document management or employee management tabs visible
5. Test chat functionality

### Test Authorization
1. Try accessing `/api/hr/employees/register` with employee credentials
2. Should receive 403 Forbidden error
3. Try accessing `/api/hr/documents/upload` with employee credentials
4. Should receive 403 Forbidden error

## Security Considerations

1. **Password Security**: Employee passwords are hashed using Werkzeug's `generate_password_hash`
2. **JWT Authentication**: All endpoints require valid JWT tokens
3. **Role-Based Access**: Endpoints validate user role before processing requests
4. **Email Uniqueness**: System prevents duplicate employee emails
5. **Username Uniqueness**: System prevents duplicate employee usernames

## Migration from Old System

If you have existing "interviewer" users, no migration is needed. The system treats `'interviewer'` as the HR role. Only the UI displays it as "HR" for clarity.

To add the employee role capability, simply run the application - the User model already supports it.

## Troubleshooting

### Employee Can't Login
- Verify employee is marked as `is_active: true` in database
- Check credentials are correct
- Ensure role is set to `'employee'`

### HR Can't Register Employees
- Verify HR user role is `'interviewer'` or `'admin'`
- Check JWT token is valid
- Ensure backend `/api/hr/employees/register` endpoint is accessible

### Employee Sees Document Management
- Clear browser cache and localStorage
- Verify `user.role` in localStorage is `'employee'` not `'interviewer'`
- Check frontend conditional rendering logic

## Future Enhancements

- [ ] Employee profile editing
- [ ] Bulk employee import via CSV
- [ ] Employee department management
- [ ] Advanced permissions (read-only HR, etc.)
- [ ] Employee onboarding workflow
- [ ] Email notifications for new employees
