```1/25/2025```
DONE
OtherUserProfile
- Add loading state so that page doesnt flicker to "page not found" before showing someone's profile

Loading.js / css
- Make the loading screen look nicer
- Used in 
  - OtherUserProfile
  - ProfilePage
  - SettingsPage

TODO
- Make major/minor typable/lookup faster
- Make "Verification email sent!" alert a popup instead (like Interests in Settings)
- Popup.js: Make Popups a seperate JS file for reuse (Interest[Settings], DeleteAccount[Settings], EmailSent[Signup, Todo], LoggedOut[Todo])
- Util.js: Make UTIL Js file for reusing code (settings/signup username check)
- ISSUE
  - While logged in --> type /profile in address bar --> takes to dashboard instead
    - But clicking "Profile" in Sidebar works fine
    - Reason
      - ProfilePage: line 48 --> navigate("/login");
      - Login: line 40 --> navigate("/dashboard")

```1/24/2025 ```
DONE
MISC
- App.js
  - Console.log the user's loggedin/loggedout status for testing purposes
- SettingsPage.js: 
  - Create a Delete Account popup when user deletes account in Settings
    - (i.e We're sorry to see you go! Please confirm your account deletion)
- Settings + Signup: 
  - Username check for special characters (can't have /, etc) 
- PageNotFound: 
  - Create Page Not Found page (if user tries going to nonexisting page, ie localhost:3000/skjdfksdfjd)
    - Prevent logged out user from accessing /profile/someonesprofile (redirects to PageNotFound)
      

```1/23/2025```
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