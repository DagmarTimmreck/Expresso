# Expresso

v1.0: uses sqlite3
v2.0: restuctures the project to have database logic only in the db folder and uses promises to expose the results of the database operations

## Parts of the project

### backend
- db: 
  - database.sqlite 
  - db.js -- implements the database logic. Provides results of database queries as promises.
  - migration.js -- initializes the database
  - seed.js -- populates the database with sample data
  - sql.js -- builds the sql statements for db.js
- server: express routers in different files for the corresponding routes
  - api.js: first level, no own routes
  - employees.js: second level 
  - timesheets.js: third level (under employees)
  - menus.js: second level
  - menuItems.js: third level (under menus)
server.js: server setup

### frontend (given)
- src: source code for frontend
- public: frontend (bundled from src)

### test 
- test.js: complete test suite for database and API (given/adjusted as described in the Comments/Tests section)


## Comments

### Working environment:
- Visual studio code with eslint and airbnb style settings
- add automated restart scripts to package.json
- Which npm packages should be dependencies and which dev-dependencies?

### Specification
- PUT/POST routes may get some id in the route and on the posted object. The id on the object is not needed but may be supplied because the API is used with an object that contains the id anyway. This is only a problem if the ids don't coincide. In that case the data is considered invalid and a 400 response is sent. 

### Tests
- change order of tests to match order in spec
- add/amend tests for
  - PUT /api/employees/:id should return a 404 status code for invalid IDs
  - DELETE /api/employees/:id should return a 404 status code for invalid IDs
  - POST /api/employees/:employeeId/timesheets should return a 404 status code if an employee with the timesheet's employee ID doesn't exist (based on the employeeId provided in the route)
  - POST /api/employees/:employeeId/timesheets should return a 400 status code if the route\'s employee ID doesn\'t coincide with the timesheet\'s employee ID (as the supplied timesheet is incorrect in this case)
  - make sure in the tests for POST /api/employees/:employeeId/timesheets routes that when testing for an incorrect timesheet only the incorrectness under test is incorrect
  - PUT /api/employees/:employeeId/timesheets/:timesheetId 
     -- should return a 400 status code if the employee ID from the route doesn't  coincide with the employee ID from req.body.timesheet
     -- should return a 400 status code if the timesheet ID from the route doesn't  coincide with the timesheet ID from req.body.timesheet
     -- should return a 400 status code if the employee ID from the route doesn't  coincide with the employee ID from the database
     - DELETE /api/employees/:employeeId/timesheets/:id should return a 404 status code for invalid employee IDs
  - PUT /api/menus/:id should return a 404 status code for invalid IDs
  - DELETE /api/menus/:id should return a 404 status code for invalid IDs
  - POST /api/menus/:menuId/menu-items
    -- should return a 400 status code if the route\'s menu ID doesn\'t coincide with the menuItem\'s menu ID
    -- should return a 404 status code if a menu with the menuItem\'s menu ID doesn\'t exist
  - PUT /api/menus/:menuId/menu-items/:menuItemId 
     -- should return a 400 status code if the menu ID from the route doesn't  coincide with the menu ID from req.body.menuItem
     -- should return a 400 status code if the menu-item ID from the route doesn't  coincide with the timesheet ID from req.body.menuItem
     -- should return a 400 status code if the menu ID from the route doesn't  coincide with the menu ID from the database
  - DELETE /api/menus/:menuId/menu-items/:id should return a 404 status code for invalid menu IDs


### Notes on express:
- res.send() does not automatically return from a function
- nor does calling next() (Program resumes where it left off when calling next only next(error) leaves the function for good.)
- default status code seems to be 200 

### Ideas for further refactoring
- switch from values syntax to string interpolation beforehand? => in sql.js iterate over attributes of value settings
- refactor req.body checks?
- the routers look so much the same. How to DRY?

## Project Overview

In this capstone project, you will build all of the routing and database logic for an internal tool for a coffee shop called Expresso.

The Expresso internal tool should allow users to:
- Create, view, update, and delete menus
- Create, view, update, and delete menu items
- Create, view, update, and delete employees
- Create, view, update, and delete employee's timesheets

You can view all of this functionality in action in the video below:

## How To Begin

To start, download the starting code for this project <a href="https://s3.amazonaws.com/codecademy-content/programs/build-apis/projects/capstone-project-2-expresso.zip" target="_blank">here</a>. After downloading the zip folder, double click it to uncompress it and access the contents of this project.

To view your local version of the site, open **index.html** in Google Chrome.

## Implementation Details

To complete this project, you will need to create the database tables and API routes specified below.

To test this functionality you can run the testing suite and interact with the API via the provided front-end. If you want more data to interact with in the front-end, you can run the **seed.js** file to add data to your database.

We've provided an empty **migration.js** file for you to write table creation logic in.

In order for the tests to run properly, you will need to make sure to:
- Create and export your Express app from a root-level file called **server.js**
- Accept and set an optional port argument for your server to listen on from `process.env.PORT`
- Accept and set an optional database file argument from `process.env.TEST_DATABASE` in all Express route files that open and modify your database
- Use the root-level **database.sqlite** as your API's database

### Database Table Properties

* **Employee**
  - id - Integer, primary key, required
  - name - Text, required
  - position - Text, required
  - wage - Integer, required
  - is_current_employee - Integer, defaults to `1`

* **Timesheet**
  - id - Integer, primary key, required
  - hours - Integer, required
  - rate - Integer, required
  - date - Integer, required
  - employee_id - Integer, foreign key, required

* **Menu**
  - id - Integer, primary key, required
  - title - Text, required

* **MenuItem**
  - id - Integer, primary key, required
  - name - Text, required
  - description - Text, optional
  - inventory - Integer, required
  - price - Integer, required
  - menu_id - Integer, foreign key, required

### Route Paths and Functionality

**/api/employees**
- GET
  - Returns a 200 response containing all saved currently-employed employees (`is_current_employee` is equal to `1`) on the `employees` property of the response body
- POST
  - Creates a new employee with the information from the `employee` property of the request body and saves it to the database. Returns a 201 response with the newly-created employee on the `employee` property of the response body
  - If any required fields are missing, returns a 400 response

**/api/employees/:employeeId**
- GET
  - Returns a 200 response containing the employee with the supplied employee ID on the `employee` property of the response body
  - If an employee with the supplied employee ID doesn't exist, returns a 404 response
- PUT
  - Updates the employee with the specified employee ID using the information from the `employee` property of the request body and saves it to the database. Returns a 200 response with the updated employee on the `employee` property of the response body
  - If any required fields are missing, returns a 400 response
  - If an employee with the supplied employee ID doesn't exist, returns a 404 response
- DELETE
  - Updates the employee with the specified employee ID to be unemployed (`is_current_employee` equal to `0`). Returns a 200 response.
  - If an employee with the supplied employee ID doesn't exist, returns a 404 response

**/api/employees/:employeeId/timesheets**
- GET
  - Returns a 200 response containing all saved timesheets related to the employee with the supplied employee ID on the `timesheets` property of the response body
  - If an employee with the supplied employee ID doesn't exist, returns a 404 response
- POST
  - Creates a new timesheet, related to the employee with the supplied employee ID, with the information from the `timesheet` property of the request body and saves it to the database. Returns a 201 response with the newly-created timesheet on the `timesheet` property of the response body
  - If an employee with the supplied employee ID doesn't exist, returns a 404 response

**/api/employees/:employeeId/timesheets/:timesheetId**
- PUT
  - Updates the timesheet with the specified timesheet ID using the information from the `timesheet` property of the request body and saves it to the database. Returns a 200 response with the updated timesheet on the `timesheet` property of the response body
  - If any required fields are missing, returns a 400 response
  - If an employee with the supplied employee ID doesn't exist, returns a 404 response
  - If an timesheet with the supplied timesheet ID doesn't exist, returns a 404 response
- DELETE
  - Deletes the timesheet with the supplied timesheet ID from the database. Returns a 204 response.
  - If an employee with the supplied employee ID doesn't exist, returns a 404 response
  - If an timesheet with the supplied timesheet ID doesn't exist, returns a 404 response

**/api/menus**
- GET
  - Returns a 200 response containing all saved menus on the `menus` property of the response body
- POST
  - Creates a new menu with the information from the `menu` property of the request body and saves it to the database. Returns a 201 response with the newly-created menu on the `menu` property of the response body
  - If any required fields are missing, returns a 400 response

**/api/menus/:menuId**
- GET
  - Returns a 200 response containing the menu with the supplied menu ID on the `menu` property of the response body
  - If a menu with the supplied menu ID doesn't exist, returns a 404 response
- PUT
  - Updates the menu with the specified menu ID using the information from the `menu` property of the request body and saves it to the database. Returns a 200 response with the updated menu on the `menu` property of the response body
  - If any required fields are missing, returns a 400 response
  - If a menu with the supplied menu ID doesn't exist, returns a 404 response
- DELETE
  - Deletes the menu with the supplied menu ID from the database if that menu has no related menu items. Returns a 204 response.
  - If the menu with the supplied menu ID has related menu items, returns a 400 response.
  - If a menu with the supplied menu ID doesn't exist, returns a 404 response

**/api/menus/:menuId/menu-items**
- GET
  - Returns a 200 response containing all saved menu items related to the menu with the supplied menu ID on the `menu items` property of the response body
  - If a menu with the supplied menu ID doesn't exist, returns a 404 response
- POST
  - Creates a new menu item, related to the menu with the supplied menu ID, with the information from the `menuItem` property of the request body and saves it to the database. Returns a 201 response with the newly-created menu item on the `menuItem` property of the response body
  - If any required fields are missing, returns a 400 response
  - If a menu with the supplied menu ID doesn't exist, returns a 404 response

**/api/menus/:menuId/menu-items/:menuItemId**
- PUT
  - Updates the menu item with the specified menu item ID using the information from the `menuItem` property of the request body and saves it to the database. Returns a 200 response with the updated menu item on the `menuItem` property of the response body
  - If any required fields are missing, returns a 400 response
  - If a menu with the supplied menu ID doesn't exist, returns a 404 response
  - If a menu item with the supplied menu item ID doesn't exist, returns a 404 response
- DELETE
  - Deletes the menu item with the supplied menu item ID from the database. Returns a 204 response.
  - If a menu with the supplied menu ID doesn't exist, returns a 404 response
  - If a menu item with the supplied menu item ID doesn't exist, returns a 404 response


## Testing

A testing suite has been provided for you, checking for all essential functionality and
edge cases.

To run these tests, first, open the root project directory in your terminal. Then run `npm install` to install
all necessary testing dependencies (if you haven't already).
Finally, run `npm test`. You will see a list of tests that ran with information
about whether or not each test passed. After this list, you will see more specific output
about why each failing test failed.

As you implement functionality, run the tests to
ensure you are creating correctly named variables and functions that return the proper values.
The tests will additionally help you identify edge cases that you may not have anticipated
when first writing the functions.