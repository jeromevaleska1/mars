const {test} = require('tap')
const got = require('got')
const host = 'http://localhost:3000'
/**
 * get method
 */
test('set boundaries', async ({equal}) => {
    const res = await got(`${host}/command/5%203`)
    equal(res.body, '\n')
})
test('set orientation first robot', async ({equal}) => {
    const res = await got(`${host}/command/1%201%20E`)
    equal(res.body, '1 1 E\n')
})
test('set instruction first robot', async ({equal}) => {
    const res = await got(`${host}/command/RFRFRFRF`)
    equal(res.body, '1 1 E\n')
})
test('set orientation second robot', async ({equal}) => {
    const res = await got(`${host}/command/3%202%20N`)
    equal(res.body, '3 2 N\n')
})
test('set instruction second robot', async ({equal}) => {
    const res = await got(`${host}/command/FRRFLLFFRRFLL`)
    equal(res.body, '3 3 N LOST\n')
})
test('set orientation third robot', async ({equal}) => {
    const res = await got(`${host}/command/0%203%20W`)
    equal(res.body, '0 3 W\n')
})
test('set instruction third robot', async ({equal}) => {
    const res = await got(`${host}/command/LLFFFLFLFL`)
    equal(res.body, '2 3 S\n')
    const res2 = await got(`${host}/command/LLFFFLFLFL!`)
    equal(res2.body, 'error processing input')

})
/**
 * post method
 */
test('set boundaries', async ({equal, same}) => {
    const res = await got.post(`${host}/command/`, {
        json: {input: '5 3'}, responseType: 'json'
    },)
    same(res.body, {success: true, response: '\n'})
    const res2 = await got.post(`${host}/command/`, {json: {input: '5 3!'}, responseType: 'json'})
    same(res2.body, {success: false, message: 'error processing input'})

})
test('set orientation first robot', async ({same}) => {
    const res = await got.post(`${host}/command/`, {json: {input: '1 1 E'}, responseType: 'json'})
    same(res.body, {success: true, response: '1 1 E\n'})
})
test('set instruction first robot', async ({same}) => {
    const res = await got.post(`${host}/command/`, {json: {input: 'RFRFRFRF'}, responseType: 'json'})
    same(res.body, {success: true, response: '1 1 E\n'})
})
test('get stats', async ({same}) => {
    const res = await got.get(`${host}/stats`, {
        responseType: 'json'
    })
    same(Object.keys(res.body), ['robotsTotal',
        'robotsLost',
        'worldExplored',
        'configs',
        'robotsAllRuns',
        'robotsLostAllRuns'])

    // equal(res.body, '1 1 E\n')
})

