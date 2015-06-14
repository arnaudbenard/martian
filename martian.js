const _ = require('lodash');

// global variables are ok for small scripts
let grid = {};
let scents = [];

/**
 * Get grid size from string
 * @param  {String} str first lines
 * @return {Object}     x,y size
 */
const getGridSize = (str) => {
  const [x, y] = str.split(' ').map(Number);
  if (x > 50 || y > 50) throw new Error('Grid is too big (>50)');
  return {x, y};
};

/**
 * Parse line to get position of robot
 * @param  {String} str Line
 * @return {Object}     Position of robot
 */
const getPosition = (str) => {
  let [x, y, dir] = str.split(' ');
  return {
    x: Number(x),
    y: Number(y),
    dir: dir
  };
};

/**
 * Parse input string
 * @param  {String} str Input
 * @return {Array}     Robots
 */
const parseInput = (str) => {
  const [firstLine, ...lines] = str.split('\n');
  grid = getGridSize(firstLine);

  return _.chain(lines)
  .compact() // remove empty strings
  .chunk(2) // groupy by two first lines
  .map((line) => {
    return {
      position: getPosition(line[0]),
      commands: line[1].split(''),
    };
  })
  .value();
};

/**
 * Turn right based on direction
 * @param  {Number} robot.x   X
 * @param  {Number} robot.y   Y
 * @param  {String} robot.dir Direction
 * @return {Object}             Robot
 *
 * Logic taken from http://tillreiter.github.io/js_exercise_planet/
 */
const turnR = ({x, y, dir}) => {
  let angles = ['N', 'E', 'S', 'W'];
  let i = angles.indexOf(dir);
  if (i === 3) i = -1;
  return {
    x,
    y,
    dir: angles[i+1]
  };
};

/**
 * Turn left based on direction
 * @param  {Number} robot.x   X
 * @param  {Number} robot.y   Y
 * @param  {String} robot.dir Direction
 * @return {Object}             Robot
 *
 * Logic taken from http://tillreiter.github.io/js_exercise_planet/
 */
const turnL = ({x, y, dir}) => {
  let angles = ['N', 'W', 'S', 'E'];
  let i = angles.indexOf(dir);
  if (i === 3) i = -1;
  return {
    x,
    y,
    dir: angles[i+1]
  };
};

/**
 * Detect if out of grid
 * @param  {Number} x X
 * @param  {Number} y Y
 * @return {Boolean}   Is out of grid
 */
const isOut = (x, y) => x < 0 || x > grid.x || y < 0 || y > grid.y;

/**
 * Detect if scent is here, returns scent object or undefined
 * @param  {Number} x X
 * @param  {Number} y Y
 * @return {Object}   Position of scent
 */
const isScent = (x, y) => _.findWhere(scents, {x, y});

/**
 * Move forward based on direction
 * @param  {Number} robot.x   X
 * @param  {Number} robot.y   Y
 * @param  {String} robot.dir Direction
 * @return {Object}             Robot
 */
const forward = ({x, y, dir}) => {
  let previous = {x, y, dir};

  if (dir === 'N') y++;
  if (dir === 'E') x++;
  if (dir === 'S') y--;
  if (dir === 'W') x--;

  if (isOut(x, y)) {
    return isScent(previous.x, previous.y) ? previous : _.extend(previous, {lost: true});
  }

  return {x, y, dir};
};

/**
 * Run the commands for a robot
 * @param  {Object} robot Robot
 */
const runCommands = (robot) => {
  if (!grid.x || !grid.y) throw new Error('No grid defined');
  const result = robot.commands.reduce((position, cmd) => {
    if (position.lost) return position; // not the most efficient but cleaner
    if (cmd === 'R') return turnR(position);
    if (cmd === 'L') return turnL(position);
    if (cmd === 'F') return forward(position);
  }, robot.position);

  if (result.lost) scents.push(result);
  console.log(`${result.x} ${result.y} ${result.dir} ${result.lost ? 'LOST' : ''}`);
};

/*
  Execute sample commands
 */
const input = `5 3
1 1 E
RFRFRFRF

3 2 N
FRRFLLFFRRFLL

0 3 W
LLFFFLFLFL`;

let robots = parseInput(input);
robots.forEach((robot) => runCommands(robot));
