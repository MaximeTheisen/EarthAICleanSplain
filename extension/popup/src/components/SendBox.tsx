import { useEffect, useState } from 'react'
import { Input, Row, Col } from 'antd'

const { TextArea } = Input

type SendBoxProps = {
    sendMessage: (message: string) => void
}

const SendBox = ({ sendMessage }: SendBoxProps) => {
    const [currMessage, setCurrMessage] = useState<string>('')

    useEffect(() => {
        const inputElement = document.getElementById('sendbox-input')
        if (inputElement) {
            inputElement.focus()
        }
    }, [])

    const handlePressEnter = (event: any) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            const message = event.currentTarget.value
            console.log('Sending message:', message)

            sendMessage(currMessage)

            setCurrMessage('')

            event.preventDefault()
        }
    }

    return (
        <Row style={{ position: 'sticky', bottom: 0 }}>
            <Col span={24}>
                <TextArea
                    value={currMessage}
                    onChange={(event) => setCurrMessage(event.target.value)}
                    id="sendbox-input"
                    onPressEnter={handlePressEnter}
                    maxLength={1000}
                    showCount
                    placeholder="Summarize this page"
                    data-testid="sendbox-input"
                />
            </Col>
        </Row>
    )
}

export default SendBox
