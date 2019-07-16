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

import {AnyOutputSettings, OutputSettings, Output} from "@swim/codec";
import {Data} from "./Data";

/** @hidden */
export class DataOutput extends Output<Data> {
  /** @hidden */
  readonly _data: Data;
  /** @hidden */
  _settings: OutputSettings;

  constructor(data: Data, settings: OutputSettings) {
    super();
    this._data = data;
    this._settings = settings;
  }

  isCont(): boolean {
    return true;
  }

  isFull(): boolean {
    return false;
  }

  isDone(): boolean {
    return false;
  }

  isError(): boolean {
    return false;
  }

  isPart(): boolean;
  isPart(isPart: boolean): Output<Data>;
  isPart(isPart?: boolean): boolean | Output<Data> {
    if (isPart === void 0) {
      return false;
    } else {
      return this;
    }
  }

  write(b: number | string): Output<Data> {
    if (typeof b === "number") {
      this._data.addByte(b);
      return this;
    } else {
      throw new TypeError("" + b);
    }
  }

  writeln(string?: string): Output<Data> {
    throw new TypeError("" + string);
  }

  settings(): OutputSettings;
  settings(settings: AnyOutputSettings): Output<Data>;
  settings(settings?: AnyOutputSettings): OutputSettings | Output<Data> {
    if (settings === void 0) {
      return this._settings;
    } else {
      this._settings = OutputSettings.fromAny(settings);
      return this;
    }
  }

  bind(): Data {
    return this._data;
  }

  clone(): Output<Data> {
    return new DataOutput(this._data.branch(), this._settings);
  }
}
