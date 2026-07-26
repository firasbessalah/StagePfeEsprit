import urllib.request, json
req = urllib.request.Request(
    'http://localhost:8000/analyze',
    data=json.dumps({"text": "Très mauvaise expérience. La maison était sale, le wifi ne marchait pas et il y avait beaucoup de bruit la nuit à cause de la route. Je suis très déçu."}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
resp = urllib.request.urlopen(req)
raw = resp.read()
print("RAW BYTES:", raw)
print("STRING:", raw.decode('utf-8'))
