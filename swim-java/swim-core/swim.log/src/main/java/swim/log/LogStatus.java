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

package swim.log;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Severity;

/**
 * An object that can provide structured status information
 * for inclusion in log events.
 */
@Public
@Since("5.0")
@FunctionalInterface
public interface LogStatus {

  /**
   * Returns the structured status of this object for inclusion in log events
   * with the given severity {@code level}.
   */
  @Nullable Object toLogStatus(Severity level);

  /**
   * Returns the structured status of the given {@code object} for inclusion
   * in log events with the given severity {@code level}. Delegates to
   * {@link #toLogStatus(Severity) object.toLogStatus(level)},
   * if {@code object} implements {@code LogStatus}; falls back to
   * {@link LogEntity#toLogEntity(Severity) object.toLogEntity(level)},
   * if {@code object} implements {@code LogEntity};
   * otherwise returns {@code null}.
   */
  static @Nullable Object of(@Nullable Object object, Severity level) {
    if (object instanceof LogStatus) {
      return ((LogStatus) object).toLogStatus(level);
    } else if (object instanceof LogEntity) {
      return ((LogEntity) object).toLogEntity(level);
    }
    return null;
  }

}
