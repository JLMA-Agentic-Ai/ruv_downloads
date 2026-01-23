import asyncio
from pathlib import Path
from lionagi.libs import SysUtil, ParseUtil
from typing import Any
from pydantic import Field
from lionagi.core import Session
from lionagi.core.form.action_form import ActionForm

import importlib
import subprocess
import sys
from os import getenv
from dotenv import load_dotenv
from pathlib import Path

E2B_KEY_SCHEME = "E2B_API_KEY"

GUIDANCE_RESPONSE = """
    Guidance from super intelligent code bot:
    {guidance_response}
    Please generate Python functions that satisfies the prompt and follows the provided guidance, while adhering to these coding standards:
    - Use descriptive and meaningful names for variables, functions, and classes.
    - Follow the naming conventions: lowercase with underscores for functions and variables, CamelCase for classes.
    - Keep functions small and focused, doing one thing well.
    - Use 4 spaces for indentation, and avoid mixing spaces and tabs.
    - Limit line length to 79 characters for better readability.
    - Use docstrings to document functions, classes, and modules, describing their purpose, parameters, and return values.
    - Use comments sparingly, and prefer descriptive names and clear code structure over comments.
    - Handle exceptions appropriately and raise exceptions with clear error messages.
    - Use blank lines to separate logical sections of code, but avoid excessive blank lines.
    - Import modules in a specific order: standard library, third-party, and local imports, separated by blank lines.
    - Use consistent quotes (single or double) for strings throughout the codebase.
    - Follow the PEP 8 style guide for more detailed coding standards and best practices.
"""

PLAN_PROMPT = "Please design coding instructions for the following prompt and provide guidance for the coder to follow."
WRITE_PROMPT = "Please write a Python function that satisfies the prompt and follows the provided guidance."
REVIEW_PROMPT = "Please review the following code and remove any unnecessary markdown or descriptions:\n\n{code}\n"
MODIFY_PROMPT = """
Please generate updated code based on the previous code and the additional request. 
 ### Previous code: \n\n{code}\n
 ### Additional request: \n\n{additional_request}\n
"""
DEBUG_PROMPT = """
please debug the code, fix the error and provide the correctly updated code to satisfy the prompt according to the guidance provided.
 ### code: \n\n {code}\n , ran into the following 
 ### error: \n\n {error}\n
"""

CODER_PROMPTS = {
    "system": GUIDANCE_RESPONSE,
    "plan_code": PLAN_PROMPT,
    "write_code": WRITE_PROMPT,
    "review_code": REVIEW_PROMPT,
    "modify_code": MODIFY_PROMPT,
    "debug_code": DEBUG_PROMPT,
}

def extract_code_blocks(code):
    print("Extracting code blocks...")
    code_blocks = []
    lines = code.split('\n')
    inside_code_block = False
    current_block = []

    for line in lines:
        if line.startswith('```'):
            if inside_code_block:
                code_blocks.append('\n'.join(current_block))
                current_block = []
                inside_code_block = False
            else:
                inside_code_block = True
        elif inside_code_block:
            current_block.append(line)

    if current_block:
        code_blocks.append('\n'.join(current_block))

    print(f"Extracted {len(code_blocks)} code block(s).")
    return '\n\n'.join(code_blocks)

def install_missing_dependencies(required_libraries):
    print("Checking for missing dependencies...")
    missing_libraries = [
        library
        for library in required_libraries
        if not is_library_installed(library)
    ]

    if missing_libraries:
        print(f"Missing libraries: {', '.join(missing_libraries)}")
        for library in missing_libraries:
            print(f"Installing {library}...")
            install_library(library)
        print("Installation completed.")
    else:
        print("All required dependencies are already installed.")

def is_library_installed(library):
    try:
        importlib.import_module(library)
        print(f"{library} is already installed.")
        return True
    except ImportError:
        print(f"{library} is not installed.")
        return False

def install_library(library):
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", library])
        print(f"Successfully installed {library}.")
    except subprocess.CalledProcessError as e:
        print(f"Error occurred while installing {library}: {str(e)}")
        print("Please check the error message and ensure you have the necessary permissions to install packages.")
        print("You may need to run the script with administrative privileges or use a virtual environment.")

class Coder:
    def __init__(self, prompts=None, session=None, session_kwargs=None, required_libraries=None):
        print("Initializing Coder...")
        self.prompts = prompts or CODER_PROMPTS
        self.session = session or self._create_session(session_kwargs)
        self.required_libraries = required_libraries or ["lionagi"]
        print("Coder initialized.")

    def _create_session(self, session_kwargs=None):
        print("Creating session...")
        session_kwargs = session_kwargs or {}
        session = Session(system=self.prompts['system'], **session_kwargs)
        print("Session created.")
        return session

    def _set_up_interpreter(self, interpreter_provider="e2b", key_scheme=E2B_KEY_SCHEME):
        print(f"Setting up interpreter with provider: {interpreter_provider}")
        if interpreter_provider == "e2b":
            SysUtil.check_import("e2b_code_interpreter")
            from e2b_code_interpreter import CodeInterpreter

            api_key = getenv(key_scheme)
            print(f"Using API key: {api_key}")
            return CodeInterpreter(api_key=api_key)
        else:
            raise ValueError("Invalid interpreter provider")

    async def _plan_code(self, context):
        print("Planning code...")
        plans = await self.session.chat(self.prompts["plan_code"], context=context)
        print("Code planning completed.")
        return plans

    async def _write_code(self, context=None):
        print("Writing code...")
        code = await self.session.chat(self.prompts["write_code"], context=context)
        print("Code writing completed.")
        return extract_code_blocks(code)

    async def _review_code(self, context=None):
        print("Reviewing code...")
        code = await self.session.chat(self.prompts["review_code"], context=context)
        print("Code review completed.")
        return code

    async def _modify_code(self, context=None):
        print("Modifying code...")
        code = await self.session.chat(self.prompts["modify_code"], context=context)
        print("Code modification completed.")
        return code

    async def _debug_code(self, context=None):
        print("Debugging code...")
        code = await self.session.chat(self.prompts["debug_code"], context=context)
        print("Code debugging completed.")
        return code

    def _handle_execution_error(self, execution, required_libraries=None):
        print("Handling execution error...")
        if execution.error and execution.error.name == 'ModuleNotFoundError':
            print("ModuleNotFoundError detected. Installing missing dependencies...")
            install_missing_dependencies(required_libraries)
            print("Dependencies installed. Retrying execution.")
            return "try again"
        elif execution.error:
            print(f"Execution error: {execution.error}")
            return execution.error

    def execute_code(self, code, **kwargs):
        print("Executing code...")
        interpreter = self._set_up_interpreter()
        with interpreter as sandbox:
            print("Running code in sandbox...")
            execution = sandbox.notebook.exec_cell(code, **kwargs)
            error = self._handle_execution_error(execution, required_libraries=kwargs.get('required_libraries'))
            if error == "try again":
                print("Retrying code execution...")
                execution = sandbox.notebook.exec_cell(code, **kwargs)
            print("Code execution completed.")
            return execution

async def main():
    print("Starting main function...")
    coder = Coder()

    code_prompt = '''
    write a pure python function that takes a list of integers and returns the sum of all the integers in the list. write a couple tests as well
    '''

    print(f"Code prompt: {code_prompt}")

    print("Planning code...")
    code_plan = await coder._plan_code(context=code_prompt)
    print("Code plan generated.")

    print("Writing code...")
    code = await coder._write_code()
    print("Code written.")

    print("Executing code...")
    execution_result = coder.execute_code(code)
    print("Code execution completed.")

    from IPython.display import Markdown

    print("Displaying code plan...")
    Markdown(code_plan)

    print("Displaying generated code...")
    print(code)

    print("Displaying execution result...")
    print(execution_result)

    print("Main function completed.")

if __name__ == "__main__":
    print("Running script...")
    asyncio.run(main())
    print("Script execution completed.")
