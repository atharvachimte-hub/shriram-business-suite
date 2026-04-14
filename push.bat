@echo off
cls
echo 🚩 ShriRam Digital Solutions - Auto Deploy Starting...
git add .
set /p msg="Enter Commit Message: "
if "%msg%"=="" set msg="Update Phase 2: Excel and Print Fix"
git commit -m "%msg%"
echo 🚀 Pushing to GitHub...
git push origin main
echo ✅ Done! Your site is live.
pause