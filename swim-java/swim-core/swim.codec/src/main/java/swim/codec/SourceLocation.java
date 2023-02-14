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

package swim.codec;

import swim.annotations.Public;
import swim.annotations.Since;

/**
 * Description of a source location. Locations are used to annotate input
 * sources, particularly for {@link Diagnostic diagnostic} purposes.
 * A {@link SourcePosition} denotes a singular source position.
 * A {@link SourceRange} denotes a span of source positions.
 *
 * @see Diagnostic
 */
@Public
@Since("5.0")
public abstract class SourceLocation {

  SourceLocation() {
    // sealed
  }

  /**
   * Returns the first source position covered by this {@code SourceLocation}.
   */
  public abstract SourcePosition start();

  /**
   * Returns the last source position covered by this {@code SourceLocation}.
   */
  public abstract SourcePosition end();

  /**
   * Returns a {@code SourceLocation} that includes all source locations
   * covered by both this location, and some {@code other} location.
   */
  public abstract SourceLocation union(SourceLocation other);

  /**
   * Returns the position of this {@code SourceLocation} relative to the given
   * {@code position}.
   */
  public abstract SourceLocation shift(SourcePosition position);

}
