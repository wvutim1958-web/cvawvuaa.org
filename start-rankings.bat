@echo off
echo Starting College Football Rankings System Setup...

REM Navigate to correct directory
cd /d %~dp0

REM Install dependencies
echo Installing required packages...
call npm install

REM Start the server
echo Starting the rankings server...
start /B node update-rankings.js

REM Open the rankings page
echo Opening rankings page...
start http://localhost:3000/cfb-rankings.html

echo Setup complete! The rankings will update automatically every hour.