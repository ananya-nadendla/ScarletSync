```2/15```
DONE
  - Styling
    - OtherUserProfile.js
    - ProfilePage.js
    - Sidebar.js
    - Chatbot.js

```2/9```
DONE
- Remove NODE MODULES off github from server
  - In gitignore, put (server/node_modules/) -> (will do after merging groupchat back to main)
- Remove .idea off Github 
  - Its for IntelliJ IDE Only (not vscode)

- SettingsPage.js
  - Added noneditable EMAIL
  - Fixed Profile Picture preview

- server.js / imageUploadUtils
  - Fixed Stream profile picture updating Bug

TODO
- OtherUserProfile
  - Style Add Friend Button + Position Better
- OLD STUFF, NOT IMPORTANT 
  - Groupchat.js
    - If admin leaves chat, appoint NEW admin
    -  Figure out "ConnectUser twice" error
  - Chatbot.js:
    - Rate limit (so that quota for day isnt filled)
  - If user is logged out, redirect to /page-not-found not /login + add Login link in /page-not-found
    - Optional: Util.js: Make UTIL Js file for reusing code (settings/signup username check)
    - Optional: Neaten Settings.js
    - Notification.js
      - Make Notifications a "card" that you can X out to close
    - Profile Picture Upload
      - Profile.js
        - Click on Friend Count --> Shows list of friends (PROFILE TODO + username[done] + clickable lead to their profile[done])
      - Settings.js: Case of Have no profile picture

```2/4/2025 && 2/6 && 2/7```
DONE
- GroupChat
  - Installed Stream + setup api keys
  - Added GroupChat.js, GroupChat.css, util/fetchStreamToken
  - Set up Stream in server.js
  - Added Groupchat link to Sidebar.js
  - CURRENTLY: Each user generates with their own unique channel

  - Adding ANYONE to a groupchat works
    - Cannot add non-existent user

  - Styling groupchat w/ Stream's default styles
  - Fixed WEIRD LAYOUT
  - USER DELETES ACCOUNT: User is deleted from groupchats 

  - DM Feature: Can enter someone's username and dm them
  - GroupChat feature: If you add a 3rd person to a DM, it turns into a groupchat
    - After you turn it into a groupchat, you can start a new DM (with the first two ppl)

  - Leave Chat done
    - "You left this chat" alert
  - Admin can remove user from chat

  - Made settings page for add user / remove user / leave chat
  - Added "XYZ Left the group" message
  - Neatened UI
  
  - Channel that user is currently on turns GREY
  - When user makes new account, Welcome Chat is created w/ Welcome message
  - Allowed renaming chats for chats of 3+ members
    
  - Chat admin permissions
    - Only admins can remove / add users / rename chat
    - Notify nonadmins that only admins can do those 3 functions

  - If chat has 0 members, delete chat

  - Added user's ProfilePic (PFP) to Stream PFP
  - "View Members" button (next to Groupchat Settings) to see members in chat

  - System Bot: Added system bot for system messages (x joined chat, x left chat, x renamed chat etc)
    - server/firebase-service-account.json (NOT IN GITHUB)



```2/3/2025```
DONE
- CHATBOT
  - Only save the last 5 chat history messages to save space

- FRIENDS
  - User Deletes Account
    - In each profile of the firebase "profiles" collection, the deleted user uid is gone from the "friends" field
    - In the "friendRequests" collection, any deleted user uid in the "to"/"from" field deletes the whole friendRequest
    - RESULT: Now when a user deletes profile, their profile is deleted from all other users' friends' pages/lists too. 
  - Made Friends Popup neater



```2/1 && 1/31/2025```
DONE
- Made a server folder for server-side w/ own .env file
- CHATBOT 
  - (Connected Google Gemini Chatbot)
    - Note: Go to /chatbot to try it out
    - Gave Google Gemini Chatbot user profile information so it has context
    - If user changes profile, Chatbot is updated with new context automatically
    - Put Chatbot "AI Advisor" in Sidebar
    - Prevent logged out users from accessing /chatbot page
    - Give chatbot chat history so it has context 
      - TODO: History gets lost every time user refrehes page
    - Added support for Links (chatbot can give a link)
    - Chatbot.css: Styled chatbot
    - Showed user's messages in Chatbot page too
    - Intro: "Hi, I'm your AI advwhat do you need help w/ today"?


```1/28/2025```
NOTE:
  - ImageKit (for profile picture) only supports up till React 18
  - I set this project from React 19 to React 18 (in package.json && package-lock.json)

Friending
- IMPORTANT: Friend Deletes Account
  - Remove Notification of Friend (Notification.js)
  - Remove Friend from Friends List Popup (ProfilePage / OtherUserProfile)
  - Remove Friend from Friend Counter (ProfilePage / OtherUserProfile)

OtherUserProfile.js
- IMPORTANT: /profile/myprofile lead directly to /profile (so that user can't friend themselves)

Profile Picture
  - OtherUserProfile.js :visible
  - Profile.js: visible
  - Settings.js: Can upload profile picture
  - WIP: 
    - Delete pfp when uploading new one (imageUploadUtils=>deleteProfilePicture() not working)
    - Delete pfp when user deletes account (method already called)

util/imageUploadUtils
  - Util file for uploading pic (works) + deleting pic (broken, wip)



```1/27/2025```
DONE
Notifications.js (WIP)
  - To display "someone wants to friend you" notification
    - Link added to Sidebar + Added as private route to App.js (aka need to be logged in to access)
  -Fixed "xyz sent friend request" to show username instead of user id

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