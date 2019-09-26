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
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.streamlet.ConnectorUtilities.ActionAccumulator;
import swim.streamlet.ConnectorUtilities.MapAction;
import swim.util.Either;
import swim.util.Pair;

public class JoinOnKeyJunctionSpec extends ConnectorTest {

  @Test
  public void innerJoin() {

    final JoinOnKeyJunction<Integer, Long, String, Pair<Long, String>> junction =
        new JoinOnKeyJunction<>(Pair::pair);

    final ActionAccumulator<Integer, Long> leftAcc = new ActionAccumulator<>();
    final ActionAccumulator<Integer, String> rightAcc = new ActionAccumulator<>();

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs1 = ConnectorUtilities.pushData(junction,
        Either.left(leftAcc.update(3, 1034L)),
        Either.right(rightAcc.update(5, "Hello")));

    Assert.assertTrue(outputs1.isEmpty());

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs2 = ConnectorUtilities.pushData(junction,
        Either.left(leftAcc.update(5, 2078L)),
        Either.right(rightAcc.update(3, "World")));

    Assert.assertEquals(outputs2.size(), 2);

    expectUpdate(outputs2.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(v, Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(5).get(), Pair.pair(2078L, "Hello"));
    });

    expectUpdate(outputs2.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v, Pair.pair(1034L, "World"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "World"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs3 = ConnectorUtilities.pushData(junction,
        Either.left(leftAcc.remove(5)),
        Either.right(rightAcc.remove(3)));

    Assert.assertEquals(outputs3.size(), 2);

    expectRemoval(outputs3.get(0), (k, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "World"));
    });

    expectRemoval(outputs3.get(1), (k, m) -> {
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

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs1 = ConnectorUtilities.pushData(junction,
        Either.left(leftAcc.update(3, 1034L)),
        Either.right(rightAcc.update(5, "Hello")));

    Assert.assertEquals(outputs1.size(), 1);

    expectUpdate(outputs1.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v, Pair.pair(1034L, "DEFAULT"));
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "DEFAULT"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs2 = ConnectorUtilities.pushData(junction,
        Either.left(leftAcc.update(5, 2078L)),
        Either.right(rightAcc.update(3, "World")));

    Assert.assertEquals(outputs2.size(), 2);

    expectUpdate(outputs2.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(v, Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "DEFAULT"));
      Assert.assertEquals(m.get(5).get(), Pair.pair(2078L, "Hello"));
    });

    expectUpdate(outputs2.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v, Pair.pair(1034L, "World"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "World"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs3 = ConnectorUtilities.pushData(junction,
        Either.left(leftAcc.remove(5)),
        Either.right(rightAcc.remove(3)));

    Assert.assertEquals(outputs3.size(), 2);

    expectRemoval(outputs3.get(0), (k, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "World"));
    });

    expectUpdate(outputs3.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v, Pair.pair(1034L, "DEFAULT"));
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "DEFAULT"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs4 = ConnectorUtilities.pushData(
        junction, Either.left(leftAcc.remove(3)));

    Assert.assertEquals(outputs4.size(), 1);

    expectRemoval(outputs4.get(0), (k, m) -> {
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

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs1 = ConnectorUtilities.pushData(junction,
        Either.left(leftAcc.update(3, 1034L)),
        Either.right(rightAcc.update(5, "Hello")));

    Assert.assertEquals(outputs1.size(), 1);

    expectUpdate(outputs1.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(v, Pair.pair(-1L, "Hello"));
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(5).get(), Pair.pair(-1L, "Hello"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs2 = ConnectorUtilities.pushData(junction,
        Either.left(leftAcc.update(5, 2078L)),
        Either.right(rightAcc.update(3, "World")));

    Assert.assertEquals(outputs2.size(), 2);

    expectUpdate(outputs2.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(v, Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(5).get(), Pair.pair(2078L, "Hello"));
    });

    expectUpdate(outputs2.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v, Pair.pair(1034L, "World"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "World"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs3 = ConnectorUtilities.pushData(junction,
        Either.left(leftAcc.remove(5)),
        Either.right(rightAcc.remove(3)));

    Assert.assertEquals(outputs3.size(), 2);

    expectUpdate(outputs3.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(v, Pair.pair(-1L, "Hello"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(-1L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "World"));
    });

    expectRemoval(outputs3.get(1), (k, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(5).get(), Pair.pair(-1L, "Hello"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs4 = ConnectorUtilities.pushData(
        junction, Either.right(rightAcc.remove(5)));

    Assert.assertEquals(outputs4.size(), 1);

    expectRemoval(outputs4.get(0), (k, m) -> {
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

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs1 = ConnectorUtilities.pushData(junction,
        Either.left(leftAcc.update(3, 1034L)),
        Either.right(rightAcc.update(5, "Hello")));

    Assert.assertEquals(outputs1.size(), 2);

    expectUpdate(outputs1.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v, Pair.pair(1034L, "DEFAULT"));
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "DEFAULT"));
    });
    expectUpdate(outputs1.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(v, Pair.pair(-1L, "Hello"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(-1L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "DEFAULT"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs2 = ConnectorUtilities.pushData(junction,
        Either.left(leftAcc.update(5, 2078L)),
        Either.right(rightAcc.update(3, "World")));

    Assert.assertEquals(outputs2.size(), 2);

    expectUpdate(outputs2.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(v, Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "DEFAULT"));
    });

    expectUpdate(outputs2.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v, Pair.pair(1034L, "World"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(2078L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "World"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs3 = ConnectorUtilities.pushData(junction,
        Either.left(leftAcc.remove(5)),
        Either.right(rightAcc.remove(3)));

    Assert.assertEquals(outputs3.size(), 2);

    expectUpdate(outputs3.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(v, Pair.pair(-1L, "Hello"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(-1L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "World"));
    });

    expectUpdate(outputs3.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v, Pair.pair(1034L, "DEFAULT"));
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(5).get(), Pair.pair(-1L, "Hello"));
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "DEFAULT"));
    });

    final ArrayList<MapAction<Integer, Pair<Long, String>>> outputs4 = ConnectorUtilities.pushData(
        junction, Either.right(rightAcc.remove(5)), Either.left(leftAcc.remove(3)));

    Assert.assertEquals(outputs4.size(), 2);

    expectRemoval(outputs4.get(0), (k, m) -> {
      Assert.assertEquals(k.intValue(), 5);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(3).get(), Pair.pair(1034L, "DEFAULT"));
    });

    expectRemoval(outputs4.get(1), (k, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(m.size(), 0);
    });
  }

}
