import asyncio
import os
from dotenv import load_dotenv
from lionagi import Session
from e2b_code_interpreter import CodeInterpreter

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
E2B_API_KEY = os.getenv("E2B_API_KEY")

system_prompt = "You are a helpful Python coding assistant."

async def generate_code(instruction):
    print(f"Generating code for: {instruction}")
    
    guidance_response = """
    Guidance from super intelligent code bot:
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
    
    coder = Session(system_prompt)
    code_result = await coder.chat(f"""
    {instruction}
    
    {guidance_response}
    Please generate a Python function that satisfies the prompt and follows the provided guidance.
    """)
    print("Generated code:")
    print(code_result)
    return code_result

async def execute_code(code):
    print("Executing code in sandbox...")
    with CodeInterpreter(api_key=E2B_API_KEY) as sandbox:
        sandbox.notebook.exec_cell(code)
        
        print("Executing test code...")
        execution = sandbox.notebook.exec_cell("""
from typing import List, Optional
from experiments.directive.base_tokenizer import BaseToken
from experiments.directive.schema import IfNode, TryNode, ForNode

tokenizer = BaseTokenizer("IF x > 10 THEN DO something ENDIF")
tokens = tokenizer.get_tokens()
parser = BaseParser(tokens)
print(parser.current_token)
        """)
        
        print("Test execution output:")
        print(execution.text)

async def main():
    instruction = """
Implement a Python class called BaseParser that provides a base parser with lookahead, error recovery, and backtracking support. The class should have the following attributes and methods:

Attributes:
- tokens (List[BaseToken]): A list of tokens to be parsed.
- current_token_index (int): The index of the current token in the tokens list.
- current_token (Optional[BaseToken]): The current token being processed.

Methods:
- __init__(self, tokens: List[BaseToken]): Initializes the parser with the given list of tokens.
- next_token(self) -> None: Advances to the next token in the list.
- peek_next_token(self, offset: int = 1) -> BaseToken | None: Peeks at the next token without consuming it.
- skip_until(self, token_types: List[str]) -> None: Skips tokens until a token of the specified type is found.
- mark(self) -> int: Marks the current position in the token list for potential backtracking.
- reset_to_mark(self, mark: int) -> None: Resets the parser to a previously marked position.
- skip_semicolon(self): Skips a semicolon token if present.
- parse_expression(self): Parses an expression until a semicolon is encountered.
- parse_if_block(self): Parses an IF block until 'ELSE' or 'ENDIF' is encountered.
- parse_if_statement(self): Parses an IF statement and returns an IfNode.
- parse_for_statement(self): Parses a FOR statement and returns a ForNode.
- parse_for_block(self): Parses a FOR block until 'ENDFOR' is encountered.
- parse_try_statement(self): Parses a TRY statement and returns a TryNode.
- parse_try_block(self, stop_keyword): Parses a TRY block until the specified stop keyword is encountered.

The class should handle the following syntax:
- IF condition1 && condition2; DO action2; ELSE; DO action3; ENDIF;
- FOR input_ IN collections; DO action(input_); ENDFOR;
- TRY; DO action(); EXCEPT; DO action(input_); ENDTRY;
"""
    code = await generate_code(instruction)
    await execute_code(code)

if __name__ == "__main__":
    asyncio.run(main())
