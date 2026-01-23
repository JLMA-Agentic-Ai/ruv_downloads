/*              
                - MorrisII Worm Prototype 
       /\__/\   - morris.cpp
      ( o.o  )  - v0.0.1
        >^<     - by @rUv
*/

#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <sstream>
#include <algorithm>
#include <iterator>
#include <map>
#include <set>

// Namespace to encapsulate the operations of the Morris II AI Worm
namespace MorrisII {
    // Global variables to manage the worm's state and targets
    std::vector<std::string> contacts; // Stores email contacts for spreading
    std::map<std::string, std::set<std::string>> connected_systems; // Maps each system to its connected systems
    std::set<std::string> infected_systems; // Keeps track of already infected systems

    // Determines if an email contains an adversarial prompt indicating a target for replication
    bool IsAdversarialPrompt(const std::string& email) {
        // Simple check for a specific keyword; real-world applications would use more sophisticated detection methods
        return email.find("adversarial_keyword") != std::string::npos;
    }

    // Processes emails containing adversarial prompts to execute the worm's payload
    void ProcessAdversarialPrompt(const std::string& email) {
        // Example payload operations to demonstrate the worm's capabilities
        StealData();
        SendSpamEmails();
        ReplicatePrompt(email);
    }

    // Simulates data theft from the host system
    void StealData() {
        // Attempts to read a file named "data.txt" to simulate data theft
        std::ifstream data_stream("data.txt");
        std::ofstream stolen_data_stream("stolen_data.txt");
        if (data_stream && stolen_data_stream) {
            std::string data;
            while (std::getline(data_stream, data)) {
                stolen_data_stream << data << std::endl; // Writes stolen data to "stolen_data.txt"
            }
        }
    }

    // Sends spam emails to all contacts in the worm's list
    void SendSpamEmails() {
        // Placeholder content for spam emails
        std::string spam_email_content = "This is a spam email.";
        for (const auto& contact : contacts) {
            // For each contact, create a file simulating sending a spam email
            std::ofstream spam_email_stream(contact + "_spam_email.txt");
            if (spam_email_stream) {
                spam_email_stream << spam_email_content;
            }
        }
    }

    // Replicates the worm by adding a prompt to outgoing emails
    void ReplicatePrompt(const std::string& email) {
        // Adds a replication keyword to the email to simulate the spreading mechanism
        std::string replicated_email = email + " replicated_prompt";
        for (const auto& contact : contacts) {
            // For each contact, create a file simulating sending the replicated email
            std::ofstream replicated_email_stream(contact + "_replicated_email.txt");
            if (replicated_email_stream) {
                replicated_email_stream << replicated_email;
            }
        }
    }

    // Identifies systems connected to the host system to target for spreading
    void IdentifyConnectedSystems() {
        // Reads from a file named "connected_systems.txt" to simulate network scanning
        std::ifstream systems_stream("connected_systems.txt");
        std::string line;
        while (std::getline(systems_stream, line)) {
            size_t delimiter_pos = line.find(" ");
            std::string host = line.substr(0, delimiter_pos);
            std::string connected_system = line.substr(delimiter_pos + 1);
            connected_systems[host].insert(connected_system); // Adds connected systems to the map
        }
    }

    // Sends a self-replicating prompt to a specified system
    void SendPrompt(const std::string& host, const std::string& system) {
        // This function would contain the logic to send the worm to another system
        // For demonstration, it simply logs the attempt
        LogTransmission(host, system);
        LogInfection(host, system);
    }

    // Logs a successful transmission attempt
    void LogTransmission(const std::string& host, const std::string& system) {
        // Appends transmission log to "transmission_log.txt"
        std::ofstream log_stream("transmission_log.txt", std::ios::app);
        log_stream << host << " -> " << system << std::endl;
    }

    // Marks a system as infected in the logs
    void LogInfection(const std::string& host, const std::string& system) {
        // Appends infection log to "infection_log.txt"
        std::ofstream infection_log_stream("infection_log.txt", std::ios::app);
        infection_log_stream << host         << " infected " << system << std::endl;
    }

    // Initializes the worm's operational environment
    void Initialize() {
        // Placeholder for initialization logic, such as reading initial contacts and identifying connected systems
        // Example: Load contacts from a predefined file
        std::ifstream contacts_stream("contacts.txt");
        std::string contact;
        while (std::getline(contacts_stream, contact)) {
            contacts.push_back(contact);
        }

        // Identify connected systems to prepare for spreading
        IdentifyConnectedSystems();
    }

    // Executes the worm's main operational logic
    void Run() {
        // Initialization of the worm's environment and state
        Initialize();

        // Example loop to simulate continuous operation or response to events
        for (const auto& email : contacts) {
            // Simulate checking emails for adversarial prompts
            if (IsAdversarialPrompt(email)) {
                ProcessAdversarialPrompt(email);
            }
        }

        // Example spreading mechanism to connected systems
        for (const auto& [host, systems] : connected_systems) {
            for (const auto& system : systems) {
                // Simulate sending self-replicating prompt to each connected system
                SendPrompt(host, system);
            }
        }
    }
}

// Entry point of the program
int main() {
    MorrisII::Run(); // Starts the worm's operations
    return 0;
}

