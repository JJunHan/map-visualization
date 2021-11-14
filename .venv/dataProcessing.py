# Setup a virtual env first
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# pip freeze > requirements.txt
# pip install -r requirements.txt
# By Jun Han :)

import pandas as pd
import numpy as np
import requests as rq
from time import sleep
import json

ENABLECONV = False

def dataConversion1():

    info_columns = ["XX"]
    latlong = []
    xy = []

    # Reading in CSV file
    file_df = pd.read_excel(".venv/dataFiles/dataBase1.xlsx" , dtype=object) #header = None
    file_df["XY"] = ""
    file_df["LatLong"] = ""
    print("There are " + str(file_df.shape[0]) + " rows and " + str(file_df.shape[1]) + " columns. \n")

    # Only extract columns we are interested in
    focus_df = pd.DataFrame(file_df[info_columns])
    print("\nThere are " + str(focus_df.shape[0]) + " rows and " + str(focus_df.shape[1]) + " columns. \n")
    focus_df['Postal Code'] = focus_df['Postal Code'].fillna("nil")
    print(focus_df.head())

    if ENABLECONV:
        url = "https://developers.onemap.sg/commonapi/search?"
        for row in focus_df['Postal Code']:
            if row == "nil": # If empty postal code, append nil
                latlong.append("nil")
                xy.append("nil")
                continue

            payload = dict(searchVal=row, returnGeom='Y', getAddrDetails='Y')
            res = rq.get(url, params =payload)
            data = res.json()

            if data != "" : # If API returns no matches, append no matches
                if data['found'] == 0:
                    latlong.append("no matches")
                    xy.append("no matches")
                    continue
                else:
                    latlong.append(data['results'][0]['LATITUDE'] + "," + data['results'][0]['LONGITUDE'])
                    xy.append(data['results'][0]['X'] + "," + data['results'][0]['Y'])


        focus_df["XY"] = xy
        focus_df["LatLong"] = latlong

        print(focus_df.head(5))

        recs = focus_df.to_dict(orient="index")

        with open('.venv/data1.txt', 'w') as file:
            file.write(json.dumps(recs)) # use `json.loads` to do the reverse

def dataConversion2():
    latlong = []
    xy = []

    # Reading in CSV file
    file_df = pd.concat(pd.read_excel(".venv/dataFiles/dataBase2.xlsx", sheet_name=None, dtype=object), ignore_index=True)
    file_df["XY"] = ""
    file_df["LatLong"] = ""
    
    info_columns = file_df.columns.tolist()
    print("\nThere are " + str(file_df.shape[0]) + " rows and " + str(file_df.shape[1]) + " columns. \n")
    print(info_columns)

    # Only extract columns we are interested in
    focus_df = pd.DataFrame(file_df[info_columns])
    print("\nThere are " + str(focus_df.shape[0]) + " rows and " + str(focus_df.shape[1]) + " columns. \n")
    focus_df['Postal Code'] = focus_df['Postal Code'].fillna("nil")
    print(focus_df.head())

    if ENABLECONV:
        url = "https://developers.onemap.sg/commonapi/search?"
        for row in focus_df['Postal Code']:
            if row == "nil":
                latlong.append("nil")
                xy.append("nil")

                continue

            payload = dict(searchVal=row, returnGeom='Y', getAddrDetails='Y')
            res = rq.get(url, params =payload)
            data = res.json()

            if data != "" :
                if data['found'] == 0:
                    latlong.append("no matches")
                    xy.append("no matches")
                    continue
                else:
                    latlong.append(data['results'][0]['LATITUDE'] + "," + data['results'][0]['LONGITUDE'])
                    xy.append(data['results'][0]['X'] + "," + data['results'][0]['Y'])


        focus_df["XY"] = xy
        focus_df["LatLong"] = latlong

        print(focus_df.head(5))

        recs = focus_df.to_dict(orient="index")

        with open('.venv/data2.txt', 'w') as file:
            file.write(json.dumps(recs)) # use `json.loads` to do the reverse

def dataConversion3():
    latlong = []
    xy = []

    # Reading in CSV file
    file_df = pd.read_excel(".venv/dataFiles/dataBase3.xlsx", sheet_name=None, dtype=object)
    file_df["XY"] = ""
    file_df["LatLong"] = ""
    
    info_columns = (file_df.columns.tolist())[:5] #only take first 4
    print("\nThere are " + str(file_df.shape[0]) + " rows and " + str(file_df.shape[1]) + " columns. \n")
    print(info_columns)

    # Only extract columns we are interested in
    focus_df = pd.DataFrame(file_df[info_columns])
    print("\nThere are " + str(focus_df.shape[0]) + " rows and " + str(focus_df.shape[1]) + " columns. \n")
    focus_df['Postal Code'] = focus_df['Postal Code'].fillna("nil")
    print(focus_df.head())

    if ENABLECONV:
        url = "https://developers.onemap.sg/commonapi/search?"
        for row in focus_df['Postal Code']:
            if row == "nil":
                latlong.append("nil")
                xy.append("nil")

                continue

            payload = dict(searchVal=row, returnGeom='Y', getAddrDetails='Y')
            res = rq.get(url, params =payload)
            data = res.json()

            if data != "" :
                if data['found'] == 0:
                    latlong.append("no matches")
                    xy.append("no matches")
                    continue
                else:
                    latlong.append(data['results'][0]['LATITUDE'] + "," + data['results'][0]['LONGITUDE'])
                    xy.append(data['results'][0]['X'] + "," + data['results'][0]['Y'])


        focus_df["XY"] = xy
        focus_df["LatLong"] = latlong

        print(focus_df.head(5))

        recs = focus_df.to_dict(orient="index")

        with open('.venv/data3.txt', 'w') as file:
            file.write(json.dumps(recs)) # use `json.loads` to do the reverse

if __name__ == "__main__":
    dataConversion1()
    dataConversion2()
    dataConversion3()
