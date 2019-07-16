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

package swim.streamlet;

import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.util.Log;

/**
 * Environment in which a {@link Streamlet} executes.
 */
public interface StreamletContext extends Log {
  /**
   * Returns the {@code Schedule} with which the {@code Streamlet} can set timers.
   */
  Schedule schedule();

  /**
   * Returns the {@code Stage} on which the {@code Streamlet} can execute tasks.
   */
  Stage stage();
}
