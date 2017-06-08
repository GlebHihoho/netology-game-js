'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error('Вы передали неправильные данные');
    }

    return new Vector(this.x + vector.x, this.y + vector.y);
  }

times(n){
    return new Vector(this.x * n, this.y * n);
  }
}


class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(pos instanceof Vector && size instanceof Vector && speed instanceof Vector)) {
      throw new Error('pos / size / speed не является vector')
    }

    this.pos   = pos;
    this.size  = size;
    this.speed = speed;
  }

  get left() {
    return this.pos.x;
  }

  get right() {
    return this.pos.x + this.size.x;
  }

  get top() {
    return this.pos.y;
  }

  get bottom() {
    return this.pos.y + this.size.y;
  }

  get type() {
    return 'actor';
  }

  act() {

  }

  isIntersect(actor) {
    if (!(actor instanceof Actor && arguments.length != 0)) {
      throw new Error('actor не является Actor')
    };

    if (
      actor.left < this.right &&
      actor.right > this.left &&
      actor.top < this.bottom &&
      actor.bottom > this.top &&
      actor !== this
    ) {
      return true;
    } else {
      return false;
    }
  }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid.slice();
    this.actors = actors.slice();
    this.height = copyGrid.length;
    this.status = null;
    this.finishDelay = 1;

    // this.max = 0;
    // if (this.grid.length) {
    //   for (let i = 0; i < this.grid.length; i++) {
    //     if (this.max < this.grid[i].length) {
    //       this.max = this.grid[i].length;
    //     }
    //   }
    // }

  }

  // лучше посчитать этот один раз в конструкторе и возвращать здесь сохранённое значение, чтобы не считать каждый раз
  get width() {
    let max = 0;

    if (this.grid.length) {
      for (let i = 0; i < this.grid.length; i++) {
        if (max < this.grid[i].length) {
          max = this.grid[i].length;
        }
      }
    }

    return max;
  }

  get player() {
    return this.actors.find(actor => actor.type === 'player');
  }

  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }

  actorAt(item) {
    return this.actors.find(actor => actor.isIntersect(item));
  }

  obstacleAt(pos, size) {
    console.log(size)
    let xStart = Math.floor(pos.x);
    let xEnd   = Math.ceil(pos.x + size.x);
    let yStart = Math.floor(pos.y);
    let yEnd   = Math.ceil(pos.y + size.y);

    if (xStart < 0 || xEnd > this.width || yStart < 0) {
      return "wall";
    }

    if (yEnd > this.height) {
      return "lava";
    }

    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        let fieldType = this.grid[y][x];
        if (fieldType) return fieldType;
      }
    }
  }

  removeActor(actor) {
    let index = 0;

    for (let i = 0; i < this.actors.length; i++) {
      if (this.actors[i] === actor) {
        index = i;
      }
    }

    this.actors.splice(index, 1);
  }

  noMoreActors(type) {
    return !this.actors.some(actor => actor.type === type);
  }

  playerTouched(type, actor) {
    if (type === 'lava' || type === 'fireball') {
      this.status = 'lost';
    }

    if (type === 'coin') {
      this.actors = this.actors.filter(other => other !== actor);

      if (this.noMoreActors('coin')) {
        this.status = "won";
      }
    }
  }
}

class Player extends Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(0.8, 1.5)) {
    super(pos, size)

    this.pos = pos.plus(new Vector(0, -0.5));
    this.size = size;
  }

  get type() {
    return 'player';
  }
}

class Fireball extends Actor {
  constructor(pos, speed) {
    super(pos, new Vector(1, 1), speed);
  }

  get type () {
    return 'fireball';
  }

  getNextPosition(time = 1) {
    // лучше обратить условие, чтобы уменьшить вложенность
    if (this.speed) {
      return this.pos.plus(this.speed.times(time));
    }
    return this.pos;
 }

  handleObstacle() {
    this.speed = this.speed.times(-1);
  }

  act(time, level) {
    let newPos = this.getNextPosition(time);
    if (level.obstacleAt(newPos, this.size)) {
      return this.handleObstacle();
    }

    return this.pos = newPos;
  }
}

class HorizontalFireball extends Fireball {
  constructor(pos) {
    super(pos, new Vector(2, 0));
    this.size = new Vector(1, 1);
  }
}

class VerticalFireball extends Fireball {
  constructor(pos) {
    super(pos, new Vector(0, 2));
    this.size = new Vector(1, 1);
  }
}

class FireRain extends Fireball {
  constructor(pos) {
    super(pos, new Vector(0, 3));
    this.size = new Vector(1, 1);
    this.oldPos = pos;
  }

  get type() {
    return 'fireball'
  }

  handleObstacle() {
    if (this.pos) {
      this.pos = this.oldPos
    }
  }
}

function random(min, max) {
  let rand = min + Math.random() * (max - min);

  return rand;
}

const phaseStart = 0;
const phaseFinish = 2 * Math.PI;

class Coin extends Actor {
  constructor(pos) {
    super(pos, new Vector(0.6, 0.6));

    this.pos  = this.pos.plus(new Vector(0.2, 0.1));
    this.spring = random(phaseStart, phaseFinish);
    this.springDist = 0.07;
    this.springSpeed = 8;
  }

  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    this.spring = this.spring + this.springSpeed * time;
  }

  getSpringVector() {
    let y = Math.sin(this.spring) * this.springDist;
    return new Vector(0, y);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.pos.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class LevelParser {
  constructor(symbol) {
    this.symbol = symbol;
  }

  actorFromSymbol(str) {
    if (this.symbol) {
      return this.symbol[str];
    }
  }

  obstacleFromSymbol(str) {
    switch(str) {
      case 'x' : return 'wall';
      case '!' : return 'lava';
      default  : return undefined;
    }
  }

  createGrid(arrString) {
    return arrString.map(char => {
      return char.split('').map(ch => this.obstacleFromSymbol(ch));
    })
  }

  createActors(plan) {
    let actors = [];
    if (this.symbol === undefined) return [];

    for (let x = 0; x < plan.length; x++) {
      for (let y = 0; y < plan[x].length; y++) {

        if (typeof this.symbol[plan[x][y]] === 'function') {
          let actor = new this.symbol[plan[x][y]](new Vector(y, x));
          if (actor instanceof Actor) {
            actors.push(actor);
          }
        }
      }
    }
    return actors;
  }

  parse(plan) {
    return new Level(this.createGrid(plan), this.createActors(plan))
  }
}


const schemas = [
  [
    "     v                 ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "  |xxx       w         ",
    "  o                 o  ",
    "  x               = x  ",
    "  x          o o    x  ",
    "  x  @    *  xxxxx  x  ",
    "  xxxxx             x  ",
    "      x!!!!!!!!!!!!!x  ",
    "      xxxxxxxxxxxxxxx  ",
    "                       "
  ]
];

var actorDict = {
  "@": Player,
  "=": HorizontalFireball,
  "|": VerticalFireball,
  "v": FireRain,
  "o": Coin
};

const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => console.log('Вы выиграли приз!'));
