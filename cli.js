const input = new (require('./services/input'));
(async () => {
    await input.init()
    const welcomeStr = 'Please enter a command and press Enter'
    process.stdout.write(welcomeStr + '\n')
    process.stdin.on('data', async data => {
        try {
            console.log(await input.processInput(data.toString().replace('\n', '')))
            console.log(welcomeStr)
        } catch (err) {
            console.log(err.message)
            console.log(welcomeStr)
        }
    })
    process.on('SIGINT', async () => {
        console.log('\n' + await input.getStats())
        process.exit(0)
    })
})()