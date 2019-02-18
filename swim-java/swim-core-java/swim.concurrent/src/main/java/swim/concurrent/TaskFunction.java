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

package swim.concurrent;

/**
 * Function to invoke as a sequential process on a concurrent execution {@link
 * Stage}.  Use {@link Stage#task(TaskFunction)} to bind a {@code TaskFunction}
 * to a {@code Stage}, and invoke {@link TaskRef#cue()} to schedule the
 * concurrent execution of the sequential task.
 *
 * <h3>Blocking</h3>
 * {@code TaskFunction} implementations should not perform long running or
 * blocking operations.  If a blocking operation needs to be performed,
 * implement a {@link Task} that returns {@code true} from {@link
 * Task#taskWillBlock() taskWillBlock()} to avoid thread starvation of the
 * execution {@code Stage}.
 *
 * @see Task
 * @see Stage
 */
//@FunctionalInterface
public interface TaskFunction {
  /**
   * Executes this sequential process.  Only one thread at a time will execute
   * {@code runTask} for this {@code TaskFunction}.
   */
  void runTask();
}
