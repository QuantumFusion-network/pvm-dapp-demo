# QF devnet faucet

## Features

- Step-by-step wallet setup guide
- Polkadot.js extension integration
- Token request system
- Clean, intuitive UI
- Mobile responsive design

## Setup

1. Install dependencies:
```bash
pnpm install
```

## Deployment

1. Build the production bundle:
```bash
pnpm build
```

2. The build output will be in the `dist` directory

3. Deploy the contents of the `dist` directory to GitHub Pages

4. For environment-specific configurations, make sure to update the RPC address in `Faucet.jsx` before building for production.

## Development

To run the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`
