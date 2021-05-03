const {test} = require('tap')
const move = new (require('../services/move'))

test('set boundaries', ({same, throws, end}) => {
    same(move.setBoundaries('5 3'), {x: 5, y: 3})
    throws(() => move.setBoundaries('E S'), {message: 'x should be a number'})
    throws(() => move.setBoundaries('1 S'), {message: 'y should be a number'})
    end()

})
test('decode position', ({same, throws, end}) => {
    throws(() => move.getCoordinate(51), 'max coordinate value exceeded')
    same(move.decodePosition('1 1 E'), {x: 1, y: 1, orientation: 'E'})
    throws(() => move.decodePosition('1 1 E S'), {message: 'incorrect position format'})
    throws(() => move.decodePosition('E 1 E'), {message: 'x should be a number'})
    throws(() => move.decodePosition('1 1 D'), {message: 'orientation is incorrect'}
    )
    end()
})
test('get new orientation', ({same, throws, end}) => {
    same(move.getNewOrientation('L'), 'N')
    same(move.getNewOrientation('L'), 'W')
    same(move.getNewOrientation('L'), 'S')
    same(move.getNewOrientation('L'), 'E')
    same(move.getNewOrientation('R'), 'S')
    same(move.getNewOrientation('R'), 'W')
    same(move.getNewOrientation('R'), 'N')
    same(move.getNewOrientation('R'), 'E')
    throws(() => move.getNewOrientation('Z'), {message: 'incorrect turn'})
    end()
})
test('get new coordinates', ({same, throws, end}) => {
    move.decodePosition('1 1 E')
    move.getNewOrientation('R')
    // current S
    same(move.getNewCoordinates(), {x: 1, y: 0})
    move.getNewOrientation('R')
    // current W
    same(move.getNewCoordinates(), {x: 0, y: 0})
    move.getNewOrientation('R')
    // current N
    same(move.getNewCoordinates(), {x: 0, y: 1})
    // current E
    move.getNewOrientation('R')
    same(move.getNewCoordinates(), {x: 1, y: 1})
    end()
})

test('check boundaries', ({same, throws, end}) => {
    move.setBoundaries('5 3')
    move.decodePosition('1 1 E')
    same(move.isInsideBoundaries(), true)
    // move.decodePosition('5 1 E')
    // same(move.isInsideBoundaries(), false)
    end()
})
test('get new coordinates', ({same, throws, end}) => {
    throws(() => move.decodeInstruction((new Array(101)).fill('R').join('')),
        {message: 'instruction length exceeded'})
    throws(() => move.decodeInstruction('ZZZ'), {message: 'instruction is not implemented'})
    move.decodePosition('1 1 E')
    same(move.decodeInstruction('RFRFRFRF'), {x: 1, y: 1, orientation: 'E'})

    move.decodePosition('3 2 N')
    same(move.decodeInstruction('FRRFLLFFRRFLL'), {x: 3, y: 3, orientation: 'N'})
    // console.log({isRobotLost:move.isRobotLost})
    // console.log(move.scents.values())
    move.decodePosition('0 3 W')
    same(move.decodeInstruction('LLFFFLFLFL'), {x: 2, y: 3, orientation: 'S'})
    end()

})
test('get % of world explored', ({same, end}) => {
    same(move.getPercentExplored(), 33.33)


    end()
})

test('get app stats', ({same, end}) => {
    same(move.getRobotStats(), {robotsTotal: 3, robotsLostCount: 1})
    move.setBoundaries('5 3')
    move.worldCapacity = ''
    same(move.getPercentExplored(), 0)
    end()
})
test('get robot position', ({same, end}) => {
    move.decodePosition('1 1 E')
    same(move.getPosition(), '1 1 E\n')
    move.isRobotLost = true
    same(move.getPosition(), '1 1 E LOST\n')
    end()
})
test('get robot status', ({same, end}) => {
    same(move.getRobotStatus(), 1)
    move.isRobotLost = false
    same(move.getRobotStatus(), 0)
    end()
})