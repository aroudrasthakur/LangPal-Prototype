# LangPal 🌍

**LangPal** is a language learning partner app that connects users with language exchange partners from around the world. Practice languages through real-time conversations, find partners who speak your target language, and track your learning journey.

Built with **React Native**, **Expo Router**, and **TypeScript**.

---

## ✨ Features

### 🔐 Authentication & User Management

- **Sign Up & Login**: Create an account with comprehensive profile setup
- **Multi-step Registration**:
  - Step 1: Username and password setup
  - Step 2: Personal information (name, DOB, language preferences)
  - Step 3: Identity and pronouns
  - Step 4: Avatar selection (gallery or camera)
- **Date of Birth Validation**: Ensures proper MM/DD/YYYY format
- **Searchable Language Picker**: Choose from 100+ languages with built-in search functionality
- **Account Management**: Edit profile details, change avatar, or delete account
- **Secure Storage**: User data persisted locally with AsyncStorage

### 💬 Real-Time Chat System

- **Live Messaging**: Send and receive messages in real-time with polling updates
- **Per-User Chat History**: Separate conversation histories for each user
- **Unread Message Badges**: Visual indicators for new messages
- **Read Receipts**: See when messages are delivered and read
- **Message Metadata**: Timestamps and language tags for each message
- **Empty State Handling**: Friendly prompts when no conversations exist

### 🔍 Partner Discovery

- **Browse Partners**: View available language partners with detailed profiles
- **Partner Profiles**: See bio, native language, learning language, gender, and pronouns
- **Online Status**: Real-time availability indicators
- **Mixed Partner List**: Combines mock partners and registered users
- **One-Tap Chat**: Start conversations directly from partner profiles

### 🛡️ Safety & Privacy Features

- **Report Conversations**: Report inappropriate behavior with reason categories and descriptions
- **Block Users**: Prevent blocked users from sending messages
- **Per-User Chat Deletion**: Delete conversations from your view without affecting the other user
- **Chat Recovery**: Deleted chats restore when new messages arrive
- **Long-Press Actions**: Quick access to report, block, and delete options

### 👤 User Profiles

- **Customizable Avatars**: Upload photos or use generated avatars based on name/gender
- **Language Information**: Display native and learning languages
- **Personal Details**: Gender, pronouns, and date of birth
- **Dark Mode Support**: Toggle between light and dark themes
- **Profile Editing**: Update all profile information except username and password

### 🎨 UI/UX Features

- **Draggable Floating Chat Button**: Quick access to conversations from anywhere
- **Wave Animation**: Smooth transition effects with reduced motion support
- **Tab Navigation**: Home, Partners, Activity, Chat, and Profile tabs
- **Theme Support**: Light and dark mode with custom color schemes
- **Adaptive Text Colors**: Input text automatically adjusts (black in light mode, white in dark)
- **Safe Area Handling**: Proper spacing on devices with notches
- **Platform-Specific Optimizations**: iOS and Android native behaviors

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Expo CLI** (optional, but recommended)
- **iOS Simulator** (Mac only) or **Android Emulator**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/aroudrasthakur/LangPal-Prototype.git
   cd LangPal-Prototype/LangPal
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan the QR code with Expo Go app (iOS/Android)

---

## 📱 App Structure

```
LangPal/
├── app/                          # Expo Router pages
│   ├── _layout.tsx              # Root layout with tabs
│   ├── index.tsx                # Home screen
│   ├── partners.tsx             # Browse partners
│   ├── partnerProfile.tsx       # Partner detail view
│   ├── chat.tsx                 # Chat list & conversations
│   ├── profile.tsx              # User profile
│   └── editProfile.tsx          # Edit profile screen
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── Avatar.tsx           # User avatar component
│   │   ├── PartnerCard.tsx      # Partner list item
│   │   └── WaveOverlay.tsx      # Animation component
│   ├── context/                 # React Context providers
│   │   ├── AuthContext.tsx      # User authentication state
│   │   └── ThemeContext.tsx     # Dark/light theme state
│   ├── screens/                 # Screen components
│   │   └── LoginScreen.tsx      # Login & signup flow
│   └── types/                   # TypeScript definitions
│       └── index.ts             # Shared types
└── assets/                      # Images and static files
```

---

## 🔧 Key Technologies

- **[React Native](https://reactnative.dev/)** - Mobile app framework
- **[Expo](https://expo.dev/)** - Development platform
- **[Expo Router](https://expo.github.io/router/)** - File-based routing
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - Local data persistence
- **[Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)** - Photo selection
- **[React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context)** - Safe area handling

---

## 🎯 Core Functionality

### Chat System

- **Per-User Isolation**: Each user maintains their own chat list and history
- **Live Updates**: Polling mechanism updates conversations every 2-3 seconds
- **Read Tracking**: `lastRead` timestamps track unread messages per user
- **Persistence**: All messages stored in AsyncStorage with chat-specific keys

### Authentication Flow

1. User signs up with username/password
2. Completes 4-step profile setup
3. Credentials and profile stored locally
4. Session persists across app restarts
5. Users can edit profile, logout, or delete account

### Safety Features

- **Report System**: Users can report conversations with categorized reasons
- **Block Mechanism**: Blocked users cannot send messages
- **Delete Behavior**: Per-user deletion keeps chat visible for partner
- **Toast Notifications**: Feedback for actions (iOS banner, Android toast)

---

## 🌈 Theme System

The app supports light and dark modes:

### Light Mode

- Background: `#F7FFF7`
- Primary: `#2F855A` (Green)
- Text: `#0f1720` (Dark)
- Input text: Black

### Dark Mode

- Background: `#071019`
- Primary: `#276749` (Dark Green)
- Text: `#E6EEF3` (Light)
- Input text: White

Toggle theme via the switch in the Profile screen.

---

## 🔒 Data Storage

All data is stored locally using AsyncStorage:

- `users` - Array of registered users
- `currentUser` - Currently logged-in user ID
- `chat-{sortedIds}` - Conversation messages
- `lastRead-chat-{sortedIds}` - Read receipt timestamps
- `deletedChats-{userId}` - User-specific deleted conversations
- `blockedUsers-{userId}` - User-specific blocked partners
- `reports` - Reported conversations

---

## 🛠️ Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
# iOS
npx expo build:ios

# Android
npx expo build:android
```

### Type Checking

```bash
npx tsc --noEmit
```

---

## 📝 Future Enhancements

- [ ] WebSocket integration for true real-time messaging
- [ ] Push notifications for new messages
- [ ] Audio/video call support
- [ ] Message translation feature
- [ ] Conversation pinning
- [ ] Search in messages
- [ ] Image/file sharing
- [ ] Backend API integration
- [ ] User verification system
- [ ] Advanced matching algorithm

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is a prototype for educational purposes.

---

## 👤 Author

**Aroudra S Thakur**

- GitHub: [@aroudrasthakur](https://github.com/aroudrasthakur)

---

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- UI inspiration from modern chat applications
- Language list from Google Translate supported languages

---

**Happy Language Learning! 🎓🌍**
