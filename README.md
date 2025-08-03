# 🥗 NutriPlan by A S T R A

A professional nutrition management system for trainers to create personalized diet plans, track client progress, and manage comprehensive nutrition programs with modern UI and PDF export capabilities.

## ✨ Features

- **🔐 Authentication**: Secure trainer login/registration
- **👥 Client Management**: Complete client profiles with fitness data
- **🥗 Diet Plans**: Create personalized daily meal plans with calorie calculator
- **📊 Analytics**: Performance metrics and insights
- **📅 Calendar**: Schedule management and appointments
- **📋 Reports**: Generate comprehensive client reports
- **📄 PDF Export**: Beautiful, modern PDF diet plans
- **🎨 Modern UI**: Responsive design with glassmorphism effects

## 🚀 Quick Start

### Prerequisites

- Node.js (>= 18.0.0)
- npm (>= 8.0.0)
- MongoDB (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd diet-tracker
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run server` - Start backend server only
- `npm run client` - Start frontend only
- `npm run build` - Build frontend for production
- `npm run build:server` - Build and start production server
- `npm run install:all` - Install all dependencies

### Project Structure

```
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── index.js          # Server entry point
├── package.json
└── README.md
```

## 🚀 Deployment

### Heroku Deployment

1. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Vercel Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

### Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t gym-trainer-app .
   ```

2. **Run Container**
   ```bash
   docker run -p 5001:5001 gym-trainer-app
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5001 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/gym-trainer-db |
| `JWT_SECRET` | JWT signing secret | (required) |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:3000 |

### Database Setup

1. **Local MongoDB**
   ```bash
   # Install MongoDB locally
   # Start MongoDB service
   mongod
   ```

2. **MongoDB Atlas (Cloud)**
   - Create account at [MongoDB Atlas](https://cloud.mongodb.com)
   - Create cluster and database
   - Get connection string
   - Update `MONGODB_URI` in `.env`

## 📱 Features Overview

### Authentication
- Trainer registration and login
- JWT-based authentication
- Secure password hashing

### Client Management
- Complete client profiles
- Personal information
- Fitness data tracking
- Medical information
- Emergency contacts

### Diet Plans
- Personalized meal plans
- Calorie calculator with multiple formulas
- Macro distribution
- PDF export with modern design
- Daily meal structure

### Analytics & Reports
- Performance metrics
- Client progress tracking
- Goal achievement rates
- Monthly growth analysis

## 🎨 UI/UX Features

- **Modern Design**: Glassmorphism effects
- **Responsive**: Mobile-first approach
- **Smooth Animations**: CSS transitions
- **Dark/Light Mode**: Theme support
- **Accessibility**: WCAG compliant

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt encryption
- **CORS Protection**: Cross-origin security
- **Helmet**: Security headers
- **Input Validation**: Express-validator
- **Rate Limiting**: API protection

## 📄 API Documentation

### Authentication
- `POST /api/auth/register` - Trainer registration
- `POST /api/auth/login` - Trainer login

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create client
- `GET /api/clients/:id` - Get client details
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Diet Plans
- `GET /api/diets` - Get all diet plans
- `POST /api/diets` - Create diet plan
- `GET /api/diets/:id` - Get diet plan details
- `PUT /api/diets/:id` - Update diet plan
- `DELETE /api/diets/:id` - Delete diet plan
- `GET /api/diets/:id/pdf` - Export PDF

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@example.com or create an issue in the repository.

---

**Built with ❤️ using React, Node.js, and MongoDB** 