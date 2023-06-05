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

package swim.decl;

import swim.annotations.Public;
import swim.annotations.Since;

/**
 * Declarative filtering modes.
 *
 * @see Include
 */
@Public
@Since("5.0")
public enum FilterMode {

  /**
   * Include values that are not considered undefined (i.e. non-{@code null}).
   */
  DEFINED,

  /**
   * Include values that are not considered undefined or false
   * (i.e. non-{@code null} and not {@code false}).
   */
  TRUTHY,

  /**
   * Include values that are not considered undefined, false, or degenerate
   * (i.e. non-{@code null}, not {@code false}, and non-zero or non-empty).
   */
  DISTINCT,

  /**
   * Include all values.
   */
  ALWAYS,

  /**
   * Defer to an implementation-defined filter.
   */
  DEFAULT,

  /**
   * Dummy value indicating that an inherited {@code FilterMode} should be
   * substituted for this mode.
   */
  INHERIT;

}
