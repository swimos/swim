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

package swim.runtime.warp;

import java.util.concurrent.ConcurrentLinkedQueue;
import swim.runtime.UplinkAddress;
import swim.runtime.WarpBinding;
import swim.structure.Value;

public abstract class SupplyUplinkModem extends WarpUplinkModem {
  final ConcurrentLinkedQueue<Value> downQueue;

  public SupplyUplinkModem(WarpBinding linkBinding, UplinkAddress uplinkAddress) {
    super(linkBinding, uplinkAddress);
    this.downQueue = new ConcurrentLinkedQueue<Value>();
  }

  @Override
  protected boolean downQueueIsEmpty() {
    return this.downQueue.isEmpty();
  }

  @Override
  public void queueDown(Value body) {
    this.downQueue.add(body);
  }

  @Override
  protected Value nextDownQueue() {
    return this.downQueue.poll();
  }
}
