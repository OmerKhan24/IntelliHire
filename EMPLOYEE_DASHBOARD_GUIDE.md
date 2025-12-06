# Employee Dashboard - Feature Guide

## Overview
A beautiful, user-friendly dashboard designed specifically for company employees to access HR resources and get instant answers to their questions.

## Features

### 🎨 Visual Design
- **Gradient Header**: Eye-catching purple gradient with personalized welcome message
- **Stats Cards**: Display conversation and activity metrics
- **Quick Access Cards**: Three main action cards with hover animations
- **Popular Topics**: Pre-defined common questions for quick access
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile

### 📊 Dashboard Sections

#### 1. Header Section
- **Personalized Greeting**: Shows employee's name with emoji
- **User Avatar**: Displays first letter of name in a styled avatar
- **Logout Button**: Quick access to sign out
- **Description**: Clear explanation of dashboard purpose

#### 2. Statistics Cards (3 Cards)
- **Total Conversations**: Number of chat sessions
- **Questions Asked**: Count of questions submitted
- **Last Active**: Most recent activity date

#### 3. Quick Access Section (3 Cards)
- **HR Assistant**
  - Icon: Robot (AI Bot)
  - Description: Chat with AI assistant
  - Badge: "AI Powered"
  - Action: Opens HR Assistant chat
  
- **Ask a Question**
  - Icon: Question/Answer bubble
  - Description: Get quick policy answers
  - Badge: "Quick Help"
  - Action: Opens HR Assistant
  
- **View Documents**
  - Icon: Document
  - Description: Access company policies via chat
  - Badge: "Resources"
  - Action: Opens HR Assistant

#### 4. Popular Topics Section
Pre-configured common questions employees can click:
- 💰 Leave Policy
- 🏥 Health Benefits
- 📅 Holiday Calendar
- 🎓 Training Programs
- 🏆 Performance Reviews

Each topic:
- Has a relevant icon
- Shows category badge
- One-click access to ask about that topic

#### 5. Help & Support Panel
Shows what the AI can help with:
- Company Policies
- Benefits & Leave
- HR Procedures
- Onboarding Guides

Includes a prominent "Start Chatting" button

#### 6. Profile Card
Displays:
- Profile icon
- Employee name
- Email address
- Role badge ("Employee")

#### 7. Information Banner
Bottom tip section with:
- AI icon
- Helpful tip about using the assistant
- Encouragement to ask questions

## User Flow

```
Employee Login
    ↓
Employee Dashboard (Automatic Redirect)
    ↓
Choose Action:
    ├─→ Click "HR Assistant" → Opens chat interface
    ├─→ Click "Ask a Question" → Opens chat interface
    ├─→ Click "View Documents" → Opens chat interface
    ├─→ Click Popular Topic → Opens chat with pre-filled question
    └─→ Click "Start Chatting" → Opens chat interface
```

## Routes

### Employee Dashboard
- **URL**: `/employee-dashboard`
- **Access**: Employees only (protected route)
- **Redirect After Login**: Automatic for employee role

### HR Assistant (Chat)
- **URL**: `/hr-assistant`
- **Access**: HR Officials and Employees
- **Back Button**: For employees, shows "Back to Dashboard"

## Design Specifications

### Color Scheme
- **Primary Gradient**: `#667eea` to `#764ba2` (Purple gradient)
- **Stat Cards**:
  - Conversations: Light Blue (`#e3f2fd`)
  - Questions: Light Green (`#e8f5e9`)
  - Last Active: Light Orange (`#fff3e0`)
- **Quick Access Cards**: Pastel backgrounds matching stat cards

### Typography
- **Main Title**: h4, Bold
- **Section Headers**: h5, Font Weight 600
- **Card Titles**: h6, Font Weight 600
- **Descriptions**: body2, Secondary text color

### Interactions
- **Card Hover**: Translates up 4px with shadow increase
- **Button Style**: Contained, Rounded corners (borderRadius: 2)
- **List Items**: Rounded, Hover background effect

### Spacing
- **Container Padding**: 4 (32px)
- **Grid Spacing**: 3 (24px)
- **Card Content**: 3 (24px padding)

## Components Used

### Material-UI Components
- Container, Box, Paper, Typography
- Grid, Card, CardContent, CardActions
- Button, IconButton, Chip, Avatar
- List, ListItem, ListItemIcon, ListItemText, ListItemButton
- Divider

### Icons (Material Icons)
- SmartToy (AI Bot)
- Person, AccountCircle (User)
- Help, QuestionAnswer (Questions)
- Description (Documents)
- TrendingUp (Stats)
- Logout (Sign out)
- WorkspacePremium (Badge)
- School, HealthAndSafety, AttachMoney, EventNote (Topics)
- Chat (Conversations)

## Implementation Details

### State Management
```javascript
const [user, setUser] = useState(null);
const [stats, setStats] = useState({
  totalChats: 0,
  questionsAsked: 0,
  lastActive: null
});
```

### Data Loading
- User data from localStorage
- Stats can be fetched from API (currently mocked)
- Future: Real-time stats from backend

### Navigation
```javascript
const navigate = useNavigate();

// Examples:
navigate('/hr-assistant')  // Go to chat
navigate('/login')         // Logout redirect
```

## Responsive Behavior

### Grid Breakpoints
- **Stats Cards**: 
  - xs: 12 (full width on mobile)
  - sm: 4 (1/3 width on small screens)
  
- **Quick Access Cards**:
  - xs: 12 (full width on mobile)
  - md: 4 (1/3 width on medium screens)
  
- **Content Grid**:
  - Popular Topics: xs: 12, md: 8 (2/3 width)
  - Side Panel: xs: 12, md: 4 (1/3 width)

## Future Enhancements

### Planned Features
- [ ] Real-time chat statistics from API
- [ ] Conversation history preview
- [ ] Recent questions widget
- [ ] Notification center
- [ ] Profile editing
- [ ] Theme customization
- [ ] Quick links customization
- [ ] Search functionality
- [ ] Bookmark favorite topics
- [ ] Activity timeline

### API Integration Points
```javascript
// Fetch employee stats
GET /api/employees/stats
Response: {
  total_chats: number,
  questions_asked: number,
  last_active: date,
  favorite_topics: string[]
}

// Fetch recent conversations
GET /api/hr/chat/conversations?limit=5
Response: {
  conversations: [...]
}
```

## Accessibility Features

- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Added to icon buttons
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Color Contrast**: Meets WCAG AA standards
- **Focus Indicators**: Visible focus states on all interactive elements

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Initial Load**: Fast (no heavy dependencies)
- **Re-renders**: Optimized with proper state management
- **Bundle Size**: Minimal impact (uses existing MUI components)

## Testing Checklist

- [ ] Dashboard loads successfully for employee role
- [ ] Stats display correctly
- [ ] All quick access cards navigate to HR Assistant
- [ ] Popular topics are clickable
- [ ] Start Chatting button works
- [ ] Logout button clears session and redirects
- [ ] Back button works from HR Assistant
- [ ] Responsive design works on mobile
- [ ] Avatar shows correct initial
- [ ] Profile card displays correct info

## Screenshots Description

### Desktop View
- Full-width header with gradient background
- Three-column stat cards
- Three-column quick access cards
- Two-column layout (8/4 split) for topics and sidebar

### Mobile View
- Stacked layout (single column)
- Reduced padding for better space usage
- Touch-friendly button sizes
- Collapsible sections if needed

## Code Location

**File**: `frontend/src/pages/EmployeeDashboard.js`
**Route**: Defined in `frontend/src/App.tsx`
**Protection**: Via `ProtectedRoute` component with `requiredRole="employee"`

## Related Documentation

- [HR Role System Guide](../HR_ROLE_SYSTEM_GUIDE.md)
- [Role Architecture](../HR_ROLE_ARCHITECTURE.md)
- [Role Restructuring Summary](../ROLE_RESTRUCTURING_SUMMARY.md)
