## Google OAuth Integration and OpenAPI Specification

### Google OAuth Integration

The MEMENTO approach leverages Google OAuth for secure authentication and authorization, allowing it to interact with Google Drive and Sheets API on behalf of the user. OAuth 2.0 provides a flow for web and desktop applications to obtain a user's consent for specific permissions (scopes) to access their data stored in Google services.

#### Key Steps for Integration:

1. **Client Registration**: Register your application in the Google API Console to obtain OAuth 2.0 credentials such as the client ID and client secret.
2. **Authorization Request**: Direct users to Google's OAuth 2.0 authorization endpoint, where they can consent to the requested permissions.
3. **Access Token**: Exchange the authorization code received for an access token and, optionally, a refresh token.
4. **API Calls**: Use the access token to make authenticated requests to Google APIs.

#### Scopes:

- `https://www.googleapis.com/auth/drive`: Full access to Google Drive.
- `https://www.googleapis.com/auth/spreadsheets`: Full access to Google Sheets.
- `https://www.googleapis.com/auth/userinfo.email`: View the user's email address.

### OpenAPI Specification

The `openapi.json` specification outlines how the MEMENTO system interfaces with Google Sheets and Drive API, providing a structured way to list, create, and update files and spreadsheets.

#### Key Endpoints:

- **List Google Sheets files**: GET `/drive/v3/files` with a query parameter to filter for Google Sheets files, enabling MEMENTO to retrieve a list of all Sheets files accessible to the user.
- **Create a new Google Sheets file**: POST `/drive/v3/files` to create new Sheets files, specifying the file's name and mimeType in the request body.
- **Update a range of values in a sheet**: PUT `/sheets/v4/spreadsheets/{spreadsheetId}/values/{range}` to update specific cells or ranges in a Google Sheet, allowing for dynamic data manipulation based on in-context learning results.
- **Get user's email address**: GET `/oauth2/v3/userinfo` to retrieve the user's email address, useful for personalizing interactions and managing user-specific data.

#### Security Schemes:

The specification includes a `GoogleOAuth` security scheme under `components.securitySchemes`, detailing the OAuth 2.0 flow for authorizationCode, including URLs for the authorization and token endpoints, as well as the required scopes for accessing Drive, Sheets, and user info.

### Usage in MEMENTO

Integrating Google OAuth and following the OpenAPI specification allows the MEMENTO system to securely and efficiently manage files and data within Google Drive and Sheets. This integration enables:

- **Automated Data Logging**: Store and retrieve short-term and long-term memory logs, and learning outcomes in Sheets.
- **Dynamic Content Generation**: Create new Sheets for dynamically generated content based on in-context learning.
- **Personalized User Interactions**: Use user-specific data (e.g., email addresses) to personalize the learning and interaction experience.

This integration empowers MEMENTO to leverage Google's robust cloud storage and spreadsheet functionalities, enhancing its capability to provide a personalized, adaptive, and contextually aware user experience.
