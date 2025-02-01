youtube video = https://www.youtube.com/watch?v=2hR-uWjBAgw

//Setup project (everyone - only need to do this once)
Just do ```npm install```. If that doesn't work, download these:
npm install react-router-dom
    (actually install react [after downloading it from browser])
npm install firebase
npm install -g firebase-tools
npm install web-vitals  
    (install tools that project needs)
npm install react-select
    (NEW TOOL - 1/25)
npm install axios
npm install cloudinary
npm install browser-image-compression
    (NEW TOOLS - 1/28)
npm install express cors dotenv @google/generative-ai
    (NEW TOOLS for server- 1/31)
npm install @supabase/supabase-js
    (NEW TOOLS for server- 2/1)

//Run project (everyone - need to do this everytime you want to run project)
OPEN A TERMINAL 
git fetch
    (get updates from github)
git reset --hard origin/main
    (update your project in VScode)
cd server
    (go in server folder -- should say \scarletsync\server in terminal)
node server.js
    (start node server - part 1 of running program)
OPEN A **NEW** TERMINAL
    (should now be back in scarletsync folder -- should say \scarletsync in terminal)
npm start
    (run program in browser - part 2 of running program)

STOP PROGRAM
^C 
    (In both terminals, to stop program)

//Push updates to github (developers only)
git add .
git status
git commit -m "message"
git push origin main
