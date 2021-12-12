// Copyright 2015-2021 Swim.inc
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

/** @internal */
export class MillisecondsInterval extends TimeInterval {
  private readonly stride: number;

  constructor(stride: number) {
    super();
    if (!isFinite(stride)) {
      stride = 1;
    }
    this.stride = stride;
  }

  override offset(d: AnyDateTime, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    d += k * this.stride;
    return new DateTime(d, z);
  }

  override next(d: AnyDateTime, k?: number): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    const stride = this.stride;
    d = Math.floor((d + k * stride) / stride) * stride;
    return new DateTime(d, z);
  }

  override floor(d: AnyDateTime): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    const stride = this.stride;
    d = Math.floor(d / stride) * stride;
    return new DateTime(d, z);
  }

  override ceil(d: AnyDateTime): DateTime {
    const z = DateTime.zone(d);
    d = DateTime.time(d);
    const stride = this.stride;
    d = Math.floor(((Math.floor((d - 1) / stride) * stride) + stride) / stride) * stride;
    return new DateTime(d, z);
  }
}
