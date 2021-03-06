'use strict'
const assert = require('assert')

class Move{
    /**
     * implements robot movements
     * @param props
     * @param props.maxCoordinatesValue {integer} 50
     * @param props.implementedInstructions {string[]} 'L', 'R', 'F'
     * @param props.maxInstructionLength {integer} 100
     */
    constructor(props = {}) {
        this.boundaries = {x: 0, y: 0}
        this.currentPoint = {x: 0, y: 0}
        this.orientations = ['N', 'E', 'S', 'W']
        this.turns = ['L', 'R']
        this.implementedInstructions = props.implementedInstructions || [...this.turns, 'F']
        this.scents = new Set()
        this.areaExplored = new Set()
        this.robotsLostCount = 0;
        this.robotsTotal = 0;
        this.isRobotLost = false;
        this.prevCoordinates = null;
        this.maxCoordinatesValue = props.maxCoordinatesValue || 50;
        this.maxInstructionLength = props.maxInstructionLength || 100;
    }

    /** gets new orientation for robot
     *    N
     * W     E
     *    S
     * @param turn {string} L, R
     * @returns {string|*}
     */
    getNewOrientation(turn) {
        assert(this.turns.includes(turn), 'incorrect turn')
        const currentIndex = this.orientations.indexOf(this.currentOrientation)
        let newIndex = turn === 'L' ? currentIndex - 1 : currentIndex + 1
        // edge cases with start and end of array
        if (newIndex < 0) newIndex = this.orientations.length - 1
        if (newIndex === this.orientations.length) newIndex = 0;
        this.currentOrientation = this.orientations[newIndex]
        return this.currentOrientation;
    }

    /**
     * gets new coordinates for robot
     * @returns {*|{x: number, y: number}}
     */
    getNewCoordinates() {
        // 1 1 E
        let {x, y} = this.currentPoint
        switch (this.currentOrientation) {
            case 'E':
                x += 1;
                break;
            case 'W':
                x -= 1;
                break;
            case 'N':
                y += 1;
                break;
            case 'S':
                y -= 1;
                break;
        }
        this.prevCoordinates = {...this.currentPoint};
        const pointAsString = JSON.stringify({x, y})
        if (this.scents.has(pointAsString)) {
            return this.currentPoint;
        }
        this.currentPoint.x = this.getCoordinate(x);
        this.currentPoint.y = this.getCoordinate(y);
        return this.currentPoint;
    }

    /**
     * verifies if current coordinates are inside the boundaries
     * and adds it to the **scents** list if not
     * @returns {boolean}
     */
    isInsideBoundaries() {
        const pointAsString = JSON.stringify(this.currentPoint)
        if (this.boundaries.x < this.currentPoint.x
            || this.boundaries.y < this.currentPoint.y
            || this.currentPoint.x < 0
            || this.currentPoint.y < 0
        ) {
            this.scents.add(pointAsString)
            return false
        }
        this.areaExplored.add(pointAsString)
        return true
    }

    /**
     * sets initial boundaries and resets counters
     * @param boundaries {string} 5 3
     * @returns {*|{x: number, y: number}}
     */
    setBoundaries(boundaries) {
        const [x, y] = boundaries.split(' ')
        assert(!isNaN(x), 'x should be a number')
        assert(!isNaN(y), 'y should be a number')
        this.scents = new Set();
        this.boundaries = {x: +x, y: +y}
        this.worldCapacity = (+x + 1) * (+y + 1);
        this.areaExplored = new Set();
        this.robotsLostCount = 0;
        this.robotsTotal = 0;
        return this.boundaries
    }

    /**
     * gets % of the world explored for current boundaries
     * @returns {*}
     */
    getPercentExplored(){
        const percentExplored = (this.areaExplored.size / this.worldCapacity * 100).toFixed(2)
        return isNaN(percentExplored) ? 0 : percentExplored
    }

    /**
     * gets robots stats for current boundaries
     * @returns {{robotsTotal: number, robotsLostCount: number}}
     */
    getRobotStats(){
        return {
            robotsTotal: this.robotsTotal,
            robotsLostCount: this.robotsLostCount
        }
    }

    /**
     * checks if instruction is valid and implemented
     * @param instruction
     * @returns {array.string} ['R', 'L', 'F']
     */

    validateInstruction(instruction){
        const instructions = instruction.trim().split('')
        assert(instructions.length <= 100, 'instruction length exceeded')
        for (let elem of instructions) {
            assert(this.implementedInstructions.includes(elem),
                `\x1b[1m\x1b[31m${elem}\x1b[0m - instruction is not implemented `)
        }
        return instructions
    }
    /**
     * decodes robot instruction and runs them
     * @param instruction RFRFRFRF
     */
    decodeInstruction(instruction) {
        const instructions = this.validateInstruction(instruction)
        this.robotsTotal += 1;
        for (let elem of instructions) {
            assert(this.implementedInstructions.includes(elem), 'instruction is not implemented')
            if (this.turns.includes(elem)) {
                this.getNewOrientation(elem)
            } else {
                this.getNewCoordinates()
                if (!this.isInsideBoundaries()) {
                    // robot is lost
                    this.currentPoint = this.prevCoordinates
                    this.isRobotLost = true;
                    this.robotsLostCount += 1;
                    break;
                }
            }
        }
        return {...this.currentPoint, orientation: this.currentOrientation}
    }

    /**
     * decodes and sets robot initial position
     * @param position '1 1 E'
     * @returns {{orientation: *, x: *, y: *}}
     */
    decodePosition(position) {
        this.isRobotLost = false;
        const splitted = position.trim().split(' ')
        assert(splitted.length === 3, 'incorrect position format')
        const [x, y, orientation] = splitted
        assert(typeof (+x) === "number" && !isNaN(+x),
            'x should be a number')
        assert(typeof +y === "number" && !isNaN(+y),
            'y should be a number')
        assert(this.orientations.includes(orientation),
            'orientation is incorrect')
        this.currentPoint = {x: this.getCoordinate(x), y: this.getCoordinate(y)}
        this.currentOrientation = orientation
        return {...this.currentPoint, orientation: orientation}
    }

    /**
     * checks for coordinates limits and makes it integer
     * @param coordinate
     * @returns {number}
     */
    getCoordinate(coordinate){
        coordinate = +coordinate
        assert(coordinate < this.maxCoordinatesValue, 'max coordinate value exceeded')
        return coordinate
    }

    /**
     * outputs robot position, orientation and status
     * @returns {string}
     */
    getPosition(){
        const isLost = this.isRobotLost ? ' LOST' : ''
        return `${this.currentPoint.x} ${this.currentPoint.y} ${this.currentOrientation}${isLost}\n`
    }

    /**
     * gets robot status
     * @returns {boolean}
     */
    getRobotStatus(){
        return this.isRobotLost
    }
}

module.exports = Move;