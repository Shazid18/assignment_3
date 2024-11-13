# Hotel Management API

A RESTful API built with Node.js, Express.js, and TypeScript for managing hotel details and images.

## Features

- Create and manage hotel records
- Upload and manage hotel images
- Retrieve hotel details
- Update hotel information
- TypeScript support
- Unit testing with Jest
- Input validation
- Error handling

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hotel-management-api
```
2. Install dependencies:
```bash
npm install
```
3. Build the project:
```bash
npm run build
```
## Running the Application
Development mode:
```bash
npm run dev
```
## Production mode:
```bash
npm run build
npm start
```
## API Endpoints
  # Create Hotel
  - POST /api/hotel
  - Body: Hotel details in JSON format
  - Returns: Created hotel object
  # Get Hotel Details
    - GET /api/hotel/:hotelId
    - Returns: Hotel details
  # Update Hotel
    - PUT /api/hotel/:hotelId
    - Body: Updated hotel details
    - Returns: Updated hotel object
  # Upload Images
    - POST /api/images
    - Body: Multipart form data with images
    - Returns: Array of image URLs

## Testing
  # Run tests:
  ```bash
npm test
```
## Project Structure
  hotel-management-api/
  ├── src/
  │   ├── controllers/     # Request handlers
  │   ├── models/         # Data models
  │   ├── routes/         # API routes
  │   ├── middleware/     # Custom middleware
  │   ├── utils/          # Utility functions
  │   └── app.ts          # Application entry point
  ├── data/              # JSON storage
  ├── uploads/           # Image storage
  ├── tests/             # Unit tests
  └── dist/              # Compiled JavaScript

## Error Handling
  # The API uses standard HTTP status codes:
    - 200: Success
    - 201: Created
    - 400: Bad Request
    - 404: Not Found
    - 500: Server Error
  
