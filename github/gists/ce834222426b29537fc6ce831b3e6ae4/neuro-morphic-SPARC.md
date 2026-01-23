---------------------------------------------------------------------------------------------------
PROMPT START
---------------------------------------------------------------------------------------------------

You are tasked with implementing a complex solution using the SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology. Your objective is to solve a symbolic mathematics problem or any similarly complex problem while producing a maintainable, testable, and extensible solution. The final system should be adaptable for various domains, not just symbolic math, but the example will focus on symbolic mathematics to illustrate the approach. Throughout the process, you will integrate self-reflection, iterative refinement, and a test-driven development (TDD) mindset.

**Key Principles and Goals:**

1. **SPARC Methodology Overview:**
   - **Specification:** Clearly define the problem, requirements, constraints, target users, and desired outcomes. Distinguish between functional and non-functional requirements. For symbolic math, detail the classes of expressions, operations, transformations, and simplifications you must handle.
   - **Pseudocode:** Develop a clear, high-level logical outline that captures how the system will process input, perform symbolic manipulations, and produce output. Include how tests will be integrated at every logical step.
   - **Architecture:** Design a robust and extensible architecture. Identify major components (e.g., parser, symbolic expression tree, transformation engine, solver modules), interfaces, data flows, and storage mechanisms. Consider modularity, scalability, and maintainability. Leverage symbolic reasoning structures (e.g., expression trees, rewriting rules) and ensure that the design allows adding new features easily.
   - **Refinement:** Iteratively improve the solution. Use TDD by writing tests for each component before implementation, refining your pseudocode and architecture as you learn from the outcomes. Continuously reflect on design decisions, complexity, and potential optimizations. Incorporate stakeholder or peer feedback and enhance documentation.
   - **Completion:** Finalize the solution with comprehensive testing (unit, integration, and system-level), meticulous documentation, and readiness for deployment. Ensure the final product is stable, well-documented, and meets all specified requirements.

2. **Test-Driven Development (TDD) Integration:**
   - Before implementing any feature, write tests that define the expected behavior (e.g., a test that checks the simplification of symbolic expressions like `(x^2 - x^2)` to `0`).
   - Implement the minimal code to pass these tests.
   - Refactor code to improve quality, maintainability, and performance, re-running tests to ensure nothing is broken.
   - Add regression tests for any bugs found along the way and ensure full coverage for critical paths.

3. **Symbolic Reasoning and Requirements Definition:**
   - **Functional Requirements (Symbolic Math Example):**
     - The system should parse mathematical expressions from textual input (e.g., "x^2 + 2*x + 1") into an internal symbolic representation.
     - It should provide operations like simplification, differentiation, integration, factorization, and substitution.
     - It must handle common algebraic rules, symbolic constants, and basic numeric evaluation.
   - **Non-Functional Requirements:**
     - The solution should be efficient for reasonably large expressions.
     - It should be modular, allowing easy addition of new mathematical rules or operations.
     - It should be documented with clear instructions for extending and maintaining the system.
   - **Symbolic Reasoning:**
     - Define symbolic transformation rules and represent them as rewrite rules or functions.
     - Identify simplification patterns (e.g., `a+a = 2*a`, `(x^n)*(x^m) = x^(n+m)`, `(x^2 - x^2) = 0`).
     - Ensure the logic supports symbolic variables, parameters, and constants.

4. **Self-Reflection Steps:**
   - After specifying requirements, pause and reflect:
     - Are all user scenarios accounted for?
     - Is the scope of the problem well-defined and realistic?
     - Have you considered performance and complexity constraints?
   - After drafting pseudocode and architecture:
     - Re-examine the flow and check if any complexities can be reduced.
     - Reflect on whether the chosen data structures are optimal for the operations you must support.
   - During Refinement:
     - Reflect on test results. Are there patterns in bugs or failures indicating a design flaw?
     - Are certain components overly complex and in need of refactoring?
     - Does the code remain understandable and maintainable as features are added?
   - At Completion:
     - Reflect on whether all requirements are met.
     - Consider future maintainers: Is the documentation sufficient for someone new to the project?
     - Think about what lessons can be learned for the next project.

5. **Iterative Improvement:**
   - Start from a simple set of symbolic operations (e.g., parsing and basic simplification).
   - Once tests for these basic features pass, incrementally add complexity (differentiation, factorization) while maintaining passing tests.
   - Regularly revisit requirements and architecture to ensure alignment with evolving understanding of the problem.

6. **Generic Adaptability:**
   - Although the example focuses on symbolic math, the same methodology applies to other domains:
     - For a machine learning pipeline, define components for data ingestion, feature extraction, model training, and evaluation.
     - For an enterprise workflow system, define modules for task management, user authentication, and reporting.
   - Emphasize modular design: The underlying architectural principles should remain applicable across domains.

7. **Detailed SPARC Steps:**

   **Specification:**
   - Clearly document all mathematical rules, input/output formats, user roles, and expected performance criteria.
   - Write down a set of user stories (e.g., "As a user, I want to input a polynomial and get a simplified version as output").
   - Define constraints (supported operators, function classes, symbolic constants).

   **Pseudocode:**
   - Draft a high-level pseudocode snippet for core workflows:
     - Parsing: `parse(input_str) -> expression_tree`
     - Simplification: `simplify(expression_tree) -> simplified_expression_tree`
     - Evaluate Tests: `run_all_tests()`
     - Each pseudocode segment should be annotated with comments explaining reasoning steps.

   **Architecture:**
   - Identify key classes (e.g., `ExpressionNode`, `OperatorNode`, `FunctionNode`, `Parser`, `Transformer`, `TestSuite`).
   - Define data flow: Input String -> Parser -> Expression Tree -> Transformer -> Output String
   - Consider external libraries for symbolic math if allowed, or ensure extensibility for adding them later.
   - Include testing infrastructure as a core component (e.g., `tests/` directory with unit tests for parser, transformer, etc.).

   **Refinement:**
   - Implement the parser first; write tests for basic parsing cases.
   - Add a few simplification rules and write tests. If a test fails, adjust pseudocode and logic.
   - Gradually incorporate more complex rules (integration, factorization) and continuously refine the architecture to keep code clean and maintainable.
   - Reflect on what can be improved after each iteration and apply those improvements.

   **Completion:**
   - Run full test suites, ensure all pass.
   - Validate that documentation (user guide, developer guide, API references) is complete and consistent.
   - Prepare for deployment or integration into a larger system.
   - Perform a final self-reflection, noting what worked well and what could be better next time.

**End Result:**
By following this SPARC-based prompt, you will produce a rigorously tested, clearly documented, and easily maintainable system for symbolic mathematics or any similarly complex domain problem. The final solution will embody good software engineering principles, TDD, and continuous reflection, ensuring a robust and scalable outcome.
