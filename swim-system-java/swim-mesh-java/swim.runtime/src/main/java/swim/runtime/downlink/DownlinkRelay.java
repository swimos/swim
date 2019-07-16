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

package swim.runtime.downlink;

import swim.concurrent.Conts;
import swim.concurrent.Stage;

abstract class DownlinkRelay<Model extends DownlinkModel<View>, View extends DownlinkView> implements Runnable {
  final Model model;
  final Object views; // View | View[]
  int viewIndex;
  final int viewCount;
  int phase;
  final int phaseCount;
  boolean preemptive;
  Stage stage;

  DownlinkRelay(Model model, int minPhase, int phaseCount) {
    this.model = model;
    this.views = model.views;
    if (this.views instanceof DownlinkView) {
      this.viewCount = 1;
    } else if (this.views instanceof DownlinkView[]) {
      this.viewCount = ((DownlinkView[]) views).length;
    } else {
      this.viewCount = 0;
    }
    this.phase = minPhase;
    this.phaseCount = phaseCount;
    this.preemptive = true;
    beginPhase(phase);
  }

  DownlinkRelay(Model model, int phaseCount) {
    this(model, 0, phaseCount);
  }

  DownlinkRelay(Model model) {
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

  void pass(View view) {
    do {
      if (this.viewIndex < this.viewCount) {
        try {
          if (!runPhase(view, this.phase, this.preemptive) && this.preemptive) {
            this.preemptive = false;
            if (this.stage != view.stage) {
              this.stage = view.stage;
              this.stage.execute(this);
              return;
            } else {
              continue;
            }
          }
        } catch (Throwable error) {
          if (Conts.isNonFatal(error)) {
            view.downlinkDidFail(error);
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
  void pass(DownlinkView[] views) {
    do {
      if (this.viewIndex < this.viewCount) {
        final View view = (View) views[this.viewIndex];
        try {
          if (!runPhase(view, this.phase, this.preemptive) && this.preemptive) {
            this.preemptive = false;
            if (this.stage != view.stage) {
              this.stage = view.stage;
              this.stage.execute(this);
              return;
            } else {
              continue;
            }
          }
        } catch (Throwable error) {
          if (Conts.isNonFatal(error)) {
            view.downlinkDidFail(error);
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
      if (this.viewCount == 1) {
        pass((View) views);
      } else if (this.viewCount > 1) {
        pass((DownlinkView[]) views);
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
