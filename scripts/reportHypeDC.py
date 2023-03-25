import requests
import json
import xlsxwriter
from bs4 import BeautifulSoup
import sys
import os

if (len(sys.argv) < 2):
    print("URL Required")
    exit()

url = sys.argv[1]
timestamp = sys.argv[2]

head = {
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'origin': 'https://www.hypedc.com',
    'referer': 'https://www.hypedc.com/au/products/nike-air-max-270-black-black-black-ah8050-005',
    'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-gpc': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
}

r = requests.get(url, headers=head)
soup = BeautifulSoup(r.text, 'html.parser')
t = soup.select('script')[3].text

in1 = t.find('products:{"') + 11
in2 = t.find('":', in1)
id = t[in1:in2]

#data = {"productIds":[id],"forceUpdate":False}
data = {"query":"","facetFilters":[["id:" + id]],"attributesToHighlight":[],"hitsPerPage":1000}

data2 = {"query":"","filters":"visibleIn.index:true","attributesToHighlight":[],"hitsPerPage":1000,"aroundLatLng":"-27.4660994, 153.023588","aroundRadius":10000000}


os.mkdir(os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist", timestamp))
workbook = xlsxwriter.Workbook(os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist", timestamp , "Stock.xlsx"))
worksheet = workbook.add_worksheet("Store Stock")
bold = workbook.add_format({'bold': True})
worksheet.write(0, 0, 'Store Name', bold)
current_col = 0
r = requests.post('https://www.hypedc.com/au/1/indexes/hypedc_au_prd_stores/query?x-algolia-agent=Algolia%20for%20JavaScript%20(4.10.4)%3B%20Browser%20(lite)&x-algolia-api-key=x&x-algolia-application-id=x', headers=head, json=data2)
info = json.loads(r.text)

store_list = {}
a = 0
for row, i in enumerate(info['hits']):
    a = row
    try:
        worksheet.write(row + 1, 0, i['name'])
        store_list[i['erpStoreId']] = row + 1
    except:
        pass

#r = requests.post('https://www.hypedc.com/au/api/product/refresh', headers=head, json=data)
r = requests.post('https://www.hypedc.com/au/1/indexes/hypedc_au_prd_products/query?x-algolia-agent=Algolia%20for%20JavaScript%20(4.10.4)%3B%20Browser%20(lite)&x-algolia-api-key=x&x-algolia-application-id=x', headers=head, json=data)

info = json.loads(r.text)

total = int(info["hits"][0]["stockTotal"])

store_data = {}
id_list = {}
worksheet2 = workbook.add_worksheet("All Stock")
worksheet2.write(0, 0, 'Store ID', bold)
for i in info["hits"][0]["variants"]:
    store_data[i["code"]] = {}
    for row, j in enumerate(i["locationQtys"]):
        if id_list.get(j, -1) == -1:
            worksheet2.write(row + 1, 0, j)
            id_list[j] = row + 1
        temp = store_data[i["code"]]
        temp[j] = i["locationQtys"][j]["qty"]
        store_data[i["code"]] = temp

for col, i in enumerate(store_data):
    worksheet2.write(0, col + 1, i, bold)
    for j in store_data[i]:
        row = id_list[j]
        worksheet2.write(row, col + 1, store_data[i][j])

for i in info["hits"][0]["variants"]:
    current_col += 1
    worksheet.write(0, current_col, i["code"], bold)
    for j in i['locationQtys']:
        try:
            row = store_list[j]
            worksheet.write(row, current_col, i['locationQtys'][j]['qty'])
        except:
            pass

workbook.close()
print(total)