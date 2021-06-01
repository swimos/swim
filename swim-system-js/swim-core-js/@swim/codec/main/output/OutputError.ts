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

import {OutputException} from "./OutputException";
import {AnyOutputSettings, OutputSettings} from "./OutputSettings";
import {Output} from "./Output";

/** @hidden */
export class OutputError extends Output<never> {
  /** @hidden */
  readonly error!: Error;

  constructor(error: Error, settings: OutputSettings) {
    super();
    Object.defineProperty(this, "error", {
      value: error,
      enumerable: true,
    });
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
    return false;
  }

  override isError(): boolean {
    return true;
  }

  override isPart(): boolean {
    return false;
  }

  override asPart(part: boolean): Output<never> {
    return this;
  }

  override write(token: number): Output<never>;
  override write(string: string): Output<never>;
  override write(tokenOrString: number | string): Output<never> {
    return this;
  }

  override writeln(string?: string): Output<never> {
    return this;
  }

  override bind(): never {
    throw new OutputException();
  }

  override trap(): Error {
    return this.error;
  }

  override readonly settings!: OutputSettings;

  override withSettings(settings: AnyOutputSettings): Output<never> {
    settings = OutputSettings.fromAny(settings);
    return new OutputError(this.error, settings);
  }

  override clone(): Output<never> {
    return this;
  }
}
