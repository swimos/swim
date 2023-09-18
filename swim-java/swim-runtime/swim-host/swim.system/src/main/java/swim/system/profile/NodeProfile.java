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

package swim.system.profile;

import swim.system.Metric;
import swim.system.NodeAddress;

public final class NodeProfile extends Metric {

  final NodeAddress cellAddress;
  final int agentOpenDelta;
  final int agentOpenCount;
  final int agentCloseDelta;
  final int agentCloseCount;
  final long agentExecDelta;
  final long agentExecRate;
  final long agentExecTime;
  final int timerEventDelta;
  final int timerEventRate;
  final long timerEventCount;
  final int downlinkOpenDelta;
  final long downlinkOpenCount;
  final int downlinkCloseDelta;
  final long downlinkCloseCount;
  final int downlinkEventDelta;
  final int downlinkEventRate;
  final long downlinkEventCount;
  final int downlinkCommandDelta;
  final int downlinkCommandRate;
  final long downlinkCommandCount;
  final int uplinkOpenDelta;
  final long uplinkOpenCount;
  final int uplinkCloseDelta;
  final long uplinkCloseCount;
  final int uplinkEventDelta;
  final int uplinkEventRate;
  final long uplinkEventCount;
  final int uplinkCommandDelta;
  final int uplinkCommandRate;
  final long uplinkCommandCount;

  public NodeProfile(NodeAddress cellAddress,
                     int agentOpenDelta, int agentOpenCount, int agentCloseDelta, int agentCloseCount,
                     long agentExecDelta, long agentExecRate, long agentExecTime,
                     int timerEventDelta, int timerEventRate, long timerEventCount,
                     int downlinkOpenDelta, long downlinkOpenCount, int downlinkCloseDelta, long downlinkCloseCount,
                     int downlinkEventDelta, int downlinkEventRate, long downlinkEventCount,
                     int downlinkCommandDelta, int downlinkCommandRate, long downlinkCommandCount,
                     int uplinkOpenDelta, long uplinkOpenCount, int uplinkCloseDelta, long uplinkCloseCount,
                     int uplinkEventDelta, int uplinkEventRate, long uplinkEventCount,
                     int uplinkCommandDelta, int uplinkCommandRate, long uplinkCommandCount) {
    this.cellAddress = cellAddress;
    this.agentOpenDelta = agentOpenDelta;
    this.agentOpenCount = agentOpenCount;
    this.agentCloseDelta = agentCloseDelta;
    this.agentCloseCount = agentCloseCount;
    this.agentExecDelta = agentExecDelta;
    this.agentExecRate = agentExecRate;
    this.agentExecTime = agentExecTime;
    this.timerEventDelta = timerEventDelta;
    this.timerEventRate = timerEventRate;
    this.timerEventCount = timerEventCount;
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
  public NodeAddress cellAddress() {
    return this.cellAddress;
  }

  public int agentOpenDelta() {
    return this.agentOpenDelta;
  }

  public int agentOpenCount() {
    return this.agentOpenCount;
  }

  public int agentCloseDelta() {
    return this.agentCloseDelta;
  }

  public int agentCloseCount() {
    return this.agentCloseCount;
  }

  public long agentExecDelta() {
    return this.agentExecDelta;
  }

  public long agentExecRate() {
    return this.agentExecRate;
  }

  public long agentExecTime() {
    return this.agentExecTime;
  }

  public int timerEventDelta() {
    return this.timerEventDelta;
  }

  public int timerEventRate() {
    return this.timerEventRate;
  }

  public long timerEventCount() {
    return this.timerEventCount;
  }

  public int downlinkOpenDelta() {
    return this.downlinkOpenDelta;
  }

  public long downlinkOpenCount() {
    return this.downlinkOpenCount;
  }

  public int downlinkCloseDelta() {
    return this.downlinkCloseDelta;
  }

  public long downlinkCloseCount() {
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

  public long uplinkOpenCount() {
    return this.uplinkOpenCount;
  }

  public int uplinkCloseDelta() {
    return this.uplinkCloseDelta;
  }

  public long uplinkCloseCount() {
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
