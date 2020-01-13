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

import {Equals} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";

export type AnyLngLat = LngLat | LngLatInit | [number, number];

export interface LngLatInit {
  lng: number;
  lat: number;
}

export class LngLat implements Equals, Debug {
  /** @hidden */
  readonly _lng: number;
  /** @hidden */
  readonly _lat: number;

  constructor(lng: number, lat: number) {
    this._lng = lng;
    this._lat = lat;
  }

  get lng(): number {
    return this._lng;
  }

  get lat(): number {
    return this._lat;
  }

  toAny(): LngLatInit {
    return {
      lng: this._lng,
      lat: this._lat,
    };
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LngLat) {
      return this._lng === that._lng && this._lat === that._lat;
    }
    return false;
  }

  debug(output: Output): void {
    output = output.write("LngLat").write(46/*'.'*/).write("from").write(40/*'('*/)
        .debug(this._lng).write(", ").debug(this._lat).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  private static _origin: LngLat | undefined;

  static origin(): LngLat {
    if (!LngLat._origin) {
      LngLat._origin = new LngLat(0, 0);
    }
    return LngLat._origin;
  }

  static from(lng: number, lat: number): LngLat {
    return new LngLat(lng, lat);
  }

  static fromAny(value: AnyLngLat): LngLat {
    if (value instanceof LngLat) {
      return value;
    } else if (value && typeof value === "object") {
      let lng: number;
      let lat: number;
      if (Array.isArray(value)) {
        lng = value[0];
        lat = value[1];
      } else {
        lng = value.lng;
        lat = value.lat;
      }
      return LngLat.from(lng, lat);
    }
    throw new TypeError("" + value);
  }
}
