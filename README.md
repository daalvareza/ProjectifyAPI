# Projectify API

API made with nodejs using typescript, handles login and signup for users and create, get and update projects and their reports made by the users.
The reports are related to an user and a project and are weekly, so the API validates if there is a report in the current week before creating another; and their hours cannot exceed 45 per week.
All the endpoints are protected (except the login and signup) by a middleware that validates a jwt in the Authorization header.

## Prerequisites

* Node.js
* MongoDB

## Installation

1. Clone the repository (git clone <repository-url>)
2. Navigate to the cloned project (cd <project-folder>)
3. Install dependencies (npm install)
4. Setting up enviromental variables (url string connection to mongo database)

## Usage
All the request (except the user's endpoints) need an Authorization headear with a valid jwt that is given in the login

POST /user/create
Create a user with an username and password given

POST /user/login
Login a user with their credentials and given a jwt

POST /projects/create
Create a project with his name and description

GET /projects/all
Get all the projects

POST /reports/create
Create a report related to a user and a project

GET /reports?userId=
Get the reports for a user

PUT /reports/update
Update a report with his id

## Running the tests
npm test

### Know the coverage of the tests
npm coverage

## Contact
Diego Alonso Alvarez Arcila - diegoalvarez9715@gmail.com