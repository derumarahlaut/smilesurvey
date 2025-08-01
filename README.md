# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## Deployment on an Ubuntu Server

This guide provides step-by-step instructions to deploy this Next.js application on an Ubuntu server.

### Prerequisites

-   An Ubuntu server (e.g., from AWS, Google Cloud, DigitalOcean).
-   `ssh` access to your server.
-   A domain name pointed to your server's IP address (optional but recommended for production).

### Step 1: Install Node.js and npm

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

### Step 2: Clone Your Application

Clone your project repository onto the server.

```bash
# Replace with your repository URL
git clone https://github.com/your-username/your-repo-name.git

# Navigate into the project directory
cd your-repo-name
```

### Step 3: Install Dependencies

Install the necessary `npm` packages defined in `package.json`.

```bash
npm install
```

### Step 4: Set Up Environment Variables

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

### Step 5: Build the Application

Create a production-optimized build of your Next.js app.

```bash
npm run build
```
This command will create a `.next` directory with the production build.

### Step 6: Run the Application with a Process Manager (pm2)

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

### (Optional) Step 7: Set Up a Reverse Proxy with Nginx

For a true production setup, you should run a web server like Nginx as a reverse proxy. This allows you to:
-   Access your app via the standard ports 80 (HTTP) and 443 (HTTPS) instead of port 3000.
-   Easily set up SSL/TLS certificates (e.g., with Let's Encrypt) for a secure `https://` connection.
-   Serve static assets more efficiently.

This step is more advanced and requires Nginx configuration, but it is the standard way to deploy Node.js applications in production.
