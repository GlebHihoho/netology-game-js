'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if (vector instanceof Vector) {
      return new Vector(this.x + vector.x, this.y + vector.y)
    } else {
      throw new Error('Вы передали неправильные данные');
    }
  }

  times(n) {
    this.x = this.x * n;
    this.y = this.y * n;

    return new Vector(this.x, this.y);
  }
}


class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (pos instanceof Vector) {
      this.pos = pos;
    } else {
      throw new Error('pos не является vector')
    }

    if (size instanceof Vector) {
      this.size = size;
    } else {
      throw new Error('size не является vector')
    }

    if (speed instanceof Vector) {
      this.speed = speed;
    } else {
      throw new Error('speed не является vector')
    }
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

    if (actor.left === this.left && actor.right === this.right && actor.top === this.top && actor.bottom === this.bottom) {
      return false;
    } else if (actor.right < this.left || actor.bottom < this.top && actor.left < this.right || actor.top > this.bottom) {
      return false;
    } else if (actor.right === this.left || actor.left === this.right || actor.top === this.bottom || actor.bottom === this.top) {
      return false;
    } else if (-actor.left === this.left && -actor.top === this.top && -actor.right === this.right && -actor.bottom === this.bottom) {
      return false;
    } else if (actor.left > this.left && actor.top > this.top && actor.right < this.right && actor.bottom < this.bottom) {
      return true;
    } else if (
      (actor.left < this.left && actor.right > this.left) ||
      (actor.left < this.right && actor.right > this.right) ||
      (actor.top < this.top && actor.bottom > this.top) ||
      (actor.top < this.bottom && actor.bottom > this.bottom)
    ) {
      return true;
    }
  }
}



class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.height = grid.length;
    this.status = null;
    this.finishDelay = 1;
  }

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
    return this.actors.filter(actor => actor.type === 'player')[0];
  }

  isFinished() {
    if (this.status != null && this.finishDelay < 0) {
      return true;
    }

    if (this.status != null && this.finishDelay > 0) {
      return false;
    }

    return false;
  }

  actorAt(actor) {
    if (!(actor instanceof Actor) || actor === undefined) {
      throw new Error('actor не является Actor')
    }

    for (let i = 0; i < this.actors.length; i++) {
      let other = this.actors[i];
      if (other != actor &&
          actor.pos.x + actor.size.x > other.pos.x &&
          actor.pos.x < other.pos.x + other.size.x &&
          actor.pos.y + actor.size.y > other.pos.y &&
          actor.pos.y < other.pos.y + other.size.y)
        return other;
    }
  }

  obstacleAt(pos, size) {
    let xStart = Math.floor(pos.x);
    let xEnd   = Math.ceil(pos.x + size.x);
    let yStart = Math.floor(pos.y);
    let yEnd   = Math.ceil(pos.y + size.y);

    if (xStart < 0 || xEnd > this.width || yStart < 0)
      return "wall";
    if (yEnd > this.height)
      return "lava";
    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        let fieldType = this.grid[y][x];
        if (fieldType) return fieldType;
      }
    }
  }

  removeActor(actor) {
    let count = 0;
    for (let i = 0; i < this.actors.length; i++) {
      if (this.actors[i] === actor) {
        count = i;
      }
    }
    this.actors.splice(count, 1);
  }

  noMoreActors(type) {
    for (let i = 0; i < this.actors.length; i++) {
      if (this.actors[i].type === type) {
        return false;
      }
    }
    return true;
  }

  playerTouched(type, actor) {
    if (type === 'lava' || type === 'fireball') {
      this.status = 'lost';
    }

    if (type === 'coin') {
      this.actors = this.actors.filter(other => other !== actor);

      if (!this.actors.some(actor => actor.type === "coin")) {
        this.status = "won";
      }
    }
  }
}



