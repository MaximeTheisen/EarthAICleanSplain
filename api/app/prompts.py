import openai
import json

from openai.embeddings_utils import get_embedding, cosine_similarity

import pandas as pd
import numpy as np
from ast import literal_eval


datafile_path = "EU_directive_paragraphs.csv"

df = pd.read_csv(datafile_path)
df["embedding"] = df.embedding.apply(literal_eval).apply(np.array)


def search_reviews(df, product_description, n=3, pprint=True):
    embedding = get_embedding(product_description, model="text-embedding-ada-002")
    df["similarities"] = df.ada_embedding.apply(
        lambda x: cosine_similarity(x, embedding)
    )
    res = df.sort_values("similarities", ascending=False).head(n)
    return res


def cleansplain(ecoterms, context):
    explain_dict_green = dict(
        zip(
            ["100% post-consumer recycled plastic"],
            [
                "This claim looks like it’s been substantiated by a life-cycle assessment."
            ],
        )
    )
    explain_dict_orange = dict(
        zip(
            ["commitment to responsible and environmentally-friendly design"],
            [
                "Generic environmental claims are prohibited when they are not based on recognized excellent environmental performance relevant to the claim."
            ],
        )
    )
    explain_dict_red = dict(
        zip(
            ["planet-positive materials"],
            [
                "There is no such thing as planet-positive in terms of materials. Be more precise."
            ],
        )
    )

    exp_list = []
    for ecoterm, con in zip(ecoterms, context):
        res = search_reviews(df, ecoterm, n=3)

        explanation = None
        if ecoterm in explain_dict_green:
            expl = dict(ecoterm)
            explanation = ["green", con, expl, res]
        if ecoterm in explain_dict_orange:
            expl = dict(ecoterm)
            explanation = ["orange", con, expl, res]
        if ecoterm in explain_dict_red:
            expl = dict(ecoterm)
            explanation = ["red", con, expl, res]

        if explanation != None:
            exp_list.append

    return exp_list


def run_conversation(website_text):
    format = """
    {
        "terms": [
            {
                "citation": "<str>",
                "tag": "<str>",
                "explanation": "<str>"
            }
        ]
    }
    """

    # Step 1: send the conversation and available functions to GPT
    messages = [
        {
            "role": "user",
            "content": f"Please identify greenwashing terms in the following abstract. Respond in JSON in the following format {format}:\n{website_text}",
        }
    ]
    functions = [
        {
            "name": "check_green",
            "description": "Use this function to identify greenwashing terms in a provided piece of text and suggest improvements.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ecoterms": {
                        "type": "list of strings",
                        "description": "A list of identified greenwashing terms found in the text. The possible terms are: [commitment to responsible and environmentally-friendly design, planet-positive materials, 100% post-consumer recycled plastic]",
                    },
                    "context": {
                        "type": "list of strings",
                        "description": "A list of context sentences, one for each greenwashing term in ecoterms. Save the text around the identified greenwashing terms in this variable.",
                    },
                },
                "required": [],
            },
        },
    ]
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=messages,
        functions=functions,
        function_call="auto",  # auto is default, but we'll be explicit
    )
    response_message = response["choices"][0]["message"]

    # Step 2: check if GPT wanted to call a function
    if response_message.get("function_call"):
        # Step 3: call the function
        # Note: the JSON response may not always be valid; be sure to handle errors
        available_functions = {
            "check_green": cleansplain,
        }  # only one function in this example, but you can have multiple
        function_name = response_message["function_call"]["name"]
        function_to_call = available_functions[function_name]
        function_args = json.loads(response_message["function_call"]["arguments"])
        function_response = function_to_call(
            terms=function_args.get("ecoterms"),
            context=function_args.get("context"),
        )

        # Step 4: send the info on the function call and function response to GPT
        messages.append(response_message)  # extend conversation with assistant's reply
        messages.append(
            {
                "role": "function",
                "name": function_name,
                "content": function_response,
            }
        )  # extend conversation with function response
        second_response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages,
        )  # get a new response from GPT where it can see the function response
        return second_response
