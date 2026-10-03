# Worklog

Running notes on how this got built — decisions, assumptions, dead ends, and anything
left unfinished. Append as you go; a line or two per entry is right.

---

### Draft Notes
We have three tasks
- Build a `/api/capacity?from=&to=` in which shows, for every week, how many hours the people are allocated.
    - We have some tables in which this calculation makes it possible
        - `people` -> a set of people with their name and weekly hours
        - `assignments` -> a set of people, containing `person_id`, and end and start date


    Concepts:
        - What is a capacity?
            - capacity aims to determine, in a time range, the allocation hours of people, replyting to
                - how many hours does people have available?
                - who is at most of their capacity? 
                - who is not?

            - capacity uses the attribute `weekly_hours` from `people` and cross with assignemtnts
    
    Assumptions:
        - `people` has no `tenant` or `company` dependency. This means that i'll assume that the there is only one team and the client will interact direct with all `people`
        - Since `people` has no `role`, i'll assume that the user is always a manager and In this moment, g no `from` or `to` query params, i'll consider no time ranges, returning all values
        - No authentication is needed. 
        - No JWT or another user session in order to determine the belonging user from the request

    Product requirements draft:
        - Client should be able to fetch `/api/capacity` and get a a list of objects containing
            - person id and name
            - weekly capacity, allocated hours and status (below, at or over capacity)
            - week start and end dates
        - Client should be able to use `from` and `to` filters in order to filter the list
        - Manager can edit weekly hours and see the updated numbers without reloading the page



- Build the `CapacityGrid` in which shows
a) people in their allocations, segmented week by week
b) over-allocation
c) date-range filter


- Editing capacity updates `people.weekly_hours` and shows on the `CapacityGrid` view. For it, we'll need to
a) Build the `PATCH /api/people/{id}`
b) the form saving for `CapacityGrid` 


### MVP mind-set
1) Start simple: show name, capacity, allocation and status before adding editing
2) Connect the table to real people and assignments so we can inspect the numbers
3) Start with no filters selected, so we can see where the data is
4) Replace manual date ranges with a starting week and number of weeks
5) Split the view into one table per week to make it easier to read
6) Add capacity editing, then move the form into the table; refresh only that person's rows across all weeks
7) Add sorting, status filters and 10-row pagination, independent for each weekly table
8) Keep filters visible while scrolling and disable range changes during loading
9) Refactor once the flow works, then add focused tests and a preview of loading and failure states

### Errors and decisions
- initial state of the page: empty filters, showing all weeks with assignments
- overlapping of weeks
    - the UI selects available Monday-starting weeks instead of arbitrary dates
    - count Monday–Friday, with inclusive assignment dates and an exclusive filter end date; overlapping assignments add together
- UX of showing the data needs to be simple intuitive in order to select the dates: one table per week, inline editing and filters disabled while loading
- After saving, fetch only that person's rows again for the displayed range. Weekly hours change for all weeks, including historical ones.
- Kept the draft and errors in the edited cell. Added a sample state preview so loading and failures are easy to inspect.
- TypeScript and the weekly-table regression test passed. Backend validation tests were added but not run here because Docker access was blocked.
