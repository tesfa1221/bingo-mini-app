# 🚀 Deployment Guide

## Frontend Deployment (cPanel)

1. **Build the project:**
   ```bash
   cd kebrchacha-vite
   npm run build
   ```

2. **Upload to cPanel:**
   - Copy files from `cpanel-vite-upload/` 
   - Upload to your cPanel `public_html` directory
   - Set file permissions: 644 for files, 755 for folders

3. **Test:**
   - Visit your domain
   - Should load in under 2 seconds
   - Test with `performance-test.html`

## Backend (Already Deployed)

Backend is running on Render: `https://bingo-mini-app-sily.onrender.com`

## Configuration

- **Telegram Bot:** @Odabingobot
- **Admin ID:** 991793142
- **Database:** Aiven MySQL
- **CDN:** Cloudinary

## Success Indicators

- ✅ Page loads in <2 seconds
- ✅ All features work correctly
- ✅ Mobile interface responsive
- ✅ Real-time updates function
- ✅ Telegram integration works