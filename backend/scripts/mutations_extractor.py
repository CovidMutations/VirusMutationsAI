import argparse
import glob
import os
import pandas as pd
import re

# Supported file extensions
EXT_XML = 'xml'
EXT_TXT = 'txt'


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
        # muts = re.findall(r'\s[A-Z]\d+[A-Z]\s', s)  # Find patterns like P223Q
        muts.extend(re.findall(r'[A-Z]\d+[A-Z]', s))  # Find patterns like P223Q
        muts.extend(re.findall(r'\d+[ACGT]+>[ACGT]+', s))  # Find patterns like 223A>T
        muts.extend(re.findall(r'\d+[ACGT]+&gt;[ACGT]+', s))  # Find patterns like 223A>T

        strings = re.findall(r'\d+ *[ACGT]+ *&gt; *[ACGT]+', s)  # Find patterns like 223 A > T
        # Convert them to canonical form
        for ss in strings:
            m = re.search(r'(?P<pos>\d+) *(?P<from>[ACGT]+) *&gt; *(?P<to>[ACGT]+)', ss)
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
    return res_list


# Variant with manual file creation
# def write_article_to_mutations_list_to_file(article_to_mutations_list, out_file_name):
#     with open(out_file_name, 'w') as f:
#         for (uid, muts) in article_to_mutations_list:
#             f.write(f'{uid},{muts}\n')


# Variant with pandas
def write_article_to_mutations_list_to_file(article_to_mutations_list, out_file_name):
    df = pd.DataFrame.from_records(article_to_mutations_list, columns=['uid', 'mutations'])
    df.to_csv(out_file_name, index=False)


def parse_args():
    parser = argparse.ArgumentParser(description='Extractor of mutations in specified folder with article files')
    parser.add_argument('input_folder',
                        type=str,
                        help='Path to folder with *.txt or *.xml files.')
    parser.add_argument('out_file_name',
                        type=str,
                        help='Name of output file with article uids and list of mutation.')
    parser.add_argument('--article_files_extension',
                        type=str,
                        choices=[EXT_XML, EXT_TXT],
                        default=EXT_XML,
                        help='Types of files to be processed. Only low-case extensions are supported (as in Linux' +
                             'there may be files article123.txt and article123.TXT in the same dir).')
    return parser.parse_args()


def main():
    args = parse_args()
    article_to_mutations_list = process_folder(args.input_folder, args.article_files_extension, verbose=True)
    write_article_to_mutations_list_to_file(article_to_mutations_list, args.out_file_name)


if __name__ == '__main__':
    main()
