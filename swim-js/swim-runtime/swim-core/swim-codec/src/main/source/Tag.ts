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

import type {HashCode} from "@swim/util";
import type {Mark} from "./Mark";
import type {Output} from "../output/Output";
import type {Display} from "../format/Display";
import type {Debug} from "../format/Debug";

/**
 * Description of a source location. Tags are used to annotate input sources,
 * particularly for [[Diagnostic diagnostic]] purposes. A [[Mark]] tag
 * annotates a source position. A [[Span]] tag annotate a source range.
 *
 * @see [[Diagnostic]]
 * @public
 */
export abstract class Tag implements HashCode, Display, Debug {
  /**
   * The first source position covered by this `Tag`.
   */
  abstract readonly start: Mark;

  /**
   * The last source position covered by this `Tag`.
   */
  abstract readonly end: Mark;

  /**
   * Returns a `Tag` that includes all source locations covered by
   * both this tag, and `that` tag.
   */
  abstract union(that: Tag): Tag;

  /**
   * Returns the position of this `Tag` relative to the given `mark`.
   */
  abstract shift(mark: Mark): Tag;

  abstract display<T>(output: Output<T>): Output<T>;

  abstract debug<T>(output: Output<T>): Output<T>;

  abstract equals(that: unknown): boolean;

  abstract hashCode(): number;
}
