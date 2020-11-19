import lxml.etree as etree
import xml.etree.ElementTree as ET
import os
import spacy
from spacy_readability import Readability

nlp = spacy.load('en_core_web_sm')
read = Readability()
nlp.add_pipe(read, last=True)

article_root_folder = 'db/'
word_list = []
files = [i for i in os.listdir(article_root_folder) if i.endswith("xml")]
for file in files:
    # Extract body-tag with the main text and remove XML-markup
    tree = ET.parse(article_root_folder + file) 
    article_body = str(ET.tostring(tree.findall('.//body/.')[0], encoding='unicode', method='text'))
    article_body = article_body.replace('\\n', '')
    text = article_body.replace('\\n', '')

    doc = nlp(text)

    print("***{}***".format(file))
    print("smog=", doc._.smog)
    print("forcast=", doc._.forcast)
    print("dale_chall=", doc._.dale_chall)
    print("coleman_liau_index=", doc._.coleman_liau_index)
    print("flesch_kincaid_grade_level=", doc._.flesch_kincaid_grade_level)
    print("flesch_kincaid_reading_ease=", doc._.flesch_kincaid_reading_ease)
    print("automated_readability_index=", doc._.automated_readability_index)
    print("\n")
