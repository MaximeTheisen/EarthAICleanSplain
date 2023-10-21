type Message = {
    role: 'user' | 'assistant'
    content: string
}

type env = 'development' | 'production' | 'test'

export { type Message, type env }
