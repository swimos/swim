// Copyright 2015-2020 Swim inc.
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

import {OutputException} from "./OutputException";
import {AnyOutputSettings, OutputSettings} from "./OutputSettings";
import {Output} from "./Output";
import {OutputDone} from "../"; // forward import
import {OutputError} from "../"; // forward import

/** @hidden */
export class OutputFull extends Output<never> {
  constructor(settings: OutputSettings) {
    super();
    Object.defineProperty(this, "settings", {
      value: settings,
      enumerable: true,
    });
  }

  isCont(): boolean {
    return false;
  }

  isFull(): boolean {
    return true;
  }

  isDone(): boolean {
    return false;
  }

  isError(): boolean {
    return false;
  }

  isPart(): boolean {
    return true;
  }

  asPart(part: boolean): Output<never> {
    return part ? this : new OutputDone(this.settings);
  }

  write(token: number): Output<never>;
  write(string: string): Output<never>;
  write(tokenOrString: number | string): Output<never> {
    return new OutputError(new OutputException("full"), this.settings);
  }

  writeln(string?: string): Output<never> {
    return new OutputError(new OutputException("full"), this.settings);
  }

  bind(): never {
    throw new OutputException();
  }

  declare readonly settings: OutputSettings;

  withSettings(settings: AnyOutputSettings): Output<never> {
    settings = OutputSettings.fromAny(settings);
    return new OutputFull(settings);
  }

  clone(): Output<never> {
    return this;
  }
}
