# Job Aggregator Platform

## Overview

This project is a comprehensive job and internship aggregator platform designed to collect external job offers, standardize data, and help users make informed decisions. The platform integrates with WeLoveDevs API to fetch real-world job data and provides features such as advanced filtering, AI-powered summarization, and a user-friendly interface for job seekers and recruiters.

## Features

### Frontend
- **Responsive and Accessible Interface**: Built with Next.js and Tailwind CSS, ensuring a seamless experience across devices.
- **User Authentication**: Secure registration and login system.
- **Job Search and Filtering**: Advanced search capabilities to find relevant job offers.
- **Job Details Page**: Comprehensive view of job offers including title, company, location, contract type, date, description, and salary.
- **Admin Interface**: Moderation and management tools for administrators.

### Backend
- **REST API**: Built with Express.js, providing endpoints for user management, job offers, and AI features.
- **Database**: Uses MySQL for data persistence with a well-defined schema.
- **Authentication and Authorization**: Secure routes with JWT-based authentication and role-based access control.

### Data and AI
- **Data Collection**: Integrates with WeLoveDevs API to fetch and normalize job offers.
- **AI Features**: AI-powered summarization and analysis of job descriptions using a lightweight LLM model.

### Security
- **Secret Management**: Environment variables for sensitive data.
- **Injection Protection**: Sanitized inputs and parameterized queries.
- **Brute-Force Mitigation**: Rate limiting and secure authentication flows.

## Installation

### Prerequisites
- Docker
- Docker Compose
- Node.js
- npm or yarn

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repository/job-aggregator.git
   cd job-aggregator
   ```

2. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add the necessary environment variables:
   ```env
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   WELOVEDVS_API_KEY=your_welovedevs_api_key
   ```

3. **Build and Start the Containers**:
   ```bash
   docker-compose up --build
   ```

4. **Access the Application**:
   Open your browser and navigate to `http://localhost:3001`.

## Usage

### User Roles
- **User**: Can browse job offers, apply for jobs, and manage their profile.
- **Recruiter**: Can post job offers and manage applications.
- **Admin**: Can moderate job offers, manage users, and access administration features.

### Key Flows
1. **Job Search**: Users can search and filter job offers based on various criteria.
2. **Job Application**: Users can apply for jobs by submitting their resume and cover letter.
3. **Job Posting**: Recruiters can post new job offers and manage existing ones.
4. **Admin Moderation**: Admins can moderate job offers and manage user accounts.

## API Documentation

The backend API is documented using Swagger. You can access the API documentation at `http://localhost:3000/api-docs`.

## Database Schema

The database schema includes tables for users, job offers, companies, and applications. Detailed schema documentation is available in the `database` directory.

## Testing

### Running Tests
```bash
npm test
```

### CI/CD
The project uses GitHub Actions for continuous integration and deployment. The workflows are defined in the `.github/workflows` directory.

## Contributing

1. **Fork the Repository**: Create a fork of the repository.
2. **Create a Branch**: Create a new branch for your feature or bug fix.
3. **Commit Changes**: Commit your changes with descriptive messages.
4. **Push Changes**: Push your changes to your fork.
5. **Create a Pull Request**: Submit a pull request to the main repository.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact

For any questions or feedback, please contact the project maintainers at `contact@example.com`.
