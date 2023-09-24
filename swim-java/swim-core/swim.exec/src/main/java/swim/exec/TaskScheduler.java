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

import java.util.concurrent.Executor;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A scheduler for arranging concurrent execution of {@linkplain
 * TaskFunction tasks}. {@code TaskScheduler} is thread safe.
 *
 * @see TaskService
 * @see ThreadPool
 */
@Public
@Since("5.0")
public interface TaskScheduler extends Executor {

  /**
   * Binds a {@code task} to this scheduler, and returns an unscheduled
   * {@code TaskRef} that can be used to {@link TaskRef#schedule()
   * schedule} and {@link TaskRef#cancel() cancel} the timer.
   */
  TaskRef bindTask(Runnable task);

  /**
   * Schedules a {@code runnable} for one-shot concurrent execution.
   */
  @Override
  void execute(Runnable runnable);

}
