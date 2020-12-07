import logging
from typing import BinaryIO, List

from Bio.Data.IUPACData import protein_letters_3to1_extended
import pandas as pd
import re


logger = logging.getLogger(__name__)


COL__INFO = 'INFO'


class VcfParser:
    """
    Class for loading and parsing specified VCF file, with ability to extract mutations.
    """
    def __init__(self, expected_vcf_format="VCFv4.2"):
        self.df_vcf = None
        if expected_vcf_format:
            # First expected line. May be None to skip the check.
            self.expected_vcf_format = b"##fileformat=" + expected_vcf_format.encode("utf-8")
        else:
            self.expected_vcf_format = None

    def read_vcf_file(self, file_stream: BinaryIO):
        # Count number of comment lines at file beginning
        comment_lines_cnt = 0
        for i, s in enumerate(file_stream):
            # Check the first line (format) if required
            if i == 0 and self.expected_vcf_format and not s.startswith(self.expected_vcf_format):
                raise ValueError(f"Unexpected first line of file: '{s}' instead of '{self.expected_vcf_format}'. " +
                                 f"To skip this check, reconstruct the class with expected_vcf_format=None")
            if not s.startswith(b"##"):
                comment_lines_cnt = i
                break
        assert comment_lines_cnt > 0  # At least one non-comment line must be present!

        # Read the file into pandas DataFrame
        file_stream.seek(0)
        self.df_vcf = pd.read_csv(file_stream, sep="\t", skiprows=comment_lines_cnt)

        # Sanity check
        for col in ['#CHROM', 'POS', 'ID', 'REF', 'ALT']:
            assert col in self.df_vcf.columns, f"Cannot find column '{col}' in the file header: '{self.df_vcf.columns}'"

        logger.info(f'Success. Loaded data shape: {self.df_vcf.shape}')

    def get_mutations(self, notation=None) -> List[str]:
        # Checks
        assert notation is None, 'Currently only None is supported as notation'
        if self.df_vcf is None:
            raise Exception('No VCF data is loaded. Use read_vcf_file first')

        # Remove duplicates (use only major fields, ignoring annotations, etc.)
        df = self.df_vcf[['POS', 'ID', 'REF', 'ALT']].drop_duplicates()
        cnt_duplicates = len(self.df_vcf) - len(df)
        logger.info(f'Original mutations: {len(self.df_vcf)}, unique: {len(df)}, duplicates removed: {cnt_duplicates}')

        # Return pandas Series object with mutation strings
        mutations_series = df.POS.astype(str) + df.REF + '>' + df.ALT
        return mutations_series.tolist()

    @staticmethod
    def convert_protein_mutations_from_3_to_1_letters(muts: [list, set], is_strict_check=True):
        """
        Convert protein mutations from 3-letter acids to 1-letter acid format. Example: "p.Thr5262Ile" -> "T5262I"
        """
        new_muts = []
        for mut in muts:
            m = re.match(r"p\.(?P<acid1>[A-Z][a-z][a-z])(?P<pos>\d+)(?P<acid2>[A-Z][a-z][a-z])", mut)
            try:
                assert m, "Unexpected format (correct example: 'p.Thr42Ser')."
                acid1 = m['acid1']
                acid2 = m['acid2']
                assert acid1 in protein_letters_3to1_extended, f'Cannot recognize acid1: {acid1}'
                assert acid2 in protein_letters_3to1_extended, f'Cannot recognize acid2: {acid2}'
                new_acid1 = protein_letters_3to1_extended[acid1]
                new_acid2 = protein_letters_3to1_extended[acid2]
                new_mut = f"{new_acid1}{m['pos']}{new_acid2}"
                new_muts.append(new_mut)
            except AssertionError as e:
                if is_strict_check:
                    raise ValueError(f"Error while parsing protein mutation '{mut}': {e}.")
                else:
                    logger.warning(f"Warning while parsing protein mutation '{mut}' -> it will be skipped. Details: {e}")
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

    def get_protein_mutations(self, is_strict_check=True):
        # Checks
        if self.df_vcf is None:
            raise Exception('No VCF data is loaded. Use read_vcf_file first')
        if COL__INFO not in self.df_vcf.columns:
            raise Exception(f"Cannot find column '{COL__INFO}' in the file header: '{self.df_vcf.columns}'")

        # For each row - extract information text and parse it
        resulting_set = set()
        for i, (_, row) in enumerate(self.df_vcf.iterrows()):
            if len(row['REF']) > 1 or row['REF'] == 'N' or len(row['ALT']) > 1 or row['ALT'] == 'N':
                # Skip non-relevant mutations
                continue
            nuc_mutation = str(row['POS']) + row['REF'] + '>' + row['ALT']
            prot_mutations = self._extract_protein_mutations(row[COL__INFO])
            logger.info(f'DBG: processing row {i}. Found muts: {prot_mutations}')
            unique_prot_mutations = set()
            # Save only unique protein mutations
            unique_prot_mutations.update(prot_mutations)
            # Convert 3-letter acids to 1-letter
            unique_prot_mutations_converted = self.convert_protein_mutations_from_3_to_1_letters(
                unique_prot_mutations, is_strict_check=is_strict_check)
            # Keep nucleotide and protein mutations as one enumerator (comma separated)
            resulting_string = nuc_mutation
            if len(prot_mutations) > 0:
                resulting_string += ',' + ','.join(unique_prot_mutations_converted)
            # Put the connected mutations in unique output set
            resulting_set.update([resulting_string])

        logger.info(f'DBG: total number of found muts: {len(resulting_set)}')

        resulting_list = list(resulting_set)
        resulting_list = sorted(resulting_list)

        return resulting_list  # List enumerators (comma separated)
