import json
import os
import re

from models.ollama_client import OllamaClient

from tools.project_tool import ProjectTool

from models.project_state import ProjectState


class CodingAgent:

    MODEL = "deepseek-coder-v2:lite"

    @staticmethod
    def extract_json(text):

        match = re.search(
            r"```json(.*?)```",
            text,
            re.DOTALL
        )

        if match:
            text = match.group(1)

        return json.loads(text)

    @staticmethod
    def execute(user_prompt):

        print(
            "\n[{}] Creating project plan...\n".format(
                __import__("datetime").datetime.now()
            )
        )

        planner_prompt = f"""
You are an expert software architect.

Generate ONLY valid JSON.

DO NOT write explanations.
DO NOT write markdown outside JSON.

JSON FORMAT:

{{
    "project_name": "",
    "project_type": "",
    "run_command": "",
    "dependencies": [],
    "files": [
        {{
            "path": "",
            "description": ""
        }}
    ]
}}

RULES:
- dependencies must contain ONLY real installable packages
- never include Python
- never include Node
- never include programming languages
- never include generic words
- all dependencies must be valid pip/npm packages

USER REQUEST:
{user_prompt}
"""

        raw_response = OllamaClient.stream_generate(
            model=CodingAgent.MODEL,
            prompt=planner_prompt
        )

        print("\nRAW RESPONSE:\n")
        print(raw_response)

        try:

            plan = CodingAgent.extract_json(
                raw_response
            )

        except Exception as e:

            return {
                "success": False,
                "message": f"Failed parsing project plan: {str(e)}"
            }

        project_name = plan.get(
            "project_name",
            "generated_project"
        )

        project_type = plan.get(
            "project_type",
            ""
        )

        run_command = plan.get(
            "run_command",
            ""
        )

        dependencies = plan.get(
            "dependencies",
            []
        )

        files = plan.get(
            "files",
            []
        )

        workspace = r"E:\Helix_Projects"

        os.makedirs(
            workspace,
            exist_ok=True
        )

        state = ProjectState(
            project_name=project_name,
            project_type=project_type,
            run_command=run_command
        )

        valid_dependencies = []

        invalid_dependencies = [
            "python",
            "node",
            "javascript",
            "typescript",
            "react",
            "application",
            "general purpose",
            "general purpose application"
        ]

        for dependency in dependencies:

            dependency = dependency.strip()

            if dependency.lower() in invalid_dependencies:
                continue

            valid_dependencies.append(
                dependency
            )

        state.set_dependencies(
            valid_dependencies
        )

        project_path = ProjectTool.create_project(
            workspace,
            project_name
        )

        print(
            f"\n[{__import__('datetime').datetime.now()}] Project created at {project_path}\n"
        )

        ProjectTool.create_folder_structure(
            project_path,
            files
        )

        for file in files:

            file_path = file["path"]

            description = file["description"]

            print(
                f"[{__import__('datetime').datetime.now()}] Generating {file_path}...\n"
            )

            generation_prompt = f"""
Generate complete production-ready code.

PROJECT TYPE:
{project_type}

FILE:
{file_path}

DESCRIPTION:
{description}

USER REQUEST:
{user_prompt}

IMPORTANT:
- Return ONLY raw code
- No markdown
- No explanations
- No code fences
"""

            generated_code = OllamaClient.stream_generate(
                model=CodingAgent.MODEL,
                prompt=generation_prompt
            )

            generated_code = generated_code.strip()

            generated_code = re.sub(
                r"^```[a-zA-Z]*",
                "",
                generated_code
            )

            generated_code = re.sub(
                r"```$",
                "",
                generated_code
            )

            ProjectTool.write_file(
                project_path,
                file_path,
                generated_code
            )

            state.add_generated_file(
                file_path
            )

        if valid_dependencies:

            print(
                f"[{__import__('datetime').datetime.now()}] Installing dependencies...\n"
            )

            ProjectTool.install_dependencies(
                project_path,
                valid_dependencies
            )

            ProjectTool.create_requirements_file(
                project_path,
                valid_dependencies
            )

        print(
            f"\n[{__import__('datetime').datetime.now()}] Project generation completed.\n"
        )

        return {
            "success": True,
            "message": f"Project created successfully at {project_path}",
            "project_path": project_path,
            "state": state.to_dict()
        }