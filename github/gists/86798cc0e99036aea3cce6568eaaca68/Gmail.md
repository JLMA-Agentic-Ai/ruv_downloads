Google Apps Script uses JavaScript to automate tasks in Google Workspace, enabling custom functions, integration with services, and creation of web apps without installing additional software.

Google Apps Script does not have a built-in trigger that executes automatically when a new email is received in Gmail. However, you can achieve similar functionality by using a combination of Gmail filters and time-driven triggers. Here’s how you can set it up:

## Steps to Trigger a Script When a New Email is Received

1. **Set Up Gmail Filters**:
   - Create a Gmail filter that applies a specific label to incoming emails that you want to process. This label will help you identify which emails the script should act upon.

2. **Create a Google Apps Script**:
   - Write a script that processes emails with the specific label. The script can read the email content, perform actions such as forwarding, saving attachments, or logging details.

3. **Use a Time-Driven Trigger**:
   - Since there is no direct "on email received" trigger, you can set up a time-driven trigger to run your script at regular intervals (e.g., every 10 minutes). This trigger will check for new emails with the specified label and process them accordingly.

### Sample Script

```javascript
function processEmails() {
  // Define the label for the emails you want to process
  var label = GmailApp.getUserLabelByName("ToProcess");
  
  // Get threads with the specified label
  var threads = label.getThreads();
  
  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();
    
    for (var j = 0; j < messages.length; j++) {
      var message = messages[j];
      
      // Process the email message
      Logger.log("Subject: " + message.getSubject());
      Logger.log("From: " + message.getFrom());
      Logger.log("Body: " + message.getBody());
      
      // Example action: Remove label after processing
      message.removeLabel(label);
    }
  }
}
```

### Setting Up the Trigger

1. Open the Apps Script editor by clicking on “Extensions” → “Apps Script” in your Google Workspace application.
2. Write or paste the script above into the editor.
3. Click on the “Triggers” icon (a clock) in the toolbar of the script editor.
4. In the Triggers dialog box, click on the “Add Trigger” button.
5. Choose the function `processEmails` from the dropdown menu.
6. Select the type of trigger as "Time-driven" and configure it to run every 10 minutes or any other interval that suits your needs.
7. Save the trigger.

### Considerations

- **Quota Limits**: Be aware of Google’s quota limits for Gmail and Apps Script, as frequent execution might hit these limits.
- **Efficiency**: The script should efficiently handle and process emails to avoid using excessive resources.
- **Security**: Ensure that the script has the necessary permissions to access your Gmail account and that it handles sensitive data securely.

By using this approach, you can effectively simulate an "on new email received" trigger in Google Apps Script.

Sources
[1] Simple Triggers | Apps Script - Google for Developers https://developers.google.com/apps-script/guides/triggers
[2] How to trigger a Google Apps Script once an email get in the inbox? https://stackoverflow.com/questions/36108478/how-to-trigger-a-google-apps-script-once-an-email-get-in-the-inbox
[3] Trigger an apps script function on sending Email - Google Groups https://groups.google.com/g/google-apps-script-community/c/i4KSCSmcUv8
[4] Trigger a Script on Email Receipt : r/GoogleAppsScript - Reddit https://www.reddit.com/r/GoogleAppsScript/comments/upj6m0/trigger_a_script_on_email_receipt/
[5] Google Apps Script Triggers: A Beginner's Overview and Alternative ... https://zenphi.com/google-apps-script-triggers-a-beginners-overview-and-alternative-solutions/
[6] Google Sheets - sending emails on trigger - EduGeek.net https://www.edugeek.net/forums/how-do-you-do/234752-google-sheets-sending-emails-trigger.html
[7] Triggering Emails and Using Script Properties in Google Sheets https://www.youtube.com/watch?v=TDnk5GPwoyY
