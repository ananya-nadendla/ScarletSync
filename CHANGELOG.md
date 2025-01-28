```1/27/2025```
DONE
Notifications.js (WIP)
  - To display "someone wants to friend you" notification
    - Link added to Sidebar + Added as private route to App.js (aka need to be logged in to access)

Friending 
  - OtherUserProfile.js (displays Friend status button)
    - Can go to someone's profile and "Send Friend Request"
    - Different button states done: Send Request, Pending, Friend, Unfriend
    - Shows Friend Count (not who, privacy)
  - Profile.js
    - Shows Friend Count
    - Click on Friend Count --> Popup displays who friends are + clickable link to each friend's profile
  - /util/friendUtils 
    - purpose: (backend logic for friend status, stored in firebase collections)
    - Friend must accept request to be friends

package-lock.json
  - added "react-select" as a dependency so its automatically downloaded if u just do "npm install"

TODO
- Optional: Util.js: Make UTIL Js file for reusing code (settings/signup username check)
- Optional: Neaten Settings.js
- Friends
  - Neaten Friend's List Popup
  - IMPORTANT: /profile/myprofile lead directly to /profile (so that user can't friend themselves)
- Notification.js
  - Make Notifications a "card" that you can X out to close
  - Fix "xyz sent friend request" to show username instead of user id
- Profile Picture Upload
  - OtherProfile.js: show pfp on other profile
  - Profile.js
    - Show pfp on your own profile
    - Click on Friend Count --> Shows list of friends (PROFILE TODO + username|done + clickable lead to their profile|done)
  - Settings.js: Upload profile / have no profile


```1/25/2025```
DONE
OtherUserProfile
- Add loading state so that page doesnt flicker to "page not found" before showing someone's profile

Settings
  - Major/Minor dropdown, type to filter search results

Loading.js / css
- Make the loading screen look nicer
- Used in 
  - OtherUserProfile
  - ProfilePage
  - SettingsPage

Popup.js
  - General file for Popups
  - Used for : Delete Account[Settings], Choose Interests[Settings], Veritifcation Email Sent[Signup], Profile Settings Saved[Settings]
    - TODO: LoggedOut

MISC
- ISSUE (FIXED)
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