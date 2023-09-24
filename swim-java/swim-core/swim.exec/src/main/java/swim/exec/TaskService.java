// Copyright 2015-2023 Nstream, inc.
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

package swim.exec;

import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A {@link TaskScheduler} with management methods for configuring, starting,
 * and stopping the service. {@code TaskService} is thread safe.
 *
 * @see ThreadPool
 */
@Public
@Since("5.0")
public interface TaskService extends TaskScheduler {

  /**
   * Ensures that this task service has entered the started state.
   * Returns {@code true} if this call causes the task service to start;
   * otherwise returns {@code false} if the task service was already started.
   * Waits until the service has been started before returning.
   */
  boolean start();

  /**
   * Ensures that this task service has permanently entered the stopped state.
   * Returns {@code true} if this call causes the task service to stop;
   * otherwise returns {@code false} if the task service was already stopped.
   * Waits until the service has been stopped before returning.
   */
  boolean stop();

}
