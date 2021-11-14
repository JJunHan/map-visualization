# Map visualization

A Prove of Concept(POC) project in collaboration with FoodBank to create a directory with the relevant information. This map visualization project utilizes [OneMap API](https://www.onemap.gov.sg/home/) as a basemap and [Leaflet JS](https://leafletjs.com/) for all the mapping features. A python script is included to extract information in JSON format from excel sheets and its sub tabs.

## How to use

Its good practise to setup a virtual env and install the dependencies.

```python
python -m venv .venv
pip install -r requirements.txt
```

1) Replace the dataBase.xlsx file with your own set of data.
    - It should contain at least a postal code or some form of address to query to OneMap API to obtain Lat/Long X/Y Coords in SVY21.

2) If the excel does not contain headers, remember to admend this line and add in the necessary labels for the columns.

```python
file_df = pd.read_excel(".venv/dataFiles/dataBase.xlsx", header= None)
file_df.columns = [""] # Replace with the column names
```

3) The script will extract the postal codes under the column **'Postal code'**.

4) It will then take that data and pass it through the OneMap API service to obtain Lat/Long/X/Y information (in SVY21) and store them accordingly.

5) Lastly, all the information that you want to display is condensed into the dataframe 'focus_df' and converted to a dictionary which is stored in 'dataBaseXX.txt'.
    - The whole text file should be copied into the JS file to be indexed.  

## Features

- Able to get user's current location
- User is also able to search a chosen location to begin
- Filters data by **Distance** and **Custom Checklist**
- Displays data on the map as markers and the information in popup boxes when the markers are selected
- Displays data on the sidebar with a **Route** link that redirects to Google Maps
- Prompts user on the possible search choices as each character is input into the search bar

## Sample

https://user-images.githubusercontent.com/62248328/141647101-aa1b4e26-00df-4b78-940c-5a314ecc8216.mp4