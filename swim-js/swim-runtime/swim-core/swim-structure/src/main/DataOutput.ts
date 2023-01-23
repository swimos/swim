// Copyright 2015-2023 Swim.inc
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

import type {Mutable} from "@swim/util";
import {AnyOutputSettings, OutputSettings, Output} from "@swim/codec";
import type {Data} from "./Data";

/** @internal */
export class DataOutput extends Output<Data> {
  constructor(data: Data, settings: OutputSettings) {
    super();
    this.data = data;
    this.settings = settings;
  }

  /** @internal */
  readonly data: Data;

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

  override readonly settings: OutputSettings;

  override withSettings(settings: AnyOutputSettings): Output<Data> {
    settings = OutputSettings.fromAny(settings);
    (this as Mutable<this>).settings = settings;
    return this;
  }

  override bind(): Data {
    return this.data;
  }

  override clone(): Output<Data> {
    return new DataOutput(this.data.branch(), this.settings);
  }
}
