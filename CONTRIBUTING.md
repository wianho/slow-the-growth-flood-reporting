# Contributing to Volusia Flood Watch

Thank you for your interest in contributing to Volusia Flood Watch! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what's best for the community
- Show empathy towards other community members
- Provide constructive feedback

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

**When submitting a bug report, include:**
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)
- Relevant logs or error messages

### Suggesting Enhancements

We welcome feature suggestions! Please include:
- A clear description of the feature
- Why this feature would be useful
- Possible implementation approach
- Any alternatives you've considered

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding standards** (see below)
3. **Write tests** for new features
4. **Update documentation** if you change functionality
5. **Ensure tests pass** before submitting
6. **Write a clear commit message** describing your changes

## Development Setup

See the main [README.md](README.md) for detailed setup instructions.

### Quick Start

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/volusia-flood-watch.git
cd volusia-flood-watch

# Set up environment
cp .env.example .env

# Start Docker services
docker-compose up -d

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Run in development mode
cd backend && npm run dev  # Terminal 1
cd frontend && npm run dev # Terminal 2
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define interfaces for all data structures
- Avoid `any` type - use proper typing
- Use meaningful variable names

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

### Naming Conventions

- **Files**: PascalCase for components (`FloodMap.tsx`), camelCase for utilities (`validation.ts`)
- **Components**: PascalCase (`FloodMap`, `ReportForm`)
- **Functions**: camelCase (`getReports`, `validateLocation`)
- **Constants**: UPPER_SNAKE_CASE (`VOLUSIA_BOUNDS`, `API_BASE_URL`)
- **Interfaces/Types**: PascalCase (`FloodReport`, `GeoJSONFeature`)

### Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and PRs when relevant

**Examples:**
```
Add real-time notification system
Fix rate limiting bug for concurrent requests
Update USGS API integration
Refactor authentication middleware
```

## Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Writing Tests

- Write unit tests for all new functions
- Write integration tests for API endpoints
- Test edge cases and error handling
- Aim for >80% code coverage

**Example test structure:**
```typescript
describe('FloodReport Model', () => {
  it('should create a report with correct confidence score', async () => {
    // Test implementation
  });

  it('should validate location bounds', async () => {
    // Test implementation
  });
});
```

## Project-Specific Guidelines

### Database Changes

- Create new migration files for schema changes
- Test migrations on a fresh database
- Include rollback instructions
- Update relevant models/types

### API Changes

- Maintain backward compatibility when possible
- Document new endpoints in README.md
- Update TypeScript types
- Add validation middleware

### Frontend Components

- Keep components small and focused
- Use functional components with hooks
- Implement proper error boundaries
- Make components responsive

### Security Considerations

- Never commit sensitive data (API keys, passwords)
- Sanitize all user inputs
- Use parameterized queries for database access
- Validate all API inputs
- Follow OWASP security guidelines

### Performance

- Optimize database queries (use indexes)
- Implement caching where appropriate
- Lazy load components when possible
- Minimize API calls
- Use React Query for data fetching

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for complex functions
- Include examples in API documentation
- Keep CONTRIBUTING.md up to date

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a release branch
4. Run full test suite
5. Deploy to staging environment
6. Manual QA testing
7. Create GitHub release
8. Deploy to production
9. Monitor for issues

## Questions?

If you have questions about contributing, please:

1. Check the README.md and existing documentation
2. Search existing issues
3. Create a new issue with the "question" label

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes
- Project documentation

Thank you for contributing to Volusia Flood Watch! Your efforts help keep our community safe during flood events.
