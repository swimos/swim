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

import {HashCode} from "@swim/util";
import {Mark} from "./Mark";
import {Span} from "./Span";
import {Output} from "./Output";
import {Display} from "./Display";
import {Debug} from "./Debug";
import {Format} from "./Format";

/**
 * Description of a source location.  Tags are used to annotate input sources,
 * particularly for [[Diagnostic diagnostic]] purposes.  A [[Mark]] tag
 * annotates a source position.  A [[Span]] tag annotate a source range.
 *
 * @see [[Diagnostic]]
 */
export abstract class Tag implements Display, Debug, HashCode {
  /**
   * Returns the first source position covered by this `Tag`.
   */
  abstract start(): Mark;

  /**
   * Returns the last source position covered by this `Tag`.
   */
  abstract end(): Mark;

  /**
   * Returns a `Tag` that includes all source locations covered by
   * both this tag, and `that` tag.
   */
  abstract union(that: Tag): Tag;

  /**
   * Returns the position of this `Tag` relative to the given `mark`.
   */
  abstract shift(mark: Mark): Tag;

  abstract display(output: Output): void;

  abstract debug(output: Output): void;

  abstract equals(that: unknown): boolean;

  abstract hashCode(): number;

  // Forward type declarations
  /** @hidden */
  static Mark: typeof Mark; // defined by Mark
  /** @hidden */
  static Span: typeof Span; // defined by Span
  /** @hidden */
  static Format: typeof Format; // defined by Format
}
