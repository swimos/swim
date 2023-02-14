// Copyright 2015-2022 Swim.inc
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

package swim.util;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

public class HashGenCacheSetTests {

  @Test
  @Tag("benchmark")
  public void benchmarkInsert() {
    final int count = 10000000;
    final int minCapacity = 1;
    final int maxCapacity = 1024;
    for (int capacity = minCapacity; capacity <= maxCapacity; capacity *= 2) {
      final HashGenCacheSet<Integer> cache = new HashGenCacheSet<Integer>(capacity);
      final long t0 = System.currentTimeMillis();
      for (int i = 0; i < count; i += 1) {
        cache.put(Murmur3.mash(i));
      }
      final long dt = System.currentTimeMillis() - t0;
      final long rate = (long) ((1000.0 * (double) count) / (double) dt);
      System.out.println("capacity " + capacity + ": inserted " + count + " items in " + dt + "ms (" + rate + "/s)");
    }
  }

}
