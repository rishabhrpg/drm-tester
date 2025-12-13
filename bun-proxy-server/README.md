# bun-proxy-server

A simple, fast DRM proxy server built with Bun.

## Setup

1.  Install dependencies:

    ```bash
    bun install
    ```

2.  Configure environment variables:

    Create a `.env` file in the `bun-proxy-server` directory with the following variables:

    ```env
    PORT=8000
    DRM_API_URL=https://your-drm-provider.com/api/license
    AUTH_TOKEN=your_auth_token
    ```

## Usage

To start the server:

```bash
bun run start
```

For development (with hot reload):

```bash
bun run dev
```

The server will listen on `http://localhost:8000` (or the port specified in `.env`).
It accepts POST requests at `/` or `/api/drm`.
