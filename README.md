# Deckster - Smart Flashcard Study Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy Status](https://img.shields.io/badge/deploy-live-brightgreen)](https://project3-cngq.onrender.com/)

## Description

Deckster is a full-stack flashcard application that helps students and lifelong learners organize their study materials and track their progress over time. Built with the MERN stack and GraphQL, it combines the simplicity of traditional flashcards with modern features like CSV import, performance analytics, and collaborative deck sharing.

**Key Features:**

- 📚 Create and manage unlimited flashcard decks
- 📊 Track study performance with detailed analytics
- 📤 Import flashcards via CSV for bulk creation
- 🔒 Secure authentication with JWT
- 🌐 Share decks publicly or keep them private
- 📱 Fully responsive design for mobile and desktop
- 🎯 Session-based study tracking with real-time statistics

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Credits](#credits)
- [License](#license)
- [Contact](#contact)

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Git

### Local Development Setup

1. **Clone the repository**

   ````bash
   git clone https://github.com/yourusername/deckster.git
   cd deckster
   ```plaintext
   ````

2. **Install dependencies**

   ```bash
   npm install
   ```

   This will install dependencies for both client and server.

3. **Set up environment variables**

   Create a `.env` file in the `server` directory:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/deckster
   JWT_SECRET_KEY=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```

4. **Seed the database** (optional)

   ```bash
   npm run seed
   ```

   This creates sample users and flashcard decks for testing.

5. **Start the development server**

   ```bash
   npm run start:dev
   ```

   - Client runs on: <http://localhost:3000>
   - Server runs on: <http://localhost:3001>
   - GraphQL Playground: <http://localhost:3001/graphql>

## Configuration

### Environment Variables

| Variable         | Description                          | Required | Default     |
| ---------------- | ------------------------------------ | -------- | ----------- |
| `MONGODB_URI`    | MongoDB connection string            | Yes      | -           |
| `JWT_SECRET_KEY` | Secret key for JWT signing           | Yes      | -           |
| `NODE_ENV`       | Environment (development/production) | No       | development |
| `PORT`           | Server port                          | No       | 3001        |

### Database Configuration

The application uses MongoDB with the following collections:

- `profiles` - User accounts and authentication
- `carddecks` - Flashcard deck metadata
- `flashcards` - Individual flashcard content
- `studyattempts` - Performance tracking data
- `securityquestions` - Account recovery options

## Usage

### Getting Started

1. **Create an Account**

   - Navigate to the signup page
   - Enter your username, email, and password
   - Select a security question for account recovery

2. **Create Your First Deck**

   - Click "Import CSV" or "Create New Deck"
   - Name your deck and choose a category
   - Add flashcards manually or import from CSV

3. **Study Your Flashcards**

   - Select a deck from your dashboard
   - Click "Study" to begin a session
   - Use keyboard shortcuts:
     - `↑/↓` or click to flip cards
     - `←` mark as incorrect
     - `→` mark as correct
     - `Space` end session early

4. **Track Your Progress**
   - View accuracy statistics per deck
   - Monitor proficiency levels
   - Review session history charts

### CSV Import Format

Create a CSV file with the following structure:

```csv
Question,Answer
What is React?,A JavaScript library for building user interfaces
What is GraphQL?,A query language for APIs
```

Optional columns: `Category`, `Difficulty`

## Features

### Core Features

#### 🔐 User Authentication

- Secure registration and login with JWT tokens
- Password hashing with bcrypt
- Security questions for account recovery
- Session persistence with Redux

#### 📚 Deck Management

- Create unlimited flashcard decks
- Organize by categories
- Set public/private visibility
- Edit and delete functionality
- Deck statistics and metadata

#### 🃏 Flashcard Operations

- Add individual flashcards
- Bulk import via CSV
- Edit flashcards inline
- Delete with confirmation

#### 📈 Study Sessions

- Interactive card flipping animation
- Keyboard and click controls
- Session timer and progress tracking
- Real-time accuracy calculation
- Performance history visualization

#### 📊 Analytics Dashboard

- Overall accuracy percentages
- Proficiency levels (Beginner → Mastered)
- Session history charts
- Per-deck and per-card statistics
- Study streak tracking

### Technical Features

- **Real-time Updates**: Apollo Client cache management
- **Responsive Design**: Mobile-first approach with CSS Grid/Flexbox
- **Accessibility**: WCAG 2.0 compliant with ARIA labels
- **Performance**: Lazy loading and code splitting
- **Security**: Input validation and sanitization

## API Documentation

### GraphQL Schema

#### Queries

```graphql
# Get current user's decks
myCardDecks: [CardDeck]!

# Get public decks
cardDecks(isPublic: Boolean!): [CardDeck]!

# Get flashcards by deck
flashcardsByDeck(deckId: ID!): [Flashcard]!

# Get study session statistics
sessionStats(studySessionId: String!): SessionStats
```

#### Mutations

```graphql
# Authentication
login(email: String!, password: String!): Auth
addProfile(input: ProfileInput!): Auth

# Deck operations
addCardDeck(input: CardDeckInput!): CardDeck
removeCardDeck(deckId: ID!): CardDeck

# Flashcard operations
addMultipleFlashcards(deckId: ID!, flashcards: [FlashcardInput!]!): [Flashcard]
updateFlashcard(flashcardId: ID!, input: FlashcardInput!): Flashcard
removeFlashcard(flashcardId: ID!): Flashcard

# Study tracking
reviewFlashcard(flashcardId: ID!, correct: Boolean!, studySessionId: String!): Flashcard
```

## Technologies Used

### Frontend

- **React** (v18.2.0) - UI library
- **TypeScript** - Type safety
- **Apollo Client** - GraphQL client
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **Vite** - Build tool
- **CSS3** - Styling with custom properties
- **Chart.js** - Data visualization
- **Papaparse** - CSV parsing

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **GraphQL** - API query language
- **Apollo Server** - GraphQL server
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing

### DevOps & Tools

- **Git** - Version control
- **GitHub Actions** - CI/CD
- **Render** - Deployment platform
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Contributing

We welcome contributions to Deckster! Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Use TypeScript for new features
- Follow existing code style (enforced by ESLint)
- Write meaningful commit messages
- Add tests for new functionality
- Update documentation as needed

### Pull Request Process

1. Ensure all tests pass
2. Update the README.md with details of changes
3. Add screenshots for UI changes
4. Request review from at least one maintainer

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Structure

- Unit tests for utilities and helpers
- Integration tests for API endpoints
- Component tests for React components
- E2E tests for critical user flows

## Deployment

### Deploy to Render

1. **Create a MongoDB Atlas cluster** for production database

2. **Fork and configure the repository**

   - Update environment variables in Render dashboard
   - Set build command: `npm run render-build`
   - Set start command: `npm start`

3. **Environment setup on Render**

   ```env
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET_KEY=production_secret_key
   NODE_ENV=production
   ```

4. **Deploy**
   - Connect GitHub repository
   - Deploy from main branch
   - Enable automatic deploys

### Production URL

🚀 **Live Application**: [https://project3-cngq.onrender.com/](https://project3-cngq.onrender.com/)

## Future Enhancements

### Planned Features

- [ ] **Spaced Repetition Algorithm** - Optimize review timing
- [ ] **Collaborative Decks** - Multi-user deck editing
- [ ] **AI-Generated Flashcards** - Create cards from documents
- [ ] **Voice Commands** - Hands-free studying
- [ ] **Offline Mode** - Study without internet connection
- [ ] **Rich Media** - Audio and video flashcards
- [ ] **Study Groups** - Share and compete with friends

## Credits

### Development Team

- **Stuart** - Backend Architecture, Study Session Features, Performance Analytics, Database Design, Deployment
- **Antonina** - Frontend Development, Component Architecture, UI/UX Design, Redux Integration, Search Features
- **Jonathan** - Full Stack Development, Authentication System, Security Features, Team Organizer
- **Jaden** - CSV Import Implementation, UI/UX Design, Theming & Styling, Accessibility, GraphQL Integration

### Acknowledgments

- Columbia Coding Bootcamp instructional team
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [GraphQL Documentation](https://graphql.org/)
- Stack Overflow community for troubleshooting help

### Third-Party Assets

- Logo design created with Canva
- Icons from React Icons library
- Color palette inspired by earth tones

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

### Project Link

🔗 **GitHub Repository**: [https://github.com/p3tx-Group-X/Project3](https://github.com/p3tx-Group-X/Project3)

### Team Members

- Stuart - [GitHub](https://github.com/sigros02)
- Antonina - [GitHub](https://github.com/antoninast)
- Jonathan - [GitHub](https://github.com/ItsJustJon)
- Jaden - [GitHub](https://github.com/jadenszewczak)

### Support

For support, please open an issue in the GitHub repository or contact the team.
