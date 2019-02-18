// Copyright 2015-2019 SWIM.AI inc.
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

import {AnyDateTime, DateTime} from "../DateTime";
import {TimeInterval} from "../TimeInterval";

/** @hidden */
export class YearsInterval extends TimeInterval {
  private readonly stride: number;

  constructor(stride: number) {
    super();
    this.stride = stride || 1;
  }

  offset(d: AnyDateTime, k?: number): DateTime {
    d = DateTime.fromAny(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    return d.year(d.year() + k * this.stride);
  }

  next(d: AnyDateTime, k?: number): DateTime {
    d = DateTime.fromAny(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d = d.year(Math.floor((d.year() + k * this.stride) / this.stride) * this.stride);
    return d.month(0, 1).hour(0, 0, 0, 0);
  }

  floor(d: AnyDateTime): DateTime {
    d = DateTime.fromAny(d);
    d = d.year(Math.floor(d.year() / this.stride) * this.stride);
    return d.month(0, 1).hour(0, 0, 0, 0);
  }

  ceil(d: AnyDateTime): DateTime {
    d = DateTime.fromAny(d);
    d = d.time(d.time() - 1);
    d = d.year(Math.floor(d.year() / this.stride) * this.stride);
    d = d.month(0, 1).hour(0, 0, 0, 0);
    d = d.year(Math.floor((d.year() + this.stride) / this.stride) * this.stride);
    return d.month(0, 1).hour(0, 0, 0, 0);
  }
}
TimeInterval.Years = YearsInterval;
