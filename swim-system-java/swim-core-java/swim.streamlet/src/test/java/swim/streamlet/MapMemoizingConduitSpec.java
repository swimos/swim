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

package swim.streamlet;

import java.util.ArrayList;
import java.util.Map;
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.collections.HashTrieMap;
import swim.streaming.MapReceptacle;
import swim.streaming.MapView;
import swim.streamlet.ConnectorUtilities.Update;
import swim.util.Deferred;

public class MapMemoizingConduitSpec extends ConnectorTest {

  @Test
  public void singleComputationOfAllValues() {
    final MapMemoizingConduit<Integer, String> conduit = new MapMemoizingConduit<>();

    final CountingDeferred val1 = new CountingDeferred("a");
    final CountingDeferred val2 = new CountingDeferred("b");

    final HashTrieMap<Integer, Deferred<String>> map =
        HashTrieMap.<Integer, Deferred<String>>empty().updated(1, val1);

    final ArrayList<Update<Integer, String>> results = new ArrayList<>();

    final MapReceptacle<Integer, String> receptacle = new MapReceptacle<Integer, String>() {

      @Override
      public void notifyChange(final Integer key, final Deferred<String> value, final Deferred<MapView<Integer, String>> map) {
        value.get();
        for (final Map.Entry<Integer, Deferred<String>> entry : map.get()) {
          entry.getValue().get();
        }
        results.add(new Update<>(key, value.get(), map.get()));
      }

      @Override
      public void notifyRemoval(final Integer key, final Deferred<MapView<Integer, String>> map) {
        Assert.fail();
      }
    };

    conduit.subscribe(receptacle);

    conduit.notifyChange(1, val1, Deferred.value(MapView.wrap(map)));
    conduit.notifyChange(2, val2, Deferred.value(MapView.wrap(map.updated(2, val2))));

    Assert.assertEquals(results.size(), 2);

    expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 1);
      Assert.assertEquals(v, "a");
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(1).get(), "a");
    });

    expectUpdate(results.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 2);
      Assert.assertEquals(v, "b");
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(1).get(), "a");
      Assert.assertEquals(m.get(2).get(), "b");
    });

    Assert.assertEquals(val1.getCount(), 1);
    Assert.assertEquals(val2.getCount(), 1);
  }

  private static final class CountingDeferred implements Deferred<String> {

    private int count = 0;
    private final String value;

    private CountingDeferred(final String value) {
      this.value = value;
    }

    public int getCount() {
      return count;
    }

    @Override
    public String get() {
      ++count;
      return value;
    }
  }

}
