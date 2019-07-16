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

import java.util.concurrent.Executor;

/**
 * An execution context in which to schedule tasks, create continuation calls,
 * and set timers.  {@code Stage} is thread safe.
 *
 * @see MainStage
 * @see Theater
 */
public interface Stage extends Executor, Schedule {
  /**
   * Returns an uncued {@code TaskRef} bound to the {@code task}, which can
   * later be used to cue the {@code task}.
   */
  TaskRef task(TaskFunction task);

  /**
   * Returns a {@code Call} that completes the {@code cont}inuation.
   */
  <T> Call<T> call(Cont<T> cont);

  /**
   * Schedules a {@code runnable} for concurrent execution.
   */
  @Override
  void execute(Runnable runnable);
}
