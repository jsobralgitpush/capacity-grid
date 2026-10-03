# Decisions

Yours to write, not your AI's. Short is good — bullets are fine, and half a page is
plenty. We read this first.

## What did the spec not tell you?

There are things this brief doesn't specify. Which ones did you hit, what did you decide,
and why?

- the product requirements
    - There is NO product requirement, with "users" or "client" should be able to
    - In a real world scenario, this project is uncomplete in a product perspective
    - This leaves a lot of spaces for ambiguity, like
        
        - Initial state and presentation: The spec didn’t define the initial date range or detailed interaction design. I chose empty filters and separate weekly tables so managers can see available periods before narrowing the view.

        - Allocation rules: It didn’t specify weekends, holidays, or whether assignment dates are inclusive. I counted Monday–Friday, included both assignment dates, and treated the filter’s end date as exclusive.

        - Manager access: The brief describes a manager, but provides no authentication or role model. I assumed the current user is authorized to edit capacity.

        - API contract: The response shape was intentionally undefined. I chose one object per person per week, containing capacity, allocation, status, and week dates.

        - After-save behavior: The spec required correct numbers without a page reload but left the strategy open. I chose to save first, then refetch only that person’s rows across the displayed weeks.

        - Pagination: The brief identified production scale but left the approach open. I added 10-row pagination per weekly table and deferred server-side pagination.


## What did you notice that looked wrong?

Anything in the output that didn't match what you expected. Whether you fixed it or left
it, we want to know you saw it.

- The schema has no user roles or permissions, so there is no way to verify that the person editing capacity is a manager. I treated manager access as an assumption for this assignment.

- Capacity is a single `weekly_hours` value per person. Changing it affects every week, including historical weeks. The model cannot represent a temporary change, such as reduced availability for three days.

- The initial date inputs required users to calculate whole-week ranges themselves. I replaced them with a starting-week selector and a number-of-weeks selector.

- The unfiltered view rendered too many rows and felt slow. I added pagination with 10 people per weekly table, but the API still returns the full dataset; that remains a performance limitation.

- Allocation assumes Monday–Friday working days and does not account for holidays or leave. Those assumptions need confirmation before using the numbers for real planning.


-

## What did the AI get wrong that you caught?

One concrete example. Every real session has one.

- Sorting and status filtering were initially shared across weekly tables. I caught this and requested separate weekly components with independent state in order to prevent state bugs.

- The AI left too much logic inside the components and handlers. I guided the refactoring into container hooks, types, constants, utilities, and backend parsing/query methods.

- The initial unfiltered view rendered too many records and felt slow. I requested pagination with 10 people per weekly table.

## What would you do differently with a week?
- Talk with the product owner about how managers use the view and which decisions it should help them make.

- Revisit the schema to don't have a coupling between week and working capacity.
    - Currently, I can only change the capacity by weeks, assuming a week begins on Monday and ends on Friday 
    - Currently, changing a capacity on the present changes the past.

- Ask if this will becomes a multi-team SaaS product to define team ownership, manager permissions, and data isolation before extending it.

- Add backend hot reload to shorten the development feedback loop.

- Add linting, formatting, and CI checks for Go and TypeScript. 

- Add server-side pagination and bounded date ranges. Frontend pagination reduces rendering, but still downloads the full dataset.