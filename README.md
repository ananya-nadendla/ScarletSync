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

//Run project (everyone - need to do this everytime you want to run project)
git fetch
    (get updates from github)
git reset --hard origin/main
    (update your project in VScode)
npm start
    (run program in browser)
^C 
    (to stop program)

//Push updates to github (developers only)
git add .
git status
git commit -m "message"
git push origin main



mkdir cloudinary-backend
cd cloudinary-backend
npm init -y
npm install express dotenv cloudinary cors body-parser
npm install express dotenv cloudinary cors body-parser multer
npm install streamifier
