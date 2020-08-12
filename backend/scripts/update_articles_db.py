import sys
import subprocess
import argparse
import re
import json

def parse_args():
    parser = argparse.ArgumentParser(description='Extractor of mutations in specified folder with article files')
    parser.add_argument('script_folder',
                        type=str,
                        help='Path to folder with scripts')
    parser.add_argument('input_folder',
                        type=str,
                        help='Path to folder with *.txt or *.xml files.')
    parser.add_argument('out_file_name',
                        type=str,
                        help='Name of output file with article uids and list of mutation. If the file already exists, '
                             'data will be appended to it.')
    return parser.parse_args()

def main():
    status = 'OK'
    status_text = ''
    try:
        args = parse_args()
        # Clean params (on some platforms there may be \r symbols in the end)
        script_folder = args.script_folder.strip()
        input_folder = args.input_folder.strip()
        out_file_name = args.out_file_name.strip()

        returned = subprocess.check_output([sys.executable, script_folder  + "covid_articles_db.py"])
        returned_text = returned.decode('utf-8')

        #print(returned_text)
        status_text = re.search(r"(?<=XX).*?(?=XX)", returned_text).group(0)

        subprocess.check_output([sys.executable, script_folder  + "mutations_extractor.py", input_folder, out_file_name])
    except Exception as e:
        status = 'ERROR'
        status_text = str(e)

    out_dict = {'status' : status, 'status_text' : status_text}
    out_json = json.dumps(out_dict, indent=4)
    print(out_json)


if __name__ == '__main__':
    main()