@echo off
echo Starting AI Route Planner Services...

echo.
echo Starting MongoDB...
start "MongoDB" cmd /k "mongod"

timeout /t 5

echo.
echo Starting Java OR-Tools Service...
cd optimizer-java
start "Java OR-Tools" cmd /k "mvn spring-boot:run"

timeout /t 10

echo.
echo Starting Node.js Backend...
cd ..\server
start "Node.js Backend" cmd /k "npm run dev"

timeout /t 5

echo.
echo Starting React Frontend...
cd ..\client
start "React Frontend" cmd /k "npm start"

echo.
echo All services started! Check the opened windows.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
echo Java Service: http://localhost:8080
pause