# ForgotAI by Pohakoo, LLC: Open Source Repo

Setup instructions:

## Setup the frontend at `/site/`

Run `npm i` to install dependencies<br>
Create a new [ReactJS](https://react.dev/learn) project<br>
Run `npx react dev` and open `localhost:3000`

## Setup the backend at `/site/functions`:

Create a venv and install the required packages

```shell
cd functions
python -m venv venv

#Windows:
venv/Scripts/activate
#Mac/Linux:
sudo source venv/bin/activate

pip install -m requirements.txt
```

The current `main.py` file is designed to run in Google Firebase Functions, so you need to modify it to start using the functions in the other scripts. You'll also need your own OpenAI keys. When you have them, create a file at `functions/oai_keys.json` and add the following:

```json
{
    "api_key":"sk-proj-KEY",
    "organization":"org-KEY",
    "project":"proj_KEY"
}
```