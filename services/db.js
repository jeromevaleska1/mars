const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const assert = require('assert')
class DB {
    /**
     * sqlite db api
     * @param dbFile
     */
    constructor(dbFile = '/tmp/database.db') {
        this.dbFile = dbFile
    }

    /**
     * creates db, necessary tables and indexes
     * @returns {NodeJS.Global.Promise<void>}
     */
    async init() {
        this.db = await open({
            filename: this.dbFile,
            driver: sqlite3.Database
        })
        // boundaries
        await this.db.exec(`create table if not exists 
            boundaries(id integer primary key, ts integer, data text)`)
        // positions
        await this.db.exec(`create table if not exists 
            positions(id integer primary key, ts integer, position text, boundariesId integer)`)
        // instructions
        await this.db.exec(`create table if not exists 
            instructions(id integer primary key, ts integer, instruction text, boundariesId integer, isRobotLost integer )`)
        // index for lost robots field
        await this.db.exec(`create index if not exists robotLostIndex on instructions(isRobotLost)`)
        // statistics
        await this.db.exec(`create table if not exists 
            stats(id integer primary key, ts integer, stat text, boundariesId integer)`)
    }

    /**
     * saves new boundaries
     * @param data
     * @returns {NodeJS.Global.Promise<{id: number}>}
     */
    async insertBoundaries(data) {
        const res = await this.db.run(`insert into boundaries(ts, data) 
        values (?,?)`, (new Date()).getTime(), data)
       return {id:res.lastID}
    }

    /**
     * returns last boundaries record from DB
     * @returns {Promise<any | undefined>}
     */
    getBoundaries() {
        return this.db.get(`select id, ts, data from boundaries order by id desc limit 1`)
    }

    getPositions(boundariesId) {
        return this.db.all(`select id, ts, position, boundariesId 
    from positions 
    where boundariesId = ? order by id`, boundariesId)
    }
    /**
     *
     */
    async insertPosition(position) {
        const boundaries = await this.getBoundaries()
       return this.db.run(`insert into positions(ts, position, boundariesId) values(?,?,?)`,
           this.getTs(),position, boundaries.id )
    }
    getTs(){
        return new Date().getTime()
    }

    /**
     * saves instruction
     * @param instruction
     * @param isRobotLost
     * @returns {Promise<ISqlite.RunResult<sqlite3.Statement>>}
     */
    async insertInstruction(instruction, isRobotLost) {
        const boundaries = await this.getBoundaries()
        return this.db.run(`insert into instructions(ts, instruction, boundariesId, isRobotLost) values(?,?,?,?)`,
            this.getTs(),instruction, boundaries.id, isRobotLost )
    }

    /**
     * gets all instructions for specific boundaries
     * @param boundariesId
     * @returns {Promise<any[]>}
     */
    async getInstructions(boundariesId){
        return this.db.all(`select * from instructions where boundariesId = ? order by id`,
        boundariesId
            )
    }

    /**
     * saves robot stats
     * @param stat
     * @returns {Promise<ISqlite.RunResult<sqlite3.Statement>>}
     */
    async insertStats(stat) {
        const boundaries = await this.getBoundaries()
        return this.db.run(`insert into stats(ts, stat, boundariesId) values(?,?,?)`,
            this.getTs(),JSON.stringify(stat), boundaries.id )
    }


    /**
     * gets statistic
     * @param boundariesId
     * @returns {Promise}
     */
    async getLatestStat(boundariesId){
        let stat = null;
        if(!!boundariesId){
            stat = await  this.db.get(`select stat from stats where boundariesId = ? order by id desc`, boundariesId);
        }
        const configs = await this.db.get('select count(id) as count from boundaries')
        const robots = await this.db.get('select count(id) as totalRobots from instructions ')
        const totalRobotsLost = await this.db.get('select count(id) as lost from instructions where isRobotLost = 1')
        const result =  {
            configs: configs.count,
            totalRobots: robots.totalRobots,
            totalRobotsLost: totalRobotsLost.lost};
        !!stat && (result.stat =  JSON.parse(stat.stat));
        return result
    }

}

module.exports = DB