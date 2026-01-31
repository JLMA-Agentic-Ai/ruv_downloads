#!/bin/bash

# Colors for bbs style text UI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display the menu
function display_menu {
    echo -e "${GREEN}================== Pygentic Setup Menu ==================${NC}"
    echo -e "1. 🛠️  Setup Project Structure"
    echo -e "2. 📦  Install Dependencies"
    echo -e "3. 🧪  Setup Virtual Environment"
    echo -e "4. 🔄  Activate Virtual Environment"
    echo -e "5. 🔧  Deactivate Virtual Environment"
    echo -e "6. ❓  Help"
    echo -e "7. 🚪  Exit"
    echo -e "${GREEN}========================================================${NC}"
}

# Function to setup project structure
function setup_project_structure {
    echo -e "${YELLOW}Setting up project structure...${NC}"
    mkdir -p my_assistant_proxy/app/routes my_assistant_proxy/app/services my_assistant_proxy/tests
    touch my_assistant_proxy/app/{__init__.py,main.py,models.py}
    touch my_assistant_proxy/app/routes/{__init__.py,assistants.py,threads.py,messages.py,runs.py}
    touch my_assistant_proxy/app/services/{__init__.py,llm_service.py,serverless_service.py,open_interpreter_service.py,database.py}
    touch my_assistant_proxy/tests/{__init__.py,test_assistants.py,test_threads.py,test_messages.py,test_runs.py}
    touch my_assistant_proxy/{requirements.txt,README.md}
    echo -e "${GREEN}Project structure created successfully.${NC}"
}

# Function to install dependencies
function install_dependencies {
    echo -e "${YELLOW}Installing dependencies...${NC}"
    pip install fastapi pydantic httpx uvicorn liteLLM pydbantic databases[sqlite]
    echo -e "${GREEN}Dependencies installed successfully.${NC}"
}

# Function to setup virtual environment
function setup_virtual_env {
    echo -e "${YELLOW}Setting up virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}Virtual environment setup successfully.${NC}"
}

# Function to activate virtual environment
function activate_virtual_env {
    echo -e "${YELLOW}Activating virtual environment...${NC}"
    source venv/bin/activate
    echo -e "${GREEN}Virtual environment activated. Run 'deactivate' to exit.${NC}"
}

# Function to deactivate virtual environment
function deactivate_virtual_env {
    echo -e "${YELLOW}Deactivating virtual environment...${NC}"
    deactivate
    echo -e "${GREEN}Virtual environment deactivated.${NC}"
}

# Function to display help
function display_help {
    echo -e "${YELLOW}Help:${NC}"
    echo -e "1. Setup Project Structure: Creates necessary directories and placeholder files."
    echo -e "2. Install Dependencies: Installs required Python packages."
    echo -e "3. Setup Virtual Environment: Creates a virtual environment."
    echo -e "4. Activate Virtual Environment: Activates the virtual environment."
    echo -e "5. Deactivate Virtual Environment: Deactivates the virtual environment."
    echo -e "6. Help: Displays this help message."
    echo -e "7. Exit: Exits the setup script."
}

# Main script logic
while true; do
    display_menu
    read -p "Please choose an option (1-7): " choice
    case $choice in
        1) setup_project_structure ;;
        2) install_dependencies ;;
        3) setup_virtual_env ;;
        4) activate_virtual_env ;;
        5) deactivate_virtual_env ;;
        6) display_help ;;
        7) echo -e "${RED}Exiting setup script. Goodbye!${NC}"; exit 0 ;;
        *) echo -e "${RED}Invalid option, please try again.${NC}" ;;
    esac
done
