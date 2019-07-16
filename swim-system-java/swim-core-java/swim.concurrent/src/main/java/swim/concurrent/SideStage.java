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
 * {@link Stage} wrapper that prevents its underlying stage from being started
 * and stopped.
 */
public class SideStage implements Stage {
  protected final Stage stage;

  public SideStage(Stage stage) {
    this.stage = stage;
  }

  @Override
  public void execute(Runnable runnable) {
    this.stage.execute(runnable);
  }

  @Override
  public TaskRef task(TaskFunction task) {
    return this.stage.task(task);
  }

  @Override
  public <T> Call<T> call(Cont<T> cont) {
    return this.stage.call(cont);
  }

  @Override
  public TimerRef timer(TimerFunction timer) {
    return this.stage.timer(timer);
  }

  @Override
  public TimerRef setTimer(long millis, TimerFunction timer) {
    return this.stage.setTimer(millis, timer);
  }
}
