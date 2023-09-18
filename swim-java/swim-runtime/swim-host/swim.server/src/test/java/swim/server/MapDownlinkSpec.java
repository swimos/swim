// Copyright 2015-2023 Nstream, inc.
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

import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import swim.actor.ActorSpaceDef;
import swim.api.SwimLane;
import swim.api.SwimRoute;
import swim.api.agent.AbstractAgent;
import swim.api.agent.AgentRoute;
import swim.api.downlink.MapDownlink;
import swim.api.lane.MapLane;
import swim.api.plane.AbstractPlane;
import swim.api.warp.function.DidReceive;
import swim.api.warp.function.WillReceive;
import swim.codec.Format;
import swim.collections.HashTrieMap;
import swim.kernel.Kernel;
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
import swim.service.web.WebServiceDef;
import swim.structure.Form;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;
import static org.testng.Assert.fail;

public class MapDownlinkSpec {

  private Kernel kernel;
  private TestMapPlane plane;

  @BeforeMethod
  public void setupResources() {
    this.kernel = ServerLoader.loadServerStack();
    this.plane = this.kernel.openSpace(ActorSpaceDef.fromName("test")).openPlane("test", TestMapPlane.class);

    this.kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
    this.kernel.start();
  }

  @AfterMethod
  public void closeResources() {
    this.kernel.stop();
  }

  private MapDownlink<String, String> getDownlink(final String nodeUri, final String laneUri, final Object observer) {
    final CountDownLatch didSyncLatch = new CountDownLatch(1);
    final MapDownlink<String, String> downlink = this.plane.downlinkMap()
        .keyClass(String.class)
        .valueClass(String.class)
        .hostUri("warp://localhost:53556")
        .nodeUri(nodeUri)
        .laneUri(laneUri)
        .didSync(didSyncLatch::countDown);

    if (observer != null) {
      downlink.observe(observer);
    }

    downlink.open();
    try {
      didSyncLatch.await();
    } catch (InterruptedException e) {
      fail("Filed to open downlink", e);
    }

    return downlink;
  }

  @Test
  public void testPut() throws InterruptedException {
    final CountDownLatch linkWillReceive = new CountDownLatch(2);
    final CountDownLatch linkDidReceive = new CountDownLatch(2);
    final CountDownLatch linkDidUpdate = new CountDownLatch(4);
    final CountDownLatch readOnlyLinkDidReceive = new CountDownLatch(2);

    class MapLinkController implements WillUpdateKey<String, String>, DidUpdateKey<String, String>, WillReceive, DidReceive {

      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println("MapLinkController- link willUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue));
        return newValue;
      }

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println("MapLinkController- link didUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue));
        linkDidUpdate.countDown();
      }

      @Override
      public void willReceive(Value body) {
        System.out.println("MapLinkController- link willReceive body: " + Recon.toString(body));
        linkWillReceive.countDown();
      }

      @Override
      public void didReceive(Value body) {
        System.out.println("MapLinkController- link didReceive body: " + Recon.toString(body));
        linkDidReceive.countDown();
      }

    }

    class ReadOnlyMapLinkController implements DidReceive {

      @Override
      public void didReceive(Value body) {
        System.out.println("ReadOnlyMapLinkController- link didReceive body: " + Recon.toString(body));
        readOnlyLinkDidReceive.countDown();
      }

    }

    final MapDownlink<String, String> mapLink = this.getDownlink("/map/words", "map", new MapLinkController());
    final MapDownlink<String, String> readOnlyMapLink = this.getDownlink("/map/words", "map", new ReadOnlyMapLinkController());

    mapLink.put("a", "indefinite article");
    mapLink.put("the", "definite article");
    linkWillReceive.await(10, TimeUnit.SECONDS);
    linkDidReceive.await(10, TimeUnit.SECONDS);
    linkDidUpdate.await(10, TimeUnit.SECONDS);
    assertEquals(linkWillReceive.getCount(), 0);
    assertEquals(linkDidReceive.getCount(), 0);
    assertEquals(linkDidUpdate.getCount(), 0);
    assertEquals(mapLink.size(), 2);
    assertEquals(mapLink.get("a"), "indefinite article");
    assertEquals(mapLink.get("the"), "definite article");

    readOnlyLinkDidReceive.await(10, TimeUnit.SECONDS);
    assertEquals(readOnlyLinkDidReceive.getCount(), 0);
    assertEquals(readOnlyMapLink.size(), 2);
    assertEquals(readOnlyMapLink.get("a"), "indefinite article");
    assertEquals(readOnlyMapLink.get("the"), "definite article");
  }

  @Test
  public void testOldValue() throws InterruptedException {
    final CountDownLatch readLinkDidUpdate0 = new CountDownLatch(1);
    final CountDownLatch readLinkDidUpdate1 = new CountDownLatch(1);
    final CountDownLatch readLinkDidUpdate2 = new CountDownLatch(1);

    class MapLinkController implements DidUpdateKey<String, String> {

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {

      }

    }

    class ReadMapLinkController implements DidUpdateKey<String, String> {

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        if (newValue.equals("apple")) {
          assertEquals(oldValue, "");
          readLinkDidUpdate0.countDown();
        } else if (newValue.equals("alpha")) {
          assertEquals(oldValue, "apple");
          readLinkDidUpdate1.countDown();
        } else if (newValue.equals("alligator")) {
          assertEquals(oldValue, "alpha");
          readLinkDidUpdate2.countDown();
        }
      }

    }

    final MapDownlink<String, String> mapLink = this.getDownlink("/map/words", "map", new MapLinkController());
    final MapDownlink<String, String> readMapLink = this.getDownlink("/map/words", "map", new ReadMapLinkController());

    mapLink.put("a", "apple");
    readLinkDidUpdate0.await(2, TimeUnit.SECONDS);
    assertEquals(readLinkDidUpdate0.getCount(), 0);

    mapLink.put("a", "alpha");
    readLinkDidUpdate1.await(2, TimeUnit.SECONDS);
    assertEquals(readLinkDidUpdate1.getCount(), 0);

    mapLink.put("a", "alligator");
    readLinkDidUpdate2.await(2, TimeUnit.SECONDS);
    assertEquals(readLinkDidUpdate2.getCount(), 0);

    assertEquals(mapLink.size(), 1);
    assertEquals(mapLink.get("a"), "alligator");
    assertEquals(readMapLink.size(), 1);
    assertEquals(readMapLink.get("a"), "alligator");
  }

  @Test
  void testRemove() throws InterruptedException {
    final CountDownLatch didReceive = new CountDownLatch(2);
    final CountDownLatch willRemove = new CountDownLatch(2);
    final CountDownLatch didRemove = new CountDownLatch(2);
    final CountDownLatch readOnlyLinkDidReceive = new CountDownLatch(2);
    final CountDownLatch readOnlyLinkDidRemove = new CountDownLatch(1);

    class MapLinkController implements DidReceive, WillRemoveKey<String>, DidRemoveKey<String, String> {

      @Override
      public void didReceive(Value body) {
        System.out.println("MapLinkController- didReceive");
        didReceive.countDown();
      }

      @Override
      public void willRemove(String key) {
        System.out.println("MapLinkController- willRemove: " + key);
        willRemove.countDown();
      }

      @Override
      public void didRemove(String key, String oldValue) {
        System.out.println("MapLinkController- didRemove key: " + key + "; oldValue: " + oldValue);
        didRemove.countDown();
      }

    }

    class ReadOnlyMapLinkController implements DidReceive, DidRemoveKey<String, String> {

      @Override
      public void didReceive(Value body) {
        System.out.println("ReadOnlyMapLinkController- link didReceive body: " + Recon.toString(body));
        readOnlyLinkDidReceive.countDown();
      }

      @Override
      public void didRemove(String key, String oldValue) {
        System.out.println("ReadOnlyMapLinkController- didRemove key: " + key + "; oldValue: " + oldValue);
        readOnlyLinkDidRemove.countDown();
      }

    }

    final MapDownlink<String, String> mapLink = this.getDownlink("/map/words", "map", new MapLinkController());
    final MapDownlink<String, String> readOnlyMapLink = this.getDownlink("/map/words", "map", new ReadOnlyMapLinkController());

    mapLink.put("a", "indefinite article");
    mapLink.put("the", "definite article");
    didReceive.await(10, TimeUnit.SECONDS);
    assertEquals(didReceive.getCount(), 0);
    assertEquals(mapLink.size(), 2);

    readOnlyLinkDidReceive.await(10, TimeUnit.SECONDS);
    assertEquals(readOnlyLinkDidReceive.getCount(), 0);
    assertEquals(readOnlyMapLink.size(), 2);

    mapLink.remove("the");
    willRemove.await(10, TimeUnit.SECONDS);
    didRemove.await(10, TimeUnit.SECONDS);
    assertEquals(willRemove.getCount(), 0);
    assertEquals(didRemove.getCount(), 0);
    assertEquals(mapLink.size(), 1);
    assertEquals(mapLink.get("a"), "indefinite article");
    assertEquals(mapLink.get("the"), Form.forString().unit());

    readOnlyLinkDidRemove.await(10, TimeUnit.SECONDS);
    assertEquals(readOnlyLinkDidRemove.getCount(), 0);
    assertEquals(readOnlyMapLink.size(), 1);
    assertEquals(readOnlyMapLink.get("a"), "indefinite article");
    assertEquals(readOnlyMapLink.get("the"), Form.forString().unit());
  }

  @Test
  void testClear() throws InterruptedException {
    final CountDownLatch didReceive = new CountDownLatch(2);
    final CountDownLatch willClear = new CountDownLatch(2);
    final CountDownLatch didClear = new CountDownLatch(2);
    final CountDownLatch readOnlyLinkDidReceive = new CountDownLatch(2);
    final CountDownLatch readOnlyLinkDidClear = new CountDownLatch(1);

    class MapLinkController implements DidReceive, WillClear, DidClear {

      @Override
      public void didReceive(Value body) {
        System.out.println("MapLinkController- didReceive");
        didReceive.countDown();
      }

      @Override
      public void didClear() {
        System.out.println("MapLinkController- didReceive");
        didClear.countDown();
      }

      @Override
      public void willClear() {
        System.out.println("MapLinkController- willClear");
        willClear.countDown();
      }

    }

    class ReadOnlyMapLinkController implements DidReceive, DidClear {

      @Override
      public void didReceive(Value body) {
        System.out.println("ReadOnlyMapLinkController- link didReceive body: " + Recon.toString(body));
        readOnlyLinkDidReceive.countDown();
      }

      @Override
      public void didClear() {
        System.out.println("ReadOnlyMapLinkController- didClear");
        readOnlyLinkDidClear.countDown();
      }

    }

    final MapDownlink<String, String> mapLink = this.getDownlink("/map/words", "map", new MapLinkController());
    final MapDownlink<String, String> readOnlyMapLink = this.getDownlink("/map/words", "map", new ReadOnlyMapLinkController());

    mapLink.put("a", "indefinite article");
    mapLink.put("the", "definite article");
    didReceive.await(10, TimeUnit.SECONDS);
    assertEquals(didReceive.getCount(), 0);
    assertEquals(mapLink.size(), 2);
    readOnlyLinkDidReceive.await(10, TimeUnit.SECONDS);
    assertEquals(readOnlyLinkDidReceive.getCount(), 0);
    assertEquals(readOnlyMapLink.size(), 2);

    mapLink.clear();
    didClear.await(10, TimeUnit.SECONDS);
    assertEquals(didClear.getCount(), 0);
    assertEquals(mapLink.size(), 0);

    readOnlyLinkDidClear.await(10, TimeUnit.SECONDS);
    assertEquals(readOnlyLinkDidClear.getCount(), 0);
    assertEquals(readOnlyMapLink.size(), 0);
  }

  @Test
  void testDrop() throws InterruptedException {
    final CountDownLatch didReceive = new CountDownLatch(5);
    final CountDownLatch willDrop = new CountDownLatch(1);
    final CountDownLatch didDrop = new CountDownLatch(1);
    final CountDownLatch readOnlyLinkDidReceive = new CountDownLatch(5);
    final CountDownLatch readOnlyLinkDidDrop = new CountDownLatch(1);

    class MapLinkController implements DidReceive, WillDrop, DidDrop {

      @Override
      public void didReceive(Value body) {
        System.out.println("MapLinkController- didReceive");
        didReceive.countDown();
      }

      @Override
      public void didDrop(int lower) {
        System.out.println("MapLinkController- didDrop: " + lower);
        didDrop.countDown();
      }

      @Override
      public void willDrop(int lower) {
        System.out.println("MapLinkController- willDrop: " + lower);
        willDrop.countDown();
      }

    }

    class ReadOnlyMapLinkController implements DidReceive, DidDrop {

      @Override
      public void didReceive(Value body) {
        System.out.println("ReadOnlyMapLinkController- link didReceive body: " + Recon.toString(body));
        readOnlyLinkDidReceive.countDown();
      }

      @Override
      public void didDrop(int lower) {
        System.out.println("ReadOnlyMapLinkController- didDrop");
        readOnlyLinkDidDrop.countDown();
      }

    }

    final MapDownlink<String, String> mapLink = this.getDownlink("/map/words", "map", new MapLinkController());
    final MapDownlink<String, String> readOnlyMapLink = this.getDownlink("/map/words", "map", new ReadOnlyMapLinkController());


    mapLink.put("a", "alpha");
    mapLink.put("b", "bravo");
    mapLink.put("c", "charlie");
    mapLink.put("d", "delta");
    mapLink.put("e", "echo");
    didReceive.await(10, TimeUnit.SECONDS);
    assertEquals(didReceive.getCount(), 0);
    assertEquals(mapLink.size(), 5);

    readOnlyLinkDidReceive.await(10, TimeUnit.SECONDS);
    assertEquals(readOnlyLinkDidReceive.getCount(), 0);
    assertEquals(readOnlyMapLink.size(), 5);

    mapLink.drop(2);
    willDrop.await(10, TimeUnit.SECONDS);
    didDrop.await(10, TimeUnit.SECONDS);
    assertEquals(willDrop.getCount(), 0);
    assertEquals(didDrop.getCount(), 0);
    assertEquals(mapLink.size(), 3);
    assertEquals(mapLink.get("c"), "charlie");
    assertEquals(mapLink.get("d"), "delta");
    assertEquals(mapLink.get("e"), "echo");
    assertEquals(mapLink.get("a"), Form.forString().unit());
    assertEquals(mapLink.get("b"), Form.forString().unit());

    readOnlyLinkDidDrop.await(10, TimeUnit.SECONDS);
    assertEquals(readOnlyLinkDidDrop.getCount(), 0);
    assertEquals(readOnlyMapLink.size(), 3);
    assertEquals(readOnlyMapLink.get("c"), "charlie");
    assertEquals(readOnlyMapLink.get("d"), "delta");
    assertEquals(readOnlyMapLink.get("e"), "echo");
  }

  @Test
  void testTake() throws InterruptedException {
    final CountDownLatch didReceive = new CountDownLatch(5);
    final CountDownLatch willTake = new CountDownLatch(1);
    final CountDownLatch didTake = new CountDownLatch(1);
    final CountDownLatch readOnlyLinkDidReceive = new CountDownLatch(5);
    final CountDownLatch readOnlyLinkDidTake = new CountDownLatch(1);

    class MapLinkController implements DidReceive, WillTake, DidTake {

      @Override
      public void didReceive(Value body) {
        System.out.println("MapLinkController- didReceive");
        didReceive.countDown();
      }

      @Override
      public void didTake(int upper) {
        System.out.println("MapLinkController- didTake: " + upper);
        didTake.countDown();
      }

      @Override
      public void willTake(int upper) {
        System.out.println("MapLinkController- willTake: " + upper);
        willTake.countDown();
      }

    }

    class ReadOnlyMapLinkController implements DidReceive, DidTake {

      @Override
      public void didReceive(Value body) {
        System.out.println("MapLinkController- link didReceive body: " + Recon.toString(body));
        readOnlyLinkDidReceive.countDown();
      }

      @Override
      public void didTake(int upper) {
        System.out.println("ReadOnlyMapLinkController- didTake");
        readOnlyLinkDidTake.countDown();
      }

    }

    final MapDownlink<String, String> mapLink = this.getDownlink("/map/words", "map", new MapLinkController());
    final MapDownlink<String, String> readOnlyMapLink = this.getDownlink("/map/words", "map", new ReadOnlyMapLinkController());

    mapLink.put("a", "alpha");
    mapLink.put("b", "bravo");
    mapLink.put("c", "charlie");
    mapLink.put("d", "delta");
    mapLink.put("e", "echo");
    didReceive.await(10, TimeUnit.SECONDS);
    assertEquals(didReceive.getCount(), 0);
    assertEquals(mapLink.size(), 5);

    readOnlyLinkDidReceive.await(10, TimeUnit.SECONDS);
    assertEquals(readOnlyLinkDidReceive.getCount(), 0);
    assertEquals(readOnlyMapLink.size(), 5);

    mapLink.take(2);
    willTake.await(10, TimeUnit.SECONDS);
    didTake.await(10, TimeUnit.SECONDS);
    assertEquals(willTake.getCount(), 0);
    assertEquals(didTake.getCount(), 0);
    assertEquals(mapLink.size(), 2);
    assertEquals(mapLink.get("a"), "alpha");
    assertEquals(mapLink.get("b"), "bravo");

    readOnlyLinkDidTake.await(10, TimeUnit.SECONDS);
    assertEquals(readOnlyLinkDidTake.getCount(), 0);
    assertEquals(readOnlyMapLink.size(), 2);
    assertEquals(readOnlyMapLink.size(), 2);
    assertEquals(readOnlyMapLink.get("a"), "alpha");
    assertEquals(readOnlyMapLink.get("b"), "bravo");
  }

  @Test
  public void testLinkMap() throws InterruptedException {
    final CountDownLatch didReceive = new CountDownLatch(4);
    final CountDownLatch didSync = new CountDownLatch(1);

    class MapLinkController implements DidReceive {

      @Override
      public void didReceive(Value body) {
        System.out.println("MapLinkController- link didReceive body: " + Recon.toString(body));
        didReceive.countDown();
      }

    }

    final MapDownlink<String, String> mapLink = this.getDownlink("/map/words", "map", new MapLinkController());
    final MapDownlink<Value, Value> mapLink1 = this.plane.downlinkMap()
        .hostUri("warp://localhost:53556")
        .nodeUri("/map/words")
        .laneUri("map")
        .observe(new MapLinkController())
        .didSync(didSync::countDown)
        .open();

    didSync.await();

    mapLink.put("a", "indefinite article");
    mapLink.put("the", "definite article");

    didReceive.await(10, TimeUnit.SECONDS);
    assertEquals(didReceive.getCount(), 0);
    assertEquals(mapLink.size(), 2);
    assertEquals(mapLink1.size(), 2);

    final HashTrieMap<String, String> expected = HashTrieMap.<String, String>empty().updated("a", "indefinite article").updated("the", "definite article");
    this.verifyMapLaneKeySet(mapLink.keySet(), String.class, expected.keySet());
    this.verifyMapLaneEntrySet(mapLink.entrySet(), String.class, String.class, expected);
    this.verifyMapLaneValuesSet(mapLink.values(), String.class, expected.values());

    this.verifyMapLaneKeySet(mapLink1.keySet(), Value.class, expected.keySet());
    this.verifyMapLaneEntrySet(mapLink1.entrySet(), Value.class, Value.class, expected);
    this.verifyMapLaneValuesSet(mapLink1.values(), Value.class, expected.values());
  }

  private <K, V> void verifyMapLaneValuesSet(Collection<V> values, Class<?> valueClass, Collection<String> expectedValues) {
    assertEquals(values.size(), expectedValues.size());
    for (V value : values) {
      assertTrue(valueClass.isAssignableFrom(value.getClass()),
                 "Actual Class: " + value.getClass().getName() + ". Expected class: " + valueClass.getName());
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

  static class TestMapLaneAgent extends AbstractAgent {

    @SwimLane("map")
    MapLane<String, String> testMap = this.<String, String>mapLane()
        .keyClass(String.class)
        .valueClass(String.class);

    @SwimLane("map1")
    MapLane<Value, Value> testMap1 = this.<Value, Value>mapLane();

  }

  static class TestMapPlane extends AbstractPlane {

    @SwimRoute("/map/:name")
    AgentRoute<TestMapLaneAgent> mapRoute;

  }

}
