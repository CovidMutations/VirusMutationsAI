# import logging
import os
import pandas as pd
import re
from Bio.Data.IUPACData import protein_letters_3to1_extended

# Note: the 'logging' module does not work with unit tests for some reason, replaced to 'print' for now
# logging.basicConfig(level=logging.DEBUG)


COL__INFO = 'INFO'


class VcfParser:
    """
    Class for loading and parsing specified VCF file, with ability to extract mutations.
    """
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

    @staticmethod
    def convert_protein_mutations_from_3_to_1_letters(muts: [list, set]):
        new_muts = []
        for mut in muts:
            m = re.match(r"p\.(?P<acid1>[A-Z][a-z][a-z])(?P<pos>\d+)(?P<acid2>[A-Z][a-z][a-z])", mut)
            try:
                assert m, "Unexpected format! Good example: 'p.Ser3Ser"
                acid1 = m['acid1']
                acid2 = m['acid2']
                assert acid1 in protein_letters_3to1_extended, f'Cannot recognize acid1: {acid1}'
                assert acid2 in protein_letters_3to1_extended, f'Cannot recognize acid2: {acid2}'
                new_acid1 = protein_letters_3to1_extended[acid1]
                new_acid2 = protein_letters_3to1_extended[acid2]
                new_mut = f"p.{new_acid1}{m['pos']}{new_acid2}"
                new_muts.append(new_mut)
            except AssertionError as e:
                raise ValueError(f"Error while parsing protein mutation '{mut}': {e}")
        return new_muts

    @staticmethod
    def _extract_protein_mutations(info_text):
        """
        Example: QNAME=hCoV-19...;QSTART=274;QSTRAND=+;ANN=
        T|synonymous_variant|LOW|ORF1ab|GU280_gp01|transcript|GU280_gp01|
        protein_coding|1/2|c.9C>T|p.Ser3Ser|9/21291|9/21291|3/7096||,
        T|synonymous_variant|LOW|ORF1ab|GU280_gp01|transcript|YP_009725297.1|
        protein_coding|1/1|c.9C>T|p.Ser3Ser|9/540|9/540|3/179||WARNING_TRANSCRIPT_NO_STOP_CODON,
        ...,
        T|upstream_gene_variant|MODIFIER|ORF1ab|GU280_gp01|transcript|YP_009742610.1|
        protein_coding||c.-2446C>T|||||2446|WARNING_TRANSCRIPT_NO_START_CODON
        """
        # Use regexp to find nucleotide mutations (for future use) and protein mutations
        res_list = []
        # for m in re.findall(r"protein_coding\|\d+/\d+\|(?P<nuc_mut>[c.\dACGT>]*)\|(?P<prot_mut>[^|]*)", info_text):
        for m in re.finditer(r"protein_coding\|\d+/\d+\|(?P<nuc_mut>[c.\dACGT>]*)\|(?P<prot_mut>[^|]*)", info_text):
            res_list.append(m.group('prot_mut'))
        return res_list

    def get_protein_mutations(self, verbose=False):
        # Checks
        if self.df_vcf is None:
            raise Exception('No VCF data is loaded. Use read_vcf_file first')
        if COL__INFO not in self.df_vcf.columns:
            raise Exception(f"Cannot find column '{COL__INFO}' in the file header: '{self.df_vcf.columns}'")

        # For each row - extract information text and parse it
        found_muts = set()
        for i, (_, row) in enumerate(self.df_vcf.iterrows()):
            muts = self._extract_protein_mutations(row[COL__INFO])
            if verbose:
                print(f'DBG: processing row {i}. Found muts: {muts}')
            found_muts.update(muts)
        if verbose:
            print(f'DBG: total number of found muts: {len(found_muts)}')
        # Convert 3-letter acids to 1-letter
        new_muts = self.convert_protein_mutations_from_3_to_1_letters(found_muts)
        return sorted(new_muts)  # List of found mutations

    def write_mutations_to_file(self, output_file, notation=None):
        mutations = self.get_mutations(notation)
        mutations.to_csv(output_file, index=False)
        print(f'Success. Mutations written to file {output_file}')
