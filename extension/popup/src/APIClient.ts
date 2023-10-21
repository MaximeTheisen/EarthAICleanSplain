import axios, { AxiosInstance } from 'axios'
import { env, Message } from './types'
import { ITab } from '../../models'

class APIClient {
    env: env
    baseUrl: string
    axios: AxiosInstance

    devBaseUrl = 'http://localhost:8000'
    prodBaseUrl = 'lalalala'

    constructor({ env }: { env: env }) {
        this.env = env
        this.baseUrl =
            env === 'development' ? this.devBaseUrl : this.prodBaseUrl
        this.axios = axios.create({
            baseURL: this.baseUrl,
        })
    }

    async proofread(
        data: { text: string | undefined },
        onError: (error: any) => void
    ) {
        console.log('making request...')

        if (prompt.length > 1000) {
            throw new Error('Prompt is too long')
        }

        try {
            const res = await fetch(`${this.baseUrl}/proofread`, {
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

            return await res.json()
        } catch (error) {
            onError(error)
        }
    }
}

export default APIClient
