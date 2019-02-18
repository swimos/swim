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

import {ColorChannelParser} from "./ColorChannelParser";

/** @hidden */
export class ColorChannel {
  readonly value: number;
  readonly units: string;

  constructor(value: number, units: string = "") {
    this.value = value;
    this.units = units;
  }

  scale(k: number): number {
    if (this.units === "%") {
      return this.value * k / 100;
    } else {
      return this.value;
    }
  }

  // Forward type declarations
  /** @hidden */
  static Parser: typeof ColorChannelParser; // defined by ColorChannelParser
}
