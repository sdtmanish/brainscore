# BrainScore - Interactive Quiz Application

A modern, full-featured quiz application built with Next.js 16, React 19, shadcn/ui, and Firebase. Supports three quiz types (text-based, image-based, and mixed) with an admin dashboard for quiz management.

![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-orange)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)

## ✨ Features

### User Features
- 🎯 **Anonymous Quiz Taking** - No signup required
- 📝 **Three Quiz Types** - Text, Image, and Mixed formats
- 🎨 **Beautiful UI** - Modern design with shadcn/ui components
- 📊 **Instant Feedback** - Real-time answer validation
- 📱 **Fully Responsive** - Works on all devices
- 🎉 **Score Tracking** - See your results after completion

### Admin Features
- 🔐 **Secure Authentication** - Firebase Auth with admin-only access
- ➕ **Create Quizzes** - Intuitive form with validation
- ✏️ **Edit Quizzes** - Update existing quizzes
- 🗑️ **Delete Quizzes** - Remove quizzes with confirmation
- 🖼️ **Image Support** - External URL support for images
- 📋 **Quiz Management Dashboard** - View and manage all quizzes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sdtmanish/brainscore.git
cd brainscore
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Environment Variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_ADMIN_EMAIL=admin@brainscore.com
```

4. **Set up Firebase**

#### Create Admin User
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** → **Users**
3. Click **Add User**
4. Enter:
   - Email: `admin@brainscore.com`
   - Password: Choose a secure password
5. Click **Add User**

#### Configure Firestore Security Rules
1. Go to **Firestore Database** → **Rules**
2. Replace with these rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email == 'admin@brainscore.com';
    }
    
    // Quizzes collection
    match /quizzes/{quizId} {
      // Anyone can read quizzes (for anonymous quiz taking)
      allow read: if true;
      
      // Only admin can create, update, or delete quizzes
      allow create, update, delete: if isAdmin();
    }
    
    // Deny access to all other collections by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### For Users
1. Visit the home page to see available quizzes
2. Click "Start Quiz" on any quiz
3. Answer questions and get instant feedback
4. View your final score

### For Admins
1. Navigate to `/admin/login`
2. Login with `admin@brainscore.com` and your password
3. Create, edit, or delete quizzes from the dashboard

## 🏗️ Project Structure

```
brainscore/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/page.jsx          # Admin login
│   │   │   ├── page.jsx                # Admin dashboard
│   │   │   └── quiz/
│   │   │       ├── create/page.jsx     # Create quiz
│   │   │       └── edit/[id]/page.jsx  # Edit quiz
│   │   ├── quiz/[slug]/page.jsx        # Quiz player
│   │   ├── page.js                     # Home page
│   │   ├── layout.js                   # Root layout
│   │   └── globals.css                 # Global styles
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components
│   │   └── ProtectedRoute.jsx         # Route guard
│   ├── contexts/
│   │   └── AuthContext.jsx             # Auth context
│   └── lib/
│       ├── firebase.js                 # Firebase config
│       ├── quizService.js              # Quiz CRUD
│       └── utils.js                    # Utilities
├── public/                             # Static assets
├── .env.local                          # Environment variables (not in repo)
└── package.json
```

## 🛠️ Tech Stack

- **Framework:** Next.js 16 with App Router
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **Component Library:** shadcn/ui
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Icons:** Lucide React
- **Notifications:** Sonner (toast)
- **Form Handling:** React Hook Form (via shadcn)

## 🎨 Quiz Types

### Text Quiz
Pure text-based questions with multiple choice answers.

### Image Quiz
Questions with accompanying images (uses external URLs).

### Mixed Quiz
Questions can optionally include images - flexibility for varied content.

## 🔒 Security

- Firestore rules allow public read, admin-only write
- Admin email (`admin@brainscore.com`) is hardcoded and validated
- Protected routes with authentication checks
- Input validation on both client and server
- No Firebase Storage used - only external image URLs

## 📝 Adding a New Quiz

1. Navigate to `/admin/login` and login
2. Click "Create New Quiz" button
3. Fill in quiz details:
   - **Title:** Display name (e.g., "Frontend Basics")
   - **Slug:** URL-safe identifier (e.g., "frontend-basics")
   - **Description:** Brief summary
   - **Type:** text | image | mixed
4. Add questions with:
   - Question text
   - Image URL (if applicable)
   - Multiple options
   - Correct answer selection
5. Click "Create Quiz"

## 🚧 Development

### Available Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Code Style
- Client components use `"use client"` directive
- ESLint with Next.js recommended config
- Tailwind CSS utility-first approach
- React Compiler enabled for automatic optimization

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | Yes |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Measurement ID | No |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Admin email address | Yes |

## 🐛 Troubleshooting

### Common Issues

**"Quiz not found" error**
- Ensure the quiz exists in Firestore
- Check that the slug matches exactly

**"Unauthorized" on admin login**
- Verify you're using `admin@brainscore.com`
- Check that the user exists in Firebase Authentication

**Firestore permission denied**
- Ensure security rules are published correctly
- Verify admin authentication is working

**Images not loading**
- Check that image URLs are valid and accessible
- Ensure CORS is enabled on the image host

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Aditya Verma**
- GitHub: [@sdtmanish](https://github.com/sdtmanish)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Firebase](https://firebase.google.com/) - Backend services
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide Icons](https://lucide.dev/) - Icons

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

Made with ❤️ using Next.js and Firebase
