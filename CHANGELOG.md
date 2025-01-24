1/23/2025
DONE
- Settings 
  - Change username: Username taken check
  - Delete Account functionality

- SignUp 
  - User enters email/password + firstname/lastname/username (required)
  - Choose username: Checks for taken username
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

OtherUserProfile.js
  - shows another user's profile
  - localhost:3000/profile/username

Misc
- DONE => Let new user take username of a deleted account when (1) signing up (2)choosing new username in settings

TODO
  - Create a Delete Account page when user deletes account in Settings
    - (i.e We're sorry to see you go! Please confirm your account deletion)
  - Console.log the user's loggedin/loggedout status for testing purposes
  - ISSUE (2)
    - /profile/wise.girly doesnt work for some reason (when logged into ananya.nadendla2)
    - But /profile/ananya.nadendla2 works when logged into wise.girly ??
    - Note: /profile/wise.girly worked when i entered more info into the profile (via settings)
  - Username check for special characters (can't have /, etc)