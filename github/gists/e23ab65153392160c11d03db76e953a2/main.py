# Import necessary objects and functions from the Flask module
from flask import Flask, jsonify, request

# Create an instance of the Flask class. This instance is the WSGI application.
app = Flask(__name__)

# Define a route to catch all requests (both root '/' and any other '<path:path>')
# This is useful for handling undefined routes or for general logging
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>', methods=['GET', 'OPTIONS'])
def catch_all(path):
    # Check if the request method is OPTIONS - usually used for CORS preflight requests
    if request.method == 'OPTIONS':
        # Generate a default response for OPTIONS requests
        response = app.make_default_options_response()
    else:
        # For non-OPTIONS requests to undefined paths, return a 404 Not Found error
        # Here you could add logic for specific paths if needed
        response = jsonify({'error': 'Not found'}), 404
    return response

# Define a route specifically for serving the microsoft-identity-association.json file
# This route is fixed and will only respond to requests for this specific file
@app.route('/.well-known/microsoft-identity-association.json')
def microsoft_identity_association():
    # Define the data to be returned in JSON format
    # This data structure is required by Microsoft for identity association
    data = {
        "associatedApplications": [
            {
                "applicationId": "YOUR-ID"
            }
        ]
    }
    # Create a response object from the data, setting the content type to application/json
    # jsonify automatically converts the Python dictionary to JSON format
    response = jsonify(data)
    response.headers['Content-Type'] = 'application/json'
    return response

# This conditional is only true if the script is run directly (python main.py)
# It's false if the script is imported as a module in another script
if __name__ == '__main__':
    # Run the app on all available IP addresses (0.0.0.0) and on port 8000
    # This makes the server publicly accessible on http://127.0.0.1:8000/
    app.run(host='0.0.0.0', port=8000)
