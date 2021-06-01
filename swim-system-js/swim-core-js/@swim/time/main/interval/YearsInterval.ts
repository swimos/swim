// Copyright 2015-2021 Swim inc.
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
import {TimeInterval} from "./TimeInterval";

/** @hidden */
export class YearsInterval extends TimeInterval {
  private readonly stride: number;

  constructor(stride: number) {
    super();
    this.stride = stride;
  }

  override offset(t: AnyDateTime, k?: number): DateTime {
    const d = DateTime.fromAny(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    return d.withYear(d.year + k * this.stride);
  }

  override next(t: AnyDateTime, k?: number): DateTime {
    let d = DateTime.fromAny(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d = d.withYear(Math.floor((d.year + k * this.stride) / this.stride) * this.stride);
    return d.withMonth(0, 1).withHour(0, 0, 0, 0);
  }

  override floor(t: AnyDateTime): DateTime {
    let d = DateTime.fromAny(t);
    d = d.withYear(Math.floor(d.year / this.stride) * this.stride);
    return d.withMonth(0, 1).withHour(0, 0, 0, 0);
  }

  override ceil(t: AnyDateTime): DateTime {
    let d = DateTime.fromAny(t);
    d = new DateTime(d.time - 1, d.zone);
    d = d.withYear(Math.floor(d.year / this.stride) * this.stride);
    d = d.withMonth(0, 1).withHour(0, 0, 0, 0);
    d = d.withYear(Math.floor((d.year + this.stride) / this.stride) * this.stride);
    return d.withMonth(0, 1).withHour(0, 0, 0, 0);
  }
}
