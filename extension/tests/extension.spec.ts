import { request } from 'http'
import { test, extensionExpect } from './fixtures'

test.describe('ask a question', () => {
    test('popup page', async ({ page, extensionId }) => {
        await page.addInitScript(() => {
            // load body text from data.json
            document.body.innerText = JSON.stringify(require('../data.json'))
        })
        page.on('request', (request) => {
            console.log('>>', request.method(), request.url())

            if (request.url().includes('v1/chat')) {
                console.log('request payload', request.postData())
            }
        })
        page.on('response', (response) =>
            console.log('<<', response.status(), response.url())
        )

        await page.goto(`chrome-extension://${extensionId}/popup.html`)
        // get the input element and enter something
        await page.locator('#sendbox-input').fill('summarize this page')
        // listen to network response
        const responsePromise = page.waitForResponse('/v1/chat')
        await page.keyboard.press('Enter')
        const response = await responsePromise
        console.log('response', response)
    })
})
