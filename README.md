This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Flow of Employee Management System

Welcome to the Employee Management System! This is a modern, full-stack application designed to help managers track employees, organize them into departments, and log their daily attendance.

Here is a beginner-friendly, step-by-step breakdown of how the whole project is put together, how data flows, and where the code lives.

1. High-Level Architecture
The project uses a monorepo layout (multiple applications inside a single workspace). It is split into three main layers:
The Database (PostgreSQL): Stores all persistent data (who the employees are, which departments exist, and attendance logs).
The BackEnd (Express & Node.js): Runs on Port 4000. It acts as a gatekeeper. It validates incoming requests, fetches or writes data to the database, and sends it back to the client.
The FrontEnd (Next.js, React, Tailwind CSS): Runs on Port 3000. This is the website the user interacts with in their browser.
2. How Everything Boots Up
At the root of the project, the 

package.json
 file uses a utility called concurrently to launch both servers at the same time:

Frontend: Starts using Next.js (npm run dev:frontend).
Backend: Starts using Express and TypeScript (npm run dev:backend).
3. Detailed Data Flow (Layer by Layer)
Let's trace how a single feature works: Loading the Dashboard.

📂 Step A: The Database Schema (The Models)
In the backend, we use Sequelize (an ORM — Object Relational Mapper) to interact with PostgreSQL using TypeScript code instead of writing raw SQL.

We define the database tables inside the models folder. For instance, 

Employee.ts
 defines fields like firstName, lastName, email, and status.
It also establishes relationships, such as: An employee belongs to a department and A department has many employees.
🛣️ Step B: Backend Web APIs (Routes & Controllers)
When the backend starts, 

index.ts
 mounts different endpoints (URLs):

app.use('/api/employees', employeeRoutes) mounts the employee manager at /api/employees.
In 

routes/employees.ts
, the route router.get('/', getAllEmployees) specifies that when someone makes a GET request to /api/employees, it should call the controller function getAllEmployees.
Inside 

controllers/employeeController.ts
, the getAllEmployees function asks Sequelize: Employee.findAll({ include: [Department] }). This pulls all employees and attaches their department information. The backend then responds with this data in JSON format.
🌐 Step C: Frontend State & Rendering
The API Store: In the frontend, 

lib/store.ts
 contains helper functions to fetch data from the backend. The function getEmployees() makes a web request to http://localhost:4000/api/employees.
The Page: When the user opens the Dashboard, 

app/dashboard/page.tsx
 uses a React hook called useEffect to call getEmployees().
State & Display: Once the list of employees is loaded from the backend, React stores it in local state (setEmployees). When state changes, React re-renders the screen and updates the statistics cards, the department charts, and the list of active/absent personnel.
4. Interactive Flow Example: Adding a New Employee
Here is exactly what happens when you type a name into the "Add Employee" form and click Save:
UI: You submit the form on the website.
Frontend Store: saveEmployee() is called in 

lib/store.ts
. It packages the form data into a JSON object and sends an HTTP POST request to http://localhost:4000/api/employees.
Backend Middleware: The backend receives the request. Before saving it, it runs validateEmployee middleware (which checks that names are not empty, and emails are formatted correctly).
Backend Controller: If valid, the request proceeds to createEmployee() in 

controllers/employeeController.ts
, which runs Employee.create(req.body).
Database: Sequelize converts this command to a SQL INSERT statement and runs it against PostgreSQL. If the email is a duplicate, the database returns an error, which the controller handles gracefully. Otherwise, it confirms success.
UI Update: The frontend receives a 201 Created response and redirects you to the main table, showing your new employee immediately!
5. Other Cool Utilities
Dark Mode Toggle: The frontend has a custom context provider at 

ThemeContext.tsx
. It monitors whether the user prefers light or dark mode, saves their choice in the browser's localStorage (so it remembers their choice on next visit), and toggles a CSS class on the main layout to switch colors.
Database Synchronization: In 

BackEnd/src/index.ts
, you'll see sequelize.sync({ alter: true }). This is a developer helper; every time the backend starts, Sequelize automatically checks if your tables match the TypeScript files and makes any necessary SQL table updates (alter) so you don't have to write manual migration scripts.

