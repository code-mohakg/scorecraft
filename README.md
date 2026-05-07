# ScoreCraft - Adaptive Question Bank & Testing Platform

A modern, intelligent adaptive testing platform designed for educational institutions. ScoreCraft helps manage comprehensive question banks, conduct adaptive assessments, and gain actionable insights into student performance.

## 🎯 Features

### Core Functionality
- **Adaptive Testing Engine**: Questions automatically adjust difficulty based on student responses
- **Question Bank Management**: Create, organize, and manage questions across subjects and chapters
- **Peer Review Workflow**: Teachers can review and approve questions before use in tests
- **Role-Based Access**: Admin, Teacher, and Student interfaces with specific permissions
- **CSV Bulk Upload**: Import questions in bulk with validation and error reporting
- **Comprehensive Analytics**: Detailed performance tracking and insights

### User Roles
- **Admin**: Manage users, grades, subjects, and platform-wide settings
- **Teacher**: Create and manage questions, review peer submissions, track student performance
- **Student**: Take adaptive tests, view results, and track performance over time

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Installation

1. **Clone or extract the project**
   ```bash
   cd ScoreCraft
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   - Navigate to `http://localhost:3000`

## 📝 Demo Accounts

The app comes with pre-configured demo accounts for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@scorecraft.com | (sign up) |
| Teacher | teacher@scorecraft.com | (sign up) |
| Student | student@scorecraft.com | (sign up) |

Simply enter the email and click "Sign In/Create Account" to proceed.

## 📊 Quick CSV Upload Template

### Question CSV Format
```
loCode,questionText,optionA,optionB,optionC,optionD,correctAnswer,difficulty,explanation,tags
LO-1.1,"What is photosynthesis?","Process of plant growth","Conversion of light to chemical energy","Water absorption","None of above",B,Medium,"Photosynthesis is the process...",biology;plants
```

**Columns:**
- `loCode`: Learning Objective code (must exist)
- `questionText`: The question text
- `optionA-D`: Answer options
- `correctAnswer`: Which option is correct (A, B, C, or D)
- `difficulty`: Easy, Medium, or Hard
- `explanation`: Detailed explanation
- `tags`: Comma-separated keywords

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── teacher/           # Teacher dashboard pages
│   ├── student/           # Student dashboard pages
│   ├── login/             # Authentication
│   └── page.tsx           # Homepage
├── components/            # Reusable React components
├── lib/                   # Utility libraries
│   └── storage.ts         # Local storage management
├── stores/                # Zustand state stores
│   ├── authStore.ts       # Authentication state
│   ├── masterDataStore.ts # Grades, subjects, chapters
│   └── questionsStore.ts  # Questions management
├── types/                 # TypeScript interfaces
├── utils/                 # Helper functions
└── styles/               # Global CSS
```

## 🔐 Data Persistence

ScoreCraft uses browser **localStorage** for data persistence:
- All data is stored locally on your machine
- Perfect for standalone desktop/laptop use
- No internet connection required after initial setup
- Data survives browser restarts but not cache clearing

**Supported Data Types:**
- Users (Admins, Teachers, Students)
- Grades, Subjects, Chapters, Learning Objectives
- Questions (with full lifecycle)
- Test Sessions and Results
- Question Reviews

## 🧪 Testing

### Admin Features to Test
1. Create Grades (e.g., "Grade 10", "Grade 11")
2. Create Subjects for each grade (e.g., "Mathematics", "Physics")
3. Manage Teachers and Students
4. View platform-wide statistics

### Teacher Workflow
1. Create Learning Objectives for a Chapter
2. Create MCQ questions tied to objectives
3. Submit questions for peer review
4. Review questions from other teachers
5. Bulk upload CSV with multiple questions
6. View student performance metrics

### Student Experience
1. Browse available chapters by subject
2. Configure test (select chapters, duration)
3. Take adaptive test (difficulty adjusts)
4. View detailed results and performance breakdown
5. Review historical test attempts
6. Analyze learning objective performance

## 🔧 Development

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

## 🌐 Deployment to Vercel

### Steps
1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import the GitHub repository
5. Click "Deploy"

**Configure Environment:**
- Framework: Next.js
- Node.js version: 18.x or higher

### Environment Variables (if needed in future)
```
NEXT_PUBLIC_APP_NAME=ScoreCraft
```

## 📈 Performance Metrics

The adaptive algorithm works as follows:

1. **Initial Difficulty**: Medium questions
2. **On Correct Answer**: Difficulty increases (Medium → Hard)
3. **On Wrong Answer**: Difficulty decreases (Hard → Medium)
4. **Window Size**: Maintains last 5 questions for trend analysis
5. **Consecutive Correct**: After 2 consecutive correct answers → promote to harder
6. **Consecutive Wrong**: After 2 consecutive wrong answers → demote to easier

## 🎨 Modern UI/UX

- **Tailwind CSS**: Utility-first styling
- **Responsive Design**: Mobile, tablet, desktop support
- **Dark Mode Ready**: Can be easily extended
- **Accessibility**: WCAG compliance focused
- **Smooth Transitions**: Professional animations

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

For future enhancements, consider:
- Professional backend with PostgreSQL
- Real authentication (OAuth, JWT)
- Progress sync across devices
- Mobile app (React Native)
- Real-time collaboration features
- Advanced reporting and analytics

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Troubleshooting

### Port 3000 already in use
```bash
lsof -i :3000  # Find process
kill -9 <PID>  # Kill process
npm run dev    # Retry
```

### localStorage full
Clear browser cache: DevTools → Application → Storage → Clear Cookies

### Questions not showing up
- Ensure questions are in "approved" status for tests
- Check that Learning Objectives are created first
- Verify questions are linked to correct Learning Objectives

## 📞 Contact & Support

For questions or support regarding ScoreCraft, refer to the comprehensive documentation in each dashboard.

---

**Happy Learning with ScoreCraft! 🎯**
