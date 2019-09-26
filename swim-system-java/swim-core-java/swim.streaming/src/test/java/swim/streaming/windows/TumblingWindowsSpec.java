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

package swim.streaming.windows;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.collections.HashTrieSet;
import swim.streaming.windows.TemporalWindowAssigner.Assignment;

public class TumblingWindowsSpec {

  private final Instant origin = Instant.parse("2019-01-01T00:00:00Z");
  private final Instant dayBefore = origin.minus(1, ChronoUnit.DAYS);

  @Test
  public void alignWindowBoundariesAfterOrigin() {

    final Instant time = origin.plus(5, ChronoUnit.HOURS)
        .plus(13, ChronoUnit.MINUTES)
        .plus(27, ChronoUnit.SECONDS)
        .plus(344, ChronoUnit.MILLIS);

    final TimeInterval hourWindow = TumblingWindows.alignWindow(origin, Duration.ofHours(1), time.toEpochMilli());
    checkWindow(hourWindow, origin.plus(
        5, ChronoUnit.HOURS), origin.plus(6, ChronoUnit.HOURS));

    final TimeInterval quarterHourWindow = TumblingWindows.alignWindow(
        origin, Duration.ofMinutes(15), time.toEpochMilli());

    checkWindow(quarterHourWindow, Instant.parse("2019-01-01T05:00:00Z"), Instant.parse("2019-01-01T05:15:00Z"));

    final TimeInterval minuteWindow = TumblingWindows.alignWindow(origin, Duration.ofMinutes(1), time.toEpochMilli());

    checkWindow(minuteWindow, Instant.parse("2019-01-01T05:13:00Z"), Instant.parse("2019-01-01T05:14:00Z"));

    final TimeInterval sevenMinuteWindow = TumblingWindows.alignWindow(
        origin, Duration.ofMinutes(7), time.toEpochMilli());

    checkWindow(sevenMinuteWindow, Instant.parse("2019-01-01T05:08:00Z"), Instant.parse("2019-01-01T05:15:00Z"));
  }

  @Test
  public void alignWindowBoundariesBeforeOrigin() {

    final Instant time = dayBefore.plus(5, ChronoUnit.HOURS)
        .plus(13, ChronoUnit.MINUTES)
        .plus(27, ChronoUnit.SECONDS)
        .plus(344, ChronoUnit.MILLIS);

    final TimeInterval hourWindow = TumblingWindows.alignWindow(origin, Duration.ofHours(1), time.toEpochMilli());
    checkWindow(hourWindow, Instant.parse("2018-12-31T05:00:00Z"), Instant.parse("2018-12-31T06:00:00Z"));

    final TimeInterval quarterHourWindow = TumblingWindows.alignWindow(
        origin, Duration.ofMinutes(15), time.toEpochMilli());

    checkWindow(quarterHourWindow, Instant.parse("2018-12-31T05:00:00Z"), Instant.parse("2018-12-31T05:15:00Z"));

    final TimeInterval minuteWindow = TumblingWindows.alignWindow(origin, Duration.ofMinutes(1), time.toEpochMilli());

    checkWindow(minuteWindow, Instant.parse("2018-12-31T05:13:00Z"), Instant.parse("2018-12-31T05:14:00Z"));

    final TimeInterval sevenMinuteWindow = TumblingWindows.alignWindow(
        origin, Duration.ofMinutes(7), time.toEpochMilli());

    checkWindow(sevenMinuteWindow, Instant.parse("2018-12-31T05:13:00Z"), Instant.parse("2018-12-31T05:20:00Z"));
  }

  @Test
  public void alignWindowBoundariesOnEdgesAfterOrigin() {

    final TimeInterval hourWindow = TumblingWindows.alignWindow(origin, Duration.ofHours(1),
        origin.plus(7, ChronoUnit.HOURS).toEpochMilli());

    checkWindow(hourWindow, Instant.parse("2019-01-01T07:00:00Z"), Instant.parse("2019-01-01T08:00:00Z"));

    final TimeInterval quarterHourWindow = TumblingWindows.alignWindow(origin, Duration.ofMinutes(15),
        origin.plus(7, ChronoUnit.HOURS).plus(45, ChronoUnit.MINUTES).toEpochMilli());

    checkWindow(quarterHourWindow, Instant.parse("2019-01-01T07:45:00Z"), Instant.parse("2019-01-01T08:00:00Z"));
  }

  @Test
  public void alignWindowBoundariesOnEdgesBeforeOrigin() {

    final TimeInterval hourWindow = TumblingWindows.alignWindow(origin, Duration.ofHours(1),
        dayBefore.plus(7, ChronoUnit.HOURS).toEpochMilli());

    checkWindow(hourWindow, Instant.parse("2018-12-31T07:00:00Z"), Instant.parse("2018-12-31T08:00:00Z"));

    final TimeInterval quarterHourWindow = TumblingWindows.alignWindow(origin, Duration.ofMinutes(15),
        dayBefore.plus(7, ChronoUnit.HOURS).plus(45, ChronoUnit.MINUTES).toEpochMilli());

    checkWindow(quarterHourWindow, Instant.parse("2018-12-31T07:45:00Z"), Instant.parse("2018-12-31T08:00:00Z"));
  }

  @Test
  public void createsInitiallyEmptyState() {
    final TumblingWindows<String> assigner = new TumblingWindows<>(origin, Duration.ofHours(1));
    final SeqWindowStore<TimeInterval> store = assigner.stateInitializer().apply(HashTrieSet.empty());
    Assert.assertTrue(store.getWindows().isEmpty());
    Assert.assertTrue(store.openWindows().isEmpty());
  }

  @Test
  public void assignsCorrectWindows() {
    final TumblingWindows<String> assigner = new TumblingWindows<>(origin, Duration.ofHours(1));
    final Instant time = origin.plus(5, ChronoUnit.HOURS)
        .plus(13, ChronoUnit.MINUTES)
        .plus(27, ChronoUnit.SECONDS)
        .plus(344, ChronoUnit.MILLIS);

    final SeqWindowStore<TimeInterval> store = assigner.stateInitializer().apply(HashTrieSet.empty());

    final Assignment<TimeInterval, SeqWindowStore<TimeInterval>> assignment =
        assigner.windowsFor("value", time.toEpochMilli(), store);

    Assert.assertEquals(assignment.windows().size(), 1);
    for (final TimeInterval window : assignment.windows()) {
      checkWindow(window, origin.plus(
          5, ChronoUnit.HOURS), origin.plus(6, ChronoUnit.HOURS));
    }

    Assert.assertEquals(assignment.updatedState().getWindows().size(), 1);
    checkWindow(assignment.updatedState().getWindows().get(0), origin.plus(
        5, ChronoUnit.HOURS), origin.plus(6, ChronoUnit.HOURS));
  }

  @Test
  public void reusesWindowObjects() {
    final TumblingWindows<String> assigner = new TumblingWindows<>(origin, Duration.ofHours(1));
    final Instant time = origin.plus(5, ChronoUnit.HOURS)
        .plus(13, ChronoUnit.MINUTES)
        .plus(27, ChronoUnit.SECONDS)
        .plus(344, ChronoUnit.MILLIS);

    final SeqWindowStore<TimeInterval> store = assigner.stateInitializer().apply(HashTrieSet.empty());

    final Assignment<TimeInterval, SeqWindowStore<TimeInterval>> assignment1 =
        assigner.windowsFor("value", time.toEpochMilli(), store);

    final Assignment<TimeInterval, SeqWindowStore<TimeInterval>> assignment2 =
        assigner.windowsFor("value",
            time.plus(10, ChronoUnit.SECONDS).toEpochMilli(),
            assignment1.updatedState());

    Assert.assertSame(assignment2.updatedState(), assignment1.updatedState());

    Assert.assertEquals(assignment1.windows().size(), 1);
    Assert.assertEquals(assignment2.windows().size(), 1);
    Assert.assertSame(assignment2.windows().iterator().next(), assignment1.windows().iterator().next());
  }

  private static void checkWindow(final TimeInterval window, final Instant expectedStart, final Instant expectedEnd) {
    Assert.assertEquals(Instant.ofEpochMilli(window.getStart()), expectedStart);
    Assert.assertEquals(Instant.ofEpochMilli(window.getEnd()), expectedEnd);
  }

  @Test
  public void initializeEmptyState() {
    final TumblingWindows<String> assigner = new TumblingWindows<>(origin, Duration.ofHours(1));

    final SeqWindowStore<TimeInterval> state = assigner.stateInitializer().apply(HashTrieSet.empty());

    Assert.assertEquals(state.openWindows(), HashTrieSet.empty());
  }

  @Test
  public void initializeFromCorrectlyAlignedWindows() {
    final TumblingWindows<String> assigner = new TumblingWindows<>(origin, Duration.ofHours(1));

    final Instant t1 = origin.plus(4, ChronoUnit.HOURS);
    final Instant t2 = origin.plus(8, ChronoUnit.HOURS);

    final TimeInterval window1 = new TimeInterval(t1.toEpochMilli(),
        t1.plus(1, ChronoUnit.HOURS).toEpochMilli());
    final TimeInterval window2 = new TimeInterval(t2.toEpochMilli(),
        t2.plus(1, ChronoUnit.HOURS).toEpochMilli());

    final SeqWindowStore<TimeInterval> state = assigner.stateInitializer().apply(
        HashTrieSet.of(window1, window2));

    Assert.assertEquals(state.openWindows(), HashTrieSet.of(window1, window2));
  }

  @Test(expectedExceptions = IllegalStateException.class)
  public void failsToInitializeForUnalignedWindows() {
    final TumblingWindows<String> assigner = new TumblingWindows<>(origin, Duration.ofHours(1));

    final Instant t1 = origin.plus(4, ChronoUnit.HOURS).plus(3, ChronoUnit.MINUTES);
    final Instant t2 = origin.plus(8, ChronoUnit.HOURS);

    final TimeInterval window1 = new TimeInterval(t1.toEpochMilli(),
        t1.plus(1, ChronoUnit.HOURS).toEpochMilli());
    final TimeInterval window2 = new TimeInterval(t2.toEpochMilli(),
        t2.plus(1, ChronoUnit.HOURS).toEpochMilli());

    assigner.stateInitializer().apply(
        HashTrieSet.of(window1, window2));

  }

  @Test(expectedExceptions = IllegalStateException.class)
  public void failsToInitializeForTooShortWindows() {
    final TumblingWindows<String> assigner = new TumblingWindows<>(origin, Duration.ofHours(1));

    final Instant t1 = origin.plus(4, ChronoUnit.HOURS);
    final Instant t2 = origin.plus(8, ChronoUnit.HOURS);

    final TimeInterval window1 = new TimeInterval(t1.toEpochMilli(),
        t1.plus(30, ChronoUnit.MINUTES).toEpochMilli());
    final TimeInterval window2 = new TimeInterval(t2.toEpochMilli(),
        t2.plus(1, ChronoUnit.HOURS).toEpochMilli());

    assigner.stateInitializer().apply(
        HashTrieSet.of(window1, window2));

  }

  @Test(expectedExceptions = IllegalStateException.class)
  public void failsToInitializeForTooLongWindows() {
    final TumblingWindows<String> assigner = new TumblingWindows<>(origin, Duration.ofHours(1));

    final Instant t1 = origin.plus(4, ChronoUnit.HOURS);
    final Instant t2 = origin.plus(8, ChronoUnit.HOURS);

    final TimeInterval window1 = new TimeInterval(t1.toEpochMilli(),
        t1.plus(90, ChronoUnit.MINUTES).toEpochMilli());
    final TimeInterval window2 = new TimeInterval(t2.toEpochMilli(),
        t2.plus(1, ChronoUnit.HOURS).toEpochMilli());

    assigner.stateInitializer().apply(
        HashTrieSet.of(window1, window2));

  }

}
