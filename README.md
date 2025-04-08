# GameTavern Server

## 🎮 Overview
GameTavern's backend server provides a robust API infrastructure for the GameTavern gaming platform. Built with NestJS and TypeScript, it offers secure authentication, game management, user lists, and integration with various gaming APIs.

## 🛠️ Tech Stack
- **Core**: 
  - NestJS
  - TypeScript
  - Express
- **Database & ORM**: 
  - PostgreSQL
  - TypeORM
- **Authentication & Security**:
  - Passport.js
  - JWT
  - bcrypt
  - Google OAuth2.0
- **API Integration**:
  - Giant Bomb API
  - OpenAI API
- **Email Services**:
  - Mailgun.js
- **Payment Processing**:
  - LemonSqueezy
- **Validation & Transformation**:
  - class-validator
  - class-transformer
- **Configuration**:
  - dotenv
  - Joi for schema validation
- **Documentation**:
  - Swagger/OpenAPI
- **Development Tools**:
  - ESLint & Prettier
  - Jest for testing
- **Package Manager**: pnpm

## 🚦 Getting Started

### Installation
1. Clone the repository:
```bash
git clone https://github.com/[your-username]/GameTavern-Server.git
cd GameTavern-Server
```

2. Install dependencies:
```bash
pnpm install
```

3. Create environment files:
```bash
cp .env.example .env.development
```

4. Set up your database:
```bash
# Run migrations
pnpm run migration:run
```

5. Start the development server:
```bash
pnpm run start:dev
```
