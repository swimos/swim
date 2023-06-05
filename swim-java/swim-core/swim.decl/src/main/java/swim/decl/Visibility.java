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

import java.lang.reflect.Member;
import java.lang.reflect.Modifier;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * Symbol visibility levels.
 *
 * @see AutoDetect
 */
@Public
@Since("5.0")
public enum Visibility {

  /**
   * Do not select any symbols.
   */
  NONE,

  /**
   * Select symbols with {@code private} or weaker access levels.
   */
  PRIVATE,

  /**
   * Select symbols with package-private or weaker access levels.
   */
  PACKAGE,

  /**
   * Select symbols with {@code protected} or weaker access levels.
   */
  PROTECTED,

  /**
   * Select symbols with {@code public} access levels.
   */
  PUBLIC,

  /**
   * Dummy value indicating that a default {@code Visibility} level should
   * be substituted for this level. No symbols are considered detectable
   * by this level.
   */
  DEFAULT,

  /**
   * Dummy value indicating that an inherited {@code Visibility} level should
   * be substituted for this level. No symbols are considered detectable
   * by this level.
   */
  INHERIT;

  /**
   * Returns {@code true} if the given class {@code member} is detectable,
   * otherwise returns {@code false}. A class member is detectable if its
   * access level is the same as, or weaker than, the access level of this
   * {@code Visibility} level.
   *
   * @param member the class member being considered for auto-detection
   * @return whether or not the caller should proceed with auto-detection
   *         of the given class {@code member}
   */
  public boolean isVisible(Member member) {
    switch (this) {
      case NONE:
        return false;
      case PRIVATE:
        return true;
      case PACKAGE:
        return (member.getModifiers() & Modifier.PRIVATE) == 0;
      case PROTECTED:
        return (member.getModifiers() & (Modifier.PROTECTED | Modifier.PUBLIC)) != 0;
      case PUBLIC:
        return (member.getModifiers() & Modifier.PUBLIC) != 0;
      default:
        return false;
    }
  }

}
