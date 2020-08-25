import lxml.etree as etree
import xml.etree.ElementTree as ET
import os
import scispacy
import spacy
from spacy import displacy
from scispacy.abbreviation import AbbreviationDetector
from scispacy.umls_linking import UmlsEntityLinker

from collections import Counter

nlp = spacy.load("en_core_sci_sm")   #Define the pre-trained model.

stop_words = ['human', 'patient', 'sars-cov-2', 'covid-19', 'model', 'virus', 'glass',
'image', 'study', 'infection', 'period', 'China', 'na', 'case', 'selection', 'estimate',
'day', 'disease', 'assess', 'population', 'target', 'host', 'sample', 'country', 'datum',
'patent', 'detect', 'ODE', 'cpg', 'specie', 'region']

#Calculate and sort words, then remove stop words
def strcount(words):
    d = {}
    for word in words:
        if word.lemma_ not in d:
            d[word.lemma_] = 1
        else:
            d[word.lemma_] += 1

    for word in stop_words:
        d.pop(word, None)

    return sorted(d.items(), key=lambda x: x[1], reverse=True) 

article_root_folder = '../db/'
word_list = []
files = [i for i in os.listdir(article_root_folder) if i.endswith("xml")]
for file in files:
    # Extract body-tag with the main text and remove XML-markup
    tree = ET.parse(article_root_folder + file) 
    article_body = str(ET.tostring(tree.findall('.//body/.')[0], encoding='unicode', method='text'))
    article_body = article_body.replace('\\n', '')
    text = article_body.replace('\\n', '')

    sentences = text.split('.')
    
    for sentence in sentences:
        doc = nlp(sentence)
        word_list += doc.ents

    dic = strcount(word_list)

    #Print 5 most mentioned terms
    print("{}:\n{}\n".format(file, [x[0] for x in dic[:5]]))
