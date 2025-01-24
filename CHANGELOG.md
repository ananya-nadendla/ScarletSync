1/23/2025
DONE
- Settings page
  - Change username: Username taken check
  - Delete Account functionality

- SignUp page:
  - User enters email/password + firstname/lastname/username (required)
  - Choose username: Username taken check
    - ISSUE(1): Can't take username of person who deleted account
  - After signing in 
    - Alert user about email verification
    - Go back to login page
  
- ProfilePage
  - Multiple majors / minors

- Side Navigation Bar
  - Will be the menu
  - Contains: Dashboard, Profile ,Settings, Log out

- Login
  - Must verify email after signup to login 
  
- CSS Styling
  - ProfilePage
  - SettingsPage
  - Signup 
  - Login
  - Dashboard
  - Sidebar
  - Reset Password (uses LoginAndSignup.css)

App.js
  - If user is not signed in, dashboard/profile/settings should redirect to /login

Misc
- DONE => ISSUE(1): Let new user take username of a deleted account when (1) signing up (2)choosing new username in settings

TODO
  - Create a delete account page (i.e We're sorry to see you go! Please confirm your account deletion)
