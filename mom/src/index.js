//@ts-check

/** @type {[string, string, (x: string) => string][]} */
const tools = [
    ['Unique', 'Enter lines', value => {
        const unique = new Set(value.split('\n'))
        unique.delete('')
        return Array.from(unique).join('\n')
    }]
]

let transformFn = tools[0][2]

const dropdown = document.querySelector('select')
/** @type {HTMLTextAreaElement} */
const left = document.querySelector('.left textarea')
/** @type {HTMLElement} */
const right = document.querySelector('.right')
const copyButton = document.querySelector('button')

dropdown.addEventListener('input', () => {
    transformFn = tools.find(tool => tool[0] === dropdown.textContent)[2]
    transform()
})

left.addEventListener('input', transform)

copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(right.innerText).catch(console.error)
    copyButton.textContent = 'Copied!'
    setTimeout(() => copyButton.textContent = 'Copy', 750)
})

for (const tool of tools) {
    const option = dropdown.appendChild(document.createElement('option'))
    option.textContent = tool[0]
    left.placeholder = tool[1]
}

function transform() {
    try {
        right.innerText = transformFn(left.value)
    } catch (err) {
        right.innerText = `Error: ${err.message}`
    }
}
