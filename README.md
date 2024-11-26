# Pensif Canvas

Pensif Canvas is an AI-powered collaborative canvas application for creative exploration and ideation. Built with Next.js, TypeScript, and modern web technologies, it enables real-time collaboration, AI-assisted content generation, and seamless project sharing.

## 🌟 Key Features

- **Canvas Functionality**
  - Multiple frame types: Sketch, Image, Model
  - Smart connections between frames
  - AI model integration
  - Real-time collaboration
  - Frame content download
  - User presence and cursor sharing

- **Project Management**
  - Create, edit, delete projects
  - Project thumbnails generation
  - Export/import functionality
  - Role-based project sharing

- **Authentication & Collaboration**
  - User authentication with Clerk
  - Project sharing (viewer, editor, owner roles)
  - Invite system (email invites, invite links)
  - Real-time collaborative editing

- **Comments & Communication**
  - Thread-based commenting system
  - Real-time comment updates
  - Emoji reactions
  - Comment resolution tracking
  - Frame-specific comments

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pensif-canvas.git
cd pensif-canvas
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Pusher Real-time
PUSHER_APP_ID=
NEXT_PUBLIC_PUSHER_KEY=
PUSHER_SECRET=
NEXT_PUBLIC_PUSHER_CLUSTER=

# Resend Email
RESEND_API_KEY=

# AI Model APIs
REPLICATE_API_KEY=
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Authentication**: Clerk
- **Real-time**: Pusher
- **Email**: Resend
- **Storage**: IndexedDB
- **UI**: Tailwind CSS, Framer Motion, Headless UI
- **AI**: Replicate

## 📦 Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── components/    # React components
│   ├── lib/          # Utilities and managers
│   │   ├── auth/     # Authentication utilities
│   │   ├── realtime/ # Real-time collaboration
│   │   ├── storage/  # Data storage
│   │   └── utils/    # Helper functions
│   └── types/        # TypeScript types
```

## 🔒 Security

- Role-based access control
- Secure authentication with Clerk
- Protected API routes
- Invite link expiration
- Secure API key management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the amazing React framework
- [Clerk](https://clerk.dev) for authentication
- [Pusher](https://pusher.com) for real-time capabilities
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Replicate](https://replicate.com) for AI model hosting
