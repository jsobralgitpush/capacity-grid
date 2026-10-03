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

    Product requirements:
        - Client should be able to fetch `/api/capacity` and get a a list of objects containing
            - 
            - b
            - c
        - Client should be able to use `from` and `to` filters in order to filter the list
        - 



    How to build
        - pagination



- Build the `CapacityGrid` in which shows
a) people in their allocations, segmented week by week
b) over-allocation
c) date-range filter


- Editing capacity. Which probably touches backend assignments and shows on the `CapacityGrid` view. For it, we'll need to
a) Build the `PATCH /api/people/{id}`
b) the form saving for `CapacityGrid` 


### MVP mind-set
1) Show the capacity grid with columns
2) 

### Errors and decisions
- initial state of the page
- overlapping of weeks
    - what if a select the middle of the week on filter? 
-  UX of showing the data needs to be simple intuitive in order to select the dates