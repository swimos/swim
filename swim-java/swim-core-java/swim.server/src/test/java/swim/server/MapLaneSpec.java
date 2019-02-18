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

package swim.server;

import java.io.File;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import swim.api.SwimLane;
import swim.api.SwimRoute;
import swim.api.agent.AbstractAgent;
import swim.api.agent.AgentType;
import swim.api.downlink.MapDownlink;
import swim.api.downlink.function.DidReceive;
import swim.api.lane.JoinMapLane;
import swim.api.lane.MapLane;
import swim.api.lane.function.DidDownlinkMap;
import swim.api.lane.function.WillCommand;
import swim.api.lane.function.WillDownlinkMap;
import swim.api.plane.AbstractPlane;
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.linker.StoreDef;
import swim.observable.function.DidClear;
import swim.observable.function.DidDrop;
import swim.observable.function.DidRemoveKey;
import swim.observable.function.DidTake;
import swim.observable.function.DidUpdateKey;
import swim.observable.function.WillClear;
import swim.observable.function.WillDrop;
import swim.observable.function.WillRemoveKey;
import swim.observable.function.WillTake;
import swim.observable.function.WillUpdateKey;
import swim.recon.Recon;
import swim.structure.Form;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class MapLaneSpec {

  private static HashTrieMap<String, String> testMapCopy = HashTrieMap.empty();
  private static HashTrieMap<String, Value> testMap1Copy = HashTrieMap.empty();
  private static HashTrieMap<Value, String> testMap2Copy = HashTrieMap.empty();
  private static HashTrieMap<Value, Value> testMap3Copy = HashTrieMap.empty();

  @SwimRoute("/map/:name")
  static class TestMapLaneAgent extends AbstractAgent {

    @SwimLane("map")
    MapLane<String, String> testMap = this.<String, String>mapLane()
        .observe(new TestMapLaneController());

    @SwimLane("map1")
    MapLane<String, Value> testMap1;

    @SwimLane("map2")
    MapLane<Value, String> testMap2;

    @SwimLane("map3")
    MapLane<Value, Value> testMap3;

    class TestMapLaneController implements WillUpdateKey<String, String>, DidUpdateKey<String, String>,
        WillRemoveKey<String>, DidRemoveKey<String, String>, WillClear, DidClear,
        WillDrop, DidDrop, WillTake, DidTake {
      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println(testMap.nodeUri().toString() + " willUpdate key: " + key + "; newValue: " + newValue);
        return newValue;
      }

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println(testMap.nodeUri().toString() + " didUpdate key: " + key + "; newValue: " + newValue + "; oldValue: " + oldValue);
        testMap1.put(key, Value.fromObject(newValue));
        testMap2.put(Value.fromObject(key), newValue);
        testMap3.put(Value.fromObject(key), Value.fromObject(newValue));
        testMapCopy = testMapCopy.updated(key, newValue);
        testMap1Copy = testMap1Copy.updated(key, Value.fromObject(newValue));
        testMap2Copy = testMap2Copy.updated(Value.fromObject(key), newValue);
        testMap3Copy = testMap3Copy.updated(Value.fromObject(key), Value.fromObject(newValue));
      }

      @Override
      public void willRemove(String key) {
        System.out.println(testMap.nodeUri().toString() + " willRemove key: " + key);
      }

      @Override
      public void didRemove(String key, String oldValue) {
        System.out.println(testMap.nodeUri().toString() + " didRemove key: " + key + "; oldValue: " + oldValue);
        testMap1.remove(key);
        testMap2.remove(Value.fromObject(key));
        testMap3.remove(Value.fromObject(key));
        testMapCopy.remove(key);
        testMap1Copy.remove(key);
        testMap2Copy.remove(key);
        testMap3Copy.remove(key);
      }

      @Override
      public void willClear() {
        System.out.println(testMap.nodeUri().toString() + " willClear");
      }

      @Override
      public void didClear() {
        System.out.println(testMap.nodeUri().toString() + " didClear");
        testMap1.clear();
        testMap2.clear();
        testMap3.clear();
        testMapCopy.clear();
        testMap1Copy.clear();
        testMap2Copy.clear();
        testMap3Copy.clear();
      }

      @Override
      public void willDrop(int lower) {
        System.out.println(testMap.nodeUri().toString() + " willDrop " + lower);
      }

      @Override
      public void didDrop(int lower) {
        System.out.println(testMap.nodeUri().toString() + " didDrop " + lower);
        testMap1.drop(lower);
        testMap2.drop(lower);
        testMap3.drop(lower);
      }

      @Override
      public void willTake(int lower) {
        System.out.println(testMap.nodeUri().toString() + " willTake " + lower);
      }

      @Override
      public void didTake(int lower) {
        System.out.println(testMap.nodeUri().toString() + " didTake " + lower);
        testMap1.take(lower);
        testMap2.take(lower);
        testMap3.take(lower);
      }
    }

  }

  @SwimRoute("/join/map/:name")
  static class TestJoinMapLaneAgent extends AbstractAgent {

    @SwimLane("downlinkMap")
    MapLane<String, String> testDownlinkMap;

    @SwimLane("join")
    JoinMapLane<String, String, String> testJoinMap = this.<String, String, String>joinMapLane()
        .observe(new TestJoinMapLaneController());

    @SwimLane("join1")
    JoinMapLane<String, String, Value> testJoinMap1;

    @SwimLane("join2")
    JoinMapLane<String, Value, String> testJoinMap2;

    @SwimLane("join3")
    JoinMapLane<String, Value, Value> testJoinMap3;

    class TestJoinMapLaneController implements WillDownlinkMap<String>, DidDownlinkMap<String>,
        WillUpdateKey<String, String>, DidUpdateKey<String, String> {
      @Override
      public MapDownlink<?, ?> willDownlink(String key, MapDownlink<?, ?> downlink) {
        return downlink;
      }

      @Override
      public void didDownlink(String key, MapDownlink<?, ?> downlink) {
      }

      @Override
      public String willUpdate(String key, String newValue) {
        return newValue;
      }

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
      }
    }

    @Override
    public void didStart() {
      System.out.println("Did start " + nodeUri().toString());
      downlinkMap()
          .nodeUri("/map/words")
          .laneUri("map")
          .keyClass(String.class)
          .valueClass(String.class)
          .didLink(() -> System.out.println("Linked to node map/words map lane"))
          .didUpdate((k, n, o) -> {
            testDownlinkMap.put(k, n);
          })
          .open();

      testJoinMap.downlink("xs").nodeUri("/map/xs").laneUri("map").open();
      testJoinMap.downlink("ys").nodeUri("/map/ys").laneUri("map").open();

      testJoinMap1.downlink("xs").nodeUri("/map/xs").laneUri("map1").open();
      testJoinMap1.downlink("ys").nodeUri("/map/ys").laneUri("map1").open();

      testJoinMap2.downlink("xs").nodeUri("/map/xs").laneUri("map2").open();
      testJoinMap2.downlink("ys").nodeUri("/map/ys").laneUri("map2").open();

      testJoinMap3.downlink("xs").nodeUri("/map/xs").laneUri("map3").open();
      testJoinMap3.downlink("ys").nodeUri("/map/ys").laneUri("map3").open();

    }
  }

  static class TestMapPlane extends AbstractPlane {
    final AgentType<?> mapAgent = agentClass(TestMapLaneAgent.class);
    final AgentType<?> joinMapAgent = agentClass(TestJoinMapLaneAgent.class);
  }

  private static final String PLANE_NAME = "map";
  private ServerRuntime server;
  private ServerPlane plane;
  private MapDownlink<String, String> mapLink;
  private MapDownlink<String, Value> mapLink1;
  private MapDownlink<Value, String> mapLink2;
  private MapDownlink<Value, Value> mapLink3;

  @BeforeMethod
  private void startServer() {
    server = new ServerRuntime();
    plane = server.materializePlane(PLANE_NAME, TestMapPlane.class, storeDef(PLANE_NAME));
    plane.bind("localhost", 53556);
    server.start();
    testMapCopy = HashTrieMap.empty();
    testMap1Copy = HashTrieMap.empty();
    testMap2Copy = HashTrieMap.empty();
    testMap3Copy = HashTrieMap.empty();
    mapLink = plane.downlinkMap()
        .keyClass(String.class)
        .valueClass(String.class)
        .hostUri("swim://localhost:53556/")
        .nodeUri("/map/words")
        .laneUri("map")
        .open();
    mapLink1 = plane.downlinkMap()
        .keyClass(String.class)
        .hostUri("swim://localhost:53556/")
        .nodeUri("/map/words")
        .laneUri("map1")
        .open();
    mapLink2 = plane.downlinkMap()
        .valueClass(String.class)
        .hostUri("swim://localhost:53556/")
        .nodeUri("/map/words")
        .laneUri("map2")
        .open();
    mapLink3 = plane.downlinkMap()
        .hostUri("swim://localhost:53556/")
        .nodeUri("/map/words")
        .laneUri("map3")
        .open();
  }

  @AfterMethod
  private void stopServer() throws InterruptedException {
    Thread.sleep(2000);
    mapLink.close();
    server.stop();
    delete(PLANE_NAME);
  }

  @Test
  void testPut() throws InterruptedException {
    final CountDownLatch didReceive = new CountDownLatch(2);
    class MapLinkController implements WillUpdateKey<String, String>,
        DidUpdateKey<String, String>, DidReceive {
      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println("willUpdate key: " + key + "; newValue: " + newValue);
        return newValue;
      }

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println("didUpdate key: " + key + "; newValue: " + newValue);
      }

      @Override
      public void didReceive(Value value) {
        System.out.println("didReceive: " + Recon.toString(value));
        didReceive.countDown();
      }

    }

    mapLink.observe(new MapLinkController());
    mapLink.put("a", "indefinite article");
    mapLink.put("the", "definite article");
    didReceive.await(2, TimeUnit.SECONDS);

    final HashTrieMap<String, String> expected = HashTrieMap.of("a", "indefinite article").updated("the", "definite article");
    assertEquals(mapLink.size(), 2);
    verifyMapLaneKeySet(mapLink.keySet(), String.class, expected.keySet());
    verifyMapLaneEntrySet(mapLink.entrySet(), String.class, String.class, expected);
    verifyMapLaneValuesSet(mapLink.values(), String.class, expected.values());
    verifyMapLaneValuesSet(testMapCopy.values(), String.class, expected.values());

    verifyMapLaneKeySet(mapLink1.keySet(), String.class, expected.keySet());
    verifyMapLaneEntrySet(mapLink1.entrySet(), String.class, Value.class, expected);
    verifyMapLaneValuesSet(mapLink1.values(), Value.class, expected.values());
    verifyMapLaneValuesSet(testMap1Copy.values(), Value.class, expected.values());

    verifyMapLaneKeySet(mapLink2.keySet(), Value.class, expected.keySet());
    verifyMapLaneEntrySet(mapLink2.entrySet(), Value.class, String.class, expected);
    verifyMapLaneValuesSet(mapLink2.values(), String.class, expected.values());
    verifyMapLaneValuesSet(testMap2Copy.values(), String.class, expected.values());

    verifyMapLaneKeySet(mapLink3.keySet(), Value.class, expected.keySet());
    verifyMapLaneEntrySet(mapLink3.entrySet(), Value.class, Value.class, expected);
    verifyMapLaneValuesSet(mapLink3.values(), Value.class, expected.values());
    verifyMapLaneValuesSet(testMap3Copy.values(), Value.class, expected.values());
  }

  @Test
  void testRemove() throws InterruptedException {
    final CountDownLatch didReceive = new CountDownLatch(2);
    final CountDownLatch willRemove = new CountDownLatch(1);
    final CountDownLatch didRemove = new CountDownLatch(1);
    final CountDownLatch willCommand = new CountDownLatch(2);

    class MapLinkController implements DidReceive, WillCommand,
        WillRemoveKey<String>, DidRemoveKey<String, String> {

      @Override
      public void didReceive(Value value) {
        System.out.println("didReceive: " + Recon.toString(value));
        didReceive.countDown();
      }

      @Override
      public void willRemove(String key) {
        System.out.println("willRemove: " + key);
        willRemove.countDown();
      }

      @Override
      public void didRemove(String key, String oldValue) {
        System.out.println("didRemove key: " + key + "; oldValue: " + oldValue);
        didRemove.countDown();
      }

      @Override
      public void willCommand(Value body) {
        System.out.println("willCommand: " + body);
        willCommand.countDown();
      }
    }

    mapLink.observe(new MapLinkController());
    mapLink.put("a", "indefinite article");
    mapLink.put("the", "definite article");
    didReceive.await(2, TimeUnit.SECONDS);
    assertEquals(mapLink.size(), 2);
    assertEquals(mapLink.get("a"), "indefinite article");
    assertEquals(mapLink.get("the"), "definite article");

    mapLink.remove("the");
    willRemove.await(2, TimeUnit.SECONDS);
    didRemove.await(2, TimeUnit.SECONDS);
    willCommand.await(2, TimeUnit.SECONDS);
    assertEquals(mapLink.size(), 1);
    assertEquals(mapLink.get("a"), "indefinite article");
    assertEquals(mapLink.get("the"), Form.forString().unit());

    assertEquals(mapLink1.size(), 1);
    assertEquals(mapLink1.get("the"), Value.absent());

    assertEquals(mapLink2.size(), 1);
    assertEquals(mapLink3.size(), 1);
  }

  @Test
  void testClear() throws InterruptedException {
    final CountDownLatch didReceive = new CountDownLatch(2);
    final CountDownLatch willClear = new CountDownLatch(1);
    final CountDownLatch didClear = new CountDownLatch(1);
    final CountDownLatch willCommand = new CountDownLatch(1);
    class MapLinkController implements DidReceive, WillUpdateKey<String, String>,
        DidUpdateKey<String, String>, WillClear, DidClear, WillCommand {
      @Override
      public void didReceive(Value value) {
        System.out.println("didReceive: " + Recon.toString(value));
        didReceive.countDown();
      }

      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println("willUpdate key: " + key + "; newValue: " + newValue);
        return newValue;
      }

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println("didUpdate key: " + key + "; newValue: " + newValue);
      }

      @Override
      public void willClear() {
        System.out.println("willClear");
        willClear.countDown();
      }

      @Override
      public void didClear() {
        System.out.println("didClear");
        didClear.countDown();
      }

      @Override
      public void willCommand(Value body) {
        System.out.println("willCommand value: " + Recon.toString(body));
        willCommand.countDown();
      }
    }

    mapLink.observe(new MapLinkController());
    mapLink.put("a", "indefinite article");
    mapLink.put("the", "definite article");
    didReceive.await(2, TimeUnit.SECONDS);
    assertEquals(mapLink.size(), 2);

    mapLink.clear();
    willClear.await(2, TimeUnit.SECONDS);
    didClear.await(2, TimeUnit.SECONDS);
    willCommand.await(2, TimeUnit.SECONDS);

    assertEquals(mapLink.size(), 0);
    assertEquals(mapLink1.size(), 0);
    assertEquals(mapLink2.size(), 0);
    assertEquals(mapLink3.size(), 0);
  }

  @Test
  void testDrop() throws InterruptedException {
    final CountDownLatch didReceive = new CountDownLatch(5);
    final CountDownLatch willDrop = new CountDownLatch(1);
    final CountDownLatch didDrop = new CountDownLatch(1);
    final CountDownLatch willCommand = new CountDownLatch(1);

    class MapLinkController implements WillUpdateKey<String, String>,
        DidUpdateKey<String, String>, DidReceive, WillDrop, DidDrop, WillCommand {
      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println("willUpdate key: " + key + "; newValue: " + newValue);
        return newValue;
      }

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println("didUpdate key: " + key + "; newValue: " + newValue);
      }

      @Override
      public void didReceive(Value value) {
        System.out.println("didReceive: " + Recon.toString(value));
        didReceive.countDown();
      }

      @Override
      public void willDrop(int lower) {
        System.out.println("willDrop: " + lower);
        willDrop.countDown();
      }

      @Override
      public void didDrop(int lower) {
        System.out.println("didDrop: " + lower);
        didDrop.countDown();
      }

      @Override
      public void willCommand(Value body) {
        System.out.println("willCommand value: " + Recon.toString(body));
        willCommand.countDown();
      }
    }

    mapLink.observe(new MapLinkController());
    mapLink.put("a", "alpha");
    mapLink.put("b", "bravo");
    mapLink.put("c", "charlie");
    mapLink.put("d", "delta");
    mapLink.put("e", "echo");
    didReceive.await(2, TimeUnit.SECONDS);
    assertEquals(mapLink.size(), 5);

    mapLink.drop(2);
    willDrop.await(2, TimeUnit.SECONDS);
    didDrop.await(2, TimeUnit.SECONDS);
    willCommand.await(2, TimeUnit.SECONDS);

    assertEquals(mapLink.size(), 3);
    assertEquals(mapLink.get("c"), "charlie");
    assertEquals(mapLink.get("d"), "delta");
    assertEquals(mapLink.get("e"), "echo");
    assertEquals(mapLink.get("a"), Form.forString().unit());
    assertEquals(mapLink.get("b"), Form.forString().unit());

    assertEquals(mapLink1.size(), 3);
    assertEquals(mapLink2.size(), 3);
    assertEquals(mapLink3.size(), 3);
  }

  @Test
  void testTake() throws InterruptedException {
    final CountDownLatch didReceive = new CountDownLatch(5);
    final CountDownLatch willTake = new CountDownLatch(1);
    final CountDownLatch didTake = new CountDownLatch(1);
    final CountDownLatch willCommand = new CountDownLatch(1);

    class MapLinkController implements WillUpdateKey<String, String>,
        DidUpdateKey<String, String>, DidReceive, WillTake, DidTake, WillCommand {
      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println("willUpdate key: " + key + "; newValue: " + newValue);
        return newValue;
      }

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println("didUpdate key: " + key + "; newValue: " + newValue);
      }

      @Override
      public void didReceive(Value value) {
        System.out.println("didReceive: " + Recon.toString(value));
        didReceive.countDown();
      }

      @Override
      public void willTake(int lower) {
        System.out.println("willTake: " + lower);
        willTake.countDown();
      }

      @Override
      public void didTake(int lower) {
        System.out.println("didTake: " + lower);
        didTake.countDown();
      }

      @Override
      public void willCommand(Value body) {
        System.out.println("willCommand value: " + Recon.toString(body));
        willCommand.countDown();
      }
    }

    mapLink.observe(new MapLinkController());
    mapLink.put("a", "alpha");
    mapLink.put("b", "bravo");
    mapLink.put("c", "charlie");
    mapLink.put("d", "delta");
    mapLink.put("e", "echo");
    didReceive.await(2, TimeUnit.SECONDS);
    assertEquals(mapLink.size(), 5);

    mapLink.take(2);
    willTake.await(2, TimeUnit.SECONDS);
    didTake.await(2, TimeUnit.SECONDS);
    willCommand.await(2, TimeUnit.SECONDS);

    assertEquals(mapLink.size(), 2);
    assertEquals(mapLink.get("a"), "alpha");
    assertEquals(mapLink.get("b"), "bravo");
    assertEquals(mapLink.get("c"), Form.forString().unit());
    assertEquals(mapLink.get("d"), Form.forString().unit());
    assertEquals(mapLink.get("e"), Form.forString().unit());

    assertEquals(mapLink1.size(), 2);
    assertEquals(mapLink2.size(), 2);
    assertEquals(mapLink3.size(), 2);
  }

  @Test
  public void testLinkToJoinMapLane() throws InterruptedException {
    final CountDownLatch didReceive = new CountDownLatch(4 + 4); // 1 update and 1 clear for each of th e4 join lanes
    final CountDownLatch didUpdate = new CountDownLatch(2 * 4);  // 2 updates for each of th e4 join lanes
    class JoinMapLinkController implements DidReceive, DidUpdateKey<String, String> {
      @Override
      public void didReceive(Value value) {
        System.out.println("join didReceive: " + Recon.toString(value));
        didReceive.countDown();
      }

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println("join didUpdate key: " + key + "; newValue: " + newValue);
        didUpdate.countDown();
      }
    }

    final MapDownlink<String, String> xs = plane.downlinkMap()
        .keyClass(String.class)
        .valueClass(String.class)
        .hostUri("swim://localhost:53556/")
        .nodeUri("/map/xs")
        .laneUri("map")
        .open();
    final MapDownlink<String, String> ys = plane.downlinkMap()
        .keyClass(String.class)
        .valueClass(String.class)
        .hostUri("swim://localhost:53556/")
        .nodeUri("/map/ys")
        .laneUri("map")
        .open();

    final MapDownlink<String, String> join = plane.downlinkMap()
        .keyClass(String.class)
        .valueClass(String.class)
        .hostUri("swim://localhost:53556/")
        .nodeUri("/join/map/all")
        .laneUri("join")
        .observe(new JoinMapLinkController())
        .open();

    final MapDownlink<String, Value> join1 = plane.downlinkMap()
        .keyClass(String.class)
        .hostUri("swim://localhost:53556/")
        .nodeUri("/join/map/all")
        .laneUri("join1")
        .observe(new JoinMapLinkController())
        .open();

    final MapDownlink<Value, String> join2 = plane.downlinkMap()
        .valueClass(String.class)
        .hostUri("swim://localhost:53556/")
        .nodeUri("/join/map/all")
        .laneUri("join2")
        .observe(new JoinMapLinkController())
        .open();

    final MapDownlink<Value, Value> join3 = plane.downlinkMap()
        .hostUri("swim://localhost:53556/")
        .nodeUri("/join/map/all")
        .laneUri("join3")
        .observe(new JoinMapLinkController())
        .open();


    xs.clear();
    ys.clear();
    xs.put("x0", "a");
    xs.put("x1", "b");
    ys.put("y0", "c");
    ys.put("y1", "d");

    didReceive.await(4, TimeUnit.SECONDS);
    didUpdate.await(4, TimeUnit.SECONDS);

    final HashTrieMap<String, String> expected = HashTrieMap.of("x0", "a").updated("x1", "b").updated("y0", "c").updated("y1", "d");
    verifyMapLaneKeySet(join.keySet(), String.class, expected.keySet());
    verifyMapLaneEntrySet(join.entrySet(), String.class, String.class, expected);
    verifyMapLaneValuesSet(join.values(), String.class, expected.values());

    verifyMapLaneKeySet(join1.keySet(), String.class, expected.keySet());
    verifyMapLaneEntrySet(join1.entrySet(), String.class, Value.class, expected);
    verifyMapLaneValuesSet(join1.values(), Value.class, expected.values());

    verifyMapLaneKeySet(join2.keySet(), Value.class, expected.keySet());
    verifyMapLaneEntrySet(join2.entrySet(), Value.class, String.class, expected);
    verifyMapLaneValuesSet(join2.values(), String.class, expected.values());

    verifyMapLaneKeySet(join3.keySet(), Value.class, expected.keySet());
    verifyMapLaneEntrySet(join3.entrySet(), Value.class, Value.class, expected);
    verifyMapLaneValuesSet(join3.values(), Value.class, expected.values());

    join.clear();
    join1.clear();
    join2.clear();
    join3.clear();
    verifyMapLaneKeySet(join.keySet(), String.class, HashTrieSet.empty());
    verifyMapLaneKeySet(join1.keySet(), String.class, HashTrieSet.empty());
    verifyMapLaneKeySet(join2.keySet(), Value.class, HashTrieSet.empty());
    verifyMapLaneKeySet(join3.keySet(), Value.class, HashTrieSet.empty());
  }

  @Test
  public void testDownlinkMap() throws InterruptedException {
    final CountDownLatch didReceive = new CountDownLatch(2);
    final CountDownLatch didUpdate = new CountDownLatch(2);
    class MapLinkController implements WillUpdateKey<String, String>,
        DidUpdateKey<String, String>, DidReceive {
      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println("willUpdate key: " + key + "; newValue: " + newValue);
        return newValue;
      }

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println("didUpdate key: " + key + "; newValue: " + newValue);
        didUpdate.countDown();
      }

      @Override
      public void didReceive(Value value) {
        System.out.println("didReceive: " + Recon.toString(value));
        didReceive.countDown();
      }

    }

    final MapDownlink<String, String> downlinkMap = plane.downlinkMap()
        .keyClass(String.class)
        .valueClass(String.class)
        .hostUri("swim://localhost:53556/")
        .nodeUri("/join/map/words")
        .laneUri("downlinkMap")
        .open();
    downlinkMap.observe(new MapLinkController());
    mapLink.put("a", "indefinite article");
    mapLink.put("the", "definite article");
    didReceive.await(2, TimeUnit.SECONDS);
    didUpdate.await(2, TimeUnit.SECONDS);

    final HashTrieMap<String, String> expected = HashTrieMap.of("a", "indefinite article").updated("the", "definite article");
    assertEquals(downlinkMap.size(), 2);
    verifyMapLaneKeySet(downlinkMap.keySet(), String.class, expected.keySet());
    verifyMapLaneEntrySet(downlinkMap.entrySet(), String.class, String.class, expected);
    verifyMapLaneValuesSet(downlinkMap.values(), String.class, expected.values());
  }

  private <K, V> void verifyMapLaneValuesSet(Collection<V> values, Class<?> valueClass, Collection<String> expectedValues) {
    assertEquals(values.size(), expectedValues.size());
    final Iterator<V> valueIterator = values.iterator();
    while (valueIterator.hasNext()) {
      final V value = valueIterator.next();
      assertTrue(valueClass.isAssignableFrom(value.getClass()), ""
          + "Actual Class: " + value.getClass().getName() + ". Expected class: " + valueClass.getName());
      if (value instanceof String) {
        assertTrue(expectedValues.contains(value),
            "Expected values does not contain " + value);
      } else if (value instanceof Value) {
        assertTrue(expectedValues.contains(((Value) value).stringValue()),
            "Expected values does not contain " + ((Value) value).stringValue());
      }
    }
  }

  private <K, V> void verifyMapLaneEntrySet(Set<Map.Entry<K, V>> entries, Class<?> keyClass, Class<?> valueClass,
                                            HashTrieMap<String, String> expected) {
    assertEquals(entries.size(), expected.size());

    final Iterator<Map.Entry<K, V>> entryIt = entries.iterator();
    while (entryIt.hasNext()) {
      final Map.Entry<K, V> entry = entryIt.next();
      final K key = entry.getKey();
      final V value = entry.getValue();
      assertTrue(keyClass.isAssignableFrom(key.getClass()),
          "Actual Class: " + key.getClass().getName() + ". Expected class: " + keyClass.getName());
      assertTrue(valueClass.isAssignableFrom(value.getClass()),
          "Actual Class: " + value.getClass().getName() + ". Expected class: " + valueClass.getName());
      if (key instanceof String) {
        if (value instanceof String) {
          assertEquals(value, expected.get(key));
        } else {
          assertEquals(((Value) value).stringValue(), expected.get(key));
        }
      } else {
        if (value instanceof String) {
          assertEquals(value, expected.get(((Value) key).stringValue()));
        } else {
          assertEquals(((Value) value).stringValue(), expected.get(((Value) key).stringValue()));
        }
      }
    }
  }

  private <K, V> void verifyMapLaneKeySet(Set<K> keys, Class<?> keyClass, Set<String> expectedKeys) {
    assertEquals(keys.size(), expectedKeys.size());
    final Iterator<K> keyIterator = keys.iterator();
    while (keyIterator.hasNext()) {
      final K key = keyIterator.next();
      assertTrue(keyClass.isAssignableFrom(key.getClass()),
          "Actual Class: " + key.getClass().getName() + ". Expected class: " + keyClass.getName());
      if (key instanceof String) {
        assertTrue(expectedKeys.contains(key),
            "Expected keys does not contain " + key);
      } else if (key instanceof Value) {
        assertTrue(expectedKeys.contains(((Value) key).stringValue()),
            "Expected keys does not contain " + ((Value) key).stringValue());
      }
    }
  }

  private StoreDef storeDef(String value) {
    return new StoreDef(System.getProperty("java.io.tmpdir") + "/swim/" + value);
  }

  private void delete(String name) {
    final String dirName = System.getProperty("java.io.tmpdir") + "/swim/" + name;
    deleteR(dirName);
  }

  private void deleteR(String name) {
    final File dir = new File(name);
    if (!dir.exists()) {
      return;
    }
    for (File file : dir.listFiles()) {
      if (file.isDirectory()) {
        deleteR(file.getAbsolutePath());
      }
      try {
        file.delete();
      } catch (Exception e) {
        System.out.println("WARNING: failed to remove from " + name);
      }
    }
    try {
      dir.delete();
    } catch (Exception swallow) {
    }
  }
}
