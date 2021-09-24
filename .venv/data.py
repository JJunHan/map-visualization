# Setup a virtual env first
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# pip freeze > requirements.txt
# pip install -r requirements.txt

import pandas as pd
import numpy as np
import requests as rq
from time import sleep
import json

SAVEHEADER = False #True #False
SAVEPOSTAL = False
ENABLECONV = False

info_columns = ["Organisation Name", "Postal code", "LatLong", "XY", "Operating Hours", "Type of Centre", "Age", "Bankcard"]

# Reading in CSV file
file_df = pd.read_excel(".venv/dataFiles/dataBase.xlsx") #header = None #no header if not it will eat the first value
file_df["XY"] = ""
print("\nThere are " + str(file_df.shape[0]) + " rows and " + str(file_df.shape[1]) + " columns. \n")
#print(file_df.dtypes)

# Only extract columns we are interested in
focus_df = pd.DataFrame(file_df[info_columns])
print("\nThere are " + str(focus_df.shape[0]) + " rows and " + str(focus_df.shape[1]) + " columns. \n")
focus_df['Postal code'] = focus_df['Postal code'].fillna("nil")
#focus_df['Postal code'] = focus_df['Postal code'].astype(str).apply(lambda x: x.replace('.0',''))
print(focus_df.head())

if SAVEHEADER:
    headers = open(".venv/dataFiles/headers.txt","w")
    # iterating the columns
    for col in file_df.columns:
        headers.write(col + "\n")
        #print(col)
    headers.close()

if SAVEPOSTAL:
    postal_info = open(".venv/dataFiles/postal_codes.txt","w")
    for row in focus_df['Postal code']:
        postal_info.write(str(row) + "\n")
        #print(row)
    postal_info.close()

if ENABLECONV:
    url = "https://developers.onemap.sg/commonapi/search?"
    latlong_info = open(".venv/dataFiles/latlong_info.txt","w")
    XY_info = open(".venv/dataFiles/XY_info.txt","w")
    with open('.venv/dataFiles/postal_codes.txt', 'r') as f:
        for line in f:
            line = line.strip('\n')
            # print(line)
            if line == "nil":
                latlong_info.write("nil\n")
                XY_info.write("nil\n")
                continue

            payload = dict(searchVal=line, returnGeom='Y', getAddrDetails='Y')
            res = rq.get(url, params =payload)
            data = res.json()

            if data != "" :
                #print(data)
                if data['found'] == 0:
                    latlong_info.write("no matches\n")
                    XY_info.write("no matches\n")
                    continue
                else:
                    latlong_info.write(data['results'][0]['LATITUDE'] + "," + data['results'][0]['LONGITUDE'] + "\n")
                    XY_info.write(data['results'][0]['X'] + "," + data['results'][0]['Y'] + "\n")

            #print(data['results'][0]['LATITUDE'])
            #print(data['results'][0]['LONGITUDE'])
            #print(res.text)
            #print(type(res.text))

    f.close()
    latlong_info.close()
    XY_info.close()

i = 0
latlong_info = open(".venv/dataFiles/latlong_info.txt","r")
for row in latlong_info:
        focus_df.loc[i,"LatLong"] = row.strip('\n')
        i = i + 1

XY_info = open(".venv/dataFiles/XY_info.txt","r")
i = 0
for row in XY_info:
    focus_df.loc[i,"XY"] = row.strip('\n')
    i = i + 1

XY_info.close()
latlong_info.close()
print(focus_df)

# Take note that we only need the first 7 fields that this csv provides
# focus_df.to_csv(".venv/pandas1.txt", header=None, index=None, sep='|', mode='a')

recs = focus_df.to_dict(orient="index")
# print(type(recs))

with open('.venv/final_info.txt', 'w') as file:
     file.write(json.dumps(recs)) # use `json.loads` to do the reverse
