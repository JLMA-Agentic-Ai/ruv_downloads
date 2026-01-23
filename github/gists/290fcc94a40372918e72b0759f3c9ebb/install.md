# Omniplex - Open Source Perplexity Clone Installation Instructions

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v14 or later)
- [npm](https://www.npmjs.com/) (comes bundled with Node.js)
- [Firebase](https://firebase.google.com/) account (for authentication and data storage)

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Omniplex-ai/omniplex.git
   ```

2. Navigate to the project directory:

   ```bash
   cd omniplex
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env.local` file in the project root directory and add your Firebase configuration:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ``` 
   
   Replace the placeholders with your actual Firebase project configuration values.

5. Run the development server:

   ```bash
   npm run dev
   ```

   The application should now be running at `http://localhost:3000`.

## Build for Production

To create a production build, run:

```bash
npm run build
```

Then, you can start the production server with:

```bash
npm start
```

## Additional Configuration

### API Keys

You may need to obtain API keys for various services used in the application (e.g., OpenAI, Anthropic, Google Search). Follow the instructions provided in the respective service documentation to obtain the keys and add them to the appropriate configuration files or environment variables.

### Firebase Configuration

Ensure that you have properly configured Firebase for authentication and data storage. Refer to the Firebase documentation for more details on setting up and configuring Firebase for your project.

## Support

If you encounter any issues or have questions, please check the [documentation](https://github.com/Omniplex-ai/omniplex) or join our [Discord server](https://discord.gg/87Mh7q5ZSd) for support.
