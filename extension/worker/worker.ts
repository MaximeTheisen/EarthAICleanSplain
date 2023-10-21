// // open explanation page on install
// chrome.runtime.onInstalled.addListener(function listener(details) {
//     if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
//         chrome.tabs.create({ url: 'https://empathy-know-550140.framer.app/' })
//         chrome.runtime.onInstalled.removeListener(listener)
//     }
// })

// Retrieves the selected text on the current tab
export async function getSelectedText(tabId: number) {
    try {
        let injectionResults = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                return window.getSelection()!.toString()
            },
        })
        if (injectionResults && injectionResults.length >= 1) {
            let selection = injectionResults[0].result
            return selection
        } else {
            throw new Error('Unknown error')
        }
    } catch (error: any) {
        if (
            error.message.includes('chrome:// URL') ||
            error.message.includes('edge:// URL')
        ) {
            throw new Error('Unable to select text in browser-internal pages')
        } else {
            console.error(error)
            throw new Error('Unknown error')
        }
    }
}

export async function getBodyInnerText(tabId: number) {
    try {
        let injectionResults = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                return document.body.innerText
            },
        })
        if (injectionResults && injectionResults.length >= 1) {
            let selection = injectionResults[0].result
            return selection
        }
    } catch (error) {
        console.error(error)
        // TODO proper error handling
    }
}
