# user-service/user-service/README.md

# User Service

This is the User Service microservice, which is part of a larger application architecture. It is responsible for handling user-related operations such as registration, authentication, and profile management.

## Getting Started

To get started with the User Service, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   cd user-service
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and configure your environment variables.

4. Run the development server:
   ```
   npm run dev
   ```

## Quick Start (Local)

If you already have the repo, you can run the service locally with these simple steps:

- Install dependencies:
  ```bash
  npm install
  ```
- Copy environment template and adjust values as needed:
  ```bash
  cp .env.example .env
  ```
- Start the development server:
  ```bash
  npm run dev
  ```

## Docker Compose (Mongo + Redis + User Service)

Use the following `docker-compose.yml` to spin up MongoDB, Redis, and the User Service together:

```yaml
version: "3.8"
services:
  mongo:
    image: mongo:6
    container_name: mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    container_name: redis
    ports:
      - "6379:6379"

  user-service:
    build: .
    container_name: user-service
    env_file:
      - .env
    environment:
      # Ensure these are present in your .env or override here as needed
      - MONGO_URI=mongodb://mongo:27017/user_service_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    ports:
      - "3000:3000"

volumes:
  mongo_data:
```

Run it with:

```bash
docker compose up -d --build
```

The service will connect to MongoDB via `mongodb://mongo:27017/` and Redis via `redis://redis:6379` using the internal Docker network.

## Scripts

- `dev`: Starts the development server with hot reloading.
- `build`: Compiles the TypeScript files to JavaScript.
- `start`: Runs the compiled JavaScript files.
- `lint`: Lints the codebase using ESLint.

## Dependencies

This project uses the following key dependencies:

- **Express**: Web framework for Node.js.
- **Mongoose**: MongoDB object modeling tool.
- **Redis**: In-memory data structure store.
- **jsonwebtoken**: For handling JSON Web Tokens.
- **bcrypt**: For hashing passwords.
- **Joi**: For data validation.
- **dotenv**: For loading environment variables.
- **CORS**: Middleware for enabling CORS.
- **Helmet**: Middleware for securing HTTP headers.
- **Morgan**: HTTP request logger middleware.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.