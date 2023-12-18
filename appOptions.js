import commandLineArgs from 'command-line-args'

const optionDefinitions = [{name: 'data', type: Boolean}]
const appOptions = commandLineArgs(optionDefinitions)

export default appOptions
