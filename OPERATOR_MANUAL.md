# StoryForge v1 - Operator's Manual

Welcome to the StoryForge engine. Use this guide to manage your local deployment.

## 🛠️ Prerequisites
- **Docker Desktop:** Must be installed and running.
- **Gemini API Key:** A valid key from [Google AI Studio](https://aistudio.google.com/).

---

## 🚀 1. Starting the Application

The application is fully containerized. Use the provided deployment scripts to build and launch the stack.

### On Windows (PowerShell):
```powershell
.\deploy.ps1
```

### On Linux/macOS (Terminal):
```bash
chmod +x deploy.sh
./deploy.sh
```

**Note:** The first run will take a few minutes as it downloads the PostgreSQL image and builds the React frontend. Subsequent runs will be much faster.

---

## ⚙️ 2. Configuration (.env)

The first time you run a deployment script, it will create a `.env` file in the root directory. You **must** edit this file to add your API key:

1. Open `.env` in a text editor.
2. Find the line: `GEMINI_API_KEY=your_google_ai_studio_key_here`
3. Replace the placeholder with your actual key.
4. Save the file and run the start script again.

---

## 🛑 3. Stopping the Application

To stop the web server and the database safely, run the following command in your terminal:

```bash
docker compose down
```

### Why use this command?
- **Graceful Shutdown:** It allows the database to finish any pending writes.
- **Resource Recovery:** It frees up your machine's RAM and CPU by removing the containers.

---

## 💾 4. Data & Persistence

**"Does stopping the app delete my stories?" NO.**

- Your data is stored in a **Docker Volume** named `storyforge_pgdata`.
- When you run `docker compose down`, the containers are removed, but the volume remains on your hard drive.
- When you start the app again with `.\deploy.ps1`, your stories and chapters will be automatically reloaded.

---

## 🌐 5. Accessing the UI

Once the containers are started, open your web browser and navigate to:

**[http://localhost:3000](http://localhost:3000)**

---

## 📋 6. Troubleshooting & Logs

If the application isn't responding or you see an "AI Error fallback," check the logs to see what the server is doing:

```bash
# See logs for the entire stack
docker compose logs -f

# See logs for just the AI/Web server
docker logs storyforge_app
```

---

**Vance (Archivist):** *This manual has been archived as part of the official project DNA.*
