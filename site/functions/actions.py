import json
from openai import OpenAI


with open("oai_keys.json") as f:
    keys = json.load(f)

oai_key = keys["api_key"]
oai_org = keys["organization"]
oai_project = keys["project"]

client = OpenAI(
    api_key=oai_key,
    organization=oai_org,
    project=oai_project,
)

def generate_logprob_options(content):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a GPT."
                },
                {
                    "role": "user",
                    "content": f"Continue the string. Respond with only your best guess for the next token(s) in the string. Do not stop. The string is: {content}"
                },
            ],
            temperature=0.0,
            max_tokens=1,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
            logprobs=True,
            top_logprobs=20,
        )
        probs = response.choices[0].logprobs.content[0].top_logprobs
        options = []
        for option in probs:
            options.append(
                {
                    "token": option.token,
                    "prob": option.logprob
                }
            )
            
    except KeyError or IndexError as e:
        print(f"KEY/INDEX ERROR: {e}")
        return []
    except Exception as e:
        print(f"API ERROR: {e}")
        return
    return options