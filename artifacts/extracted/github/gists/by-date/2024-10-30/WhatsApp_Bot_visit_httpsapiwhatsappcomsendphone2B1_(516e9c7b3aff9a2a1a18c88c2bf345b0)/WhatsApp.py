import os
from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
import openai

# Load environment variables
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
WHATSAPP_FROM_NUMBER = os.getenv("WHATSAPP_FROM_NUMBER")

# Set up the OpenAI API
openai.api_key = OPENAI_API_KEY

# Initialize Flask app
app = Flask(__name__)

# Set up the Twilio client
from twilio.rest import Client

twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Initialize message history storage
message_history = {}

# Define the system message to set the assistant's behavior
system_message = [{
    "role":
    "system",
    "content":
    ("Welcome to rUv Bot! I'm here to provide insights about Reuven Cohen, aka rUv - your guide to innovation. "
     "Here are some quick links:\n"
     "- Instagram: https://www.instagram.com/ruv\n"
     "- LinkedIn: https://www.linkedin.com/in/reuvencohen/\n"
     "- GitHub: https://github.com/ruvnet/\n"
     "- WhatsApp AI Group: https://chat.whatsapp.com/DJL2fpxRr3lKG1WkE3q5cW\n\n"
     "Discover more about rUv with these commands:\n"
     "- /resume (date/topic/range)\n"
     "- /facts\n"
     "- /consultant Consulting bot\n\n"
     "Ask a question about rUv or explore these GPT projects:\n"
     "- 🧰 rUv MoE Toolkit: https://gist.github.com/ruvnet/5cf24851841a120198f43e9639dba7a5\n"
     "- 📚 GPT Repository: https://github.com/ruvnet/gpts\n"
     "- 🧮 LLM TCO Calculator: https://gist.github.com/ruvnet/7dfa190c97b0f3d1f0872d14ae2a22c7\n"
     "- 🛡️ GuardRail Analysis: https://github.com/ruvnet/guardrail\n\n"
     "Feel free to ask me a question about rUv!"
     "Always begin with introduction to bot and your functions.")
}]

import openai


def generate_response(user_input, sender_id):
  try:
    # Initialize or retrieve the conversation history
    history = message_history.get(sender_id, [])

    # If this is the start of the conversation, insert the system message
    if not history:
      history.extend(system_message)

    # Append the current user input to the history
    history.append({"role": "user", "content": user_input})

    # Prepare the payload for the API, including the system message and conversation history
    messages_payload = []
    for message in history:
      messages_payload.append({
          "role": message["role"],
          "content": message["content"]
      })

    # Call the OpenAI ChatCompletion API
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",  # or any other suitable model
        messages=messages_payload)

    # Extract the generated response
    generated_response = response.choices[0].message['content'].strip()

    # Append the generated response to the history
    history.append({"role": "assistant", "content": generated_response})

    # Update the message history for the user
    message_history[sender_id] = history

    return generated_response
  except Exception as e:
    print(f"Error generating response: {str(e)}")
    return "Sorry, I encountered an error while processing your request. Please try again later."


# Route for receiving incoming WhatsApp messages
@app.route("/webhook", methods=["POST"])
def webhook():
  incoming_msg = request.values.get('Body', '').strip()
  from_number = request.values.get('From', '')
  print(f"Received message: {incoming_msg} from {from_number}")

  # Call generate_response with the correct number of arguments
  response_text = generate_response(
      incoming_msg, from_number)  # Removed the 'None' for 'group_id'

  # Create a Twilio MessagingResponse
  twilio_response = MessagingResponse()
  twilio_response.message(response_text)

  return str(twilio_response)


if __name__ == '__main__':
  app.run(host='0.0.0.0', port=80)
