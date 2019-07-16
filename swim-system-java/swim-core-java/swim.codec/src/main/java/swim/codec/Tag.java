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

package swim.codec;

/**
 * Description of a source location.  Tags are used to annotate input sources,
 * particularly for {@link Diagnostic diagnostic} purposes.  A {@link Mark} tag
 * annotates a source position.  A {@link Span} tag annotate a source range.
 *
 * @see Diagnostic
 */
public abstract class Tag implements Display, Debug {
  /**
   * Returns the first source position covered by this {@code Tag}.
   */
  public abstract Mark start();

  /**
   * Returns the last source position covered by this {@code Tag}.
   */
  public abstract Mark end();

  /**
   * Returns a {@code Tag} that includes all source locations covered by
   * both this tag, and some {@code other} tag.
   */
  public abstract Tag union(Tag other);

  /**
   * Returns the position of this {@code Tag} relative to the given
   * {@code mark}.
   */
  public abstract Tag shift(Mark mark);
}
