# rochanegra-api/app/services/llm_service.py

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
# CORRECTED IMPORT: PydanticOutputParser is now in output_parsers
from langchain_core.output_parsers import PydanticOutputParser
from app.modules.finance.schemas import TransactionCreateLLM
from app.core.config import get_settings
from datetime import datetime

# 1. Setup the parser with our Pydantic model
parser = PydanticOutputParser(pydantic_object=TransactionCreateLLM)

# 2. Create the prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", (
        "You are an expert financial assistant. Parse the user's text into a structured transaction. "
        "All expenses should be represented as positive numbers. "
        "The current date is {current_date}."
        "Format Instructions:\n{format_instructions}"
    )),
    ("human", "{user_text}"),
]).partial(format_instructions=parser.get_format_instructions())


def parse_transaction_from_text(text: str) -> TransactionCreateLLM:
    """
    Uses an LLM chain to parse natural language text into a structured Pydantic object.
    """
    settings = get_settings()
    llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY)
    chain = prompt | llm | parser
    
    response = chain.invoke({
        "user_text": text,
        "current_date": datetime.now().isoformat()
    })
    return response