import axios, { AxiosInstance } from 'axios'
import { env, Message } from './types'
import { ITab } from '../../models'

class APIClient {
    env: env
    baseUrl: string
    axios: AxiosInstance

    devBaseUrl = 'http://localhost:8000/v1'
    prodBaseUrl = 'https://chromeai--controlk-api-fastapi-app.modal.run/v1'

    constructor({ env }: { env: env }) {
        this.env = env
        this.baseUrl =
            env === 'development' ? this.devBaseUrl : this.prodBaseUrl
        this.axios = axios.create({
            baseURL: this.baseUrl,
        })
    }

    async complete(
        data: { prompt: Message; history: Message[]; tab: ITab },
        onData: (data: any) => void,
        onError: (error: any) => void
    ) {
        if (prompt.length > 1000) {
            throw new Error('Prompt is too long')
        }

        try {
            const res = await fetch(`${this.baseUrl}/chat`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            // handle errors
            if (!res.ok) {
                throw new Error('Network response was not ok')
            }

            if (!res.body) {
                throw new Error('No body')
            }

            const reader = res.body
                .pipeThrough(new TextDecoderStream())
                .getReader()

            let result = ''
            while (true) {
                const { value, done } = await reader.read()
                if (done) break

                result += value
                onData(result)
            }
        } catch (error) {
            onError(error)
        }
    }
}

export default APIClient
