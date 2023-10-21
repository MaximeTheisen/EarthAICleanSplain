// React component showing chat messages

import React from 'react'

import { Card, Col, Row } from 'antd'
import ReactMarkdown from 'react-markdown'
import { Message } from '../types'

interface MessagesProps {
    messages: Message[]
}

const Messages: React.FC<MessagesProps> = ({ messages }) => {
    return (
        <div>
            {messages.map((item: Message) => (
                <Row
                    justify={item.role === 'assistant' ? 'start' : 'end'}
                    style={{
                        marginBottom: '5px',
                    }}
                >
                    <Col>
                        <Card
                            style={{
                                backgroundColor: 'rgb(240,240,240)',
                            }}
                        >
                            <ReactMarkdown>{item.content}</ReactMarkdown>
                        </Card>
                    </Col>
                </Row>
            ))}
        </div>
    )
}
export default Messages
