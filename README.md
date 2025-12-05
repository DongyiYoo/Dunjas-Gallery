# Dunja's Gallery
Dunja’s Gallery is an app that shows the difference between insecure and secure coding. The insecure version includes SQL injection, XSS, and data exposure, while the secure version fixes them with validation, security headers, CSRF, sessions, and logging.
 
## Functional Specifications
- User authentication  
- View / Add / Delete artworks  
- Search and category filtering
 
## Vulnerability for Insecure Branch

- Cross-Site Scripting
- Broken Access Control
- SQL Injection
- Sensitive Data Exposure
- No CSRF protection /input Validaiton 

## Security Implementation for Secure Branch

- Security Domain	
- Injection Prevention	
- XSS Defense
- Bcrypt
- Session Security	
- Access Control	
- CSRF Protection	
- Security Headers
- Logging	
 
## Technology Stack
- Node.js
- Express.js
- SQLite3
- EJS 
- JavaScript 
- Bcrypt
- Csurf
- Helmet
- Morgan
- Express-Session
 
## Installation & Setup Guide

### 1. Clone the Repository
git clone https://github.com/DongyiYoo/Dunjas-Gallery.git

cd Dunjas-Gallery

### 2. Install Dependencies 
npm install

### 3. Run the Application
node gallery.js

### 4. Access
URL: http://localhost:6789
 
# Testing 
Account for testing administrative features.

Username: admin

Password: password123
