import { useState, useEffect, useRef } from 'react'
import { Row, Col, message, Typography, Button } from 'antd'

import { Terms, env } from './types'
import { ITab, NoActiveTabError } from '../../models'
import APIClient from './APIClient'
import { getBodyInnerText, getSelectedText } from '../../worker/worker'

const client = new APIClient({ env: process.env.env as env })

const App = () => {
    const [terms, setTerms] = useState<Terms[]>([])
    const [currTab, setCurrTab] = useState<ITab | null>(null)
    const [messageApi, contextHolder] = message.useMessage()

    const [isChecking, setIsChecking] = useState(false)

    const checkText = async () => {
        console.log('checking text')
        setIsChecking(true)
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
            const json = await client.proofread(
                {
                    text: tab.bodyInnerText,
                },
                (error) => {
                    messageApi.open({
                        type: 'error',
                        content: error.message || 'Unkown error',
                    })
                }
            )
            setTerms(json.terms)
            messageApi.open({
                type: 'success',
                content: 'Check complete',
            })
            setIsChecking(false)
        }
    }

    useEffect(() => {
        console.log('terms', terms)
    }, [terms])

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
        <div>
            {contextHolder}
            <Row justify={'center'}>
                <Col>
                    <Button loading={isChecking} onClick={checkText}>
                        Check for Greenwashing
                    </Button>
                </Col>
            </Row>
        </div>
    )
}

export default App
