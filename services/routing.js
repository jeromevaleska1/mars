const Input = require('./input')
const express = require('express')
const ajv = new (require('ajv'))

class Routing {
    /**
     * app routing module
     * @param app
     */
    constructor(app) {
        this.app = app;
        this.input = new Input();
        (async () => {
            await this.input.init();
            await this.init()
        })()
    }

    init() {
        this.app.use('/doc', express.static('./out'))
        this.app.use(express.json())
        /**
         * POST access point to send commands to robot
         */
        this.app.post('/command/', async (req, res) => {
            try {
                const schema = {
                    type: "object",
                    properties: {input: {type: 'string'}},
                    required: ['input']
                }
                const isValid = ajv.validate(schema, req.body)
                if (!isValid) throw new Error('validation failed')
                res.json({
                    success: true,
                    response:await this.input.processInput(req.body.input)
                })
            } catch (e) {
                res.json({success: false, message: 'error processing input'})
            }
        })
        /**
         * GET access point to send commands to robot
         */
        this.app.get('/command/:input', async (req, res) => {
            try {
                res.send(await this.input.processInput(req.params.input))
            } catch (e) {
                res.send('error processing input')
            }
        })
        /**
         * gets robot stats
         */
        this.app.get('/stats', async (req, res) => {
            res.json(await this.input.getStats(true))
        })
    }
}

module.exports = Routing;