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

package swim.runtime.lane;

import swim.concurrent.Conts;
import swim.concurrent.Stage;

abstract class LaneRelay<Model extends LaneModel<View, ?>, View extends LaneView> implements Runnable {
  final Model model;
  final Object views; // View | View[]
  int viewIndex;
  final int viewCount;
  int phase;
  final int phaseCount;
  boolean preemptive;
  Stage stage;

  LaneRelay(Model model, int minPhase, int phaseCount) {
    this.model = model;
    this.views = model.views;
    if (this.views instanceof LaneView) {
      this.viewCount = 1;
    } else if (this.views instanceof LaneView[]) {
      this.viewCount = ((LaneView[]) views).length;
    } else {
      this.viewCount = 0;
    }
    this.phase = minPhase;
    this.phaseCount = phaseCount;
    this.preemptive = true;
    beginPhase(phase);
  }

  LaneRelay(Model model, int phaseCount) {
    this(model, 0, phaseCount);
  }

  LaneRelay(Model model) {
    this(model, 0, 1);
  }

  boolean isDone() {
    return this.phase > this.phaseCount;
  }

  void beginPhase(int phase) {
    // stub
  }

  boolean runPhase(View view, int phase, boolean preemptive) {
    return true;
  }

  void endPhase(int phase) {
    // stub
  }

  void done() {
    // stub
  }

  void pass() {
    do {
      if (this.phase < this.phaseCount) {
        endPhase(this.phase);
        this.phase += 1;
        this.preemptive = true;
        if (this.phase < this.phaseCount) {
          beginPhase(this.phase);
        } else {
          endPhase(this.phase);
          this.phase += 1;
          done();
          return;
        }
      } else {
        return;
      }
    } while (true);
  }

  void pass(View view) {
    do {
      if (this.viewIndex < this.viewCount) {
        try {
          if (!runPhase(view, this.phase, this.preemptive) && this.preemptive) {
            this.preemptive = false;
            if (this.stage == null) {
              this.stage = this.model.stage();
              this.stage.execute(this);
              return;
            } else {
              continue;
            }
          }
        } catch (Throwable error) {
          if (Conts.isNonFatal(error)) {
            view.laneDidFail(error);
          }
          throw error;
        }
        this.viewIndex += 1;
      } else if (this.phase < this.phaseCount) {
        endPhase(this.phase);
        this.viewIndex = 0;
        this.phase += 1;
        this.preemptive = true;
        if (this.phase < this.phaseCount) {
          beginPhase(this.phase);
        } else {
          endPhase(this.phase);
          this.phase += 1;
          done();
          return;
        }
      } else {
        return;
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  void pass(LaneView[] views) {
    do {
      if (this.viewIndex < this.viewCount) {
        final View view = (View) views[this.viewIndex];
        try {
          if (!runPhase(view, this.phase, this.preemptive) && this.preemptive) {
            this.preemptive = false;
            if (this.stage == null) {
              this.stage = this.model.stage();
              this.stage.execute(this);
              return;
            } else {
              continue;
            }
          }
        } catch (Throwable error) {
          if (Conts.isNonFatal(error)) {
            view.laneDidFail(error);
          }
          throw error;
        }
        this.viewIndex += 1;
      } else if (this.phase < this.phaseCount) {
        endPhase(this.phase);
        this.viewIndex = 0;
        this.phase += 1;
        this.preemptive = true;
        if (this.phase < this.phaseCount) {
          beginPhase(this.phase);
        } else {
          endPhase(this.phase);
          this.phase += 1;
          done();
          return;
        }
      } else {
        return;
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  @Override
  public void run() {
    try {
      if (this.viewCount == 0) {
        pass();
      } else if (this.viewCount == 1) {
        pass((View) views);
      } else if (this.viewCount > 1) {
        pass((LaneView[]) views);
      }
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        this.model.didFail(error);
      } else {
        throw error;
      }
    }
  }
}
