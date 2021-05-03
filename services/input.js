const Move = require('./move')
const DB = require('./db')
const colors = require('colors')
const assert = require('assert')
class Input {
    /**
     * handles input/output for boundaries, instructions and orientation
     */
    constructor() {
        this.move = new Move()
        this.db = new DB()
        this.boundariesId = null;
    }
    async init(){
        await this.db.init()
    }
    /**
     * figuring out input type
     * @param data
     * @returns {string}
     */
     getInputType(data) {
        const splitted = data.trim().split(' ')
        // we have an instruction
        if (splitted.length === 1) {
            return 'instruction'
        } else {
            // we have boundaries
            if (splitted.length === 2) return 'boundaries'
            // we have orientation
            if (splitted.length === 3) return 'orientation'
            throw new Error('unknown input type')
        }
    }

    /**
     * adds styles to output
     * @param output
     */
    styleOutput(output){
         return colors.bold(colors.green(output))
    }

    /**
     * processing input/output according to its type
     * @param data string
     * @param useExtendedOutput boolean
     * @returns {string}
     */
    async processInput(data, useExtendedOutput = false) {
        assert(/^[a-zA-Z0-9\s]*$/.test(data), 'incorrect input')
        const inputType = this.getInputType(data)
        switch (inputType) {
            case 'boundaries':
                const boundaries = this.move.setBoundaries(data);
                const  res = await this.db.insertBoundaries(boundaries)
                this.boundariesId = res.id;
                return useExtendedOutput ? `${this.styleOutput(inputType)} command received ` : '\n'
            case 'orientation':
                this.move.decodePosition(data);
                await this.db.insertPosition(data)
                return useExtendedOutput ? `${this.styleOutput(inputType)} command received \n` + this.move.getPosition(): this.move.getPosition()
            case 'instruction':
                this.move.decodeInstruction(data);
                const robotStatus = this.move.getRobotStatus() ? 1 : 0;
                await this.db.insertInstruction(data, robotStatus)
                await this.db.insertStats(this.move.getRobotStats())
                return useExtendedOutput ? `${this.styleOutput(inputType)} command received \n` + this.move.getPosition() : this.move.getPosition()
        }
    }

    /**
     * get statistics for the current script iteration
     * @returns {string|{robotsTotal: number, worldExplored: string, robotsLost: number}}
     */
    async getStats(json = false){
        const robotsStat = this.move.getRobotStats()
        const stat = await this.db.getLatestStat(this.boundariesId)
        if(json) {
            return {
                robotsTotal: robotsStat.robotsTotal,
                robotsLost: robotsStat.robotsLostCount,
                worldExplored: this.move.getPercentExplored() + '%',
                configs: stat.configs,
                robotsAllRuns: stat.totalRobots,
                robotsLostAllRuns: stat.totalRobotsLost
            }
        }
        return `Robots total: ${robotsStat.robotsTotal}\nRobots lost: ${robotsStat.robotsLostCount}\nWorld explored: ${this.move.getPercentExplored()}%\nRobots total all run: ${stat.totalRobots}\nRobots lost all run:${stat.totalRobotsLost}\nAmount of boundaries set:${stat.configs}`

    }

}

module.exports = Input