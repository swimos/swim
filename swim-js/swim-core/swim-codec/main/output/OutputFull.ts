// Copyright 2015-2023 Nstream, inc.
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
import type {OutputSettingsLike} from "./OutputSettings";
import {OutputSettings} from "./OutputSettings";
import {Output} from "./Output";
import {OutputDone} from "../"; // forward import
import {OutputError} from "../"; // forward import

/** @internal */
export class OutputFull extends Output<never> {
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
    return true;
  }

  override isDone(): boolean {
    return false;
  }

  override isError(): boolean {
    return false;
  }

  override isPart(): boolean {
    return true;
  }

  override asPart(part: boolean): Output<never> {
    return part ? this : new OutputDone(this.settings);
  }

  override write(token: number): Output<never>;
  override write(string: string): Output<never>;
  override write(tokenOrString: number | string): Output<never> {
    return new OutputError(new OutputException("full"), this.settings);
  }

  override writeln(string?: string): Output<never> {
    return new OutputError(new OutputException("full"), this.settings);
  }

  override bind(): never {
    throw new OutputException();
  }

  override readonly settings!: OutputSettings;

  override withSettings(settings: OutputSettingsLike): Output<never> {
    settings = OutputSettings.fromLike(settings);
    return new OutputFull(settings);
  }

  override clone(): Output<never> {
    return this;
  }
}
