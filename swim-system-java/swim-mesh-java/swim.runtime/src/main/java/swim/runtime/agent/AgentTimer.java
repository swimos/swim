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

package swim.runtime.agent;

import swim.concurrent.Conts;
import swim.concurrent.Schedule;
import swim.concurrent.Timer;
import swim.concurrent.TimerContext;
import swim.concurrent.TimerFunction;
import swim.concurrent.TimerRef;

public class AgentTimer implements Timer, TimerContext, TimerRef, Runnable {
  protected final AgentNode node;
  protected final TimerFunction timer;
  protected TimerContext timerContext;

  public AgentTimer(AgentNode node, TimerFunction timer) {
    this.node = node;
    this.timer = timer;
  }

  @Override
  public TimerContext timerContext() {
    return this.timerContext;
  }

  @Override
  public void setTimerContext(TimerContext timerContext) {
    this.timerContext = timerContext;
    if (this.timer instanceof Timer) {
      ((Timer) this.timer).setTimerContext(this);
    }
  }

  @Override
  public void runTimer() {
    this.node.execute(this);
  }

  @Override
  public void timerWillSchedule(long millis) {
    if (this.timer instanceof Timer) {
      ((Timer) this.timer).timerWillSchedule(millis);
    }
  }

  @Override
  public void timerDidCancel() {
    if (this.timer instanceof Timer) {
      ((Timer) this.timer).timerDidCancel();
    }
  }

  @Override
  public Schedule schedule() {
    return this.node;
  }

  @Override
  public boolean isScheduled() {
    return this.timerContext.isScheduled();
  }

  @Override
  public void reschedule(long millis) {
    this.timerContext.reschedule(millis);
  }

  @Override
  public boolean cancel() {
    return this.timerContext.cancel();
  }

  @Override
  public void run() {
    final long t0 = System.nanoTime();
    try {
      this.timer.runTimer();
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        this.node.didFail(error);
      } else {
        throw error;
      }
    }
    final long dt = System.nanoTime() - t0;
    if (this.node instanceof AgentModel) {
      AgentModel.TIMER_EVENT_DELTA.incrementAndGet((AgentModel) this.node);
      ((AgentModel) this.node).accumulateExecTime(dt);
    }
  }
}
