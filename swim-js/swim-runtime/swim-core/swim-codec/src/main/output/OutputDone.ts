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

import {OutputException} from "./OutputException";
import {AnyOutputSettings, OutputSettings} from "./OutputSettings";
import {Output} from "./Output";
import {OutputFull} from "../"; // forward import
import {OutputError} from "../"; // forward import

/** @internal */
export class OutputDone extends Output<never> {
  constructor(settings: OutputSettings) {
    super();
    Object.defineProperty(this, "settings", {
      value: settings,
      enumerable: true,
    });
  }

  override isCont(): boolean {
    return false;
  }

  override isFull(): boolean {
    return false;
  }

  override isDone(): boolean {
    return true;
  }

  override isError(): boolean {
    return false;
  }

  override isPart(): boolean {
    return false;
  }

  override asPart(part: boolean): Output<never> {
    return part ? new OutputFull(this.settings) : this;
  }

  override write(token: number): Output<never>;
  override write(string: string): Output<never>;
  override write(tokenOrString: number | string): Output<never> {
    return new OutputError(new OutputException("done"), this.settings);
  }

  override writeln(string?: string): Output<never> {
    return new OutputError(new OutputException("done"), this.settings);
  }

  override bind(): never {
    throw new OutputException();
  }

  override readonly settings!: OutputSettings;

  override withSettings(settings: AnyOutputSettings): Output<never> {
    settings = OutputSettings.fromAny(settings);
    return new OutputDone(settings);
  }

  override clone(): Output<never> {
    return this;
  }
}
