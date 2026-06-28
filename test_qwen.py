from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
)

response = client.chat.completions.create(
    model="qwen-plus",
    messages=[
        {"role": "system", "content": "You are AgriPulse AI, an agricultural assistant for Kenyan smallholder farmers."},
        {"role": "user", "content": "My maize leaves are turning yellow in Kisumu. What should I do?"}
    ]
)

print(response.choices[0].message.content)