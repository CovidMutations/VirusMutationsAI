import nltk
from nltk.tokenize import sent_tokenize
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import lxml.etree as etree
import xml.etree.ElementTree as ET
import os

article_root_folder = '../db/'
files = [i for i in os.listdir(article_root_folder) if i.endswith("xml")]
for file in files:
    # Extract body-tag with the main text and remove XML-markup
    tree = ET.parse(article_root_folder + file) 
    article_body = str(ET.tostring(tree.findall('.//body/.')[0], encoding='unicode', method='text'))
    article_body = article_body.replace('\\n', '')
    text = article_body.replace('\\n', '')
    
    # Tokenizing the text 
    stopWords = set(stopwords.words("english")) 
    words = word_tokenize(text) 
    
    # Creating a frequency table to keep the score of each word 
    freqTable = dict() 
    for word in words: 
        word = word.lower() 
        if word in stopWords: 
            continue
        if word in freqTable: 
            freqTable[word] += 1
        else: 
            freqTable[word] = 1
    
    # Creating a dictionary to keep the score of each sentence 
    sentences = sent_tokenize(text) 
    sentenceValue = dict() 
    
    for sentence in sentences:
        # Skip too short and too long phrases
        if len(sentence.split()) > 30 or len(sentence.split()) < 7:
            continue
        for word, freq in freqTable.items(): 
            if word in sentence.lower(): 
                if sentence in sentenceValue: 
                    sentenceValue[sentence] += freq 
                else: 
                    sentenceValue[sentence] = freq 
    
    sumValues = 0
    for sentence in sentenceValue: 
        sumValues += sentenceValue[sentence] 
    
    # Average value of a sentence from the original text 
    average = int(sumValues / len(sentenceValue)) 
    
    # Storing sentences into our summary. 
    summary = ''
    # now add only most relevant phrase!
    keymax = max(sentenceValue, key=sentenceValue.get)
    summary += " " + keymax
    print("{}:\n{}\n".format(file, summary))
