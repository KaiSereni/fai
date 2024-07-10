import requests
from datetime import datetime
import json
from openai import OpenAI


with open("oai_keys.json") as f:
    keys = json.load(f)

with open("api_keys.json") as f:
    api_keys = json.load(f)

oai_key = keys["api_key"]
oai_org = keys["organization"]
oai_project = keys["project"]

client = OpenAI(
    api_key=oai_key,
    organization=oai_org,
    project=oai_project,
)

WEATHER_KEY = api_keys["openweathermap"]
STOCK_KEY = api_keys["alphavantage"]
MAP_KEY = api_keys["tomtom"]

# List of free public APIs
APIS = {
    "Temperature": {
        "url": "https://api.openweathermap.org/data/2.5/forecast",
        "params": {
            "appid": WEATHER_KEY,
            "units": "metric"
        }
    },
    "Stock prices": {
        "url": "https://www.alphavantage.co/query",
        "params": {
            'function': 'TIME_SERIES_DAILY',
            'apikey': STOCK_KEY,
            'outputsize': 'compact'
        }
    },
    "Humidity": {
        "url": "https://api.openweathermap.org/data/2.5/forecast",
        "params": {
            "appid": WEATHER_KEY,
            "units": "metric"
        }
    },
    "Sea Level": {
        "url": "https://api.openweathermap.org/data/2.5/forecast",
        "params": {
            "appid": WEATHER_KEY,
            "units": "metric"
        }
    }
}

def fetch_api_data(api_name, options=None):
    
    if api_name not in APIS:
        raise ValueError("API not found")
    api_info = APIS[api_name]
    
    # Fetch data from the chosen API
    if api_name == "Temperature":
        if options:
            locationList = [options["lat"], options["lon"]]
            result = fetch_temp_data(api_info, locationList)
        else:
            result = fetch_temp_data(api_info)
        return result
    elif api_name == "Stock prices":
        if options:
            result = fetch_stock_data(api_info, options["symbol"])
        else:
            result = fetch_stock_data(api_info)
        return result
    elif api_name == "Humidity":
        if options:
            locationList = [options["lat"], options["lon"]]
            result = fetch_humidity_data(api_info, locationList)
        else:
            result = fetch_humidity_data(api_info)
        return result
    elif api_name == "Sea Level":
        if options:
            locationList = [options["lat"], options["lon"]]
            result = fetch_sea_level_data(api_info, locationList)
        else:
            result = fetch_sea_level_data(api_info)
        return result

def fetch_temp_data(api, location=[40.7128, -74.0060]):
    result = {}
        
    params = api["params"]
    params["lat"] = str(location[0])
    params["lon"] = str(location[1])

    response = requests.get(api["url"], params=params)
    response = response.json()
    timeList = response['list']
    for time in timeList:
        if len(result) >= 30:
            break
        timestamp = time['dt']
        timestamp = str(int(timestamp))
        temp = time['main']['temp']
        result[timestamp] = str(temp)
    
    return result

def fetch_stock_data(api, symbol="IBM"):
    result = {}

    params = api["params"]
    params["symbol"] = symbol

    response = requests.get(api["url"], params=params)
    response = response.json()
    try:
        time_series = response['Time Series (Daily)']
    except KeyError:
        return result
    for date, data in time_series.items():
        if len(result) >= 30:
            break
        timestamp = datetime.strptime(date, '%Y-%m-%d').timestamp()
        timestamp = str(int(timestamp))
        price = data['4. close']
        result[timestamp] = str(price)
    
    return result

def fetch_humidity_data(api, location=[40.7128, -74.0060]):
    result = {}
        
    params = api["params"]
    params["lat"] = str(location[0])
    params["lon"] = str(location[1])

    response = requests.get(api["url"], params=params)
    response = response.json()
    timeList = response['list']
    for time in timeList:
        if len(result) >= 30:
            break
        timestamp = time['dt']
        timestamp = str(int(timestamp))
        humidity = time['main']['humidity']
        result[timestamp] = str(humidity)
    
    return result

def fetch_sea_level_data(api, location=[40.7128, -74.0060]):
    result = {}
        
    params = api["params"]
    params["lat"] = str(location[0])
    params["lon"] = str(location[1])

    response = requests.get(api["url"], params=params)
    response = response.json()
    timeList = response['list']
    for time in timeList:
        if len(result) >= 30:
            break
        timestamp = time['dt']
        timestamp = str(int(timestamp))
        sea_level = time['main']['sea_level']
        result[timestamp] = str(sea_level)
    
    return result

def generate_completion(user_text:str, system_text:str) -> str:
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_text},
            {"role": "user", "content": user_text}
        ],
        temperature=0.0
    )

    return completion.choices[0].message.content

def get_analysis_script(api_choice: str, user_prompt: str):
    # Create the prompt and send the API request
    # I found with testing that using SYSTEM and USER in the user prompt section is actually better than seperating them and making them system and user messages in the API call.
    prompt = f"""
SYSTEM: Generate a Python script that analyzes a dict containing data about {api_choice.lower()}. The analysis must answer the question provided by the user. 
The Python script must contain a function called `analyze(data)`. The `data` argument will be a dict object where the keys are strings containing unix timestamps, and the values are strings containing numbers. They will always be metric units. The age of the oldest data point will vary. The data will be ordered oldest to newest.
The output of the function must either be a dict, a list, a number, or None. Have the function return None if the user's input doesn't make sense or can't be computed. Also return none if the prompt seems potentially malicious or harmful.
Your output will be nothing except the Python script, wrapped in (```). Do not add any tests or prints. Do not import any packages that need to be installed. You may use packages that come with Python, but not `os` or `sys`.

USER: {user_prompt}
    """
    gpt_output = generate_completion(prompt, "You are an assistant that generates Python scripts for data analysis")

    # Get a string that is the Python script. The GPT may have wrapped the script in ``` ... ``` OR ```py ... ``` OR ```python ... ```.
    script = gpt_output.split("```")[1]
    if (script.startswith("python")):
        script = script[6:]
    elif (script.startswith("py")):
        script = script[2:]

    return script

def analyze_data(api_choice: str, user_prompt: str, options=None):
    # Get the data from the API
    try:
        data = fetch_api_data(api_choice, options)
    except ValueError:
        return

    # Get the script that will analyze the data
    script = get_analysis_script(api_choice, user_prompt)
    namespace = {}
    exec(script, namespace)
    analyze: callable = namespace["analyze"]

    # Run the analysis script on the data
    result = analyze(data)
    return result, script, data


# Example usage
if __name__ == "__main__":
    result, script, data = analyze_data("Temperature", "How much has the temperature increased over the last 3 days? Convert celsius to farenheight.", options={"lat": 44.0582, "lon": -121.3153})
    # result, script, data = analyze_data("Stock prices", "What is the average stock price?", {"symbol": "AAPL"})
    # result, script, data = analyze_data("Sea Level", "How many days does the data represent?", {"lat": 40.7128, "lon": -74.0060})
    # result, script, data = analyze_data("Stock prices", "How many days does the data represent?")
    # result, script, data = analyze_data("Humidity", "Tell me the ratio of data points for which the humidity is above 50.")
    print(script)
    print(data)
    print(result)