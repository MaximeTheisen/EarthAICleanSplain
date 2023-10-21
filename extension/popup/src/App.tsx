import { useState, useEffect, useRef } from 'react'
import { Row, Col, message, Typography } from 'antd'

import SendBox from './components/SendBox'
import { Message, env } from './types'
import { ITab, NoActiveTabError } from '../../models'
import APIClient from './APIClient'
import { getBodyInnerText, getSelectedText } from '../../worker/worker'
import Messages from './components/Messages'

const client = new APIClient({ env: process.env.env as env })

const { Text } = Typography

const App = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [currTab, setCurrTab] = useState<ITab | null>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const [messageApi, contextHolder] = message.useMessage()

    const sendMessage = async (message: string) => {
        const newMessage: Message = { role: 'user', content: message }
        const newHistory: Message[] = [...messages, newMessage]

        setMessages(newHistory)

        let tab: ITab = {
            bodyInnerText: '',
            url: '',
            highlightedText: '',
        }

        try {
            tab = await getTab()
            setCurrTab(tab)
        } catch (error) {
            console.error(error)
            if (error instanceof NoActiveTabError) {
                tab = currTab as ITab
            }
        } finally {
            // send completion request to API
            await client.complete(
                {
                    prompt: newMessage,
                    history: messages,
                    tab,
                },
                (tempResult) => {
                    setMessages([
                        ...newHistory,
                        {
                            role: 'assistant',
                            content: tempResult,
                        },
                    ])
                },
                (error) => {
                    messageApi.open({
                        type: 'error',
                        content: error.message || 'Unkown error',
                    })
                }
            )
        }
    }

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight
        }
    }, [messages])

    const getTab = async (): Promise<ITab> => {
        let [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        })

        if (!tab || !tab.id || !tab.url) {
            throw new NoActiveTabError()
        }

        const [highlightedText, pageContent] = await Promise.all([
            getSelectedText(tab.id),
            getBodyInnerText(tab.id),
        ])

        return {
            url: tab.url,
            bodyInnerText: pageContent,
            highlightedText,
        }
    }

    return (
        <div style={{ height: '500px', width: '300px' }}>
            {contextHolder}
            <Row justify={'center'}>
                <Col>
                    <Text>
                        <a
                            href="https://forms.gle/Y155rLsTGDq3CYxu5"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Send Feedback
                        </a>
                    </Text>
                </Col>
            </Row>
            <Row
                style={{
                    marginBottom: '10px',
                    height: '450px',
                    overflowY: 'auto',
                }}
                ref={listRef}
            >
                <Col span={24}>
                    <Messages messages={messages} />
                </Col>
            </Row>
            <Row
                style={{
                    position: 'sticky',
                    bottom: '10px',
                }}
            >
                <Col span={24}>
                    <SendBox sendMessage={sendMessage} />
                </Col>
            </Row>
        </div>
    )
}

export default App
