from Bio import Entrez
from lxml import etree
import uuid
import pandas as pd
import os
import sys
import time

# Input params
Entrez.email = "test@domain.com"
ncbi_db = "pmc"
query = 'SARS-CoV-2 mutation AND "open access"[filter]' #less articles but more relevant content
#query = 'SARS-CoV-2AND "open access"[filter]' #more articles but less relevant content
article_root_folder = '../db/'

if len(sys.argv) > 1:
    article_root_folder = sys.argv[1]

print("DB path: {}".format(article_root_folder))

# Init folders/files and load existing index
if not os.path.exists(article_root_folder):
    os.makedirs(article_root_folder)
if os.path.exists(article_root_folder + '/index.csv'):
    df_index = pd.read_csv(article_root_folder + '/index.csv')
else:
    df_index = pd.DataFrame(columns=['uid', 'storage_id', 'add_time', 'title', 'url'])


# Make request to NCBI with the query string
start = 0
all_cov_ids = []

while True:
    handle = Entrez.esearch(db="pmc", retmax=500, retstart=start, term=query)
    record = Entrez.read(handle)
    start += 500
    handle.close()
    all_cov_ids += record["IdList"]
    print(len(all_cov_ids))
    if len(record["IdList"]) == 0:
        break
print("{}: found {} articles for '{}'".format(ncbi_db, len(all_cov_ids), query))

# Uncomment block bellow to download all missing articles to the index folder
'''
files = [i for i in os.listdir(article_root_folder) if i.endswith("xml")]
count_removed_files = 0
for file in files:
    if file[:-4] not in df_index['uid'].values:
        os.remove(article_root_folder + file)
        count_removed_files += 1
print("Removed {} unindexed files".format(count_removed_files))

uids = df_index['uid'].tolist()
count_notexist_files = 0
for uid in uids:
    if not os.path.exists(article_root_folder + uid + '.xml'):
        count_notexist_files += 1
        handle = Entrez.efetch(db=ncbi_db, id=uid, rettype="xml", retmode="text")
        record = handle.read()
        output_str = str(record)
        output_str = output_str.replace('\\n', '\n')[2:-1] #removing extra symbols not related to XML

        with open(article_root_folder + uid + ".xml", "w") as file_article:
            file_article.write(str(output_str))
print("Appended {} non-exist files to download".format(count_notexist_files))
'''
# Request articles one by one and add them to the index if they're not in the index
count_appended_items = 0
count_errors = 0
count_already_added = 0
for i in range(0
        , len(all_cov_ids) #set smaller number here do not request whole set (for testing)
        ):
    try:
        #check if already indexed (now by storage ID), switch to title for multi-storage
        if int(all_cov_ids[i]) not in df_index['storage_id'].values:
            handle = Entrez.efetch(db=ncbi_db, id=all_cov_ids[i], rettype="xml", retmode="text")
            record = handle.read()
            output_str = str(record)
            output_str = output_str.replace('\\n', '\n')[2:-1] #removing extra symbols not related to XML

            tree = etree.fromstring(output_str)
            article_title = tree.find('.//front/article-meta/title-group/article-title').text
            if not article_title or article_title == '' or article_title == '\n':
                article_title = tree.find('.//front/article-meta/title-group/article-title/*')
                article_title = article_title.text + (article_title.tail if article_title.tail else '')

            article_title = article_title.replace('\n', '') # replace all multi-line titles to one-line
            article_title = article_title.replace('‐', '-') # replace unicode '-' to ascii '-'
            article_uid = 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC' + tree.find(".//front/article-meta/article-id[@pub-id-type='pmc']").text
            str_uid = uuid.uuid4().hex[0:8]

            df_index = df_index.append({'uid': str_uid, 'storage_id' : all_cov_ids[i], 'add_time' : int(time.time()), 'title': article_title, 'url': article_uid}, ignore_index=True)
            count_appended_items +=1 

            with open(article_root_folder + str_uid + ".xml", "w") as file_article:
                file_article.write(str(output_str))
        else:
            count_already_added += 1
            pass
    except:
        count_errors += 1
        print("ERROR: {}: {}".format(i, all_cov_ids[i]))
        pass
    if i > 10 and i % int(len(all_cov_ids)/10) == 0:
        # the index is dumped to the file from time to time do not loose all collected data on crash
        print("Progress {}/{}...".format(i, len(all_cov_ids)))
        df_index.to_csv(article_root_folder + '/index.csv', index=False)

# save index in the end
df_index.to_csv(article_root_folder + '/index.csv', index=False)

# Remove files in db that are not in the index (keep DB in valid state)
files = [i for i in os.listdir(article_root_folder) if i.endswith("xml")]
count_removed_files = 0
for file in files:
    if file[:-4] not in df_index['uid'].values:
        os.remove(article_root_folder + file)
        count_removed_files += 1
print("Removed {} unindexed files".format(count_removed_files))

print("XX Indexed {} new article(s), {} already in the index, {} error(s) XX".format(count_appended_items, count_already_added, count_errors))
