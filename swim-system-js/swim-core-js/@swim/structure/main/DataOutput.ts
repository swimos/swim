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

import {AnyOutputSettings, OutputSettings, Output} from "@swim/codec";
import type {Data} from "./Data";

/** @hidden */
export class DataOutput extends Output<Data> {
  /** @hidden */
  readonly data!: Data;

  constructor(data: Data, settings: OutputSettings) {
    super();
    Object.defineProperty(this, "data", {
      value: data,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "settings", {
      value: settings,
      enumerable: true,
      configurable: true,
    });
  }

  override isCont(): boolean {
    return true;
  }

  override isFull(): boolean {
    return false;
  }

  override isDone(): boolean {
    return false;
  }

  override isError(): boolean {
    return false;
  }

  override isPart(): boolean {
    return false;
  }

  override asPart(part: boolean): Output<Data> {
    return this;
  }

  override write(b: number | string): Output<Data> {
    if (typeof b === "number") {
      this.data.addByte(b);
      return this;
    } else {
      throw new TypeError("" + b);
    }
  }

  override writeln(string?: string): Output<Data> {
    throw new TypeError("" + string);
  }

  override readonly settings!: OutputSettings;

  override withSettings(settings: AnyOutputSettings): Output<Data> {
    settings = OutputSettings.fromAny(settings);
    Object.defineProperty(this, "settings", {
      value: settings,
      enumerable: true,
      configurable: true,
    });
    return this;
  }

  override bind(): Data {
    return this.data;
  }

  override clone(): Output<Data> {
    return new DataOutput(this.data.branch(), this.settings);
  }
}
