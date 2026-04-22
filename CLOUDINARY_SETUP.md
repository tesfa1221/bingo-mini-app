# Cloudinary Upload Preset Setup

## Quick Setup (2 minutes)

Your Cloudinary credentials are already configured in the .env files!

### Create Upload Preset:

1. Go to: https://console.cloudinary.com/console
2. Login with your account (dnalvqyhu)
3. Click **Settings** (gear icon) in the top right
4. Click **Upload** tab
5. Scroll down to **Upload presets**
6. Click **Add upload preset**
7. Configure:
   - **Preset name:** `bingo_deposits`
   - **Signing mode:** Select **Unsigned** (IMPORTANT!)
   - **Folder:** `bingo-deposits`
8. Click **Save**

That's it! The preset is now ready.

## Verify It Works

After creating the preset, your app will be able to upload payment screenshots directly from the browser.

## Already Configured in Your App:

✅ Backend (.env):
```
CLOUDINARY_CLOUD_NAME=dnalvqyhu
CLOUDINARY_API_KEY=294487373912288
CLOUDINARY_API_SECRET=xGIYxpQKlkRjVzYhWaNSWxBmWDg
```

✅ Frontend (client/.env):
```
REACT_APP_CLOUDINARY_CLOUD_NAME=dnalvqyhu
REACT_APP_CLOUDINARY_UPLOAD_PRESET=bingo_deposits
```

## Test Upload

Once the preset is created, users can:
1. Go to Wallet tab
2. Click Deposit
3. Enter amount
4. Click "Upload Screenshot"
5. Select image
6. Image uploads directly to Cloudinary!
