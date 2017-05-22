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
    if (actor instanceof Actor) {
      if (actor.left === this.left && actor.right === this.right && actor.top === this.top && actor.bottom === this.bottom) {
        return false;
      } else if (actor.left > this.left || actor.right > this.right || actor.top > this.top || actor.bottom > this.bottom) {
        return false;
      } else if (actor.left === this.left || actor.right === this.right || actor.top === this.top || actor.bottom === this.bottom) {
        return false;
      } else if (actor.left > this.left && actor.right < this.right && actor.top < this.top && actor.bottom > this.bottom) {
        return true;
      } else if (
        (actor.left < this.left && actor.right < this.right && actor.top > this.top && actor.bottom > this.bottom) ||
        (actor.left > this.left && actor.right < this.right && actor.top > this.top && actor.bottom > this.bottom) ||
        (actor.left > this.left && actor.right > this.right && actor.top > this.top && actor.bottom > this.bottom) ||
        (actor.left < this.left && actor.right > this.right && actor.top < this.top && actor.bottom > this.bottom) ||
        (actor.left > this.left && actor.right > this.right && actor.top < this.top && actor.bottom > this.bottom) ||
        (actor.left < this.left && actor.right < this.right && actor.top < this.top && actor.bottom < this.bottom) ||
        (actor.left > this.left && actor.right < this.right && actor.top < this.top && actor.bottom < this.bottom) ||
        (actor.left > this.left && actor.right > this.right && actor.top < this.top && actor.bottom < this.bottom)
       ) {
        return true;
      } else {
        return true;
      }
    } else {
      throw new Error('actor не является Actor')
    }
  }
}



class Level {
  constructor(height = 0, width = 0) {
    this.height = height;
    this.width  = width;
  }
}

