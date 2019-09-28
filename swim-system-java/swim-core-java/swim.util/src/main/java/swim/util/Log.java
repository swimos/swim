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

package swim.util;

/**
 * Takes actions when presented messages of various severities.
 */
public interface Log {
  /**
   * Logs a trace-level message.
   */
  void trace(Object message);

  /**
   * Logs a debug-level message.
   */
  void debug(Object message);

  /**
   * Logs an info-level message.
   */
  void info(Object message);

  /**
   * Logs a warn-level message.
   */
  void warn(Object message);

  /**
   * Logs an error-level message.
   */
  void error(Object message);

  /**
   * Logs an fail-level message.
   */
  void fail(Object message);
}
