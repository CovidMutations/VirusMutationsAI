# import logging
import os
import pandas as pd

# Note: the 'logging' module does not work with unit tests for some reason, replaced to 'print' for now
# logging.basicConfig(level=logging.DEBUG)


class VcfParser:
    def __init__(self, expected_vcf_format='##fileformat=VCFv4.2'):
        self.df_vcf = None
        self.expected_vcf_format = expected_vcf_format  # First expected line. May be None to skip the check.

    def read_vcf_file(self, file_name, verbose=False):

        # Check if the file exists
        if not os.path.isfile(file_name):
            raise FileNotFoundError(f"Cannot find the specified file: '{file_name}'")

        # Count number of comment lines at file beginning
        comment_lines_cnt = 0
        with open(file_name, 'r') as f:
            for i, s in enumerate(f):
                # Check the first line (format) if required
                if (i == 0) and (self.expected_vcf_format is not None) and (self.expected_vcf_format != s.strip()):
                    raise ValueError(f"Unexpected first line of file: '{s}' instead of '{self.expected_vcf_format}'. " +
                                     f"To skip this check, reconstruct the class with expected_vcf_format=None")
                if not s.startswith('##'):
                    comment_lines_cnt = i
                    break
        assert comment_lines_cnt > 0  # At least one non-comment line must be present!

        # Read the file into pandas DataFrame
        self.df_vcf = pd.read_csv(file_name, sep='\t', skiprows=comment_lines_cnt)

        # Sanity check
        for col in ['#CHROM', 'POS', 'ID', 'REF', 'ALT']:
            assert col in self.df_vcf.columns, f"Cannot find column '{col}' in the file header: '{self.df_vcf.columns}'"

        if verbose:
            print(f'Success. Loaded data shape: {self.df_vcf.shape}')

    def get_mutations(self, notation=None, verbose=False):
        # Checks
        assert notation is None, 'Currently only None is supported as notation'
        if self.df_vcf is None:
            raise Exception('No VCF data is loaded. Use read_vcf_file first')

        # Remove duplicates (use only major fields, ignoring annotations, etc.)
        df = self.df_vcf[['POS', 'ID', 'REF', 'ALT']].drop_duplicates()
        cnt_duplicates = len(self.df_vcf) - len(df)
        if verbose:
            print(f'Original mutations: {len(self.df_vcf)}, unique: {len(df)}, duplicates removed: {cnt_duplicates}')

        # Return pandas Series object with mutation strings
        mutations_series = df.POS.astype(str) + df.REF + '>' + df.ALT
        return mutations_series

    def write_mutations_to_file(self, output_file, notation=None):
        mutations = self.get_mutations(notation)
        mutations.to_csv(output_file, index=False)
        print(f'Success. Mutations written to file {output_file}')

