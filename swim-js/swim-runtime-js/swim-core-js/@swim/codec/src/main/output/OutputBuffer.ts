// Copyright 2015-2021 Swim Inc.
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

import {Lazy} from "@swim/util";
import {AnyOutputSettings, OutputSettings} from "./OutputSettings";
import {Output} from "./Output";
import {OutputBufferFull} from "../"; // forward import
import {OutputBufferDone} from "../"; // forward import
import {OutputBufferError} from "../"; // forward import

/**
 * Non-blocking token stream buffer.
 */
export abstract class OutputBuffer<T = unknown> extends Output<T> {
  abstract override asPart(part: boolean): OutputBuffer<T>;

  abstract readonly index: number;

  abstract withIndex(index: number): OutputBuffer<T>;

  abstract readonly limit: number;

  abstract withLimit(limit: number): OutputBuffer<T>;

  abstract readonly capacity: number;

  abstract readonly remaining: number;

  abstract has(index: number): boolean;

  abstract get(index: number): number;

  abstract set(index: number, token: number): void;

  abstract override write(token: number): OutputBuffer<T>;
  abstract override write(string: string): OutputBuffer<T>;

  override writeln(string?: string): OutputBuffer<T> {
    if (typeof string === "string") {
      this.write(string);
    }
    return this.write(this.settings.lineSeparator);
  }

  abstract step(offset?: number): OutputBuffer<T>;

  override flush(): OutputBuffer<T> {
    return this;
  }

  abstract override withSettings(settings: AnyOutputSettings): Output<T>;

  override clone(): OutputBuffer<T> {
    throw new Error();
  }

  /**
   * Returns an `OutputBuffer` in the _full_ state.
   */
  @Lazy
  static override full(): OutputBuffer<never> {
    return new OutputBufferFull(OutputSettings.standard());
  }

  /**
   * Returns an `OutputBuffer` in the _done_ state.
   */
  @Lazy
  static override done(): OutputBuffer<never> {
    return new OutputBufferDone(OutputSettings.standard());
  }

  /**
   * Returns an `OutputBuffer` in the _error_ state that traps the given `error`.
   */
  static override error(error: Error): OutputBuffer<never> {
    return new OutputBufferError(error, OutputSettings.standard());
  }
}
