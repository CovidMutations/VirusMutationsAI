import sys
import random
import uuid
import numpy as np
import string
import json
from time import sleep

def convert(s): 
    str1 = "" 
    return(str1.join(s)) 

#print('Number of arguments:', len(sys.argv), 'arguments.')
#print('Argument List:', str(sys.argv))

if len(sys.argv) != 2:
    print('ERROR: Wrong command arguments: You need to provide the path to VCF!')
    quit()

try:
    f = open(sys.argv[1])

    sleep(random.randint(5, 20))

    all_mutation_map = {}
    for i in range(random.randint(1, 20)):
        mutation_list = []
        for j in range(random.randint(1, 10)):
            mutation_map = {}
            mutation_map['article_name'] = convert(np.random.choice(list(string.ascii_lowercase), 10)).capitalize() \
                + (' ' + convert(np.random.choice(list(string.ascii_lowercase), 10)))*random.randint(1, 7)
            mutation_map['article_url'] = 'http://' + convert(np.random.choice(list(string.ascii_lowercase), 20)) + '.com'
            mutation_list.append(mutation_map)
        all_mutation_map[uuid.uuid4().hex[0:8]] = mutation_list

    out_json = json.dumps(all_mutation_map, indent = 4)
    print(out_json)

except IOError:
    print("ERROR: {}: File not accessible!".format(sys.argv[1]))