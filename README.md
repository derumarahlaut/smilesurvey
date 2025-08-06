# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## Deployment on an Ubuntu Server

This guide provides step-by-step instructions to deploy this Next.js application on an Ubuntu server, with specific sections for both command-line and aaPanel deployment.

### 1. Command-Line Deployment (Manual)

This section covers the traditional method of deploying via the command line.

#### Prerequisites

-   An Ubuntu server (e.g., from AWS, Google Cloud, DigitalOcean).
-   `ssh` access to your server.
-   A domain name pointed to your server's IP address (optional but recommended for production).

#### Step 1: Install Node.js and npm

Your Next.js application requires a Node.js runtime. If you don't have it installed, connect to your server via `ssh` and run the following commands:

```bash
# Update package lists
sudo apt update

# Install Node.js (this command installs a recent version) and npm
sudo apt install -y nodejs npm
```

Verify the installation:
```bash
node -v
npm -v
```

#### Step 2: Clone Your Application

Clone your project repository onto the server.

```bash
# Replace with your repository URL
git clone https://github.com/your-username/your-repo-name.git

# Navigate into the project directory
cd your-repo-name
```

#### Step 3: Install Dependencies

Install the necessary `npm` packages defined in `package.json`.

```bash
npm install
```

#### Step 4: Set Up Environment Variables

Your application requires environment variables for services like Google AI and SMTP for sending emails. Create a `.env` file in the root of your project.

```bash
nano .env
```

Copy and paste the following content into the file. **Crucially, you must fill in your own secret keys and credentials.**

```env
# Get your API key from Google AI Studio: https://makersuite.google.com/app/apikey
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# Your SMTP server credentials for sending verification emails
EMAIL_HOST="your_smtp_host"
EMAIL_PORT="your_smtp_port"
EMAIL_USER="your_email_address"
EMAIL_PASS="your_email_or_app_password"
```
Press `Ctrl+X`, then `Y`, then `Enter` to save and exit `nano`.

#### Step 5: Build the Application

Create a production-optimized build of your Next.js app.

```bash
npm run build
```
This command will create a `.next` directory with the production build.

#### Step 6: Run the Application with a Process Manager (pm2)

For a production environment, it's highly recommended to use a process manager like `pm2`. This will keep your application running in the background and automatically restart it if it crashes.

1.  **Install `pm2` globally:**
    ```bash
    sudo npm install pm2 -g
    ```

2.  **Start your application using `pm2`:**
    ```bash
    pm2 start npm --name "smilesurvey" -- start
    ```
    -   `--name "smilesurvey"` gives your process a memorable name.
    -   `-- start` tells `pm2` to use the `start` script from your `package.json`. By default, this runs `next start` on port 3000.

3.  **Check the status of your application:**
    ```bash
    pm2 list
    ```

4.  **Save the process list to automatically restart on server reboot:**
    ```bash
    pm2 save
    pm2 startup
    ```
    The second command will give you a command to run to enable the startup script.

Your application should now be running! If you have a firewall, ensure that port 3000 (or whichever port you configure) is open. You can now access your app via `http://<your_server_ip>:3000`.

### 2. aaPanel Deployment

This section explains how to deploy the application using the aaPanel interface.

#### Prerequisites

-   aaPanel installed on your Ubuntu server.
-   **Node.js Manager** installed from the aaPanel App Store.
-   Your domain name (e.g., `skg.polkesban.online`) is already pointed to your server's IP address.

#### Step 1: Upload Project Files

1.  Navigate to **Files** in aaPanel.
2.  Go to the directory `/www/wwwroot`.
3.  Create a new folder for your project, for example, `smilesurvey`.
4.  Upload all your project files into this new folder. You can do this by zipping your project locally and uploading the single zip file, then unzipping it inside aaPanel.

#### Step 2: Add Node Project in aaPanel

1.  Navigate to **Website** in aaPanel.
2.  Click on **Add Node project**.
3.  Fill in the form fields exactly as described below, based on your screenshot:
    -   **Path**: Click the folder icon and navigate to the root of your project directory (e.g., `/www/wwwroot/smilesurvey`).
    -   **Name**: A descriptive name for your project, e.g., `Survey Kesehatan Gigi`.
    -   **Run opt**: Select **start** from the dropdown menu. This corresponds to the `npm run start` command in your `package.json`, which is the standard way to run a production Next.js app.
    -   **Port**: Enter **3000**. The `start` script defaults to port 3000. aaPanel will automatically create a reverse proxy from your domain to this port.
    -   **User**: `www` is the standard and correct user.
    -   **Node**: Select the Node.js version you have installed (e.g., v16.9.0 or a newer version like v18.x or v20.x, as Next.js recommends newer versions).
    -   **Remark**: Any comment, e.g., `Survey Kesehatan Gigi`.
    -   **Domain name**: Enter your full domain name, e.g., `skg.polkesban.online`.

4.  Click **Confirm**.

#### Step 3: Install Dependencies and Build

1.  After adding the project, go back to the Node project list.
2.  Click the **Module** button for your project.
3.  Click **Install** to run `npm install` and install all the required packages.
4.  After the installation is complete, navigate back to the **Files** section.
5.  Go to your project directory and click the **Terminal** button at the top.
6.  In the terminal window that opens, run the build command:
    ```bash
    npm run build
    ```
    This will create the `.next` production build folder.

#### Step 4: Set Environment Variables

1.  In the Node project list, click on your project's **Path** to open the project settings.
2.  Go to the **Environment variable** tab.
3.  Click **Add** and add the following keys and their corresponding values one by one:
    -   `GEMINI_API_KEY`
    -   `EMAIL_HOST`
    -   `EMAIL_PORT`
    -   `EMAIL_USER`
    -   `EMAIL_PASS`
4.  After adding the variables, restart your project from the Node project list by clicking the **Restart** button.

Your application should now be live and accessible via your domain name. aaPanel handles the process manager (pm2) and the reverse proxy (Nginx) for you automatically.
