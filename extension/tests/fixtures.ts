// fixtures.ts
import {
    test as base,
    expect,
    defineConfig,
    chromium,
    type BrowserContext,
} from '@playwright/test'
import path from 'path'

export const test = base.extend<{
    context: BrowserContext
    extensionId: string
}>({
    context: async ({}, use) => {
        const pathToExtension = path.join(__dirname, '..', 'dist')
        console.log('pathToExtension', pathToExtension)
        const context = await chromium.launchPersistentContext('', {
            headless: false,
            args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`,
            ],
        })
        await use(context)
        await context.close()
    },
    extensionId: async ({ context }, use) => {
        // for manifest v3:
        let [background] = context.serviceWorkers()
        if (!background)
            background = await context.waitForEvent('serviceworker')

        const extensionId = background.url().split('/')[2]
        await use(extensionId)
    },
})
export const extensionExpect = test.expect
