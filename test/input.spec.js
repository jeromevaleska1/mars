const Input = require('../services/input')
const input = new Input()
const {test} = require('tap')
const colors = require('colors')

test('input type evaluation', async ({same}) => {
    await input.init()
    same(input.getInputType('1 1'), 'boundaries')
    same(input.getInputType('1 1 E'), 'orientation')
    same(input.getInputType('FFF'), 'instruction')

})
test('process input', async ({same, rejects}) => {
    same(await input.processInput('5 3'), '\n')
    same(await input.processInput('1 1 E'), '1 1 E\n')
    same(await input.processInput('RFRFRFRF'), '1 1 E\n')
    input.move.isRobotLost = 1
    same(await input.processInput('RFRFRFRF'), '1 1 E LOST\n')
    rejects(async () => await input.processInput('A B C D'), 'unknown input type')
// extended output

    const getCommand = (command) => colors.bold(colors.green(command)) + ' command received '
    same(await input.processInput('5 3', true), getCommand('boundaries'))
    same(await input.processInput('1 1 E', true), getCommand('orientation') + '\n1 1 E\n')
    same(await input.processInput('RFRFRFRF', true), getCommand('instruction') + '\n1 1 E\n')

})
test('get robot stats', async ({same}) => {
    same(Object.keys(await input.getStats(true)), ['robotsTotal',
        'robotsLost',
        'worldExplored',
        'configs',
        'robotsAllRuns',
        'robotsLostAllRuns'])
    const res = await input.getStats()
    const keys = res.split('\n').map(elem => elem.split(':')[0])
    same(keys, [
        'Robots total',
        'Robots lost',
        'World explored',
        'Robots total all run',
        'Robots lost all run',
        'Amount of boundaries set'
    ])

})
test('output styling', ({equal, end}) => {
    const output = '11111'
    equal(input.styleOutput(output), colors.bold(colors.green(output)))
    console.log()
    end()
})