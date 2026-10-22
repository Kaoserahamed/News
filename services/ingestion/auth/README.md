# News Authentication Module

## Overview
Authentication system for reader/subscriber/editor/admin roles with OAuth2 and JWT.

## Files
- `services/ingestion/auth.py` - Authentication logic
- `services/ingestion/models.py` - User and role models
- `services/ingestion/middleware.py` - Auth middleware and RBAC
- `services/ingestion/routes/auth.py` - Auth API routes

## Features
- Reader, subscriber, editor, and admin account registration/login
- JWT-based session management
- OAuth2 provider integration
- Role-Based Access Control (RBAC)
- Password hashing with bcrypt
- Session timeout handling

## Tech Stack
- Node.js/Next.js
- MongoDB
- JWT
- OAuth2
- bcrypt for password hashing

## Day 5 Outcome
Authentication module implemented. 1 PR created targeting development.