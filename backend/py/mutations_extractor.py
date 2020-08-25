import argparse
import glob
import os
import pandas as pd
import re
import shutil
import time


# Supported file extensions
EXT_XML = 'xml'
EXT_TXT = 'txt'

COL_UID = 'uid'
COL_MUTATIONS = 'mutations'
OUT_COLS = [COL_UID, COL_MUTATIONS]


def get_files_by_mask(data_dir, mask, verbose=False):
    assert os.path.isdir(data_dir)
    files_mask = os.path.join(data_dir, mask)
    files = sorted(glob.glob(files_mask))
    if verbose:
        print("Files mask: '{}', found: {} files".format(files_mask, len(files)))
    return files


# Note: processing on 'lines' level makes possible to do unit testing
def process_article_lines(lines: list, file_type: str, verbose=False):
    muts = []
    for s in lines:
        s = s.strip()  # May be
        if file_type == EXT_XML:
            s = re.sub('<[^<]+>', "", s)  # Strip all xml tags

        # Search mutations with different patterns
        # muts = re.findall(r'\d+', s)  # Find all numbers
        # muts = re.findall(r'\S+\d+\S+', s)  # Find all numbers, alone or with left/right letters
        muts.extend(re.findall(r'[A-Z]\d+[A-Z]', s))  # Find patterns like P223Q

        # Find patterns like "223 A > T", "223 A &gt; T" and convert them to canonical form "223A>T"
        strings = re.findall(r'\d+ *[ACGT]+ *(?:&gt;|>) *[ACGT]+', s)
        for ss in strings:
            m = re.search(r'(?P<pos>\d+) *(?P<from>[ACGT]+) *(:?&gt;|>) *(?P<to>[ACGT]+)', ss)
            mut = f"{m.group('pos')}{m.group('from')}>{m.group('to')}"
            muts.append(mut)
    if verbose:
        print(f'Found muts: {muts}')
    return muts


def process_article_file(input_filename, file_type: str, verbose=False):
    if verbose:
        print(f'Start processing article file {input_filename}')
    with open(input_filename, 'r') as f:
        lines = f.readlines()
    mut_list = process_article_lines(lines, file_type, verbose=verbose)
    if verbose:
        print(f'..lines: {len(lines)}, mutations: {len(mut_list)}')
    return mut_list


def process_folder(input_folder, article_files_extension, verbose=False):
    if not os.path.isdir(input_folder):
        raise FileNotFoundError(f'Cannot find the specified folder with articles: {input_folder}')
    files = get_files_by_mask(input_folder, '*.' + article_files_extension, verbose=verbose)
    res_list = []
    for f in files:
        mut_list = process_article_file(f, file_type=article_files_extension,  verbose=verbose)
        root, ext = os.path.splitext(os.path.basename(f))
        res_tuple = (root, str(mut_list))  # article uid + string with list of mutations like "['23A>G', ...]"
        res_list.append(res_tuple)
    # TODO(MEDIUM_2020-08): dump a list of skipped files (may be useful if there are upper-case extensions, etc.)
    return pd.DataFrame.from_records(res_list, columns=OUT_COLS)


def merge_new_data_with_old(new_article_to_mutations_df, old_article_to_mutations_df=None):
    if old_article_to_mutations_df is None:
        return new_article_to_mutations_df  # No old data
    # Merge new data with old, replacing data in case of possible uid conflicts
    # Ref: https://stackoverflow.com/a/52468811
    old_df = old_article_to_mutations_df.set_index(COL_UID, drop=False)
    new_df = new_article_to_mutations_df.set_index(COL_UID, drop=False)
    df = new_df.combine_first(old_df)
    df = df.reset_index(drop=True)
    # Sanity checks
    assert all(df.columns == OUT_COLS)
    assert len(df) >= max(len(old_df), len(new_df))
    return df


def try_to_load_existing_data(out_file_name):
    df = None
    if os.path.isfile(out_file_name):
        df = pd.read_csv(out_file_name)
        assert all(df.columns == OUT_COLS), f'Unexpected columns in loaded data: {df.columns} instead of {OUT_COLS}'
    return df


def safe_write_to_output_file(df, out_file_name):
    """First saves df to temp file, then rename it. Should help in case of access collisions, low disk space, etc."""
    tmp_name = f'{out_file_name}_{time.time()}'  # Ex: 'super_file.csv_223322.223322'
    df.to_csv(tmp_name, index=False)  # In rare cases (no disk space, etc.) may fail
    shutil.move(tmp_name, out_file_name)


def parse_args():
    parser = argparse.ArgumentParser(description='Extractor of mutations in specified folder with article files')
    parser.add_argument('input_folder',
                        type=str,
                        help='Path to folder with *.txt or *.xml files.')
    parser.add_argument('out_file_name',
                        type=str,
                        help='Name of output file with article uids and list of mutation. If the file already exists, '
                             'data will be appended to it.')
    parser.add_argument('--article_files_extension',
                        type=str,
                        choices=[EXT_XML, EXT_TXT],
                        default=EXT_XML,
                        help='Types of files to be processed. Only low-case extensions are supported (as in Linux' +
                             'there may be files article123.txt and article123.TXT in the same dir).')
    return parser.parse_args()


def main():
    args = parse_args()
    # Clean params (on some platforms there may be \r symbols in the end)
    input_folder = args.input_folder.strip()
    out_file_name = args.out_file_name.strip()

    # Load data from existing file, if any
    old_article_to_mutations_df = try_to_load_existing_data(out_file_name)

    # Prepare new data
    new_article_to_mutations_df = process_folder(input_folder, args.article_files_extension, verbose=True)

    # Merge old + new, then write to disk
    final_article_to_mutations_df = merge_new_data_with_old(new_article_to_mutations_df, old_article_to_mutations_df)
    safe_write_to_output_file(final_article_to_mutations_df, out_file_name)


if __name__ == '__main__':
    main()
