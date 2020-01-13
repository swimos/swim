// Copyright 2015-2020 SWIM.AI inc.
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

import {HashCode, Murmur3} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import {Value, Form} from "@swim/structure";
import {TimeZoneForm} from "./TimeZoneForm";

export type AnyTimeZone = TimeZone | string | number;

export class TimeZone implements HashCode, Debug {
  /** @hidden */
  readonly _name: string | undefined;
  /** @hidden */
  readonly _offset: number;

  /** @hidden */
  private constructor(name: string | undefined, offset: number) {
    this._name = name;
    this._offset = offset;
  }

  isUTC(): boolean {
    return this._offset === 0;
  }

  isLocal(): boolean {
    return this._offset === -new Date().getTimezoneOffset();
  }

  name(): string | undefined {
    return this._name;
  }

  offset(): number {
    return this._offset;
  }

  equals(that: unknown) {
    if (this === that) {
      return true;
    } else if (that instanceof TimeZone) {
      return this._offset === that._offset;
    }
    return false;
  }

  hashCode(): number {
    if (TimeZone._hashSeed === void 0) {
      TimeZone._hashSeed = Murmur3.seed(TimeZone);
    }
    return Murmur3.mash(Murmur3.mix(TimeZone._hashSeed, Murmur3.hash(this._offset)));
  }

  debug(output: Output): void {
    output = output.write("TimeZone").write(46/*'.'*/);
    if (this._name === "UTC" && this._offset === 0) {
      output = output.write("utc").write(40/*'('*/).write(41/*')'*/);
    } else if (this._name === void 0) {
      output = output.write("forOffset").write(40/*'('*/)
          .debug(this._offset).write(41/*')'*/);
    } else {
      output = output.write("from").write(40/*'('*/)
          .debug(this._name).write(", ").debug(this._offset).write(41/*')'*/);
    }
  }

  toString(): string {
    return Format.debug(this);
  }

  private static _hashSeed?: number;

  private static _utc?: TimeZone;
  static utc(): TimeZone {
    if (!TimeZone._utc) {
      TimeZone._utc = new TimeZone("UTC", 0);
    }
    return TimeZone._utc;
  }

  private static _local?: TimeZone;
  static local(): TimeZone {
    if (!TimeZone._local) {
      TimeZone._local = TimeZone.forOffset(-new Date().getTimezoneOffset());
    }
    return TimeZone._local;
  }

  static forName(name: string): TimeZone | undefined {
    switch (name) {
      case "UTC": return TimeZone.utc();
      default: return void 0;
    }
  }

  static forOffset(offset: number): TimeZone {
    switch (offset) {
      case 0: return TimeZone.utc();
      default: return new TimeZone(void 0, offset);
    }
  }

  static from(name: string, offset: number): TimeZone {
    if (name === "UTC" && offset === 0) {
      return TimeZone.utc();
    } else {
      return new TimeZone(name, offset);
    }
  }

  static fromAny(value: AnyTimeZone): TimeZone {
    if (value instanceof TimeZone) {
      return value;
    } else if (typeof value === "string") {
      const zone = TimeZone.forName(value);
      if (zone !== void 0) {
        return zone;
      }
    } else if (typeof value === "number") {
      return TimeZone.forOffset(value);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): TimeZone | undefined {
    const name = value.stringValue(void 0);
    if (name !== void 0) {
      return TimeZone.forName(name);
    }
    const offset = value.numberValue(void 0);
    if (offset !== void 0) {
      return TimeZone.forOffset(offset);
    }
    return void 0;
  }

  private static _form: Form<TimeZone, AnyTimeZone>;
  static form(unit?: AnyTimeZone): Form<TimeZone, AnyTimeZone> {
    if (unit !== void 0) {
      unit = TimeZone.fromAny(unit);
    }
    if (unit !== TimeZone.utc()) {
      return new TimeZone.Form(unit);
    } else {
      if (!TimeZone._form) {
        TimeZone._form = new TimeZone.Form(TimeZone.utc());
      }
      return TimeZone._form;
    }
  }

  // Forward type declarations
  /** @hidden */
  static Form: typeof TimeZoneForm; // defined by TimeZoneForm
}
