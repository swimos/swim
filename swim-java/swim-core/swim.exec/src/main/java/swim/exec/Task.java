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

package swim.exec;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A stateful {@link TaskFunction} with an associated {@link TaskContext}
 * for scheduling and cancelling concurrent execution of the task with a
 * bound {@link TaskScheduler}.
 *
 * @see AbstractTask
 * @see TaskScheduler
 */
@Public
@Since("5.0")
public interface Task extends TaskFunction {

  /**
   * Returns the management context that binds this task to a {@link
   * TaskScheduler}. Returns {@code null} if this task is not currently
   * bound to a {@code TaskScheduler}.
   */
  @Nullable TaskContext taskContext();

  /**
   * Sets the {@link #taskContext()} that binds this task to a {@link
   * TaskScheduler}. Invoked by {@link TaskScheduler#bindTask(Runnable)
   * TaskScheduler.bindTask}.
   */
  void setTaskContext(@Nullable TaskContext taskContext);

}
