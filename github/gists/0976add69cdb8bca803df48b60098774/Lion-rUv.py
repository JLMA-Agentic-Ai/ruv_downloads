import asyncio
import random
import lionagi as li
from typing import Dict, List

templates = {
    "Business Analysis": {
        "context": "Acme Corporation, a leading multinational conglomerate, is actively exploring strategic investment opportunities in emerging technologies to maintain its competitive edge and drive future growth. The board of directors has convened a special committee to conduct a comprehensive analysis of the technological landscape and identify the most promising areas for investment. The committee seeks in-depth insights and recommendations on which cutting-edge technologies have the potential to revolutionize Acme's core industries and create new market opportunities over the next decade.",
        "prompt": "Conduct a thorough evaluation of the potential impact and investment viability of four key emerging technologies: artificial intelligence (AI), blockchain, quantum computing, and biotechnology. For each technology, provide a detailed assessment of its current state of development, major players in the field, and projected market growth. Analyze the specific applications and use cases within Acme's core industries, highlighting the potential benefits, challenges, and disruptions each technology could bring. Consider factors such as scalability, regulatory landscape, talent availability, and competitive dynamics when assessing the investment viability of each technology. Provide clear recommendations on which technologies Acme should prioritize for investment, along with a proposed allocation of resources and a high-level roadmap for integration into the company's existing operations.",
        "guidance": "Provide a comprehensive and well-structured analysis, focusing on delivering clear, concise, and actionable insights. Use industry-specific terminology and cite relevant data and examples to support your recommendations. Maintain an objective and analytical tone throughout the report."
    },
    "Application Planning": {
        "context": "Acme Software Solutions is developing a new web application for task management and collaboration. The application aims to streamline project management processes and enhance team productivity. The development team is in the early stages of the project and seeks guidance on architecting a scalable and maintainable solution.",
        "prompt": "Design a high-level architecture for the task management and collaboration web application. Consider factors such as user authentication, data storage, real-time updates, and integration with third-party services. Provide recommendations on the choice of frontend and backend technologies, along with a justification for each selection. Outline the key components of the application, including the user interface, database schema, and API endpoints. Discuss potential challenges and propose strategies for addressing them, such as performance optimization, security considerations, and error handling. Finally, provide a roadmap for the development process, including milestones and deliverables.",
        "guidance": "Provide a clear and concise architectural overview, focusing on the key design decisions and their rationale. Use technical terminology and diagrams where appropriate to illustrate the system architecture. Ensure that the recommendations align with industry best practices and consider the long-term maintainability and scalability of the application."
    },
    "Source Code Generation": {
        "context": "The development team at Acme Software Solutions is tasked with automating parts of their workflow, specifically focusing on generating source code for repetitive tasks and common software patterns. The team aims to enhance productivity and reduce manual coding errors.",
        "prompt": "Create a Python script that automates the generation of source code for a simple REST API. The API should support basic CRUD (Create, Read, Update, Delete) operations for managing user information. Consider aspects such as request handling, response formatting, and data storage. Include error handling and input validation to ensure the robustness of the API. Provide comments within the code to explain the functionality and decisions made during development.",
        "guidance": "Ensure the source code is clean, modular, and follows Python best practices. Use appropriate libraries and frameworks, such as Flask or FastAPI, to simplify the implementation. Structure the code to allow for easy extension and maintenance. Include detailed comments to aid understanding and future development. The final script should offer a clear example of how to structure a basic REST API in Python, serving as a template for further customization and expansion."
    },
    "SQL Generation": {
        "context": "The analytics team at Acme Corporation needs to frequently extract insights from their customer database. To streamline their analysis, they require an automated solution for generating SQL queries based on specific analytical requirements. This solution should accommodate various types of queries, such as data retrieval, aggregation, and filtering based on dynamic inputs.",
        "prompt": "Develop a Python function that generates SQL queries for extracting user data from a 'customers' table. The function should accept parameters for selecting fields, setting conditions, and defining aggregation operations (e.g., COUNT, AVG). For example, if the user needs to find the average age of users in New York, the function should produce the appropriate SQL query. Include error handling to manage invalid inputs and ensure the generated SQL is valid and efficient.",
        "guidance": "Focus on creating a flexible and robust function capable of handling a variety of query requirements. Ensure the function is well-documented, with examples demonstrating how to call it with different parameters. Use string formatting or templating libraries like Jinja2 to construct the SQL queries dynamically. Incorporate best practices for avoiding SQL injection vulnerabilities, such as using parameterized queries. The output should be an executable SQL query string, ready for use with a database connection."
    },
    "Story Creation": {
        "context": "Acme Publishing House is seeking fresh and engaging story ideas for its upcoming anthology series. The anthology will feature short stories across various genres, including science fiction, fantasy, mystery, and romance. The editorial team is looking for unique and captivating storylines that will resonate with a diverse audience.",
        "prompt": "Generate a collection of five original story ideas, each belonging to a different genre. For each story idea, provide a brief synopsis that captures the main plot, characters, and themes. The stories should have compelling hooks, well-developed protagonists, and unexpected twists. Consider the target audience for each genre and tailor the stories accordingly. Provide a title for each story and a short explanation of why it would be a good fit for the anthology. Additionally, suggest potential authors or writing styles that could bring each story to life.",
        "guidance": "Deliver creative and imaginative story ideas that showcase originality and depth. Use vivid descriptions and engaging language to capture the essence of each story. Ensure that the stories have a clear structure and narrative arc, with well-defined conflicts and resolutions. Provide enough detail to give the editorial team a strong sense of each story's potential, while leaving room for further development and interpretation."
    },
    "TV/Movie Script": {
        "context": "Acme Productions is developing a new television series that explores the lives of a group of friends navigating their careers, relationships, and personal growth in a bustling city. The series aims to capture the authentic experiences and challenges faced by young professionals in contemporary society. The writing team is brainstorming ideas for the pilot episode and seeks guidance on crafting a compelling script.",
        "prompt": "Develop a detailed outline for the pilot episode of the television series. Introduce the main characters, their backgrounds, and their relationships with each other. Establish the central conflict or theme that will drive the narrative throughout the episode. Create a series of scenes that showcase the characters' personalities, aspirations, and struggles. Incorporate realistic dialogue and relatable situations that resonate with the target audience. Consider the pacing and structure of the episode, including key moments of tension, humor, and emotional depth. Provide a clear resolution or cliffhanger that sets the stage for future episodes.",
        "guidance": "Craft a script outline that balances character development, plot progression, and thematic exploration. Use a mix of dialogue, action, and description to bring the scenes to life. Ensure that the characters have distinct voices and motivations that fuel their actions and interactions. Pay attention to the overall tone and style of the series, creating a consistent and engaging narrative. Provide enough detail to guide the writing process while allowing room for creative interpretation and collaboration among the writing team."
    }
}

class ExpertModel:
    def __init__(self, model_id: str, metadata: Dict):
        self.model_id = model_id
        self.metadata = metadata
        try:
            # Initialize the service without the model parameter
            self.service = li.Services.OpenAI()
            if hasattr(self.service, 'model'):
                # If the service has a 'model' attribute, set it post-initialization
                self.service.model = self.metadata["model"]
            self.session = li.Session(service=self.service)
        except Exception as e:
            li.logging.error(f"Initialization error for {model_id}: {e}")
            self.service = None
            self.session = None

    async def generate_output(self, context: Dict, prompt: str) -> str:
        if not self.session:
            return "Session not initialized."
        try:
            response = await self.session.chat(prompt, context=context)
            return response
        except Exception as e:
            li.logging.error(f"Error generating output for {self.model_id}: {e}")
            return "Error generating output."
        
class GatingModel:
    def __init__(self, learning_rate: float):
        self.expert_weights = {}
        self.learning_rate = learning_rate

    def update_weights(self, expert_id: str, performance_score: float):
        if expert_id in self.expert_weights:
            self.expert_weights[expert_id] = (1 - self.learning_rate) * self.expert_weights[expert_id] + self.learning_rate * performance_score
        else:
            self.expert_weights[expert_id] = performance_score

    def select_experts(self, experts: List[ExpertModel], context: Dict, k: int) -> List[ExpertModel]:
        if not experts:
            raise ValueError("No experts available to select from.")

        relevance_scores = {}
        for expert in experts:
            weight = self.expert_weights.get(expert.model_id, 1.0)
            relevance = random.random() * weight
            relevance_scores[expert.model_id] = relevance

        selected_expert_ids = sorted(relevance_scores, key=relevance_scores.get, reverse=True)[:k]
        selected_experts = [expert for expert in experts if expert.model_id in selected_expert_ids]

        return selected_experts
    

class RecursiveUnifiedValidators:
    def __init__(self, experts: List[ExpertModel], gating_model: GatingModel, exploration_rate: float):
        self.experts = experts
        self.gating_model = gating_model
        self.exploration_rate = exploration_rate

    async def process_input(self, context: Dict, prompt: str, k: int, iterations: int) -> List[str]:
        print(f"Exploration Rate: {self.exploration_rate}")
        print(f"Selecting experts for context: {context}")
        
        if random.random() < self.exploration_rate:
            print("Exploring: Selecting random experts")
            selected_experts = random.sample(self.experts, k)
        else:
            print("Exploiting: Selecting experts based on gating model")
            selected_experts = self.gating_model.select_experts(self.experts, context, k)

        print(f"Selected Experts: {[expert.model_id for expert in selected_experts]}")

        async def run_iteration(iteration):
            print(f"Iteration {iteration + 1}:")
            outputs = await asyncio.gather(*(expert.generate_output(context, prompt) for expert in selected_experts))
            return " ".join(outputs)

        iteration_results = await asyncio.gather(*(run_iteration(i) for i in range(iterations)))
        return iteration_results5
        

async def main():
    num_experts = 5  # 🤖 Number of Expert Models
    min_iterations = 3  # 🔄 Minimum Number of Iterations
    learning_rate = 0.1  # 📈 Learning Rate
    exploration_rate = 0.2  # 🔍 Exploration Rate

    print(f"Initializing {num_experts} expert models...")
    experts = [
        ExpertModel(model_id=f"expert{i+1}", metadata={"model": "gpt-3.5-turbo"})
        for i in range(num_experts)
    ]
    print(f"Expert Models: {[expert.model_id for expert in experts]}")

    print(f"Initializing gating model with learning rate {learning_rate}...")
    gating_model = GatingModel(learning_rate)
    print("Updating gating model weights...")
    for expert in experts:
        weight = random.uniform(6.0, 9.0)
        gating_model.update_weights(expert.model_id, weight)
        print(f"Updated weight for {expert.model_id}: {weight}")
    print("Gating model initialized and weights updated.")

    print(f"Creating RecursiveUnifiedValidators system with exploration rate {exploration_rate}...")
    rUv_system = RecursiveUnifiedValidators(experts, gating_model, exploration_rate)
    print("RecursiveUnifiedValidators system created.")

    while True:
        print("\nAvailable templates:")
        for i, template_name in enumerate(templates.keys(), start=1):
            print(f"{i}. {template_name}")
        print("0. Enter a custom prompt")

        choice = input("Enter the number of the template you want to use (or 0 for a custom prompt): ")

        if choice == "0":
            print("Custom prompt selected.")
            context_input = input("Enter the context for the custom prompt: ")
            prompt_input = input("Enter the custom prompt: ")
            guidance_input = input("Enter the guidance for the custom prompt: ")

            context = {"topic": "Custom Prompt", "urgency": "high"}
            prompt = f"{context_input}\n\n{prompt_input}\n\n{guidance_input}"
            print("Custom prompt created.")
        else:
            try:
                template_index = int(choice) - 1
                template_name = list(templates.keys())[template_index]
                template_data = templates[template_name]

                context = {"topic": template_name, "urgency": "high"}
                prompt = f"{template_data['context']}\n\n{template_data['prompt']}\n\n{template_data['guidance']}"
                print(f"Template '{template_name}' selected.")
            except (ValueError, IndexError):
                print("Invalid choice. Please try again.")
                continue

        print(f"Processing input for {min_iterations} iterations...")
        for iteration in range(min_iterations):
            print(f"\nIteration {iteration + 1}:")
            print(f"Exploration Rate: {rUv_system.exploration_rate}")
            print(f"Selecting experts for context: {context}")

            if random.random() < rUv_system.exploration_rate:
                print("Exploring: Selecting random experts")
                selected_experts = random.sample(rUv_system.experts, k=min(3, num_experts))
            else:
                print("Exploiting: Selecting experts based on gating model")
                selected_experts = rUv_system.gating_model.select_experts(rUv_system.experts, context, k=min(3, num_experts))

            print(f"Selected Experts: {[expert.model_id for expert in selected_experts]}")
            print("Expert Weights:")
            for expert in selected_experts:
                print(f"- {expert.model_id}: {rUv_system.gating_model.expert_weights[expert.model_id]}")

            print("Generating outputs from selected experts...")
            outputs = await asyncio.gather(*(expert.generate_output(context, prompt) for expert in selected_experts))
            print("Expert Outputs:")
            for i, output in enumerate(outputs, start=1):
                print(f"Expert {i}: {output}")

            combined_output = " ".join(outputs)
            print(f"Combined Output: {combined_output}")
            print()

        choice = input("Do you want to generate another output? (y/n): ")
        if choice.lower() != "y":
            break

    print("Program ended.")

if __name__ == "__main__":
    asyncio.run(main())