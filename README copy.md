# Chrome Extension Project

## Development

### One-time Setup

1. Create a Python environment
2. Install all requirements from `api/requirements.txt` into the environment

### During Development

1. Start the backend locally (from inside `api`): `uvicorn main:fastapi_app --reload`
2. Build the chrome extension: `npm run dev`
3. Reload the chrome extension at [chrome://extensions]()
