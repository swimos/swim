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

package swim.runtime.profile;

import swim.runtime.LaneAddress;
import swim.runtime.Metric;

public final class WarpLaneProfile extends Metric {
  final LaneAddress cellAddress;
  final long execDelta;
  final long execRate;
  final long execTime;
  final int downlinkOpenDelta;
  final int downlinkOpenCount;
  final int downlinkCloseDelta;
  final int downlinkCloseCount;
  final int downlinkEventDelta;
  final int downlinkEventRate;
  final long downlinkEventCount;
  final int downlinkCommandDelta;
  final int downlinkCommandRate;
  final long downlinkCommandCount;
  final int uplinkOpenDelta;
  final int uplinkOpenCount;
  final int uplinkCloseDelta;
  final int uplinkCloseCount;
  final int uplinkEventDelta;
  final int uplinkEventRate;
  final long uplinkEventCount;
  final int uplinkCommandDelta;
  final int uplinkCommandRate;
  final long uplinkCommandCount;

  public WarpLaneProfile(LaneAddress cellAddress,
                         long execDelta, long execRate, long execTime,
                         int downlinkOpenDelta, int downlinkOpenCount, int downlinkCloseDelta, int downlinkCloseCount,
                         int downlinkEventDelta, int downlinkEventRate, long downlinkEventCount,
                         int downlinkCommandDelta, int downlinkCommandRate, long downlinkCommandCount,
                         int uplinkOpenDelta, int uplinkOpenCount, int uplinkCloseDelta, int uplinkCloseCount,
                         int uplinkEventDelta, int uplinkEventRate, long uplinkEventCount,
                         int uplinkCommandDelta, int uplinkCommandRate, long uplinkCommandCount) {
    this.cellAddress = cellAddress;
    this.execDelta = execDelta;
    this.execRate = execRate;
    this.execTime = execTime;
    this.downlinkOpenDelta = downlinkOpenDelta;
    this.downlinkOpenCount = downlinkOpenCount;
    this.downlinkCloseDelta = downlinkCloseDelta;
    this.downlinkCloseCount = downlinkCloseCount;
    this.downlinkEventDelta = downlinkEventDelta;
    this.downlinkEventRate = downlinkEventRate;
    this.downlinkEventCount = downlinkEventCount;
    this.downlinkCommandDelta = downlinkCommandDelta;
    this.downlinkCommandRate = downlinkCommandRate;
    this.downlinkCommandCount = downlinkCommandCount;
    this.uplinkOpenDelta = uplinkOpenDelta;
    this.uplinkOpenCount = uplinkOpenCount;
    this.uplinkCloseDelta = uplinkCloseDelta;
    this.uplinkCloseCount = uplinkCloseCount;
    this.uplinkEventDelta = uplinkEventDelta;
    this.uplinkEventRate = uplinkEventRate;
    this.uplinkEventCount = uplinkEventCount;
    this.uplinkCommandDelta = uplinkCommandDelta;
    this.uplinkCommandRate = uplinkCommandRate;
    this.uplinkCommandCount = uplinkCommandCount;
  }

  @Override
  public LaneAddress cellAddress() {
    return this.cellAddress;
  }

  public long execDelta() {
    return this.execDelta;
  }

  public long execRate() {
    return this.execRate;
  }

  public long execTime() {
    return this.execTime;
  }

  public int downlinkOpenDelta() {
    return this.downlinkOpenDelta;
  }

  public int downlinkOpenCount() {
    return this.downlinkOpenCount;
  }

  public int downlinkCloseDelta() {
    return this.downlinkCloseDelta;
  }

  public int downlinkCloseCount() {
    return this.downlinkCloseCount;
  }

  public int downlinkEventDelta() {
    return this.downlinkEventDelta;
  }

  public int downlinkEventRate() {
    return this.downlinkEventRate;
  }

  public long downlinkEventCount() {
    return this.downlinkEventCount;
  }

  public int downlinkCommandDelta() {
    return this.downlinkCommandDelta;
  }

  public int downlinkCommandRate() {
    return this.downlinkCommandRate;
  }

  public long downlinkCommandCount() {
    return this.downlinkCommandCount;
  }

  public int uplinkOpenDelta() {
    return this.uplinkOpenDelta;
  }

  public int uplinkOpenCount() {
    return this.uplinkOpenCount;
  }

  public int uplinkCloseDelta() {
    return this.uplinkCloseDelta;
  }

  public int uplinkCloseCount() {
    return this.uplinkCloseCount;
  }

  public int uplinkEventDelta() {
    return this.uplinkEventDelta;
  }

  public int uplinkEventRate() {
    return this.uplinkEventRate;
  }

  public long uplinkEventCount() {
    return this.uplinkEventCount;
  }

  public int uplinkCommandDelta() {
    return this.uplinkCommandDelta;
  }

  public int uplinkCommandRate() {
    return this.uplinkCommandRate;
  }

  public long uplinkCommandCount() {
    return this.uplinkCommandCount;
  }
}
