'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error('vector не является объектом класса Vector');
    }

    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  times(n){
    return new Vector(this.x * n, this.y * n);
  }
}


class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {

    if (!(pos instanceof Vector)) {
      throw new Error('pos не является объектом класса Vector')
    }

    if (!(size instanceof Vector)) {
      throw new Error('size не является объектом класса Vector')
    }

    if (!(speed instanceof Vector)) {
      throw new Error('speed не является объектом класса Vector')
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
    if (!(actor instanceof Actor)) {
      throw new Error('actor не является Actor')
    }

    if (!(actor !== this)) {
      return false;
    }

    if (!(actor.left < this.right)) {
      return false;
    }

    if (!(actor.right > this.left)) {
      return false;
    }

    if (!(actor.top < this.bottom)) {
      return false;
    }

    if (!(actor.bottom > this.top)) {
      return false;
    }

    return true;
  }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid   = grid.slice();
    this.actors = actors.slice();
    this.height = this.grid.length;
    this.status = null;
    this.finishDelay = 1;

    if (this.height !== 0) {
      this.width = Math.max(...this.grid.map(element => element.length));
    } else {
      this.width = 0;
    }
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
    let xStart = Math.floor(pos.x);
    let xEnd   = Math.ceil(pos.x + size.x);
    let yStart = Math.floor(pos.y);
    let yEnd   = Math.ceil(pos.y + size.y);

    if (xStart < 0 || xEnd > this.width || yStart < 0) {
      return 'wall';
    }

    if (yEnd > this.height) {
      return 'lava';
    }

    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        let fieldType = this.grid[y][x];

        if (fieldType) {
          return fieldType;
        }
      }
    }
  }

  removeActor(actor) {
    let findIndex = this.actors.findIndex(elem => elem === actor);

    this.actors.splice(findIndex, 1);
  }

  noMoreActors(type) {
    return !this.actors.some(actor => actor.type === type);
  }

  playerTouched(type, actor) {
    if (this.status !== null) {
      return;
    }

    if (type === 'lava' || type === 'fireball') {
      this.status = 'lost';
    }

    if (type === 'coin') {
      this.removeActor(actor);

      if (this.noMoreActors('coin')) {
        this.status = "won";
      }
    }
  }
}

class LevelParser {
  constructor(symbol = {}) {
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

  createGrid(plan) {
    if (!plan.length) {
      return [];
    }

    return plan.map(line => {
      return line.split('').map(ch => this.obstacleFromSymbol(ch));
    })
  }

  createActors(plan) {
    let actors = [];

    for (let x = 0; x < plan.length; x++) {
      for (let y = 0; y < plan[x].length; y++) {
        let cell = this.symbol[plan[x][y]];

        if (typeof cell === 'function') {
          let actor = new cell(new Vector(y, x));
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

class Player extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5));
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
    return this.pos.plus(this.speed.times(time));
  }

  handleObstacle() {
    this.speed = this.speed.times(-1);
  }

  act(time, level) {
    let newPos = this.getNextPosition(time);

    if (level.obstacleAt(newPos, this.size)) {
      this.handleObstacle();
      return;
    }

    this.pos = newPos;
  }
}

class HorizontalFireball extends Fireball {
  constructor(pos) {
    super(pos, new Vector(2, 0));
  }
}

class VerticalFireball extends Fireball {
  constructor(pos) {
    super(pos, new Vector(0, 2));
  }
}

class FireRain extends Fireball {
  constructor(pos) {
    super(pos, new Vector(0, 3));
    this.oldPos = pos;
  }

  handleObstacle() {
    if (this.pos) {
      this.pos = this.oldPos
    }
  }
}

const random = (min, max) => Math.floor((max - min) * Math.random()) + min;

const phaseStart  = 0;
const phaseFinish = 2 * Math.PI;

class Coin extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
    this.post = this.pos;
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
    return this.post.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

const actorDict = {
  "@": Player,
  "=": HorizontalFireball,
  "|": VerticalFireball,
  "v": FireRain,
  "o": Coin
};

const parser = new LevelParser(actorDict);

loadLevels().then(
  lvl => {
    runGame(JSON.parse(lvl), parser, DOMDisplay).then(() => alert('Вы выиграли приз!'));
  }
);


