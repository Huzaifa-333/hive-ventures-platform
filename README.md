# Hive Construction Ventures — Advisor System

A full-stack web platform for property investment management with profit sharing (75% investor / 25% Hive).

---

## Technologies Used

- **Frontend:** React.js, Next.js (info page)
- **Backend:** Node.js, Express.js     API
- **Database:** MongoDB, Mongoose ODM
- **Authentication:** JWT  (tokens), bcryptjs(password hashing)
- **Styling:** HTML5, CSS3 with Vanilla CSS (fully responsive)(also no frameworks like Tailwind or Bootstrap)

---

## Features

### Admin
- Login/Logout, Manage credentials, Retrieve lost password
- Manage properties (CRUD, current value, status)
- View all investor profiles
- View all investments with profit/loss
- Respond to contact messages
- Download investment cheques (PDF)

### Investor
- Login/Logout, Manage credentials, Retrieve lost password
- View available properties with share system
- Invest in properties (min $1000)
- Track investments with real-time profit calculation
- Withdraw (early = original only, after 1 year = +75% profit)
- Download investment certificates (PDF)
- Update profile (username, email, gender, age)
- Receive contact form responses from admin

### Visitor
- Browse property listings
- Search properties
- Register as investor
- Contact form

---

## Database Schema (Models)

### User Model

{
  username: String, required, unique
  password: String, required (hashed)
  role: String [investor, admin]
  email: String, required
  phone: String
  gender: String [male, female, other]
  age: Number, min 18
  status: String [pending, verified]
  createdAt: Date
}
### Property Model
{
  title: String, required
  price: Number, required
  currentValue: Number
  status: String [Available, Sold, Under Construction]
  image: String
  description: String
  location: String
  totalShares: Number (default: 100)
  availableShares: Number (default: 100)
  createdAt: Date
}
## Installation & Setup

### Prerequisites
- Node.js installed
- MongoDB installed locally or use MongoDB Atlas

### Backend Setup

cd hive/hive-ventures/backend
npm install
node server.js

### Frontend Setup
cd hive/hive-ventures
npm install
npm start

### Next.js Info Page 
cd hive/hive-ventures
npm run next-dev

### Environment Variables (.env in backend folder)
m run next-dev
Environment Variables (.env in backend folder)
text
MONGO_URI=mongodb://localhost:27017/hiveventures
JWT_SECRET=your_secret_key
PORT=5000

### Running the Application
Start MongoDB: net start MongoDB (in admin PowerShell)

Start Backend: cd backend && node server.js (port 5000)

Start Frontend: npm start (port 3000)

Start Next.js: npm run next-dev (port 3001)

Access the app at: http://localhost:3000

###Demo Credentials
Admin:
xx

## api
API endpoints are URL routes that accept requests (GET, POST, PUT, DELETE) from the frontend. Authorization checks if the user has permission to access a route using JWT tokens sent in the request header.

The frontend sends the token in the Authorization header, and the backend middleware verifies it and checks the user's role (admin or investor) before allowing access.

Without a valid token, the server returns 401 Unauthorized; without proper role, it returns 403 Forbidden.

### API Endpoints
Method	Endpoint	          Description
POST	/api/auth/register	  User registration
POST	/api/auth/login	     User login
GET	/api/auth/me	         Get current user
GET	/api/properties	          Get all properties
POST	/api/investments/invest	Make investment
GET	/api/investments/my-investments	   Get user investments
POST	/api/investments/withdraw/:id	  Withdraw investment
GET	/api/investments/all	        Admin — all investments
GET	/api/auth/users	              Admin — all users
PUT	/api/properties/admin/:id	  Admin — update property
POST	/api/contact/submit	       Submit contact form
PUT	/api/contact/respond/:id	   Admin — respond to contact

### Project Structure

hive-ventures/
├── backend/
│   ├── models/          (User, Property, Investment, Contact)
│   ├── routes/          (auth, properties, investments, contact)
│   ├── middleware/      (auth)
│   └── server.js
├── src/
│   ├── App.js
│   ├── App.css
│   └── assets/
├── pages/
│   └── info.js          (Next.js demo page)
└── package.json

### Key Business Logic Implemented
# Profit Sharing:
 Investor gets 75% profit,
  Hive takes 25%

# Loss Protection: 
-If property sells below cost, investor gets original amount back 
— Hive bears loss

# Withdrawal Rules:

Before 1 year: Original amount only (no profit)

After 1 year: Original + 75% of profit

Loss scenario: Original amount only (Hive bears loss)

## Investment Security:
 Each investment generates a cheque number; 
 PDF certificate can be downloaded

#### Property Share System
Each property has 100 total shares

Investors buy shares based on investment amount

Admin can update property's current value (affects profit calculation)

#### Contact Response System
Visitor submits contact form (name, email, message)

Admin responds from dashboard

Investor can check response by re-entering same name/email

### Adopted Methodology
So, For this project, the VU Process Model is adopted. It is a hybrid model combining the structured nature of the Waterfall model with the cyclic risk-management approach of the Spiral model. This approach suits academic and medium-scale real-estate applications where requirements are mostly clear, but iterative refinement is needed for investment rules and calculations.

Waterfall Model: Followed a sequential approach — requirements → design → implementation → testing → deployment. Each phase completed before moving to the next.

Spiral Model: Used for risk management — iterative cycles of planning, risk analysis, engineering, and evaluation. Helped handle changing requirements and feedback during development.

In this project: Waterfall for overall planning, Spiral for iterative development (prototype → feedback → improvements).

VU Process Model = V-Shaped Process Model (Verification and Validation model).

It's an extension of the waterfall model where testing phases are planned in parallel with development phases — forming a "V" shape. Left side = verification (development), right side = validation (testing). Each development phase has a corresponding testing phase.

In short: Development on left, testing on right — all phases planned upfront.

#### Key Concepts & Implementation Points

# Concept        	    Implementation in Project
$ Authentication	   JWT tokens stored in localStorage, sent via Authorization header
Authorization	     Role-based access (admin vs investor) — middleware checks req.user.role
Password Security	bcryptjs hashing (10 salt rounds), never stored as plain text
HTTP Status Codes	 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Server Error)
REST API	        Express routes with GET, POST, PUT, DELETE methods
Database Modeling	Mongoose schemas with relationships (ref, populate)
React useEffect	    DOM manipulation after render (video, animations, event listeners)
Responsive Design	CSS media queries, flexbox, grid, data-label for mobile tables
PDF Generation    	jsPDF library for cheque/investment certificates
Real-time Updates	Dashboard refreshes after investment/withdrawal via window.location.reload()
State Management	React useState for active section, user data, UI states
LocalStorage	    Persist active section, scroll position, auth token
Modal Dialogs	    Custom modals for investment, password recovery, property details
Form Validation  	Password regex (6+ chars, 1 number, 1 special), age (18+), email format

API endpoints are URL routes that accept requests (GET, POST, PUT, DELETE) from the frontend. Authorization checks if the user has permission to access a route using JWT tokens sent in the request header.

The frontend sends the token in the Authorization header, and the backend middleware verifies it and checks the user's role (admin or investor) before allowing access.

Without a valid token, the server returns 401 Unauthorized; without proper role, it returns 403 Forbidden.

JWT token is a secure encoded string containing user ID and role — sent with every request to prove identity.
Backend verifies it before allowing access to protected routes — without it, user gets 401 error.

Validated by the backend middleware (auth.js) using jwt.verify() — it checks token signature and expiry, then extracts user data.

API routes receive frontend requests (login, invest, etc.), process them (validate input, query database, apply business logic), and send back JSON responses.

Frontend sends JWT token in request header → backend middleware verifies it → if valid, API processes request; if not, returns 401 error.

A database query is a command sent to MongoDB to perform an action on data — like find, insert, update, or delete records.

In your project:

User.findOne({ username }) finds a user by username

Investment.find({ investorId: req.user.id }) finds all investments for a specific investor

Property.findByIdAndUpdate() updates a property record

Yes — database queries are executed inside API routes when the backend receives a request. The API route receives the request, runs a query on the database, then sends the result back as a JSON response.

Yes — database queries are used inside protected API routes to fetch, update, or delete user-specific data after the JWT token is verified by the auth middleware.


Login success: Frontend sends credentials to API → Backend validates → Generates JWT token → Saves token in localStorage → Redirects to dashboard via setActiveSection('dashboard'). Token is then sent with every subsequent request to authenticate the user.

hen you click the Hive Ventures logo, the onClick event triggers showSection('home'), which updates the state variable activeSection to home. This makes the Home section visible while hiding all other sections, and scrolls to the top of the page using window.scrollTo(0, 0).

When you click "Invest Now," it checks if you're logged in, shows a modal to enter amount, sends a POST request to the backend, and creates a new investment record in MongoDB.
When you click "Withdraw," it sends a POST request to the backend, updates the investment status to "withdrawn," restores shares back to the property, and reloads the dashboard to show updated totals and profits.

The double $$ is because in JavaScript template literals, $ is used for interpolation, so to display a literal $ sign, you need to escape it with another $.
Example:
$${amount} = displays $50,000 (first $ is literal, second starts interpolation)
$ + ${amount} = same thing
To change currency symbol:
Replace the first $ with your symbol. For example, to change to Rs.$:
Interpolation is inserting dynamic values (variables, expressions) into a string using ${} in JavaScript template literals — e.g., Hello ${name} replaces ${name} with the actual value of name. It makes strings dynamic and easy to build.
${name} is a placeholder that gets replaced with the actual value of the name variable when the code runs.
Example: if name = "admin1", then Hello ${name} becomes Hello admin1
Yes — you can use string concatenation with the + operator: 'Hello ' + name + '!'
Or use the older String.replace() method for more complex replacements, but it's less readable.



 ### (HTTP Status Codes Used )###

Code	Meaning	Where Used
200	OK	Successful GET/PUT requests
201	Created	User registered, investment made
400	Bad Request	Invalid credentials, duplicate username, validation failed
401	Unauthorized	Missing or invalid JWT token  //verification unseuccesf
403	Forbidden	Non-admin trying admin route
404	Not Found	Property/investment/user not found
500	Server Error	Database connection failure, server crash

Submission Details
Project Title: Hive Construction Ventures Advisor System
Submitted by: F25PROJECT9AEDE
Year: 2026

username of admin:
      :admin1
pass  :admin@12345

investor:
sam@789
sam@12345
