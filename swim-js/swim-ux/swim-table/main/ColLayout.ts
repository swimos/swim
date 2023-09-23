// Copyright 2015-2023 Nstream, inc.
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

import {Equals} from "@swim/util";
import {Equivalent} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {LengthLike} from "@swim/math";
import {Length} from "@swim/math";
import type {ColorOrLookLike} from "@swim/theme";
import type {ColorOrLook} from "@swim/theme";
import {ColorLook} from "@swim/theme";

/** @public */
export type ColLayoutLike = ColLayout | ColLayoutInit;

/** @public */
export interface ColLayoutInit {
  key?: string;
  grow?: number;
  shrink?: number;
  basis?: LengthLike;
  optional?: boolean;
  persistent?: boolean;
  textColor?: ColorOrLookLike | null;
  width?: LengthLike | null;
  left?: LengthLike | null;
  right?: LengthLike | null;
  hidden?: boolean;
}

/** @public */
export class ColLayout implements Equals, Equivalent, Debug {
  constructor(key: string, grow: number, shrink: number, basis: Length,
              optional: boolean, persistent: boolean, textColor: ColorOrLook | null,
              width: Length | null, left: Length | null, right: Length | null, hidden: boolean) {
    this.key = key;
    this.grow = grow;
    this.shrink = shrink;
    this.basis = basis;
    this.optional = optional;
    this.persistent = persistent;
    this.textColor = textColor;
    this.width = width;
    this.left = left;
    this.right = right;
    this.hidden = hidden;
  }

  likeType?(like: ColLayoutInit): void;

  readonly key: string;

  withKey(key: string): ColLayout {
    return this.copy(key, this.grow, this.shrink, this.basis, this.optional, this.persistent,
                     this.textColor, this.width, this.left, this.right, this.hidden);
  }

  readonly grow: number;

  readonly shrink: number;

  readonly basis: Length;

  withFlex(grow: number, shrink: number, basis?: LengthLike): ColLayout {
    if (basis !== void 0) {
      basis = Length.fromLike(basis);
    } else {
      basis = this.basis;
    }
    return this.copy(this.key, grow, shrink, basis, this.optional, this.persistent,
                     this.textColor, this.width, this.left, this.right, this.hidden);
  }

  readonly optional: boolean;

  asOptional(optional: boolean): ColLayout {
    return this.copy(this.key, this.grow, this.shrink, this.basis, optional, this.persistent,
                     this.textColor, this.width, this.left, this.right, this.hidden);
  }

  readonly persistent: boolean;

  asPersistent(persistent: boolean): ColLayout {
    return this.copy(this.key, this.grow, this.shrink, this.basis, this.optional, persistent,
                     this.textColor, this.width, this.left, this.right, this.hidden);
  }

  readonly textColor: ColorOrLook | null;

  withTextColor(textColor: ColorOrLookLike | null): ColLayout {
    textColor = ColorLook.fromLike(textColor);
    return this.copy(this.key, this.grow, this.shrink, this.basis, this.optional, this.persistent,
                     textColor, this.width, this.left, this.right, this.hidden);
  }

  readonly width: Length | null;

  readonly left: Length | null;

  readonly right: Length | null;

  readonly hidden: boolean;

  asHidden(hidden: boolean): ColLayout {
    return this.copy(this.key, this.grow, this.shrink, this.basis, this.optional, this.persistent,
                     this.textColor, this.width, this.left, this.right, hidden);
  }

  resized(width: LengthLike | null, left: LengthLike | null,
          right: LengthLike | null, hidden?: boolean): ColLayout {
    if (width !== null) {
      width = Length.fromLike(width);
    }
    if (left !== null) {
      left = Length.fromLike(left);
    }
    if (right !== null) {
      right = Length.fromLike(right);
    }
    if (hidden === void 0) {
      hidden = this.hidden;
    }
    return this.copy(this.key, this.grow, this.shrink, this.basis, this.optional,
                     this.persistent, this.textColor, width, left, right, hidden);
  }

  protected copy(key: string, grow: number, shrink: number, basis: Length, optional: boolean,
                 persistent: boolean, textColor: ColorOrLook | null,
                 width: Length | null, left: Length | null, right: Length | null,
                 hidden: boolean): ColLayout {
    return new ColLayout(key, grow, shrink, basis, optional, persistent,
                         textColor, width, left, right, hidden);
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ColLayout) {
      return this.key === that.key && this.grow === that.grow && this.shrink === that.shrink
          && this.basis.equivalentTo(that.basis, epsilon) && this.optional === that.optional
          && this.persistent === that.persistent && Equivalent(this.textColor, that.textColor, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ColLayout) {
      return this.key === that.key && this.grow === that.grow && this.shrink === that.shrink
          && this.basis.equals(that.basis) && this.optional === that.optional
          && this.persistent === that.persistent && Equals(this.textColor, that.textColor)
          && Equals(this.width, that.width) && Equals(this.left, that.left)
          && Equals(this.right, that.right) && this.hidden === that.hidden;
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("ColLayout").write(46/*'.'*/).write("create").write(40/*'('*/)
                   .debug(this.key).write(", ").debug(this.grow).write(", ")
                   .debug(this.shrink).write(", ").debug(this.basis).write(41/*')'*/);
    if (this.optional) {
      output = output.write(46/*'.'*/).write("asOptional").write(40/*'('*/)
                     .debug(this.optional).write(41/*')'*/);
    }
    if (this.persistent) {
      output = output.write(46/*'.'*/).write("asPersistent").write(40/*'('*/)
                     .debug(this.persistent).write(41/*')'*/);
    }
    if (this.textColor) {
      output = output.write(46/*'.'*/).write("withTextColor").write(40/*'('*/)
                     .debug(this.textColor).write(41/*')'*/);
    }
    if (this.width !== null || this.left !== null || this.right !== null || this.hidden) {
      output = output.write(46/*'.'*/).write("resized").write(40/*'('*/)
                     .debug(this.width).write(", ").debug(this.left).write(", ")
                     .debug(this.right).write(", ").debug(this.hidden).write(41/*')'*/);
    }
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  static create(key: string, grow?: number, shrink?: number, basis?: LengthLike,
                optional?: boolean, persistent?: boolean, textColor?: ColorOrLookLike | null): ColLayout {
    if (grow === void 0) {
      grow = 0;
    }
    if (shrink === void 0) {
      shrink = 1;
    }
    if (basis !== void 0) {
      basis = Length.fromLike(basis);
    } else {
      basis = Length.zero();
    }
    if (optional === void 0) {
      optional = false;
    }
    if (persistent === void 0) {
      persistent = false;
    }
    if (textColor === void 0) {
      textColor = null;
    }
    if (textColor === void 0) {
      textColor = null;
    }
    if (textColor !== null) {
      textColor = ColorLook.fromLike(textColor);
    }
    return new ColLayout(key, grow, shrink, basis, optional, persistent,
                         textColor, null, null, null, false);
  }

  static fromLike(value: ColLayoutLike): ColLayout {
    if (value === void 0 || value === null || value instanceof ColLayout) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return ColLayout.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: ColLayoutInit): ColLayout {
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
      basis = Length.fromLike(basis);
    } else {
      basis = Length.zero();
    }
    let optional = init.optional;
    if (optional === void 0) {
      optional = false;
    }
    let persistent = init.persistent;
    if (persistent === void 0) {
      persistent = false;
    }
    let textColor = init.textColor;
    if (textColor === void 0) {
      textColor = null;
    }
    if (textColor !== null) {
      textColor = ColorLook.fromLike(textColor);
    }
    let width = init.width;
    if (width !== void 0 && width !== null) {
      width = Length.fromLike(width);
    } else {
      width = null;
    }
    let left = init.left;
    if (left !== void 0 && left !== null) {
      left = Length.fromLike(left);
    } else {
      left = null;
    }
    let right = init.right;
    if (right !== void 0 && right !== null) {
      right = Length.fromLike(right);
    } else {
      right = null;
    }
    let hidden = init.hidden;
    if (hidden === void 0) {
      hidden = false;
    }
    return new ColLayout(key, grow, shrink, basis, optional, persistent,
                         textColor, width, left, right, hidden);
  }
}
