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

import java.util.concurrent.ConcurrentLinkedQueue;

public class ConcurrentTrancheQueue<T> {
  final ConcurrentLinkedQueue<T>[] queues;
  final float scale;
  final int highest;

  @SuppressWarnings("unchecked")
  public ConcurrentTrancheQueue(int tranches) {
    if (tranches == 0) {
      throw new IllegalArgumentException();
    }
    this.queues = (ConcurrentLinkedQueue<T>[]) new ConcurrentLinkedQueue<?>[tranches];
    for (int i = 0; i < tranches; i += 1) {
      this.queues[i] = new ConcurrentLinkedQueue<T>();
    }
    this.scale = 0.5f * tranches;
    this.highest = tranches - 1;
  }

  public int size() {
    int size = 0;
    for (int tranche = this.highest; tranche >= 0; tranche -= 1) {
      size += this.queues[tranche].size();
    }
    return size;
  }

  public void add(T value, float prio) {
    final int tranche = Math.max(0, Math.min((int) ((1.0f + prio) * this.scale), this.highest));
    this.queues[tranche].add(value);
  }

  public T peek() {
    for (int tranche = this.highest; tranche >= 0; tranche -= 1) {
      final T value = this.queues[tranche].peek();
      if (value != null) {
        return value;
      }
    }
    return null;
  }

  public T poll() {
    for (int tranche = this.highest; tranche >= 0; tranche -= 1) {
      final T value = this.queues[tranche].poll();
      if (value != null) {
        return value;
      }
    }
    return null;
  }
}
