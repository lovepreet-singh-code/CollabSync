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