# Install required libraries
!pip install litellm openinterpreter

# Import libraries
import os
from google.colab import secrets, files, drive
from litellm import LiteLLM
from taxcalc import *
import subprocess
import json
import taxcalc_accounts_api as tcapi
import taxcalc_return_api as trapi
from openinterpreter import OpenInterpreter

# Mount Google Drive
drive.mount('/content/drive')

# Set up OpenAI API key using Colab secrets
os.environ["OPENAI_API_KEY"] = secrets.get('OPENAI_API_KEY')

# Initialize LiteLLM with GPT-3.5 model
llm = LiteLLM(model_name="gpt-3.5-turbo", max_tokens=16000)

# Define taxcalc variables and descriptions
taxcalc_variables = {
    "Tax Calculation Variables": {
        "Income tax liability": "Total income tax owed by an individual or business",
        "Payroll tax liability": "Total payroll taxes owed, including Social Security and Medicare taxes",
        "Marginal tax rates": "Tax rate applied to the next dollar of income",
        "Tax deductions and credits": "Reductions to taxable income or tax liability",
        "Tax reforms and policy changes": "Modifications to tax laws and parameters",
        "Revenue effects of tax changes": "Impact of tax reforms on government revenue",
        "Distributional analysis by income group": "Tax impact across different income levels"
    },
    "Data Management Variables": {
        "Input data sources": "Data inputs for tax analysis, such as surveys or administrative data",
        "Output data formats": "Data formats for exporting results, such as CSV or JSON",
        "Data cleaning and preprocessing": "Preparing and transforming input data for analysis",
        "Data merging and splitting": "Combining or separating datasets based on specific criteria",
        "Data validation and error handling": "Checking data integrity and handling anomalies"
    },
    "Tax Form Variables": {
        "Individual tax forms": "Tax forms for individual taxpayers, such as Form 1040",
        "Business tax forms": "Tax forms for businesses, such as Form 1120",
        "Information returns": "Forms for reporting income and transactions, such as W-2 or 1099",
        "State and local tax forms": "Tax forms specific to state and local jurisdictions",
        "Form field mappings and calculations": "Mapping data to tax form fields and calculating values"
    },
    "Tax Filing Variables": {
        "E-filing status and tracking": "Electronic filing status and progress tracking",
        "Tax return validation results": "Results of validating tax returns for errors or inconsistencies",
        "E-file document generation": "Generating electronic filing documents and attachments",
        "Submission status to tax authorities": "Status of tax return submission to relevant authorities"
    },
    "Parameter Variables": {
        "start_year": "First year for calculating tax results",
        "num_years": "Number of years to calculate tax results",
        "last_known_year": "Last known year for tax law parameters",
        "removed": "Parameters that have been removed",
        "redefined": "Parameters that have been redefined",
        "wage_indexed": "Parameters that are wage-indexed",
        "EITC_c": "Earned Income Tax Credit (EITC) parameters",
        "SS_Earnings_c": "Social Security earnings cap"
    },
    "Behavioral Response Variables": {
        "Elasticity of taxable income": "Responsiveness of taxable income to tax rate changes",
        "Elasticity of labor supply": "Responsiveness of labor supply to tax rate changes",
        "Elasticity of capital gains realizations": "Responsiveness of capital gains realizations to tax rate changes",
        "Elasticity of charitable giving": "Responsiveness of charitable giving to tax rate changes"
    },
    "State Tax Variables": {
        "State income tax rates and brackets": "Income tax rates and brackets for each state",
        "State sales tax rates": "Sales tax rates for each state",
        "State EITC parameters": "State-specific Earned Income Tax Credit parameters",
        "State-specific deductions and credits": "Deductions and credits specific to each state"
    },
    "Open-Interpreter Variables": {
        "Python code snippets": "Python code for custom tax analysis and calculations",
        "JavaScript code snippets": "JavaScript code for web-based tax applications",
        "Shell scripts": "Shell scripts for automating tax-related tasks",
        "SQL queries": "SQL queries for accessing and manipulating tax data",
        "R scripts": "R scripts for statistical analysis of tax data",
        "File paths for reading and writing": "File paths for input and output data",
        "Directory paths for file management": "Directory paths for organizing tax-related files",
        "Package dependencies for installation": "Python packages required for tax analysis",
        "API endpoints and authentication credentials": "API endpoints and credentials for accessing external tax services"
    }
}

# Define function to query LLM with chat memory
def query_llm(prompt, chat_history=[]):
  # Append taxcalc variables and descriptions to the chat history
  variables_prompt = "Here are the available taxcalc variables and their descriptions:\n\n"
  for category, variables in taxcalc_variables.items():
    variables_prompt += f"Category: {category}\n"
    for variable, description in variables.items():
      variables_prompt += f"- {variable}: {description}\n"
    variables_prompt += "\n"
  
  chat_history.append(("system", variables_prompt))
  
  response = llm.chat_completion(prompt, chat_history)
  chat_history.append((prompt, response))
  return response, chat_history

# Define function to generate dynamic guidance prompt 
def generate_guidance_prompt(user_query, service_type):
  prompt = f"""
  You are an AI assistant to help use the taxcalc Python library.
  The user is interested in {service_type}.
  Based on their query: {user_query}, provide guidance on which
  taxcalc capabilities to use and how to use them for this service type. 
  Refine the query if needed. Respond with a clear prompt to guide the user.
  """
  return prompt

# Define function to execute taxcalc based on LLM guidance
def execute_taxcalc(guidance):
  # 1. Use the taxcalc Python package API directly
  def use_taxcalc_api(guidance):
    # Parse the guidance to extract taxcalc parameters and reforms
    params, reforms = parse_guidance(guidance)
    
    # Create Policy and Records objects
    policy = Policy()
    records = Records() 

    # Apply the reforms to the Policy object
    policy.implement_reform(reforms)

    # Create a Calculator using the Policy and Records  
    calc = Calculator(policy=policy, records=records)

    # Advance the Calculator to the target year
    calc.advance_to_year(params['year'])

    # Compute the tax liabilities
    calc.calc_all()

    # Extract the results 
    income_tax = calc.weighted_total('iitax')
    payroll_tax = calc.weighted_total('payrolltax')

    # Return the results as a dictionary
    results = {
      'income_tax': income_tax,
      'payroll_tax': payroll_tax
    }

    return results

  # 2. Call the simtax.py command-line interface  
  def use_simtax_cli(guidance):
    # Parse the guidance to get the tax policy parameters
    params = parse_guidance(guidance)

    # Construct the simtax.py command with the parameters
    command = f"simtax.py --reform {params['reform']} --year {params['year']}"

    # Use subprocess.run() to execute simtax.py and capture the output
    result = subprocess.run(command, shell=True, capture_output=True, text=True)

    # Parse the output and return the results
    output_lines = result.stdout.strip().split('\n')
    output_data = [json.loads(line) for line in output_lines]

    return output_data

  # 3. Integrate with TaxCalc's accounts production software
  def use_taxcalc_accounts(guidance):
    # Use TaxCalc's API to get trial balance data
    trial_balance = tcapi.get_trial_balance()

    # Create Records object from the trial balance
    records = Records(data=trial_balance)

    # Parse the guidance to extract taxcalc parameters and reforms
    params, reforms = parse_guidance(guidance)

    # Create Policy object and apply the reforms  
    policy = Policy()
    policy.implement_reform(reforms)

    # Create Calculator and compute tax liabilities
    calc = Calculator(policy=policy, records=records)
    calc.advance_to_year(params['year'])
    calc.calc_all()

    # Get the results
    results = calc.dataframe(['iitax', 'payrolltax'])

    # Export the results back to TaxCalc Accounts Production
    tcapi.update_accounts(results)

    return results

  # 4. Utilize TaxCalc's tax return production features  
  def use_taxcalc_return(guidance):
    # Parse the guidance to extract data for the tax forms
    form_data = parse_guidance(guidance)

    # Dynamically populate the relevant tax forms in TaxCalc
    trapi.populate_forms(form_data)

    # Validate the return using TaxCalc's built-in tax logic
    validation_result = trapi.validate_return()

    if validation_result['is_valid']:
      # Generate detailed calculation reports and summaries
      calculation_report = trapi.generate_calculation_report()
      tax_summary = trapi.generate_tax_summary()

      # Optionally e-file the return with HMRC
      if form_data['efile']:
        filing_result = trapi.efile_return()
      else:
        filing_result = None
    else:
      calculation_report = None 
      tax_summary = None
      filing_result = None

    # Return the results
    results = {
      'calculation_report': calculation_report, 
      'tax_summary': tax_summary,
      'filing_result': filing_result,
      'validation_result': validation_result
    }

    return results

  # 5. Provide a generic interface to execute arbitrary Python code
  def execute_arbitrary_code(guidance):
    # Extract the Python code from the guidance
    code = extract_code(guidance)

    # Extract any file uploads from the guidance
    uploaded_files = extract_uploaded_files(guidance)

    # Extract any package dependencies from the guidance 
    dependencies = extract_dependencies(guidance)

    # Use open-interpreter to install dependencies and execute code
    interpreter = OpenInterpreter()
    
    for file_path, file_content in uploaded_files.items():
      interpreter.write_file(file_path, file_content)
    
    for package in dependencies:
      interpreter.install(package)

    output, result = interpreter.execute(code)

    # Capture output files written by the code
    output_files = interpreter.list_files()

    # Return output, result, and output files
    return output, result, output_files

  # Parse the guidance to determine which execution method to use
  execution_method = determine_execution_method(guidance)

  if execution_method == 'taxcalc_api':
    return use_taxcalc_api(guidance)
  elif execution_method == 'simtax_cli':
    return use_simtax_cli(guidance)  
  elif execution_method == 'taxcalc_accounts':
    return use_taxcalc_accounts(guidance)
  elif execution_method == 'taxcalc_return':
    return use_taxcalc_return(guidance)
  else:
    return execute_arbitrary_code(guidance)

# Set up Colab UI widgets 
service_type = widgets.Dropdown(
    options=['Personal Tax', 'Business Tax', 'Advanced Analytics', 'Other Services'],
    description='Service Type:',
)

user_query = widgets.Text(placeholder="Enter your tax policy query")
guidance_output = widgets.Output()
taxcalc_output = widgets.Output()

def on_query_click(b):
  query = user_query.value
  service = service_type.value
  
  # Generate guidance prompt and query LLM
  guidance_prompt = generate_guidance_prompt(query, service)
  guidance, chat_history = query_llm(guidance_prompt)
  
  with guidance_output:
    print(guidance)

  # Execute taxcalc based on guidance  
  result = execute_taxcalc(guidance)

  with taxcalc_output:
    print(result)

query_button = widgets.Button(description="Submit Query")
query_button.on_click(on_query_click)

# Organize options in a grid
grid = widgets.GridspecLayout(3, 3)

# Personal Tax options
personal_tax_info = widgets.HTMLMath(
    value="<b>Personal Tax</b><br>Compute individual income tax, marginal rates, etc.",
)
grid[0, 0] = personal_tax_info

# Business Tax options  
business_tax_info = widgets.HTMLMath(
    value="<b>Business Tax</b><br>Compute corporate income tax, deductions, etc.",
)
grid[0, 1] = business_tax_info

# Advanced Analytics options
advanced_analytics_info = widgets.HTMLMath(
    value="<b>Advanced Analytics</b><br>Distributional analysis, revenue scoring, etc.",  
)
grid[1, 0] = advanced_analytics_info

# Other Services options
other_services_info = widgets.HTMLMath(
    value="<b>Other Services</b><br>Tax reform analysis, custom scenarios, etc.",
)
grid[1, 1] = other_services_info

grid[2, 0] = service_type
grid[2, 1] = user_query
grid[2, 2] = query_button

display(grid)
display(guidance_output)  
display(taxcalc_output)

# Add visualization of taxcalc results
def visualize_results(results):
  # Placeholder for visualization code
  pass

# Add ability to configure and manage taxcalc 
def configure_taxcalc():
  print("TaxCalc Configuration")
  print("---------------------")

  # Load existing configuration from file
  config_file = "taxcalc_config.txt"
  if os.path.exists(config_file):
    with open(config_file, "r") as file:
      config = json.load(file)
    start_year = config.get("start_year", 2023)
    num_years = config.get("num_years", 10)
    reform_file = config.get("reform_file", "")
    data_file = config.get("data_file", "")
    output_dir = config.get("output_dir", "")
  else:
    start_year = 2023
    num_years = 10
    reform_file = ""
    data_file = ""
    output_dir = ""

  # Display current configuration  
  print("Current Configuration:")
  print(f"  Start Year: {start_year}")
  print(f"  Number of Years: {num_years}")
  print(f"  Reform File: {reform_file}")
  print(f"  Data File: {data_file}")
  print(f"  Output Directory: {output_dir}")

  # Prompt for configuration changes
  while True:
    print("\nConfiguration Options:")
    print("1. Set Start Year")
    print("2. Set Number of Years")
    print("3. Set Reform File")
    print("4. Set Data File")
    print("5. Set Output Directory")
    print("6. Save Configuration")
    print("7. Exit")

    config_choice = input("Enter your choice: ")

    if config_choice == '1':
      start_year = int(input("Enter the start year: "))
    elif config_choice == '2':
    if config_choice == '1':
      start_year = int(input("Enter the start year: "))
    elif config_choice == '2':
      num_years = int(input("Enter the number of years: "))
    elif config_choice == '3':
      reform_file = input("Enter the path to the reform file: ")
    elif config_choice == '4':
      data_file = input("Enter the path to the data file: ")
    elif config_choice == '5':
      output_dir = input("Enter the output directory: ")
    elif config_choice == '6':
      # Save the configuration to a file
      config = {
        "start_year": start_year,
        "num_years": num_years,
        "reform_file": reform_file,
        "data_file": data_file,
        "output_dir": output_dir
      }
      with open("taxcalc_config.txt", "w") as file:
        json.dump(config, file)
      print("Configuration saved successfully!")
    elif config_choice == '7':
      break
    else:
      print("Invalid choice. Please try again.")

  print("Returning to main menu...")

# Implement a text-based UI to navigate options
while True:
  print("Select an option:")
  print("1. Enter tax policy query")
  print("2. View chat history") 
  print("3. Configure taxcalc")
  print("4. Quit")

  choice = input("Enter your choice: ")
  
  if choice == '1':
    query = input("Enter your tax policy query: ")
    service = input("Select service type (Personal Tax, Business Tax, Advanced Analytics, Other Services): ")
    
    guidance_prompt = generate_guidance_prompt(query, service)
    guidance, chat_history = query_llm(guidance_prompt, chat_history)
    
    print(f"Guidance: {guidance}")
    
    result = execute_taxcalc(guidance)
    print(f"Result: {result}")
    
    visualize_results(result)

  elif choice == '2':
    print("Chat History:")
    for prompt, response in chat_history:
      print(f"User: {prompt}")
      print(f"Assistant: {response}")
      print()
  
  elif choice == '3':
    configure_taxcalc()
  
  elif choice == '4':
    print("Exiting...")
    break
  
  else:
    print("Invalid choice. Please try again.")