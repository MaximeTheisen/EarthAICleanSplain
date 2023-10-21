type Terms = {
    role: 'user' | 'assistant'
    content: string
}

type env = 'development' | 'production' | 'test'

export { type Terms, type env }
