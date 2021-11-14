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
import {Mark} from "../source/Mark";
import {AnyInputSettings, InputSettings} from "./InputSettings";
import {Input} from "./Input";
import {InputBufferEmpty} from "../"; // forward import
import {InputBufferDone} from "../"; // forward import
import {InputBufferError} from "../"; // forward import

/**
 * Non-blocking token stream buffer.
 * @public
 */
export abstract class InputBuffer extends Input {
  abstract override asPart(part: boolean): InputBuffer;

  abstract readonly index: number;

  abstract withIndex(index: number): InputBuffer;

  abstract readonly limit: number;

  abstract withLimit(limit: number): InputBuffer;

  abstract readonly capacity: number;

  abstract readonly remaining: number;

  abstract has(index: number): boolean;

  abstract get(index: number): number;

  abstract set(index: number, token: number): void;

  abstract override step(offset?: number): InputBuffer;

  abstract override seek(mark: Mark): InputBuffer;

  abstract override withId(id: string | undefined): InputBuffer;

  abstract override withMark(mark: Mark): InputBuffer;

  abstract override withSettings(settings: AnyInputSettings): InputBuffer;

  abstract override clone(): InputBuffer;

  /**
   * Returns an `InputBuffer` in the _empty_ state.
   */
  @Lazy
  static override empty(): InputBuffer {
    return new InputBufferEmpty(void 0, Mark.zero, InputSettings.standard());
  }

  /**
   * Returns an `InputBuffer` in the _done_ state.
   */
  @Lazy
  static override done(): InputBuffer {
    return new InputBufferDone(void 0, Mark.zero, InputSettings.standard());
  }

  /**
   * Returns an `InputBuffer` in the _error_ state that traps the given `error`.
   */
  static override error(error: Error): InputBuffer {
    return new InputBufferError(error, void 0, Mark.zero, InputSettings.standard());
  }
}
