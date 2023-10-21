/**
 * class Alternative(BaseModel):
    original: str
    alternative: str


class Term(BaseModel):
    citation: str
    tag: str
    explanation: str
    alternative: list[Alternative]
 */

type Terms = {
    citation: string
    tag: string
    explanation: string
    alternative: { original: string; alternative: string }[]
}

type env = 'development' | 'production' | 'test'

export { type Terms, type env }
