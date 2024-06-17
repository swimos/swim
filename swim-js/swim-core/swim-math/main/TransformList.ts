// Copyright 2015-2024 Nstream, inc.
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

import type {Uninitable} from "@swim/util";
import type {Mutable} from "@swim/util";
import {Murmur3} from "@swim/util";
import {Constructors} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import {Unicode} from "@swim/codec";
import type {Item} from "@swim/structure";
import type {Value} from "@swim/structure";
import {Record} from "@swim/structure";
import {R2Point} from "./R2Point";
import type {TransformLike} from "./Transform";
import {Transform} from "./Transform";
import {TransformParser} from "./Transform";
import {AffineTransform} from "./AffineTransform";
import {IdentityTransform} from "./IdentityTransform";

/** @public */
export type TransformListLike = TransformList | string;

/** @public */
export const TransformListLike = {
  [Symbol.hasInstance](instance: unknown): instance is TransformListLike {
    return instance instanceof TransformList
        || typeof instance === "string";
  },
};

/** @public */
export class TransformList extends Transform {
  constructor(transforms: readonly Transform[]) {
    super();
    this.transforms = transforms;
    this.stringValue = void 0;
  }

  readonly transforms: readonly Transform[];

  override transform(that: Transform): Transform;
  override transform(x: number, y: number): R2Point;
  override transform(x: Transform | number, y?: number): Transform | R2Point {
    if (arguments.length === 2) {
      const transforms = this.transforms;
      for (let i = 0; i < transforms.length; i += 1) {
        const transform = transforms[i]!;
        const xi = transform.transformX(x as number, y!);
        const yi = transform.transformY(x as number, y!);
        x = xi;
        y = yi;
      }
      return new R2Point(x as number, y!);
    } else if (x instanceof IdentityTransform) {
      return this;
    } else if (x instanceof Transform) {
      return Transform.list(this, x);
    }
    throw new TypeError("" + x);
  }

  override transformX(x: number, y: number): number {
    const transforms = this.transforms;
    for (let i = 0; i < transforms.length; i += 1) {
      const transform = transforms[i]!;
      const xi = transform.transformX(x, y);
      const yi = transform.transformY(x, y);
      x = xi;
      y = yi;
    }
    return x;
  }

  override transformY(x: number, y: number): number {
    const transforms = this.transforms;
    for (let i = 0; i < transforms.length; i += 1) {
      const transform = transforms[i]!;
      const xi = transform.transformX(x, y);
      const yi = transform.transformY(x, y);
      x = xi;
      y = yi;
    }
    return y;
  }

  override inverse(): Transform {
    const transforms = this.transforms;
    const n = transforms.length;
    const inverseTransforms = new Array<Transform>(n);
    for (let i = 0; i < n; i += 1) {
      inverseTransforms[i] = transforms[n - i - 1]!.inverse();
    }
    return new TransformList(inverseTransforms);
  }

  override toAffine(): AffineTransform {
    let matrix = AffineTransform.identity();
    const transforms = this.transforms;
    for (let i = 0; i < transforms.length; i += 1) {
      matrix = matrix.multiply(transforms[i]!.toAffine());
    }
    return matrix;
  }

  override toCssTransformComponent(): CSSTransformComponent | null {
    if (typeof CSSTranslate === "undefined") {
      return null;
    }
    return new CSSMatrixComponent(this.toMatrix());
  }

  override toCssValue(): CSSStyleValue | null {
    if (typeof CSSTransformValue === "undefined") {
      return null;
    }
    const transforms = this.transforms;
    const n = transforms.length;
    const components = new Array<CSSTransformComponent>(n);
    for (let i = 0; i < transforms.length; i += 1) {
      const transform = transforms[i]!;
      const component = transform.toCssTransformComponent();
      if (component === null) {
        return null;
      }
      components[i] = component;
    }
    return new CSSTransformValue(components);
  }

  override toValue(): Value {
    const transforms = this.transforms;
    const n = transforms.length;
    const record = Record.create(n);
    for (let i = 0; i < n; i += 1) {
      record.push(transforms[i]!.toValue());
    }
    return record;
  }

  override interpolateTo(that: TransformList): Interpolator<TransformList>;
  override interpolateTo(that: Transform): Interpolator<Transform>;
  override interpolateTo(that: unknown): Interpolator<Transform> | null;
  override interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof TransformList) {
      return TransformListInterpolator(this, that);
    }
    return super.interpolateTo(that);
  }

  override conformsTo(that: Transform): boolean {
    if (!(that instanceof TransformList)) {
      return false;
    }
    const n = this.transforms.length;
    if (n !== that.transforms.length) {
      return false;
    }
    for (let i = 0; i < n; i += 1) {
      if (!this.transforms[i]!.conformsTo(that.transforms[i]!)) {
        return false;
      }
    }
    return true;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (!(that instanceof TransformList)) {
      return false;
    }
    const n = this.transforms.length;
    if (n !== that.transforms.length) {
      return false;
    }
    for (let i = 0; i < n; i += 1) {
      if (!this.transforms[i]!.equivalentTo(that.transforms[i]!, epsilon)) {
        return false;
      }
    }
    return true;
  }

  override equals(that: unknown): boolean {
    if (!(that instanceof TransformList)) {
      return false;
    }
    const n = this.transforms.length;
    if (n !== that.transforms.length) {
      return false;
    }
    for (let i = 0; i < n; i += 1) {
      if (!this.transforms[i]!.equals(that.transforms[i]!)) {
        return false;
      }
    }
    return true;
  }

  override hashCode(): number {
    let hashValue = Constructors.hash(TransformList);
    const transforms = this.transforms;
    for (let i = 0; i < transforms.length; i += 1) {
      hashValue = Murmur3.mix(hashValue, transforms[i]!.hashCode());
    }
    return Murmur3.mash(hashValue);
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Transform").write(46/*'.'*/).write("list").write(40/*'('*/);
    const transforms = this.transforms;
    const n = transforms.length;
    if (n > 0) {
      output = output.debug(transforms[0]!);
      for (let i = 1; i < n; i += 1) {
        output = output.write(", ").debug(transforms[i]!);
      }
    }
    output = output.write(41/*')'*/);
    return output;
  }

  /** @internal */
  readonly stringValue: string | undefined;

  override toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      const transforms = this.transforms;
      const n = transforms.length;
      if (n === 0) {
        stringValue = "none";
      } else {
        stringValue = transforms[0]!.toString();
        for (let i = 1; i < n; i += 1) {
          stringValue += " ";
          stringValue += transforms[i]!.toString();
        }
      }
      (this as Mutable<this>).stringValue = stringValue;
    }
    return stringValue;
  }

  override toAttributeString(): string {
    const transforms = this.transforms;
    const n = transforms.length;
    if (n === 0) {
      return "";
    }
    let s = transforms[0]!.toAttributeString();
    for (let i = 1; i < n; i += 1) {
      s += " ";
      s += transforms[i]!.toAttributeString();
    }
    return s;
  }

  static override fromLike<T extends TransformListLike | null | undefined>(value: T): TransformList | Uninitable<T>;
  static override fromLike<T extends TransformLike | null | undefined>(value: T): never;
  static override fromLike<T extends TransformListLike | null | undefined>(value: T): TransformList | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof TransformList) {
      return value as TransformList | Uninitable<T>;
    } else if (typeof value === "string") {
      return TransformList.parse(value);
    }
    throw new TypeError("" + value);
  }

  static override fromValue(value: Value): TransformList | null {
    const transforms: Transform[] = [];
    value.forEach(function (item: Item) {
      const transform = Transform.fromValue(item.toValue());
      if (transform !== null) {
        transforms.push(transform);
      }
    }, this);
    if (transforms.length !== 0) {
      return new TransformList(transforms);
    }
    return null;
  }

  static override parse(string: string): TransformList {
    const transform = Transform.parse(string);
    if (transform instanceof TransformList) {
      return transform;
    }
    return new TransformList([transform]);
  }
}

/** @internal */
export interface TransformListInterpolator extends Interpolator<TransformList> {
  /** @internal */
  readonly interpolators: readonly Interpolator<Transform>[];

  readonly 0: TransformList;

  readonly 1: TransformList;

  equals(that: unknown): boolean;
}

/** @internal */
export const TransformListInterpolator = (function (_super: typeof Interpolator) {
  const TransformListInterpolator = function (f0: TransformList, f1: TransformList): TransformListInterpolator {
    const interpolator = function (u: number): TransformList {
      const interpolators = interpolator.interpolators;
      const interpolatorCount = interpolators.length;
      const transforms = new Array<Transform>(interpolatorCount);
      for (let i = 0; i < interpolatorCount; i += 1) {
        transforms[i] = interpolators[i]!(u);
      }
      return new TransformList(transforms);
    } as TransformListInterpolator;
    Object.setPrototypeOf(interpolator, TransformListInterpolator.prototype);
    const transforms0 = f0.transforms;
    const transforms1 = f1.transforms;
    const interpolatorCount = Math.min(transforms0.length, transforms1.length);
    const interpolators = new Array<Interpolator<Transform>>(interpolatorCount);
    for (let i = 0; i < interpolatorCount; i += 1) {
      interpolators[i] = transforms0[i]!.interpolateTo(transforms1[i]!);
    }
    (interpolator as Mutable<typeof interpolator>).interpolators = interpolators;
    return interpolator;
  } as {
    (f0: TransformList, f1: TransformList): TransformListInterpolator;

    /** @internal */
    prototype: TransformListInterpolator;
  };

  TransformListInterpolator.prototype = Object.create(_super.prototype);
  TransformListInterpolator.prototype.constructor = TransformListInterpolator;

  Object.defineProperty(TransformListInterpolator.prototype, 0, {
    get(this: TransformListInterpolator): TransformList {
      const interpolators = this.interpolators;
      const interpolatorCount = interpolators.length;
      const transforms = new Array<Transform>(interpolatorCount);
      for (let i = 0; i < interpolatorCount; i += 1) {
        transforms[i] = interpolators[i]![0];
      }
      return new TransformList(transforms);
    },
    configurable: true,
  });

  Object.defineProperty(TransformListInterpolator.prototype, 1, {
    get(this: TransformListInterpolator): TransformList {
      const interpolators = this.interpolators;
      const interpolatorCount = interpolators.length;
      const transforms = new Array<Transform>(interpolatorCount);
      for (let i = 0; i < interpolatorCount; i += 1) {
        transforms[i] = interpolators[i]![1];
      }
      return new TransformList(transforms);
    },
    configurable: true,
  });

  TransformListInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof TransformListInterpolator) {
      const n = this.interpolators.length;
      if (n !== that.interpolators.length) {
        return false;
      }
      for (let i = 0; i < n; i += 1) {
        if (!this.interpolators[i]!.equals(that.interpolators[i]!)) {
          return false;
        }
      }
      return true;
    }
    return false;
  };

  return TransformListInterpolator;
})(Interpolator);

/** @internal */
export class TransformListParser extends Parser<Transform> {
  private readonly transform: Transform | undefined;
  private readonly transformParser: Parser<Transform> | undefined;

  constructor(transform?: Transform, transformParser?: Parser<Transform>) {
    super();
    this.transform = transform;
    this.transformParser = transformParser;
  }

  override feed(input: Input): Parser<Transform> {
    return TransformListParser.parse(input, this.transform, this.transformParser);
  }

  static parse(input: Input, transform: Transform = Transform.identity(),
               transformParser?: Parser<Transform>): Parser<Transform> {
    do {
      if (transformParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input.step();
        }
        if (input.isCont()) {
          transformParser = TransformParser.parse(input);
        } else if (input.isDone()) {
          return Parser.done(transform);
        }
      }
      if (transformParser !== void 0) {
        transformParser = transformParser.feed(input);
        if (transformParser.isDone()) {
          transform = transform.transform(transformParser.bind());
          transformParser = void 0;
          continue;
        } else if (transformParser.isError()) {
          return transformParser.asError();
        }
      }
      break;
    } while (true);
    return new TransformListParser(transform, transformParser);
  }
}
