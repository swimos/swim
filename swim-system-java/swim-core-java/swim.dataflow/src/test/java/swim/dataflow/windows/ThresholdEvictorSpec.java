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

package swim.dataflow.windows;

import java.util.Random;
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.collections.BTreeMap;
import swim.streaming.windows.SlidingInterval;
import swim.streaming.windows.eviction.EvictionThresholdFunction;

public class ThresholdEvictorSpec {

  public static final class Record {
    final int data;

    private Record(final int data) {
      this.data = data;
    }

    @Override
    public boolean equals(final Object obj) {
      if (this == obj) {
        return true;
      } else if (!(obj instanceof Record)) {
        return false;
      } else {
        final Record other = (Record) obj;
        return data == other.data;
      }
    }

    @Override
    public int hashCode() {
      return Integer.hashCode(data);
    }

    @Override
    public String toString() {
      return String.format("Record[%d]", data);
    }
  }

  @Test
  public void retainsUnexpiredRecords() {

    final Random rand = new Random();

    final EvictionThresholdFunction<Record, SlidingInterval, Long> threshold =
        (rec, window, ts) -> ts - window.length();

    final ThresholdEvictor<Record, Long, SlidingInterval, Integer> evictor = new ThresholdEvictor<>(threshold);

    final SlidingInterval window = new SlidingInterval(10000L);

    final Record rec1 = new Record(rand.nextInt());
    final Record rec2 = new Record(rand.nextInt());
    final Record rec3 = new Record(rand.nextInt());

    final BTreeMap<Long, Record, Integer> data = BTreeMap.<Long, Record, Integer>empty()
        .updated(1000L, rec1).updated(2000L, rec2).updated(3000L, rec3);

    final BTreeMap<Long, Record, Integer> evicted = evictor.evict(data, window, rec3, 3000L);

    Assert.assertEquals(evicted, data);
  }

  @Test
  public void evictsExpiredRecords() {
    final Random rand = new Random();

    final EvictionThresholdFunction<Record, SlidingInterval, Long> threshold =
        (rec, window, ts) -> ts - window.length();

    final ThresholdEvictor<Record, Long, SlidingInterval, Integer> evictor = new ThresholdEvictor<>(threshold);

    final SlidingInterval window = new SlidingInterval(10000L);

    final Record rec1 = new Record(rand.nextInt());
    final Record rec2 = new Record(rand.nextInt());
    final Record rec3 = new Record(rand.nextInt());
    final Record rec4 = new Record(rand.nextInt());

    final BTreeMap<Long, Record, Integer> data = BTreeMap.<Long, Record, Integer>empty()
        .updated(1000L, rec1).updated(2000L, rec2).updated(10000L, rec3).updated(15000L, rec3);

    final BTreeMap<Long, Record, Integer> evicted = evictor.evict(data, window, rec4, 15000L);

    final BTreeMap<Long, Record, Integer> expected = BTreeMap.<Long, Record, Integer>empty()
        .updated(10000L, rec3).updated(15000L, rec3);

    Assert.assertEquals(evicted, expected);
  }

}
