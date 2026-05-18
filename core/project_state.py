class ProjectState:

    def __init__(
        self,
        project_name="",
        project_type="",
        run_command=""
    ):

        self.project_name = project_name
        self.project_type = project_type
        self.run_command = run_command

        self.dependencies = []
        self.generated_files = []

    def set_dependencies(
        self,
        dependencies
    ):

        self.dependencies = dependencies

    def add_generated_file(
        self,
        file_path
    ):

        self.generated_files.append(
            file_path
        )

    def to_dict(self):

        return {
            "project_name": self.project_name,
            "project_type": self.project_type,
            "run_command": self.run_command,
            "dependencies": self.dependencies,
            "generated_files": self.generated_files
        }