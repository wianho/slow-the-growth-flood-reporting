# Security Documentation

## Admin Authentication

### Overview
The admin dashboard uses JWT-based authentication with bcrypt password hashing for secure access control.

### Configuration

#### Environment Variables
The admin credentials are stored securely using environment variables:

- `ADMIN_USERNAME`: Admin username (default: configured in .env)
- `ADMIN_PASSWORD_HASH`: Bcrypt hash of the admin password

**Important**: The actual password is NEVER stored in the codebase. Only the bcrypt hash is stored in environment variables.

#### Generating a Password Hash

To create a new admin password hash:

```bash
cd backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('your_password_here', 10).then(hash => console.log(hash));"
```

Copy the resulting hash to your `.env` file:
```
ADMIN_PASSWORD_HASH=$2b$10$...your_hash_here...
```

### Setup Instructions

#### Local Development

1. Copy the example environment file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Generate a password hash for your admin account (see above)

3. Update `backend/.env` with your credentials:
   ```
   ADMIN_USERNAME=your_username
   ADMIN_PASSWORD_HASH=your_generated_hash
   ```

#### Production Deployment

1. Set environment variables on your production server in `.env`:
   ```bash
   ssh root@your-server
   cd /root/slow-the-growth
   nano .env
   ```

2. Add the admin credentials:
   ```
   ADMIN_USERNAME=your_username
   ADMIN_PASSWORD_HASH=your_generated_hash
   ```

3. Restart the backend service:
   ```bash
   docker compose -f docker-compose.prod.yml restart backend
   ```

### Security Best Practices

✅ **DO:**
- Store passwords as bcrypt hashes in environment variables
- Use strong, unique passwords (minimum 12 characters, mix of upper/lower/numbers/symbols)
- Keep `.env` files out of version control (they're in `.gitignore`)
- Rotate admin passwords periodically
- Use HTTPS for all admin access (already configured)
- Review admin dashboard access logs regularly

❌ **DON'T:**
- Commit `.env` files to Git
- Share admin credentials in plain text
- Use the same password across multiple services
- Store passwords in source code
- Reuse password hashes across environments

### Access Control

#### Admin Endpoints
All admin endpoints are protected with JWT authentication:

- `POST /api/admin/login` - Get JWT token (requires username + password)
- `GET /api/admin/reports` - View all reports (requires valid JWT)
- `GET /api/admin/stats` - View statistics (requires valid JWT)
- `DELETE /api/admin/reports/:id` - Delete report (requires valid JWT)
- `DELETE /api/admin/reports` - Clear all reports (requires valid JWT)

#### JWT Tokens
- Tokens expire after 24 hours
- Tokens are stored in browser localStorage
- Tokens include username and role claim
- Invalid tokens return 401 Unauthorized

### Threat Model & Mitigations

| Threat | Mitigation |
|--------|-----------|
| Password theft | Bcrypt hashing (cost factor: 10) |
| Credential exposure | Environment variables, not in source code |
| Session hijacking | JWT tokens with 24h expiration |
| Brute force attacks | Consider adding rate limiting to login endpoint |
| Token theft | HTTPS only, short expiration window |

### Additional Security Considerations

#### Recommended Improvements
1. **Rate Limiting**: Add rate limiting to `/api/admin/login` endpoint to prevent brute force
2. **2FA**: Consider adding two-factor authentication for admin accounts
3. **Audit Logging**: Log all admin actions (deletes, logins, etc.)
4. **IP Whitelisting**: Restrict admin access to known IP addresses
5. **Password Complexity**: Enforce password requirements at registration

#### Current Limitations
- No rate limiting on login endpoint (rely on general API rate limiting)
- No session invalidation mechanism (tokens valid until expiration)
- No password reset functionality
- Single admin account (consider multi-user admin system)

### Incident Response

If admin credentials are compromised:

1. Immediately generate new password hash:
   ```bash
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('new_strong_password', 10).then(hash => console.log(hash));"
   ```

2. Update production `.env` file with new hash

3. Restart backend service:
   ```bash
   docker compose -f docker-compose.prod.yml restart backend
   ```

4. All existing admin JWT tokens will remain valid until they expire (24h max)

5. Review logs for unauthorized access

### Contact

For security concerns or to report vulnerabilities, please contact the repository maintainer.
