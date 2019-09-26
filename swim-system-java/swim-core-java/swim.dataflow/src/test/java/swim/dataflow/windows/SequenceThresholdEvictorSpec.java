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
import swim.collections.FingerTrieSeq;
import swim.streaming.timestamps.WithTimestamp;
import swim.streaming.windows.SlidingInterval;
import swim.streaming.windows.eviction.EvictionCriterionFunction;
import swim.streaming.windows.eviction.EvictionThresholdFunction;

public class SequenceThresholdEvictorSpec {

  public static final class Record {
    final int data;

    public Record(final int data) {
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
    retainsUnexpiredRecords(true, rand);
    retainsUnexpiredRecords(false, rand);
  }

  public void retainsUnexpiredRecords(final boolean assumeOrdered, final Random rand) {
    final EvictionCriterionFunction<Record, Long> criterion = (rec, ts) -> ts;
    final EvictionThresholdFunction<Record, SlidingInterval, Long> threshold = (rec, window, ts) -> ts - window.length();
    final SequenceThresholdEvictor<Record, Long, SlidingInterval> evictor = new SequenceThresholdEvictor<>(
        criterion,
        threshold,
        assumeOrdered);

    final Record rec1 = new Record(rand.nextInt());
    final Record rec2 = new Record(rand.nextInt());
    final Record rec3 = new Record(rand.nextInt());

    final FingerTrieSeq<WithTimestamp<Record>> data = FingerTrieSeq.<WithTimestamp<Record>>empty()
        .appended(new WithTimestamp<>(rec1, 1000L))
        .appended(new WithTimestamp<>(rec2, 2000L))
        .appended(new WithTimestamp<>(rec3, 3000L));

    final SlidingInterval window = new SlidingInterval(10000L);

    final FingerTrieSeq<WithTimestamp<Record>> evicted = evictor.evict(
        data, window, rec3, 3000L);

    Assert.assertEquals(evicted, data);
  }

  @Test
  public void evictsExpiredRecords() {
    final Random rand = new Random();
    evictsExpiredRecords(true, rand);
    evictsExpiredRecords(false, rand);
  }

  public void evictsExpiredRecords(final boolean assumeOrdered, final Random rand) {
    final EvictionCriterionFunction<Record, Long> criterion = (rec, ts) -> ts;
    final EvictionThresholdFunction<Record, SlidingInterval, Long> threshold = (rec, window, ts) -> ts - window.length();
    final SequenceThresholdEvictor<Record, Long, SlidingInterval> evictor = new SequenceThresholdEvictor<>(
        criterion,
        threshold,
        assumeOrdered);

    final Record rec1 = new Record(rand.nextInt());
    final Record rec2 = new Record(rand.nextInt());
    final Record rec3 = new Record(rand.nextInt());
    final Record rec4 = new Record(rand.nextInt());

    final FingerTrieSeq<WithTimestamp<Record>> data = FingerTrieSeq.<WithTimestamp<Record>>empty()
        .appended(new WithTimestamp<>(rec1, 1000L))
        .appended(new WithTimestamp<>(rec2, 2000L))
        .appended(new WithTimestamp<>(rec3, 10000L))
        .appended(new WithTimestamp<>(rec4, 15000L));

    final SlidingInterval window = new SlidingInterval(10000L);

    final FingerTrieSeq<WithTimestamp<Record>> evicted = evictor.evict(
        data, window, rec4, 15000L);

    final FingerTrieSeq<WithTimestamp<Record>> expected = FingerTrieSeq.<WithTimestamp<Record>>empty()
        .appended(new WithTimestamp<>(rec3, 10000L))
        .appended(new WithTimestamp<>(rec4, 15000L));

    Assert.assertEquals(evicted, expected);

  }

  @Test
  public void preservesOrder() {
    final Random rand = new Random();
    final EvictionCriterionFunction<Record, Long> criterion = (rec, ts) -> ts;
    final EvictionThresholdFunction<Record, SlidingInterval, Long> threshold = (rec, window, ts) -> ts - window.length();
    final SequenceThresholdEvictor<Record, Long, SlidingInterval> evictor = new SequenceThresholdEvictor<>(
        criterion,
        threshold,
        false);

    final Record rec1 = new Record(rand.nextInt());
    final Record rec2 = new Record(rand.nextInt());
    final Record rec3 = new Record(rand.nextInt());
    final Record rec4 = new Record(rand.nextInt());
    final Record rec5 = new Record(rand.nextInt());

    final FingerTrieSeq<WithTimestamp<Record>> data = FingerTrieSeq.<WithTimestamp<Record>>empty()
        .appended(new WithTimestamp<>(rec1, 10000L))
        .appended(new WithTimestamp<>(rec2, 2000L))
        .appended(new WithTimestamp<>(rec3, 7000L))
        .appended(new WithTimestamp<>(rec4, 1000L))
        .appended(new WithTimestamp<>(rec5, 15000L));

    final SlidingInterval window = new SlidingInterval(10000L);

    final FingerTrieSeq<WithTimestamp<Record>> evicted = evictor.evict(
        data, window, rec5, 15000L);

    final FingerTrieSeq<WithTimestamp<Record>> expected = FingerTrieSeq.<WithTimestamp<Record>>empty()
        .appended(new WithTimestamp<>(rec1, 10000L))
        .appended(new WithTimestamp<>(rec3, 7000L))
        .appended(new WithTimestamp<>(rec5, 15000L));

    Assert.assertEquals(evicted, expected);
  }

}
