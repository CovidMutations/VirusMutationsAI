# Note: the file should be launched using "bash", not "sh"!

# Mutations variant1: nucleotide, absolute positions
#python -u vcf_to_articles_json.py 'db/sample.vcf' --article_index_file_name 'db/index.csv' --article_mutations_file_name 'db/articles2mutations.txt' \
#--verbose=0  1> >(tee _stdout.log) 2> >(tee _stderr.log >&2)

# Mutations variant2: aminoacids, relative positions
python -u vcf_to_articles_json.py 'db/sample.vcf' --article_index_file_name 'db/index.csv' --article_mutations_file_name 'db/articles2mutations.txt' \
--snp_eff_jar_path '/home/natali/2020-08-24_SnpEff/snpEff/snpEff.jar'  --verbose=0  1> >(tee _stdout.log) 2> >(tee _stderr.log >&2)
