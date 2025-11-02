# CollabSync Postman Collection Setup Guide

## Overview
This guide provides detailed instructions for setting up and using the comprehensive Postman collection for the CollabSync project, which includes both user authentication and document management workflows.

## Collection Files
- **CollabSync-Complete.postman_collection.json** - Complete workflow collection with authentication and document operations
- **CollabSync-DocumentService.local.postman_collection.json** - Document service focused collection for local testing

## Prerequisites

### 1. Services Running
Ensure both services are running on the correct ports:
- **User Service**: `http://localhost:3000`
- **Document Service**: `http://localhost:4002`

### 2. Environment Variables
Both services need proper environment configuration:

#### User Service (.env)
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/collabsync-users
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secure_jwt_secret_key_here
```

#### Document Service (.env)
```env
PORT=4002
MONGO_URI=mongodb://localhost:27017/collabsync-documents
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secure_jwt_secret_key_here
KAFKA_BROKERS=localhost:9092
```

**⚠️ Important**: Both services MUST use the same `JWT_SECRET` for token validation to work properly.

## Postman Setup

### 1. Import Collection
1. Open Postman
2. Click "Import" button
3. Select `CollabSync-Complete.postman_collection.json`
4. The collection will be imported with all requests and tests

### 2. Collection Variables
The collection uses these variables (automatically managed):
- `userServiceUrl`: http://localhost:3000
- `documentServiceUrl`: http://localhost:4002
- `jwt`: JWT token (auto-captured from login)
- `userId`: User ID (auto-captured from registration/login)
- `docId`: Document ID (auto-captured from document creation)
- `docVersion`: Document version (auto-updated after each modification)
- `collaboratorId`: Sample collaborator ID for sharing tests

### 3. Manual Variable Configuration (Optional)
If you need to set variables manually:
1. Right-click on the collection
2. Select "Edit"
3. Go to "Variables" tab
4. Update values as needed

## Testing Workflows

### Complete Workflow Test
Run the entire collection in sequence:

1. **🔐 Authentication Flow**
   - Register User → Login User → Get User Profile
   - JWT token is automatically captured and used for subsequent requests

2. **📄 Document Operations**
   - Create Document → List Documents → Get Document by ID
   - Update Document Content → Share Document
   - Document ID and version are automatically tracked

3. **🔄 Optimistic Concurrency Testing**
   - Version Conflict Test (intentionally fails with old version)
   - Missing Version Test (intentionally fails without version)

4. **🚫 Error Scenarios**
   - Unauthorized Access, Invalid Token, Document Not Found, Invalid ID Format

5. **🗑️ Cleanup**
   - Delete Document → Verify Document Deleted

### Individual Testing
You can run individual folders or requests:
- **Authentication only**: Run the "🔐 Authentication Flow" folder
- **Document operations only**: Ensure you have a valid JWT token first
- **Error testing**: Run "🚫 Error Scenarios" to test error handling

## Key Features

### Automatic Token Management
- JWT tokens are automatically captured from login/registration responses
- Tokens are automatically included in subsequent requests
- No manual token copying required

### Optimistic Concurrency Control
- Document versions are automatically tracked and updated
- Version conflict scenarios are tested
- Proper error handling for concurrent modifications

### Comprehensive Error Testing
- Tests for unauthorized access, invalid tokens, missing documents
- Validates proper HTTP status codes and error messages
- Ensures robust error handling

### Real-world Scenarios
- Complete user registration and authentication flow
- Document creation, sharing, and collaboration workflows
- Version conflict resolution testing
- Cleanup and verification procedures

## Troubleshooting

### Common Issues

#### 1. Connection Refused (ECONNREFUSED)
**Problem**: Cannot connect to services
**Solution**: 
- Verify services are running on correct ports
- Check if ports 3000 and 4002 are available
- Restart services if needed

#### 2. Invalid Token Errors
**Problem**: JWT validation fails
**Solution**:
- Ensure both services use the same `JWT_SECRET`
- Re-run the authentication flow to get a fresh token
- Check token format in Authorization header

#### 3. Version Conflicts
**Problem**: Document updates fail with version conflicts
**Solution**:
- This is expected behavior for optimistic concurrency
- Use the latest version number from previous responses
- The collection automatically manages versions

#### 4. Database Connection Issues
**Problem**: MongoDB or Redis connection failures
**Solution**:
- Ensure MongoDB is running on port 27017
- Ensure Redis is running on port 6379
- Check database connection strings in .env files

### Port Configuration
If you need to use different ports:

1. Update service configuration files (.env)
2. Update Postman collection variables:
   - `userServiceUrl`
   - `documentServiceUrl`

### JWT Token Generation (Manual)
If you need to generate JWT tokens manually for testing:

```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { userId: '507f1f77bcf86cd799439011', role: 'user' },
  'your_super_secure_jwt_secret_key_here',
  { expiresIn: '7d' }
);
console.log(token);
```

## Collection Structure

```
CollabSync - Complete Workflow/
├── 🔐 Authentication Flow/
│   ├── Register User
│   ├── Login User
│   └── Get User Profile
├── 📄 Document Operations/
│   ├── Create Document
│   ├── List Documents
│   ├── Get Document by ID
│   ├── Update Document Content (Versioned)
│   └── Share Document (Update ACL)
├── 🔄 Optimistic Concurrency Testing/
│   ├── Version Conflict Test (Should Fail)
│   └── Missing Version Test (Should Fail)
├── 🚫 Error Scenarios/
│   ├── Unauthorized Access (No Token)
│   ├── Invalid Token
│   ├── Document Not Found
│   └── Invalid Document ID Format
└── 🗑️ Cleanup/
    ├── Delete Document
    └── Verify Document Deleted
```

## Best Practices

1. **Run Authentication First**: Always start with the authentication flow to get valid tokens
2. **Sequential Testing**: Run requests in the provided order for best results
3. **Check Test Results**: Review the test results tab to ensure all assertions pass
4. **Environment Consistency**: Keep JWT_SECRET consistent across all services
5. **Clean State**: Use the cleanup folder to reset test data between runs

## Support
For issues or questions:
1. Check service logs for detailed error messages
2. Verify environment configuration
3. Ensure all dependencies (MongoDB, Redis, Kafka) are running
4. Review the test results for specific failure details