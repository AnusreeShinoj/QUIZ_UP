Build a complete, modern, full-stack web application called QuizNest for my B.Tech Information Technology Web Application Development college project.

Project purpose

Create a platform where registered users can create, discover, share, attempt and manage quizzes. The application must automatically evaluate quiz answers, analyse topic-wise performance, maintain quiz history and recommend practice quizzes for weak topics.

Technology requirements

- Frontend: React, HTML, CSS and JavaScript.
- Backend: Node.js server-side runtime.
- Database and authentication: Firebase Authentication and Cloud Firestore.
- Use Firebase integration when prompted and configure persistent storage and authentication.
- Do not use AI or Machine Learning to calculate scores or generate recommendations. Use normal JavaScript conditional rules.
- Keep the code modular, understandable and suitable for a college project.

Design requirements

Create a professional, polished, responsive website with a modern educational SaaS dashboard, consistent typography, attractive quiz cards, clean spacing, subtle animations, accessible forms and mobile-friendly layouts.

Use a refined navy, white and teal colour palette. Make the interface visually consistent across every page. Avoid a generic template appearance.

Required pages

1. Home page with a hero section, features, popular quizzes and calls to action.
2. Registration and login pages.
3. Personal dashboard with quiz statistics, recent attempts and recommended quizzes.
4. Explore Quizzes page with search and filters for subject, topic, difficulty and examination category.
5. Create Quiz page with a form for quiz details and dynamic multiple-choice question creation.
6. My Quizzes page to view, edit, delete, publish, unpublish and manage drafts.
7. Quiz Attempt page with question navigation, answer selection, progress indicators, unanswered-question status and an optional timer.
8. Results page with score, percentage, correct and incorrect answers, accuracy, explanations and topic-wise performance.
9. My Progress page with quiz history, charts and improvement over time.
10. Quiz sharing and private quiz access using unique quiz codes or shareable links.

Quiz creation

Each quiz must support a title, description, subject, topic, difficulty, examination category, visibility, questions, multiple-choice options, correct answers and explanations.

Allow creators to save drafts, edit quizzes and publish or unpublish them. Users must only be able to manage quizzes they own.

Quiz evaluation

Validate answers on the server. Calculate total marks, percentage, correct answers, incorrect answers, accuracy and time taken. Save each completed attempt in the database.

Do not expose correct answers to users before submission.

Topic-wise analysis and recommendations

Associate each question with a topic. Calculate accuracy separately for each topic after an attempt.

Use this rule: if a user's accuracy in a topic is below 50%, mark it as a topic needing practice and recommend published quizzes matching that topic.

Display recommendations on the results page and dashboard. Use predefined JavaScript rules only, without Gemini API calls, AI or Machine Learning for recommendations.

Authentication and security

Implement functional registration and login, protected pages, user-specific quiz history and secure data access. Configure and verify Firebase Security Rules so users cannot read or modify data they are not authorised to access. Never store plaintext passwords.

Functional requirements

Every visible button, form, filter, navigation item and quiz action must work. Data must persist after refreshing the page and signing in again. Do not use mock data as the permanent database.

Add useful loading states, validation messages, empty states and error handling.

Development instructions

First build the complete application structure and main user interface. Then connect Firebase Authentication and Firestore, implement quiz CRUD operations, quiz participation, secure server-side evaluation, topic-wise analysis, recommendations and history.

Test the complete flow from registration to quiz creation, publication, attempt, result storage and recommendation.

Do not claim a feature is implemented unless it actually works. Keep the application easy to demonstrate and explain during a college project review.
