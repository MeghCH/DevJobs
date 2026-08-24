# API Documentation

This directory contains the API documentation for the Job Aggregator Platform using Swagger.

## Overview

The API documentation is written in OpenAPI 3.0 format and provides detailed information about the endpoints, request/response formats, and authentication methods.

## Setup

### Prerequisites
- Node.js (v14 or later)
- npm or yarn

### Install Swagger UI

To visualize the API documentation, you can use Swagger UI. Install it using:

```bash
npm install swagger-ui-express
```

### Running Swagger UI

To run Swagger UI locally, add the following code to your backend server:

```javascript
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./docs/swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

Then start your backend server and navigate to `http://localhost:3000/api-docs` to view the API documentation.

## API Endpoints

### Authentication
- **POST /auth/register**: Register a new user
- **POST /auth/login**: Login a user
- **GET /auth/me**: Get current user details

### Job Listings
- **GET /jobs**: Get all job listings
- **POST /jobs**: Create a new job listing
- **GET /jobs/{id}**: Get a specific job listing
- **PUT /jobs/{id}**: Update a job listing
- **DELETE /jobs/{id}**: Delete a job listing

### Applications
- **GET /applications**: Get all applications
- **POST /applications**: Create a new application
- **GET /applications/{id}**: Get a specific application

## Request/Response Formats

### User Registration

**Request:**
```json
{
  "name": "Doe",
  "firstname": "John",
  "email": "john@example.com",
  "password": "mypassword123",
  "role": "user",
  "company": "Acme Corp",
  "siret": "12345678900012"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Doe",
  "firstname": "John",
  "email": "john@example.com",
  "role": "user",
  "company": "Acme Corp",
  "siret": "12345678900012",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### User Login

**Request:**
```json
{
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Doe",
    "firstname": "John",
    "email": "john@example.com",
    "role": "user",
    "company": "Acme Corp",
    "siret": "12345678900012",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Job Listing

**Request:**
```json
{
  "title": "Software Engineer",
  "company": "Acme Corp",
  "location": "Paris, France",
  "contractType": "Full-time",
  "description": "We are looking for a software engineer to join our team.",
  "salaryMin": 50000,
  "salaryMax": 70000,
  "currency": "EUR",
  "experienceYears": 2,
  "remoteType": "Hybrid",
  "skills": ["JavaScript", "React", "Node.js"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Software Engineer",
    "company": "Acme Corp",
    "location": "Paris, France",
    "contractType": "Full-time",
    "description": "We are looking for a software engineer to join our team.",
    "salaryMin": 50000,
    "salaryMax": 70000,
    "currency": "EUR",
    "experienceYears": 2,
    "remoteType": "Hybrid",
    "skills": ["JavaScript", "React", "Node.js"],
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Application

**Request:**
```json
{
  "jobId": 1,
  "cvPath": "/uploads/cvs/cv.pdf",
  "coverLetterPath": "/uploads/cover_letters/cover_letter.pdf",
  "extraDocumentsPath": "/uploads/extra_documents/extra_document.pdf",
  "applicantFirstname": "John",
  "applicantName": "Doe",
  "applicantGender": "Male",
  "applicantEmail": "john@example.com",
  "applicantPhone": "1234567890",
  "applicantPostalCode": "75001",
  "applicantCity": "Paris"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "jobId": 1,
    "userId": 1,
    "cvPath": "/uploads/cvs/cv.pdf",
    "coverLetterPath": "/uploads/cover_letters/cover_letter.pdf",
    "extraDocumentsPath": "/uploads/extra_documents/extra_document.pdf",
    "applicantFirstname": "John",
    "applicantName": "Doe",
    "applicantGender": "Male",
    "applicantEmail": "john@example.com",
    "applicantPhone": "1234567890",
    "applicantPostalCode": "75001",
    "applicantCity": "Paris",
    "appliedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. To access protected endpoints, include the JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Error Handling

The API returns standard HTTP status codes to indicate the success or failure of requests. In case of an error, the response will include an error object with a message and status code:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "status": 400
  }
}
```

## Resources

- [Swagger Documentation](https://swagger.io/docs/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)