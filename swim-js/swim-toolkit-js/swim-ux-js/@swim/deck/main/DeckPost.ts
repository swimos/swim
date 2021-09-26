// Copyright 2015-2021 Swim Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Equals, Equivalent} from "@swim/util"
import {Debug, Format, Output} from "@swim/codec";
import {AnyLength, Length} from "@swim/math";

export type AnyDeckPost = DeckPost | DeckPostInit;

export interface DeckPostInit {
  key?: string;
  grow?: number;
  shrink?: number;
  basis?: AnyLength;
  width?: AnyLength | null;
  left?: AnyLength | null;
  right?: AnyLength | null;
}

export class DeckPost implements Equals, Equivalent, Debug {
  constructor(key: string, grow: number, shrink: number, basis: Length,
              width: Length | null, left: Length | null, right: Length | null) {
    this.key = key;
    this.grow = grow;
    this.shrink = shrink;
    this.basis = basis;
    this.width = width;
    this.left = left;
    this.right = right;
  }

  readonly key: string;

  readonly grow: number;

  withGrow(grow: number): DeckPost {
    return this.copy(this.key, grow, this.shrink, this.basis,
                     this.width, this.left, this.right);
  }

  readonly shrink: number;

  withShrink(shrink: number): DeckPost {
    return this.copy(this.key, this.grow, shrink, this.basis,
                     this.width, this.left, this.right);
  }

  readonly basis: Length;

  withBasis(basis: AnyLength): DeckPost {
    basis = Length.fromAny(basis);
    return this.copy(this.key, this.grow, this.shrink, basis,
                     this.width, this.left, this.right);
  }

  readonly width: Length | null;

  readonly left: Length | null;

  readonly right: Length | null;

  resized(width: AnyLength | null, left: AnyLength | null, right: AnyLength | null): DeckPost {
    if (width !== null) {
      width = Length.fromAny(width);
    }
    if (left !== null) {
      left = Length.fromAny(left);
    }
    if (right !== null) {
      right = Length.fromAny(right);
    }
    return this.copy(this.key, this.grow, this.shrink, this.basis, width, left, right);
  }

  protected copy(key: string, grow: number, shrink: number, basis: Length,
                 width: Length | null, left: Length | null, right: Length | null): DeckPost {
    return new DeckPost(key, grow, shrink, basis, width, left, right);
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof DeckPost) {
      return this.key === that.key && this.grow === that.grow && this.shrink === that.shrink
          && this.basis.equivalentTo(that.basis, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof DeckPost) {
      return this.key === that.key && this.grow === that.grow && this.shrink === that.shrink
          && this.basis.equals(that.basis) && Equals(this.width, that.width)
          && Equals(this.left, that.left) && Equals(this.right, that.right);
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("DeckPost").write(46/*'.'*/).write("create").write(40/*'('*/)
                   .debug(this.key).write(", ").debug(this.grow).write(", ")
                   .debug(this.shrink).write(", ").debug(this.basis).write(41/*')'*/);
    if (this.width !== null || this.left !== null || this.right !== null) {
      output = output.write(46/*'.'*/).write("resized").write(40/*'('*/)
                     .debug(this.width).write(", ").debug(this.left).write(", ")
                     .debug(this.right).write(", ").write(41/*')'*/);
    }
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  static create(key: string, grow?: number, shrink?: number, basis?: AnyLength): DeckPost {
    if (grow === void 0) {
      grow = 0;
    }
    if (shrink === void 0) {
      shrink = 1;
    }
    if (basis !== void 0) {
      basis = Length.fromAny(basis);
    } else {
      basis = Length.zero();
    }
    return new DeckPost(key, grow, shrink, basis, null, null, null);
  }

  static fromAny(value: AnyDeckPost): DeckPost {
    if (value === void 0 || value === null || value instanceof DeckPost) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return DeckPost.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: DeckPostInit): DeckPost {
    let key = init.key;
    if (key === void 0) {
      key = "";
    }
    let grow = init.grow;
    if (grow === void 0) {
      grow = 0;
    }
    let shrink = init.shrink;
    if (shrink === void 0) {
      shrink = 1;
    }
    let basis = init.basis;
    if (basis !== void 0) {
      basis = Length.fromAny(basis);
    } else {
      basis = Length.zero();
    }
    let width = init.width;
    if (width !== void 0 && width !== null) {
      width = Length.fromAny(width);
    } else {
      width = null
    }
    let left = init.left;
    if (left !== void 0 && left !== null) {
      left = Length.fromAny(left);
    } else {
      left = null
    }
    let right = init.right;
    if (right !== void 0 && right !== null) {
      right = Length.fromAny(right);
    } else {
      right = null
    }
    return new DeckPost(key, grow, shrink, basis, width, left, right);
  }
}
