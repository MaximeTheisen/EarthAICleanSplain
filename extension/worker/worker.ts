// // open explanation page on install
// chrome.runtime.onInstalled.addListener(function listener(details) {
//     if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
//         chrome.tabs.create({ url: 'https://empathy-know-550140.framer.app/' })
//         chrome.runtime.onInstalled.removeListener(listener)
//     }
// })

import { NoActiveTabError } from '../models'
import { Terms } from '../popup/src/types'

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

export async function highlightTerms(tabId: number, terms: Terms[]) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },

            func: () => {
                console.log('highlighting terms...')

                const terms = [
                    {
                        citation:
                            'commitment to responsible and environmentally-friendly design',
                        tag: 'orange',
                        explanation:
                            'Generic environmental claims are prohibited when they are not based on recognized excellent environmental performance relevant to the claim.',
                        alternative: [
                            {
                                original:
                                    'commitment to responsible and environmentally-friendly design',
                                alternative: 'commitment to responsible design',
                            },
                        ],
                    },
                ]

                for (const term of terms) {
                    var context = document.querySelector('body')
                    var instance = new Mark(context as HTMLElement)

                    // const options: Mark.MarkOptions = {
                    //     element: 'span',
                    //     className: 'custom-highlight',
                    // }

                    instance.mark(term.citation)
                }
                // // inject css
                // const css = `.custom-highlight {
                //     background-color: red;  /* Change 'red' to your desired color */
                //     color: black;
                // }`
                // const style = document.createElement('style')
                // style.type = 'text/css'
                // style.appendChild(document.createTextNode(css))
            },
        })
    } catch (error) {
        console.error(error)
    }
}

export async function getActiveTabID() {
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    })

    if (!tab || !tab.id || !tab.url) {
        throw new NoActiveTabError()
    }

    return tab.id
}
