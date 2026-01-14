# project-3o

Competitive programming tracker + guide.

## Goal
Track problem-solving sessions, time spent, topics, contests & upsolving — then generate personalized guidance and tasks.

## Roadmap
- [ ] Backend (Express + MongoDB)
- [ ] Chrome Extension 
- [ ] Dashboard 
- [ ] AI Guide

## Design Update (UserProblem tracking)
Originally, this project tracked problem activity using multiple Session logs.
The plan was later simplified:

- Timer runs locally in the extension until accepted.
- After accepted, a single UserProblem record is created/updated in MongoDB.

UserProblem stores:
- timeSpentSeconds
- accepted
- reviewed/editorial checklist
- notes