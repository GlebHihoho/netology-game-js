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
      (actor.left < this.left && actor.right < this.right && actor.top < this.top && actor.bottom < this.bottom) || // 1
      (actor.left > this.left && actor.right < this.right && actor.top < this.top && actor.bottom < this.bottom) || // 2
      (actor.left > this.left && actor.right > this.right && actor.top < this.top && actor.bottom < this.bottom) || // 3

      (actor.left < this.left && actor.right < this.right && actor.top > this.top && actor.bottom < this.bottom) || // 4
      (actor.left > this.left && actor.right > this.right && actor.top > this.top && actor.bottom < this.bottom) || // 5

      (actor.left < this.left && actor.right < this.right && actor.top > this.top && actor.bottom > this.bottom) || // 6
      (actor.left > this.left && actor.right < this.right && actor.top > this.top && actor.bottom > this.bottom) || // 7
      (actor.left > this.left && actor.right > this.right && actor.top > this.top && actor.bottom > this.bottom) || // 8

      (actor.left < this.left && actor.right > this.right && actor.top < this.top && actor.bottom < this.bottom) || // 9
      (actor.left < this.left && actor.right > this.right && actor.top > this.top && actor.bottom < this.bottom) || // 10
      (actor.left < this.left && actor.right > this.right && actor.top > this.top && actor.bottom > this.bottom) || // 11

      (actor.left < this.left && actor.right < this.right && actor.top < this.top && actor.bottom > this.bottom) || // 12
      (actor.left > this.left && actor.right < this.right && actor.top < this.top && actor.bottom > this.bottom) || // 13
      (actor.left > this.left && actor.right > this.right && actor.top < this.top && actor.bottom > this.bottom)    // 14
    ) {
      return true;
    }

  }
}



class Level {
  constructor(height = 0, width = 0) {
    this.height = height;
    this.width  = width;
  }
}

