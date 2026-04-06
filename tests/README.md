# KrishiCred Test Suite

This directory contains tests for the KrishiCred platform.

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_api.py

# Run specific test
pytest tests/test_api.py::test_health_check

# Run with verbose output
pytest -v
```

## Test Structure

- `conftest.py` - Pytest configuration and fixtures
- `test_api.py` - API endpoint tests
- `test_models.py` - Database model tests
- `test_services/` - Service layer tests
- `test_repositories/` - Repository layer tests
