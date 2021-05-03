const {test} = require('tap')
const db = new (require('../services/db'))()
test('save boundaries', async ({same}) => {
    await db.init()
    const res = await db.insertBoundaries('1 1')
    // console.log(res)
    same(Object.keys(res), ['id'])
})
let boundariesId
test('get boundaries', async ({equal}) => {
    const res = await db.getBoundaries()
    // console.log(res)
    equal(res.data, '1 1')
    boundariesId = res.id
})
test('save position', async ({equal}) => {
    await db.insertPosition('1 1 E')
    await db.insertPosition('1 1 S')
    const res = await db.getPositions(boundariesId)
    equal(res[0].position, '1 1 E')
    // console.log(res)
})
test('save instruction', async ({equal, same}) => {
    await db.insertInstruction('LLFFFLFLFL', 1)
    await db.insertInstruction('RRFFRRLL', 0)
    const res = await db.getInstructions(boundariesId)
    equal(res.length, 2)
    equal(res[0].isRobotLost, 1)
    same(Object.keys(res[0]), ['id', 'ts', 'instruction', 'boundariesId', 'isRobotLost'])
})
test('save stats', async ({same}) => {
    await db.insertStats({"robotsTotal": 1, "robotsLost": 0, "worldExplored": "16.67%"})
    await db.insertStats({"robotsTotal": 2, "robotsLost": 0, "worldExplored": "26.67%"})
    const res = await db.getLatestStat(boundariesId)
    same(Object.keys(res),
        ['configs', 'totalRobots', 'totalRobotsLost', 'stat'])
    const res2 = await db.getLatestStat()
    same(Object.keys(res2),
        ['configs', 'totalRobots', 'totalRobotsLost'])
// )
})
