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

import {Equivalent, Equals} from "@swim/util"
import {Debug, Format, Output} from "@swim/codec";
import {AnyLength, Length} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";

export type AnyColLayout = ColLayout | ColLayoutInit;

export interface ColLayoutInit {
  key?: string;
  grow?: number;
  shrink?: number;
  basis?: AnyLength;
  optional?: boolean;
  textColor?: Look<Color> | AnyColor | null;
  width?: AnyLength | null;
  left?: AnyLength | null;
  right?: AnyLength | null;
  hidden?: boolean;
}

export class ColLayout implements Equals, Equivalent, Debug {
  constructor(key: string, grow: number, shrink: number, basis: Length,
              optional: boolean, textColor: Look<Color> | Color | null,
              width: Length | null, left: Length | null, right: Length | null,
              hidden: boolean) {
    Object.defineProperty(this, "key", {
      value: key,
      enumerable: true,
    });
    Object.defineProperty(this, "grow", {
      value: grow,
      enumerable: true,
    });
    Object.defineProperty(this, "shrink", {
      value: shrink,
      enumerable: true,
    });
    Object.defineProperty(this, "basis", {
      value: basis,
      enumerable: true,
    });
    Object.defineProperty(this, "optional", {
      value: optional,
      enumerable: true,
    });
    Object.defineProperty(this, "textColor", {
      value: textColor,
      enumerable: true,
    });
    Object.defineProperty(this, "width", {
      value: width,
      enumerable: true,
    });
    Object.defineProperty(this, "left", {
      value: left,
      enumerable: true,
    });
    Object.defineProperty(this, "right", {
      value: right,
      enumerable: true,
    });
    Object.defineProperty(this, "hidden", {
      value: hidden,
      enumerable: true,
    });
  }

  readonly key!: string;

  readonly grow!: number;

  readonly shrink!: number;

  readonly basis!: Length;

  withFlex(grow: number, shrink: number, basis?: AnyLength): ColLayout {
    if (basis !== void 0) {
      basis = Length.fromAny(basis);
    } else {
      basis = this.basis;
    }
    return this.copy(this.key, grow, shrink, basis, this.optional, this.textColor,
                     this.width, this.left, this.right, this.hidden);
  }

  readonly optional!: boolean;

  asOptional(optional: boolean): ColLayout {
    return this.copy(this.key, this.grow, this.shrink, this.basis, optional,
                     this.textColor, this.width, this.left, this.right, this.hidden);
  }

  readonly textColor!: Look<Color> | Color | null;

  withTextColor(textColor: Look<Color> | AnyColor | null): ColLayout {
    if (textColor !== null && !(textColor instanceof Look)) {
      textColor = Color.fromAny(textColor);
    }
    return this.copy(this.key, this.grow, this.shrink, this.basis, this.optional,
                     textColor, this.width, this.left, this.right, this.hidden);
  }

  readonly width!: Length | null;

  readonly left!: Length | null;

  readonly right!: Length | null;

  readonly hidden!: boolean;

  asHidden(hidden: boolean): ColLayout {
    return this.copy(this.key, this.grow, this.shrink, this.basis, this.optional,
                     this.textColor, this.width, this.left, this.right, hidden);
  }

  resized(width: AnyLength | null, left: AnyLength | null,
          right: AnyLength | null, hidden?: boolean): ColLayout {
    if (width !== null) {
      width = Length.fromAny(width);
    }
    if (left !== null) {
      left = Length.fromAny(left);
    }
    if (right !== null) {
      right = Length.fromAny(right);
    }
    if (hidden === void 0) {
      hidden = this.hidden;
    }
    return this.copy(this.key, this.grow, this.shrink, this.basis, this.optional,
                     this.textColor, width, left, right, hidden);
  }

  protected copy(key: string, grow: number, shrink: number, basis: Length,
                 optional: boolean, textColor: Look<Color> | Color | null,
                 width: Length | null, left: Length | null, right: Length | null,
                 hidden: boolean): ColLayout {
    return new ColLayout(key, grow, shrink, basis, optional, textColor,
                         width, left, right, hidden);
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ColLayout) {
      return this.key === that.key && this.grow === that.grow && this.shrink === that.shrink
          && this.basis.equivalentTo(that.basis, epsilon) && this.optional === that.optional
          && Equivalent(this.textColor, that.textColor, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ColLayout) {
      return this.key === that.key && this.grow === that.grow && this.shrink === that.shrink
          && this.basis.equals(that.basis) && this.optional === that.optional
          && Equals(this.textColor, that.textColor) && Equals(this.width, that.width)
          && Equals(this.left, that.left) && Equals(this.right, that.right)
          && this.hidden === that.hidden;
    }
    return false;
  }

  debug(output: Output): void {
    output = output.write("ColLayout").write(46/*'.'*/).write("create").write(40/*'('*/)
        .debug(this.key).write(", ").debug(this.grow).write(", ")
        .debug(this.shrink).write(", ").debug(this.basis);
    if (this.optional) {
      output = output.write(", ").debug(this.optional);
    }
    if (this.textColor !== null) {
      output = output.write(", ").debug(this.textColor);
    }
    output = output.write(41/*')'*/);
    if (this.width !== null || this.left !== null || this.right !== null || this.hidden) {
      output = output.write(46/*'.'*/).write("resized").write(40/*'('*/)
          .debug(this.width).write(", ").debug(this.left).write(", ")
          .debug(this.right).write(", ").debug(this.hidden).write(41/*')'*/);
    }
  }

  toString(): string {
    return Format.debug(this);
  }

  static create(key: string, grow?: number, shrink?: number, basis?: AnyLength,
                optional?: boolean, textColor?: Look<Color> | AnyColor | null): ColLayout {
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
    if (optional === void 0) {
      optional = false;
    }
    if (textColor === void 0) {
      textColor = null;
    }
    if (textColor !== null && !(textColor instanceof Look)) {
      textColor = Color.fromAny(textColor);
    }
    return new ColLayout(key, grow, shrink, basis, optional, textColor,
                         null, null, null, false);
  }

  static fromAny(value: AnyColLayout): ColLayout {
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
      basis = Length.fromAny(basis);
    } else {
      basis = Length.zero();
    }
    let optional = init.optional;
    if (optional === void 0) {
      optional = false;
    }
    let textColor = init.textColor;
    if (textColor === void 0) {
      textColor = null;
    }
    if (textColor !== null && !(textColor instanceof Look)) {
      textColor = Color.fromAny(textColor);
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
    let hidden = init.hidden;
    if (hidden === void 0) {
      hidden = false;
    }
    return new ColLayout(key, grow, shrink, basis, optional, textColor,
                         width, left, right, hidden);
  }
}
