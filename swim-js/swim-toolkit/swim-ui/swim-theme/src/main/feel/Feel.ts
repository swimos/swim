// Copyright 2015-2022 Swim.inc
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

import type {Mood} from "../mood/Mood";
import type {Look} from "../look/Look";
import {FeelVector} from "./FeelVector";

/** @public */
export abstract class Feel implements Mood {
  constructor(name: string) {
    this.name = name;
  }

  readonly name: string;

  abstract combine<T>(look: Look<T, any>, combination: T | undefined,
                      value: T, weight?: number): T;

  empty(): FeelVector {
    return FeelVector.empty();
  }

  of(...looks: [Look<unknown>, any][]): FeelVector {
    return FeelVector.of(...looks);
  }

  from(array: ReadonlyArray<[Look<unknown>, unknown]>,
       index?: {readonly [name: string]: number | undefined}): FeelVector {
    return FeelVector.fromArray(array, index);
  }

  toString(): string {
    return "Feel" + "." + this.name;
  }

  static ambient: Feel; // defined by feels
  static default: Feel; // defined by feels

  static primary: Feel; // defined by feels
  static secondary: Feel; // defined by feels

  static unselected: Feel; // defined by feels
  static selected: Feel; // defined by feels
  static disabled: Feel; // defined by feels
  static inactive: Feel; // defined by feels
  static warning: Feel; // defined by feels
  static alert: Feel; // defined by feels

  static darker: Feel; // defined by feels
  static lighter: Feel; // defined by feels
  static contrasted: Feel; // defined by feels

  static raised: Feel; // defined by feels
  static covered: Feel; // defined by feels

  static opaque: Feel; // defined by feels
  static floating: Feel; // defined by feels
  static transparent: Feel; // defined by feels
  static translucent: Feel; // defined by feels
  static embossed: Feel; // defined by feels
  static nested: Feel; // defined by feels
  static hovering: Feel; // defined by feels

  static navigating: Feel; // defined by feels
}
