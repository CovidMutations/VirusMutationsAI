import argparse
import ast
from collections import defaultdict
import json
import os
import pandas as pd
import subprocess
import sys
import time

import vcf_parser


COL__UID = 'uid'
COL__MUTATIONS = 'mutations'


DEFAULT_ARTICLE_INDEX_PATH = '../db/index.csv'
DEFAULT_ARTICLE_MUTATIONS_PATH = '../db/articles2mutations.txt'


def eprint(*a):
    """Print message to stderr (in cases when stdout is used for json generation, etc.)"""
    print(*a, file=sys.stderr)


# The logic is opposite to write_article_to_mutations_list_to_file in mutations_extractor.py
def _read_article_to_mutations_df_from_file(file_name):
    assert os.path.isfile(file_name)  # Should have been already checked
    df = pd.read_csv(file_name)
    # Sanity check (problems should not occur on consistent backend)
    assert list(df.columns) == [COL__UID, COL__MUTATIONS], f"Unexpected columns in file {file_name}: {df.columns}"
    return df


def convert_list_string_to_list(s):
    """Example: "['a', 'b']" -> ['a', 'b'] """
    # Src: https://stackoverflow.com/a/1894296
    return ast.literal_eval(s)


def create_mutation_to_articles_dict(article_to_mutations_df: pd.DataFrame):
    out_dict = defaultdict(list)
    for (i, row) in article_to_mutations_df.iterrows():
        article_uid = row[COL__UID]
        s = row[COL__MUTATIONS]  # Ex: "[]", "['D614G', 'D614G', ...]"
        muts = convert_list_string_to_list(s)
        assert isinstance(muts, list)
        # Cycle for each unique mutation
        for mut in set(muts):
            # Append current article to
            out_dict[mut].append(article_uid)
    return out_dict


def find_articles_by_vcf_mutations(vcf_mutations: list, mutation_to_articles_dict: dict, verbose=False):
    out_list = []
    not_founds = []
    for vcf_mut in vcf_mutations:
        if vcf_mut in mutation_to_articles_dict:
            out_list.append((vcf_mut, mutation_to_articles_dict[vcf_mut]))
        else:
            not_founds.append(vcf_mut)
    if verbose:
        eprint(f'Finding articles for VCF mutations: for {len(out_list)} found, for {len(not_founds)} not found.')
    return out_list, not_founds


def append_found_results_to_out_dict(found_articles, article_index_df, out_dict, verbose=False):
    for (vcf_mut, uids) in found_articles:
        mutation_list = []
        for uid in uids:
            mutation_map = {}
            temp_df = article_index_df[article_index_df.uid == uid]
            assert len(temp_df) == 1, f"Unexpected number of results ({len(temp_df)}) for article uid '{uid}'"

            # Get and check article title
            title = temp_df.title.iloc[0]  # Get first (and the only) item
            if not isinstance(title, str):
                if verbose:
                    eprint(f"WARNING: Article with uid {uid} has non-string title: '{title}' -> will be skipped.")
                continue
            mutation_map['article_name'] = title
            
            # Get and check article url
            url = temp_df.url.iloc[0]       # Get first (and the only) item
            assert isinstance(url, str)
            mutation_map['article_url'] = url

            mutation_list.append(mutation_map)
        out_dict[vcf_mut] = mutation_list  # Modify the dict in-place


def apply_snpeff_to_vcf(vcf_file_name: str, snp_eff_jar_path: str, verbose: bool):
    if verbose:
        eprint('DBG: launching snpeff..')

    # Prepare unique file names for results
    tmp_vcf_file = f'__out_{time.time()}__vcf_after_snpeff.vcf'
    tmp_err_file = f'__out_{time.time()}__stderr_after_snpeff.txt'

    # Compose command line and run it
    cmd_parts = ['java', '-jar', snp_eff_jar_path, "eff", '-v', 'NC_045512.2', vcf_file_name,
                 "1>", tmp_vcf_file, "2>", tmp_err_file]
    subprocess.run(cmd_parts, check=True)

    if verbose:
        eprint(f'..done. Out files: {tmp_vcf_file}, {tmp_err_file}')

    return tmp_vcf_file


def get_mutations_from_file(vcf_file_name, verbose):
    if not os.path.isfile(vcf_file_name):
        raise FileNotFoundError(f"Cannot find VCF file: {vcf_file_name}")

    # Parse VCF into sequence of mutations
    vcf_parser_obj = vcf_parser.VcfParser()
    try:
        vcf_parser_obj.read_vcf_file(vcf_file_name, verbose=verbose)
        # vcf_mutations = vcf_parser_obj.get_mutations(verbose=verbose)
        vcf_mutations = vcf_parser_obj.get_protein_mutations(is_strict_check=False, verbose=verbose)
        assert isinstance(vcf_mutations, list)
    except Exception as e:
        # Re-raise exception with additional context
        raise Exception(f'ERROR while parsing vcf file: {e}')
    return vcf_mutations


def parse_args():
    parser = argparse.ArgumentParser(description='For each mutation in VCF file tries to find related articles. ' +
                                     'The output in JSON format is dumped to stdout.')
    parser.add_argument('vcf_file_or_request',
                        type=str,
                        help='Path to input VCF file with mutations OR mutation for search')
    parser.add_argument('--article_index_file_name',
                        type=str,
                        default=DEFAULT_ARTICLE_INDEX_PATH,
                        help='Path to input CVS file with index of articles in the database.')
    parser.add_argument('--article_mutations_file_name',
                        type=str,
                        default=DEFAULT_ARTICLE_MUTATIONS_PATH,
                        help='Path to input CVS file with article to mutations mapping.')
    parser.add_argument('--snp_eff_jar_path',
                        type=str,
                        default='',
                        help='Path to snpeff jar file. If omitted, the snpeff will not be called (i.e. mutations will'
                             'be taken from original VCF file).')
    parser.add_argument('--verbose',
                        type=int,
                        choices=[0, 1],
                        default=0,
                        help='Verbosity level. Specify 1 for debugging.')

    return parser.parse_args()


def main():

    out_dict = {}
    verbose = 0

    try:
        # Parse and check args
        args = parse_args()
        verbose = args.verbose
        # TODO(2020-09): move to separate function
        eprint('DBG: check input files..') if verbose > 0 else None
        if not os.path.isfile(args.article_index_file_name):
            raise FileNotFoundError(f"Cannot find article index file: {args.article_index_file_name}")
        if not os.path.isfile(args.article_mutations_file_name):
            raise FileNotFoundError(f"Cannot find article mutations file: {args.article_mutations_file_name}")
        if (args.snp_eff_jar_path != '') and (not os.path.isfile(args.snp_eff_jar_path)):
            raise FileNotFoundError(f"Cannot find snpeff jar file: {args.snp_eff_jar_path}")

        # Get mutations, either directly as a string, or extract them from VCF file
        if args.vcf_file_or_request.endswith('.vcf'):
            vcf_file = args.vcf_file_or_request
            if args.snp_eff_jar_path != '':
                vcf_file = apply_snpeff_to_vcf(vcf_file, args.snp_eff_jar_path, verbose)
            vcf_mutations = get_mutations_from_file(vcf_file, verbose)
        else:
            vcf_mutations = [args.vcf_file_or_request]

        # Create mapping "mutation -> article(s)"
        tmp_df = _read_article_to_mutations_df_from_file(args.article_mutations_file_name)
        mutation_to_articles_dict = create_mutation_to_articles_dict(tmp_df)

        # Find articles for VCF mutations
        found_articles, not_founds = find_articles_by_vcf_mutations(vcf_mutations, mutation_to_articles_dict,
                                                                    verbose=verbose)

        # Load index of articles, should go without errors
        article_index_df = pd.read_csv(args.article_index_file_name)

        # Prepare final structure for json
        append_found_results_to_out_dict(found_articles, article_index_df, out_dict, verbose)
        if verbose:
            out_dict['mutations_without_articles'] = not_founds  # VCF mutations without found articles

    except Exception as e:
        if verbose > 0:
            raise  # Just re-raise the exception (to show call stack, etc.)
        out_dict['error_text'] = str(e)

    # Convert to json and print it to stdout
    out_json = json.dumps(out_dict, allow_nan=False, indent=4)
    print(out_json)


if __name__ == '__main__':
    main()
