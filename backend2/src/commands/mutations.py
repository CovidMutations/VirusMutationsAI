from src.core.mutation import MutationCoreService

mutation_service = MutationCoreService()


def add_mutation_mappings(file, header=False, delimiter=","):
    mutation_service.add_mutation_mappings_from_csv(file, header, delimiter)
