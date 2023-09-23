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

import type {Uninitable} from "@swim/util";
import {Murmur3} from "@swim/util";
import type {HashCode} from "@swim/util";
import {Lazy} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {Item} from "@swim/structure";
import type {Value} from "@swim/structure";
import {Text} from "@swim/structure";
import {Num} from "@swim/structure";
import {Form} from "@swim/structure";

/** @public */
export type TimeZoneLike = TimeZone | string | number;

/** @public */
export const TimeZoneLike = {
  [Symbol.hasInstance](instance: unknown): instance is TimeZoneLike {
    return instance instanceof TimeZone
        || typeof instance === "string"
        || typeof instance === "number";
  },
};

/** @public */
export class TimeZone implements HashCode, Debug {
  /** @internal */
  private constructor(name: string | undefined, offset: number) {
    this.name = name;
    this.offset = offset;
  }

  likeType?(like: string | number): void;

  readonly name: string | undefined;

  readonly offset: number;

  isUTC(): boolean {
    return this.offset === 0;
  }

  isLocal(): boolean {
    return this.offset === -new Date().getTimezoneOffset();
  }

  /** @override */
  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof TimeZone) {
      return this.offset === that.offset;
    }
    return false;
  }

  /** @override */
  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(TimeZone), Numbers.hash(this.offset)));
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    output = output.write("TimeZone").write(46/*'.'*/);
    if (this.name === "UTC" && this.offset === 0) {
      output = output.write("utc").write(40/*'('*/);
    } else if (this.name === void 0) {
      output = output.write("forOffset").write(40/*'('*/).debug(this.offset);
    } else {
      output = output.write("create").write(40/*'('*/)
                     .debug(this.name).write(", ").debug(this.offset);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  /** @override */
  toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static utc(): TimeZone {
    return new TimeZone("UTC", 0);
  }

  @Lazy
  static local(): TimeZone {
    return this.forOffset(-new Date().getTimezoneOffset());
  }

  static create(name: string | undefined, offset: number): TimeZone {
    if (name === "UTC" && offset === 0) {
      return TimeZone.utc();
    }
    return new TimeZone(name, offset);
  }

  static forName(name: string): TimeZone | null {
    switch (name) {
      case "UTC": return TimeZone.utc();
      default: return null;
    }
  }

  static forOffset(offset: number): TimeZone {
    switch (offset) {
      case 0: return TimeZone.utc();
      default: return new TimeZone(void 0, offset);
    }
  }

  static fromLike<T extends TimeZoneLike | null | undefined>(value: T): TimeZone | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof TimeZone) {
      return value as TimeZone | Uninitable<T>;
    } else if (typeof value === "string") {
      const zone = TimeZone.forName(value);
      if (zone !== null) {
        return zone;
      }
    } else if (typeof value === "number") {
      return TimeZone.forOffset(value);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): TimeZone | null {
    const name = value.stringValue(void 0);
    if (name !== void 0) {
      return TimeZone.forName(name);
    }
    const offset = value.numberValue(void 0);
    if (offset !== void 0) {
      return TimeZone.forOffset(offset);
    }
    return null;
  }

  @Lazy
  static form(): Form<TimeZone, TimeZoneLike> {
    return new TimeZoneForm(TimeZone.utc());
  }
}

/** @internal */
export class TimeZoneForm extends Form<TimeZone, TimeZoneLike> {
  constructor(unit: TimeZone | undefined) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly unit: TimeZone | undefined;

  override withUnit(unit: TimeZone | undefined): Form<TimeZone, TimeZoneLike> {
    if (unit === this.unit) {
      return this;
    }
    return new TimeZoneForm(unit);
  }

  override mold(zone: TimeZoneLike): Item {
    zone = TimeZone.fromLike(zone);
    const name = zone.name;
    if (name !== void 0) {
      return Text.from(name);
    } else {
      return Num.from(zone.offset);
    }
  }

  override cast(item: Item): TimeZone | undefined {
    const value = item.toValue();
    const zone = TimeZone.fromValue(value);
    return zone !== null ? zone : void 0;
  }
}
