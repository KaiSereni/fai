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
                    "content": "You are acting as a GPT."
                },
                {
                    "role": "user",
                    "content": f"Continue the string. Respond with only your best guess for the next token(s) in the string. Do not stop. The string is: {content}"
                    # Okay, I get that this diverges from the explanation given on the website, but in order to fix it I would have had to run my own
                    # LLM on a server, and not only are there not many good open-source LLMs as of yet, I also don't have the money to get a server
                    # with the needed processing power. I used this solution as the OpenAI API gives logprobs, but we can't see the data stream and
                    # the logprobs at the same time.
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

def get_corrections(string: str, context_title: str):
    # For each token in the input string, create a string by combining it with all the previous tokens and get the top 100 next tokens
    corrections = []
    split_string = string.split()
    for i in range(len(split_string)):
        input_text = " ".join(split_string[:i])
        input_text = f"{context_title}\n{input_text}"
        input_word = split_string[i]
        top_next_tokens = generate_logprob_options(input_text)
        corrections.append({
            "word": input_word,
            "corrections": top_next_tokens,
        })
    
    return corrections

if __name__ == "__main__":
    string = "The quick brown fox jumps over the lazy dog"
    context_title = "The whole alphabet"
    corrections = get_corrections(string, context_title)
    print(corrections)