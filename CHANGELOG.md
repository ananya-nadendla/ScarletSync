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
- ISSUE FIXED
  - /profile/wise.girly doesnt work when wise.girly is made as fresh account, no info edited (when logged into ananya.nadendla2)
  - It DOES work when wise.girly's info is edited via settings
  - Reason: "some of the fields in the profileData object are being accessed before they are defined"
  
TODO
  - Create a Delete Account page when user deletes account in Settings
    - (i.e We're sorry to see you go! Please confirm your account deletion)
  - Console.log the user's loggedin/loggedout status for testing purposes
  - Username check for special characters (can't have /, etc)
  - Create Page Not Found page (if user tries going to nonexisting page, ie localhost:3000/skjdfksdfjd)