## NODE - Martian Robots
App has web and CLI version and uses SQLite database to store statistics and user input

* Core logic is implemented in **Move** class
* **Routing** class is responsible for web API, POST endpoint uses AJV for user input validation
* **DB** is responsible for saving and retrieving user data and statistics
* **Input** handles user input, identifies its type and makes some validation

Each class has a corresponding test suit in **test** directory

### Docker image
`docker pull jeromevaleska/mars`
to get the image

`docker run -d jeromevaleska/mars -p 3000:3000`
to run container
### Documentation
after image is up and running services and API methods documentation is available at [http://localhost:3000/doc](http://localhost:3000/doc)
### tests
Tests are created with [TAP](https://node-tap.org/) and  available at the **test** directory

They can be executed with 
`docker exec -it <image id> npm test`
or `npm test` if app runs without docker

Output is similar to 
```

🌈 SUMMARY RESULTS 🌈


Suites:   4 passed, 4 of 4 completed
Asserts:  65 passed, of 65
Time:     4s
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 db.js    |     100 |      100 |     100 |     100 |                   
 input.js |     100 |      100 |     100 |     100 |                   
 move.js  |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------
```
### CLI version 
`docker exec -it <image id> script.sh`
or with `./script.sh` if app runs without docker

user interaction and output is similar to
```
Please enter a command and press Enter
5 3

Please enter a command and press Enter
1 1 E
1 1 E
Please enter a command and press Enter
RFRFRFRF
1 1 E
Please enter a command and press Enter
^C
Robots total: 1
Robots lost: 0
World explored: 16.67%
Robots total all run: 456
Robots lost all run:145
Amount of boundaries set:257
```

if **extended** parameter passed to the script `./script.sh extended` additional **command type** output will be added
```
Please enter a command and press Enter
5 3
boundaries command received 
Please enter a command and press Enter
1 1 E
orientation command received 
1 1 E
Please enter a command and press Enter
RFRFRFRF
instruction command received 
1 1 E
Please enter a command and press Enter
^C
Robots total: 1
Robots lost: 0
World explored: 16.67%
Robots total all run: 459
Robots lost all run:147
Amount of boundaries set:267

```
instructions are validated before run and error message will be printed if necessary 
```
Please enter a command and press Enter
FBF
B - instruction is not implemented
```


### web version 
is available at `localhost:3000`
#### GET endpoint
`GET endpoint http://localhost:3000/command`
`curl localhost:3000/command/5%203` for boundaries
output `\n`

`curl localhost:3000/command/1%201%20E` for orientation
output `1 1 E`

`curl localhost:3000/command/RFRFRFRF` for instructions
output `1 1 E`

`http://localhost:3000/stats` provides additional statistics 

output `{"robotsTotal":1,"robotsLost":0,"worldExplored":"16.67%","configs":14,"robotsAllRuns":26,"robotsLostAllRuns":7}`

#### POST endpoint
`POST http://localhost:3000/command/` accepts **input** parameter similar to this
for boundaries
`curl -X POST localhost:3000/command -d '{"input":"5 3"}' --header "Content-Type: application/json"`
output `{"success":true,"response":"\n"}`

for orientation
`curl -X POST localhost:3000/command -d '{"input":"5 3"}' --header "Content-Type: application/json"`
output `{"success":true,"response":"1 1 E\n"}`

for instructions
`curl -X POST localhost:3000/command -d '{"input":"RFRFRFRF"}' --header "Content-Type: application/json"`
output `{"success":true,"response":"1 1 E\n"}`
