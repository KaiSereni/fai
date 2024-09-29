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

def generate_completion(system_text:str, user_text:str) -> str:
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_text},
            {"role": "user", "content": user_text}
        ]
    )

    return completion.choices[0].message.content

def generate_logprob_options(chat_message: str) -> list[dict]:
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "Your job is to match an input phrase to different tasks."
                },
                {
                    "role": "user",
                    "content": chat_message
                },
            ],
            temperature=0.0,
            max_tokens=1,
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
                    "token": option.token.strip(),
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

def assistant_speech_output(user_input: str, result_character: str, possible_actions: list[str] = "") -> str:
    if (result_character == "?"):
        return "I'm unable to run that action (action not on list)."
    if (result_character == "*"):
        return "Please request an action for me to run (no action requested)."
    assistant_system = "You are a virtual assistant, responsible for completing tasks."
    assistant_user = f"""
The user's request was the following: {user_input}
In response, you activated the following task: {possible_actions[int(result_character)]}
The user's request was completed successfully.
Generate a response to the user's request in as few words as possible.
    """
    assistant_output = generate_completion(system_text=assistant_system, user_text=assistant_user)
    return assistant_output

def get_highest_logprob_option(options: list[dict]) -> str:
    highest_prob = -10000
    highest_option = ""
    for option in options:
        if option["prob"] > highest_prob:
            highest_prob = option["prob"]
            highest_option = option["token"]
    return highest_option


def text_to_action(input_text: str, possible_actions: list[str]) -> str:
    if (len(possible_actions) > 10):
        raise OverflowError("Too many possible actions!")
    logprob_text = f"The user has sent the following prompt: {input_text}."
    i = 0
    for action in possible_actions:
        logprob_text += f"\nIf the user has indicated that they want to: {action}, return the number {i}."
        i+=1
    logprob_text += "\nIf the user has requested an action that is not one of these, return the ? character."
    logprob_text += "\nIf it doesn't seem like the user made a request at all, return the * character."
    logprob_text += "\nReturn one token and nothing else."
    logprob_options = generate_logprob_options(logprob_text)
    result_character = get_highest_logprob_option(logprob_options)
    return result_character


def assistant_response(input_string: str, possible_actions: list[str]) -> str:
    result_character = text_to_action(input_string, possible_actions)
    try:
        result_character = int(result_character)
        speech_output = assistant_speech_output(input_string, result_character, possible_actions)
        final_output = f"""
    The model chose action index {result_character}: {possible_actions[result_character]}
    The model's response is: {speech_output}
    """
    except:
        result_character = result_character
        final_output = f"""
    The model's response is: {assistant_speech_output(user_input="", result_character=result_character)}
    """
    return final_output

def speech_to_text(blob):
    transcription = client.audio.transcriptions.create(
        model="whisper-1", 
        file=blob
    )
    return transcription.text

if __name__ == "__main__":
    prompt = "DISABLE DA KITCHEN BRIGHTNESS THING."
    #prompt = "My spaceship is in need of a bath."
    #prompt = "Open the door to me spaceship."
    #prompt = "Light up my bedroom, bestie."
    #prompt = "Turn the kitchen light on. Or off. I don't really care."
    actions = ["Turn on the kitchen light.", "Turn off the kitchen light.", "Turn on the bedroom light.", "Turn off the bedroom light."]
    print(assistant_response(prompt, actions))