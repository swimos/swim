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
 * Stateful {@link TaskFunction} to invoke as a sequential process on a
 * concurrent execution {@link Stage}, with lifecycle callbacks, and a {@link
 * TaskContext} for self-management.  Use {@link Stage#task(TaskFunction)} to
 * bind a new {@code Task} to a {@code Stage}, and invoke {@link TaskRef#cue()}
 * to schedule the concurrent execution of the sequential task.
 *
 * <h3>Blocking</h3>
 * {@code Task} implementations should not perform long running or blocking
 * operations, if possible. If a {@code Task} does need to block, it should
 * return {@code true} from {@link #taskWillBlock()} to avoid thread starvation
 * of the execution {@code Stage}.
 *
 * @see AbstractTask
 * @see Stage
 */
public interface Task extends TaskFunction {
  /**
   * Returns the context used to managed this {@code Task}.  Returns {@code
   * null} if this {@code Task} is not bound to a {@link Stage}.
   */
  TaskContext taskContext();

  /**
   * Sets the context used to managed this {@code Task}.  A {@code
   * TaskContext} is assigned when binding this {@code Task} to a {@link Stage}.
   */
  void setTaskContext(TaskContext taskContext);

  /**
   * Executes this sequential process.  Only one thread at a time will execute
   * {@code runTask} for this {@code Task}.
   */
  @Override
  void runTask();

  /**
   * Returns {@code true} if this {@code Task} might block its thread of
   * execution when running; returns {@code false} if this {@code Task} will
   * never block.  Used by the execution {@code Stage} to prevent thread
   * starvation when concurrently running many blocking tasks.
   */
  boolean taskWillBlock();

  /**
   * Lifecycle callback invoked before this {@code Task} is scheduled for
   * execution.
   */
  void taskWillCue();

  /**
   * Lifecycle callback invoked after this {@code Task} is explicitly
   * cancelled.
   */
  void taskDidCancel();
}
