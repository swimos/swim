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

package swim.dataflow.connector;

import java.util.ArrayList;
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.dataflow.connector.ConnectorTestUtil.ActionAccumulator;
import swim.dataflow.connector.ConnectorTestUtil.MapAction;
import swim.dataflow.graph.Pair;
import static swim.dataflow.graph.Either.left;
import static swim.dataflow.graph.Either.right;

public class JoinOnKeyJunctionSpec {

  @Test
  public void innerJoin() {

    final JoinOnKeyJunction<Integer, Long, String, Pair<Long, String>> junction =
        new JoinOnKeyJunction<>(Pair::pair);

    final ActionAccumulator<Integer, Long> leftAcc = new ActionAccumulator<>();
    final ActionAccumulator<Integer, String> rightAcc = new ActionAccumulator<>();

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs1 = ConnectorTestUtil.pushData(junction,
        left(leftAcc.update(3, 1034L)),
        right(rightAcc.update(5, "Hello")));

    Assert.assertTrue(outputs1.isEmpty());

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs2 = ConnectorTestUtil.pushData(junction,
        left(leftAcc.update(5, 2078L)),
        right(rightAcc.update(3, "World")));

    Assert.assertEquals(outputs2.size(), 2);

    ConnectorTestUtil.expectUpdate(outputs2.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(v, Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(5).get(), Pair.pair(2078L, "Hello"));
    });

    ConnectorTestUtil.expectUpdate(outputs2.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v, Pair.pair(1034L, "World"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "World"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs3 = ConnectorTestUtil.pushData(junction,
        left(leftAcc.remove(5)),
        right(rightAcc.remove(3)));

    Assert.assertEquals(outputs3.size(), 2);

    ConnectorTestUtil.expectRemoval(outputs3.get(0), (k, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "World"));
    });

    ConnectorTestUtil.expectRemoval(outputs3.get(1), (k, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(m.size(), 0);
    });
  }

  @Test
  public void leftJoin() {
    final JoinOnKeyJunction<Integer, Long, String, Pair<Long, String>> junction =
        new JoinOnKeyJunction<>(Pair::pair, v -> Pair.pair(v, "DEFAULT"), null);

    final ActionAccumulator<Integer, Long> leftAcc = new ActionAccumulator<>();
    final ActionAccumulator<Integer, String> rightAcc = new ActionAccumulator<>();

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs1 = ConnectorTestUtil.pushData(junction,
        left(leftAcc.update(3, 1034L)),
        right(rightAcc.update(5, "Hello")));

    Assert.assertEquals(outputs1.size(), 1);

    ConnectorTestUtil.expectUpdate(outputs1.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v, Pair.pair(1034L, "DEFAULT"));
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "DEFAULT"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs2 = ConnectorTestUtil.pushData(junction,
        left(leftAcc.update(5, 2078L)),
        right(rightAcc.update(3, "World")));

    Assert.assertEquals(outputs2.size(), 2);

    ConnectorTestUtil.expectUpdate(outputs2.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(v, Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "DEFAULT"));
      Assert.assertEquals(m.get(5).get(), Pair.pair(2078L, "Hello"));
    });

    ConnectorTestUtil.expectUpdate(outputs2.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v, Pair.pair(1034L, "World"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "World"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs3 = ConnectorTestUtil.pushData(junction,
        left(leftAcc.remove(5)),
        right(rightAcc.remove(3)));

    Assert.assertEquals(outputs3.size(), 2);

    ConnectorTestUtil.expectRemoval(outputs3.get(0), (k, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "World"));
    });

    ConnectorTestUtil.expectUpdate(outputs3.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v, Pair.pair(1034L, "DEFAULT"));
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "DEFAULT"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs4 = ConnectorTestUtil.pushData(
        junction, left(leftAcc.remove(3)));

    Assert.assertEquals(outputs4.size(), 1);

    ConnectorTestUtil.expectRemoval(outputs4.get(0), (k, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(m.size(), 0);
    });
  }

  @Test
  public void rightJoin() {
    final JoinOnKeyJunction<Integer, Long, String, Pair<Long, String>> junction =
        new JoinOnKeyJunction<>(Pair::pair, null, v -> Pair.pair(-1L, v));

    final ActionAccumulator<Integer, Long> leftAcc = new ActionAccumulator<>();
    final ActionAccumulator<Integer, String> rightAcc = new ActionAccumulator<>();

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs1 = ConnectorTestUtil.pushData(junction,
        left(leftAcc.update(3, 1034L)),
        right(rightAcc.update(5, "Hello")));

    Assert.assertEquals(outputs1.size(), 1);

    ConnectorTestUtil.expectUpdate(outputs1.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(v, Pair.pair(-1L, "Hello"));
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(5).get(), Pair.pair(-1L, "Hello"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs2 = ConnectorTestUtil.pushData(junction,
        left(leftAcc.update(5, 2078L)),
        right(rightAcc.update(3, "World")));

    Assert.assertEquals(outputs2.size(), 2);

    ConnectorTestUtil.expectUpdate(outputs2.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(v, Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(5).get(), Pair.pair(2078L, "Hello"));
    });

    ConnectorTestUtil.expectUpdate(outputs2.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v, Pair.pair(1034L, "World"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "World"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs3 = ConnectorTestUtil.pushData(junction,
        left(leftAcc.remove(5)),
        right(rightAcc.remove(3)));

    Assert.assertEquals(outputs3.size(), 2);

    ConnectorTestUtil.expectUpdate(outputs3.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(v, Pair.pair(-1L, "Hello"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(-1L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "World"));
    });

    ConnectorTestUtil.expectRemoval(outputs3.get(1), (k, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(5).get(), Pair.pair(-1L, "Hello"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs4 = ConnectorTestUtil.pushData(
        junction, right(rightAcc.remove(5)));

    Assert.assertEquals(outputs4.size(), 1);

    ConnectorTestUtil.expectRemoval(outputs4.get(0), (k, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(m.size(), 0);
    });
  }

  @Test
  public void fullJoin() {
    final JoinOnKeyJunction<Integer, Long, String, Pair<Long, String>> junction =
        new JoinOnKeyJunction<>(Pair::pair, v -> Pair.pair(v, "DEFAULT"), v -> Pair.pair(-1L, v));

    final ActionAccumulator<Integer, Long> leftAcc = new ActionAccumulator<>();
    final ActionAccumulator<Integer, String> rightAcc = new ActionAccumulator<>();

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs1 = ConnectorTestUtil.pushData(junction,
        left(leftAcc.update(3, 1034L)),
        right(rightAcc.update(5, "Hello")));

    Assert.assertEquals(outputs1.size(), 2);

    ConnectorTestUtil.expectUpdate(outputs1.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v, Pair.pair(1034L, "DEFAULT"));
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "DEFAULT"));
    });
    ConnectorTestUtil.expectUpdate(outputs1.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(v, Pair.pair(-1L, "Hello"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(-1L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "DEFAULT"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs2 = ConnectorTestUtil.pushData(junction,
        left(leftAcc.update(5, 2078L)),
        right(rightAcc.update(3, "World")));

    Assert.assertEquals(outputs2.size(), 2);

    ConnectorTestUtil.expectUpdate(outputs2.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(v, Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "DEFAULT"));
    });

    ConnectorTestUtil.expectUpdate(outputs2.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v, Pair.pair(1034L, "World"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "World"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs3 = ConnectorTestUtil.pushData(junction,
        left(leftAcc.remove(5)),
        right(rightAcc.remove(3)));

    Assert.assertEquals(outputs3.size(), 2);

    ConnectorTestUtil.expectUpdate(outputs3.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(v, Pair.pair(-1L, "Hello"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(-1L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "World"));
    });

    ConnectorTestUtil.expectUpdate(outputs3.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v, Pair.pair(1034L, "DEFAULT"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(-1L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "DEFAULT"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs4 = ConnectorTestUtil.pushData(
        junction, right(rightAcc.remove(5)), left(leftAcc.remove(3)));

    Assert.assertEquals(outputs4.size(), 2);

    ConnectorTestUtil.expectRemoval(outputs4.get(0), (k, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "DEFAULT"));
    });

    ConnectorTestUtil.expectRemoval(outputs4.get(1), (k, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(m.size(), 0);
    });
  }

}
