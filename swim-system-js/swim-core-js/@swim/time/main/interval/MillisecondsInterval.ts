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
export class MillisecondsInterval extends TimeInterval {
  private readonly stride: number;

  constructor(stride: number) {
    super();
    if (typeof stride !== "number" || !isFinite(stride) || isNaN(stride)) {
      stride = 1;
    }
    this.stride = stride;
  }

  offset(d: AnyDateTime, k?: number): DateTime {
    d = DateTime.fromAny(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    return d.time(d.time() + k * this.stride);
  }

  next(d: AnyDateTime, k?: number): DateTime {
    d = DateTime.fromAny(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    const stride = this.stride;
    return d.time(Math.floor((d.time() + k * stride) / stride) * stride);
  }

  floor(d: AnyDateTime): DateTime {
    d = DateTime.fromAny(d);
    const stride = this.stride;
    return d.time(Math.floor(d.time() / stride) * stride);
  }

  ceil(d: AnyDateTime): DateTime {
    d = DateTime.fromAny(d);
    const stride = this.stride;
    return d.time(Math.floor(((Math.floor((d.time() - 1) / stride) * stride) + stride) / stride) * stride);
  }
}
TimeInterval.Milliseconds = MillisecondsInterval;
