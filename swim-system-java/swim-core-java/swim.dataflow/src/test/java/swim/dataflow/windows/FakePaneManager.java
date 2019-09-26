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

import java.util.function.Consumer;
import org.testng.Assert;
import swim.util.Pair;

/**
 * Implementation of {@link PaneManager} that executes an {@link Expectation} when updated.
 */
final class FakePaneManager implements PaneManager<Pair<Long, Integer>, Integer, Integer> {

  private Listener<Integer, Integer> listener = null;
  private Expectation expected = null;
  private boolean isClosed = false;
  private final Consumer<FakePaneManager> onClose;

  FakePaneManager(final Consumer<FakePaneManager> onClose) {
    this.onClose = onClose;
  }

  /**
   * Register a new expectation for the next time this receives data.
   * @param exp The expectation.
   */
  public void expect(final Expectation exp) {
    expected = exp;
  }

  @Override
  public void setListener(final Listener<Integer, Integer> listener) {
    Assert.assertFalse(isClosed);
    this.listener = listener;
  }

  @Override
  public void update(final Pair<Long, Integer> data, final long timestamp, final TimeContext context) {
    Assert.assertFalse(isClosed);
    if (expected != null) {
      Assert.assertEquals(data, expected.getData());
      Assert.assertEquals(timestamp, expected.getTimestamp());
      if (expected.getWillRequest() != null) {
        final Pair<Long, WindowCallback> wr = expected.getWillRequest();
        context.scheduleAt(wr.getFirst(), wr.getSecond());
      }
      if (expected.getWillOutput() != null) {
        final Pair<Integer, Integer> wo = expected.getWillOutput();
        Assert.assertNotNull(listener);
        listener.accept(wo.getFirst(), wo.getSecond());
      }
      expected = null;
    } else {
      Assert.fail();
    }
  }

  @Override
  public void close() {
    Assert.assertFalse(isClosed);
    isClosed = true;
    onClose.accept(this);
  }

}
