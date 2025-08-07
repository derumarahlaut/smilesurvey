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
-   A local copy of your project files (e.g., in a zip file).
-   A domain name pointed to your server's IP address (optional but recommended for production).

#### Step 1: Get Your Project Files
After this chat session is complete, Firebase Studio will provide you with an option to **download your project as a `.zip` file**. Download this file to your local computer.

#### Step 2: Install Node.js and npm

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

#### Step 3: Upload and Unzip Your Application

1.  **Upload to Server**: Use a tool like `scp` (from your local terminal) or an SFTP client (like FileZilla) to upload the `.zip` file from your computer to your server. For example:
    ```bash
    # In your local computer's terminal, navigate to where you saved the zip file
    scp ./smilesurvey.zip your_username@your_server_ip:/var/www/
    ```
2.  **Unzip the Project**: Connect to your server via `ssh` and unzip the file.
    ```bash
    # Connect to your server
    ssh your_username@your_server_ip

    # Navigate to the target directory
    cd /var/www

    # Install the unzip tool if you don't have it
    sudo apt install -y unzip

    # Unzip the project. This will create a 'smilesurvey' folder.
    unzip smilesurvey.zip -d smilesurvey
    
    # Navigate into the project directory
    cd smilesurvey
    ```

#### Step 4: Install Dependencies

Install the necessary `npm` packages defined in `package.json`.

```bash
npm install
```

#### Step 5: Set Up Environment Variables

Your application requires environment variables. Create a `.env` file in the root of your project.

```bash
nano .env
```

Copy and paste the following content into the file, filling in your own credentials.

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

#### Step 6: Build the Application

Create a production-optimized build of your Next.js app.

```bash
npm run build
```
This command will create a `.next` directory with the production build.

#### Step 7: Run the Application with a Process Manager (pm2)

For a production environment, use a process manager like `pm2` to keep your app running.

1.  **Install `pm2` globally:**
    ```bash
    sudo npm install pm2 -g
    ```

2.  **Start your application:**
    ```bash
    pm2 start npm --name "smilesurvey" -- start
    ```
    -   `--name "smilesurvey"` gives your process a memorable name.
    -   `-- start` tells `pm2` to use the `start` script from your `package.json`.

3.  **Check the status:**
    ```bash
    pm2 list
    ```

4.  **Enable automatic restart on server reboot:**
    ```bash
    pm2 save
    pm2 startup
    ```
    The second command provides a command to run to enable the startup script.

Your application should now be running!

---

### 2. aaPanel Deployment

This section explains how to deploy the application using the aaPanel interface.

#### Prerequisites

-   aaPanel installed on your Ubuntu server.
-   **Node.js Manager** installed from the aaPanel App Store.
-   A domain name (e.g., `skg.polkesban.online`) is pointed to your server's IP address.

#### Step 1: Get Your Project Files

After this chat session with the AI is complete, **Firebase Studio will give you an option to download your entire project as a `smilesurvey.zip` file**. Download this file to your computer.

#### Step 2: Upload and Unzip in aaPanel

1.  **Upload via aaPanel File Manager**:
    -   Log in to your aaPanel dashboard.
    -   Navigate to **Files** from the left-hand menu.
    -   Go to the directory where you want to store your sites, which is typically `/www/wwwroot`.
    -   Click the **Upload** button at the top.
    -   In the popup, select the `smilesurvey.zip` file from your computer and upload it.
2.  **Unzip the File**:
    -   Once the upload is complete, you will see `smilesurvey.zip` in the file list.
    -   Right-click on the zip file and select **Unzip**.
    -   A folder named `smilesurvey` will be created. This is your project root.

#### Step 3: Add Node Project in aaPanel

1.  Navigate to **Website** in aaPanel.
2.  Click on **Add Node project**.
3.  Fill in the form fields exactly as described below:
    -   **Path**: Click the folder icon and navigate to the root of your project directory (e.g., `/www/wwwroot/smilesurvey`).
    -   **Name**: A descriptive name, e.g., `Survey Kesehatan Gigi`.
    -   **Run opt**: Select **start** from the dropdown menu. This corresponds to the `npm run start` command.
    -   **Port**: Enter **3000**. The `start` script defaults to this port.
    -   **User**: `www` is the standard user.
    -   **Node**: Select the Node.js version you have installed (e.g., v16.9.0 or a newer version like v18.x or v20.x).
    -   **Domain name**: Enter your full domain name, e.g., `skg.polkesban.online`.

4.  Click **Confirm**.

#### Step 4: Install Dependencies and Build

1.  After adding the project, go back to the Node project list.
2.  Click the **Module** button for your project.
3.  Click **Install** to run `npm install`.
4.  After installation, navigate back to **Files**.
5.  Go to your project directory (`/www/wwwroot/smilesurvey`) and click the **Terminal** button at the top of the file manager.
6.  In the terminal window, run the build command:
    ```bash
    npm run build
    ```
    This creates the `.next` production folder. Close the terminal when it's done.

#### Step 5: Set Environment Variables

1.  In the Node project list, click on your project's **Path** to open the project settings.
2.  Go to the **Environment variable** tab.
3.  Click **Add** and add the following keys and their corresponding values one by one:
    -   `GEMINI_API_KEY`
    -   `EMAIL_HOST`
    -   `EMAIL_PORT`
    -   `EMAIL_USER`
    -   `EMAIL_PASS`
4.  After adding the variables, restart your project from the Node project list by clicking the **Restart** button.

Your application should now be live and accessible via your domain name.
