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

import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
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
import swim.api.warp.function.DidSync;
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

public class MapDownlinkSpec {
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

  @Test
  public void testPut() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestMapPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestMapPlane.class);

    final CountDownLatch linkWillReceive = new CountDownLatch(2);
    final CountDownLatch linkDidReceive = new CountDownLatch(2);
    final CountDownLatch linkDidUpdate = new CountDownLatch(4);
    final CountDownLatch linkDidSync = new CountDownLatch(1);
    final CountDownLatch readOnlyLinkDidReceive = new CountDownLatch(2);
    class MapLinkController implements WillUpdateKey<String, String>,
        DidUpdateKey<String, String>, WillReceive, DidReceive, DidSync {
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
      @Override
      public void didSync() {
        System.out.println("MapLinkController- link didSync");
        linkDidSync.countDown();
      }
    }

    class ReadOnlyMapLinkController implements DidReceive {
      @Override
      public void didReceive(Value body) {
        System.out.println("ReadOnlyMapLinkController- link didReceive body: " + Recon.toString(body));
        readOnlyLinkDidReceive.countDown();
      }
    }

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final MapDownlink<String, String> mapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .observe(new MapLinkController())
          .open();
      final MapDownlink<String, String> readOnlyMapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .observe(new ReadOnlyMapLinkController())
          .open();
      mapLink.put("a", "indefinite article");
      mapLink.put("the", "definite article");
      linkWillReceive.await(1, TimeUnit.SECONDS);
      linkDidReceive.await(1, TimeUnit.SECONDS);
      linkDidUpdate.await(1, TimeUnit.SECONDS);
      linkDidSync.await(1, TimeUnit.SECONDS);
      assertEquals(linkWillReceive.getCount(), 0);
      assertEquals(linkDidReceive.getCount(), 0);
      assertEquals(linkDidUpdate.getCount(), 0);
      assertEquals(linkDidSync.getCount(), 0);
      assertEquals(mapLink.size(), 2);
      assertEquals(mapLink.get("a"), "indefinite article");
      assertEquals(mapLink.get("the"), "definite article");

      readOnlyLinkDidReceive.await(1, TimeUnit.SECONDS);
      assertEquals(readOnlyLinkDidReceive.getCount(), 0);
      assertEquals(readOnlyMapLink.size(), 2);
      assertEquals(readOnlyMapLink.get("a"), "indefinite article");
      assertEquals(readOnlyMapLink.get("the"), "definite article");
    } finally {
      kernel.stop();
    }
  }

  @Test
  void testRemove() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestMapPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestMapPlane.class);

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

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final MapDownlink<String, String> mapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .observe(new MapLinkController())
          .open();
      final MapDownlink<String, String> readOnlyMapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .observe(new ReadOnlyMapLinkController())
          .open();

      mapLink.put("a", "indefinite article");
      mapLink.put("the", "definite article");
      didReceive.await(2, TimeUnit.SECONDS);
      assertEquals(didReceive.getCount(), 0);
      assertEquals(mapLink.size(), 2);

      readOnlyLinkDidReceive.await(2, TimeUnit.SECONDS);
      assertEquals(readOnlyLinkDidReceive.getCount(), 0);
      assertEquals(readOnlyMapLink.size(), 2);

      mapLink.remove("the");
      willRemove.await(2, TimeUnit.SECONDS);
      didRemove.await(2, TimeUnit.SECONDS);
      assertEquals(willRemove.getCount(), 0);
      assertEquals(didRemove.getCount(), 0);
      assertEquals(mapLink.size(), 1);
      assertEquals(mapLink.get("a"), "indefinite article");
      assertEquals(mapLink.get("the"), Form.forString().unit());

      readOnlyLinkDidRemove.await(2, TimeUnit.SECONDS);
      assertEquals(readOnlyLinkDidRemove.getCount(), 0);
      assertEquals(readOnlyMapLink.size(), 1);
      assertEquals(readOnlyMapLink.get("a"), "indefinite article");
      assertEquals(readOnlyMapLink.get("the"), Form.forString().unit());
    } finally {
      kernel.stop();
    }
  }

  @Test
  void testClear() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestMapPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestMapPlane.class);

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

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final MapDownlink<String, String> mapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .observe(new MapLinkController())
          .open();
      final MapDownlink<String, String> readOnlyMapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .observe(new ReadOnlyMapLinkController())
          .open();

      mapLink.put("a", "indefinite article");
      mapLink.put("the", "definite article");
      didReceive.await(2, TimeUnit.SECONDS);
      assertEquals(didReceive.getCount(), 0);
      assertEquals(mapLink.size(), 2);
      readOnlyLinkDidReceive.await(2, TimeUnit.SECONDS);
      assertEquals(readOnlyLinkDidReceive.getCount(), 0);
      assertEquals(readOnlyMapLink.size(), 2);

      mapLink.clear();
      didClear.await(2, TimeUnit.SECONDS);
      assertEquals(didClear.getCount(), 0);
      assertEquals(mapLink.size(), 0);

      readOnlyLinkDidClear.await(2, TimeUnit.SECONDS);
      assertEquals(readOnlyLinkDidClear.getCount(), 0);
      assertEquals(readOnlyMapLink.size(), 0);

    } finally {
      kernel.stop();
    }
  }

  @Test
  void testDrop() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestMapPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestMapPlane.class);

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

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final MapDownlink<String, String> mapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .observe(new MapLinkController())
          .open();
      final MapDownlink<String, String> readOnlyMapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .observe(new ReadOnlyMapLinkController())
          .open();

      mapLink.put("a", "alpha");
      mapLink.put("b", "bravo");
      mapLink.put("c", "charlie");
      mapLink.put("d", "delta");
      mapLink.put("e", "echo");
      didReceive.await(2, TimeUnit.SECONDS);
      assertEquals(didReceive.getCount(), 0);
      assertEquals(mapLink.size(), 5);

      readOnlyLinkDidReceive.await(2, TimeUnit.SECONDS);
      assertEquals(readOnlyLinkDidReceive.getCount(), 0);
      assertEquals(readOnlyMapLink.size(), 5);

      mapLink.drop(2);
      willDrop.await(2, TimeUnit.SECONDS);
      didDrop.await(2, TimeUnit.SECONDS);
      assertEquals(willDrop.getCount(), 0);
      assertEquals(didDrop.getCount(), 0);
      assertEquals(mapLink.size(), 3);
      assertEquals(mapLink.get("c"), "charlie");
      assertEquals(mapLink.get("d"), "delta");
      assertEquals(mapLink.get("e"), "echo");
      assertEquals(mapLink.get("a"), Form.forString().unit());
      assertEquals(mapLink.get("b"), Form.forString().unit());

      readOnlyLinkDidDrop.await(2, TimeUnit.SECONDS);
      assertEquals(readOnlyLinkDidDrop.getCount(), 0);
      assertEquals(readOnlyMapLink.size(), 3);
      assertEquals(readOnlyMapLink.get("c"), "charlie");
      assertEquals(readOnlyMapLink.get("d"), "delta");
      assertEquals(readOnlyMapLink.get("e"), "echo");
    } finally {
      kernel.stop();
    }
  }

  @Test
  void testTake() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestMapPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestMapPlane.class);

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

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final MapDownlink<String, String> mapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .observe(new MapLinkController())
          .open();
      final MapDownlink<String, String> readOnlyMapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .observe(new ReadOnlyMapLinkController())
          .open();

      mapLink.put("a", "alpha");
      mapLink.put("b", "bravo");
      mapLink.put("c", "charlie");
      mapLink.put("d", "delta");
      mapLink.put("e", "echo");
      didReceive.await(2, TimeUnit.SECONDS);
      assertEquals(didReceive.getCount(), 0);
      assertEquals(mapLink.size(), 5);

      readOnlyLinkDidReceive.await(2, TimeUnit.SECONDS);
      assertEquals(readOnlyLinkDidReceive.getCount(), 0);
      assertEquals(readOnlyMapLink.size(), 5);

      mapLink.take(2);
      willTake.await(2, TimeUnit.SECONDS);
      didTake.await(2, TimeUnit.SECONDS);
      assertEquals(willTake.getCount(), 0);
      assertEquals(didTake.getCount(), 0);
      assertEquals(mapLink.size(), 2);
      assertEquals(mapLink.get("a"), "alpha");
      assertEquals(mapLink.get("b"), "bravo");

      readOnlyLinkDidTake.await(2, TimeUnit.SECONDS);
      assertEquals(readOnlyLinkDidTake.getCount(), 0);
      assertEquals(readOnlyMapLink.size(), 2);
      assertEquals(readOnlyMapLink.size(), 2);
      assertEquals(readOnlyMapLink.get("a"), "alpha");
      assertEquals(readOnlyMapLink.get("b"), "bravo");
    } finally {
      kernel.stop();
    }
  }

  @Test
  public void testLinkMap() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestMapPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestMapPlane.class);

    final CountDownLatch didReceive = new CountDownLatch(4);
    class MapLinkController implements DidReceive {
      @Override
      public void didReceive(Value body) {
        System.out.println("MapLinkController- link didReceive body: " + Recon.toString(body));
        didReceive.countDown();
      }
    }

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final MapDownlink<String, String> mapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .observe(new MapLinkController())
          .open();

      final MapDownlink<Value, Value> mapLink1 = plane.downlinkMap()
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .observe(new MapLinkController())
          .open();

      mapLink.put("a", "indefinite article");
      mapLink.put("the", "definite article");

      didReceive.await(2, TimeUnit.SECONDS);
      assertEquals(didReceive.getCount(), 0);
      assertEquals(mapLink.size(), 2);
      assertEquals(mapLink1.size(), 2);

      final HashTrieMap<String, String> expected = HashTrieMap.of("a", "indefinite article").updated("the", "definite article");
      verifyMapLaneKeySet(mapLink.keySet(), String.class, expected.keySet());
      verifyMapLaneEntrySet(mapLink.entrySet(), String.class, String.class, expected);
      verifyMapLaneValuesSet(mapLink.values(), String.class, expected.values());

      verifyMapLaneKeySet(mapLink1.keySet(), Value.class, expected.keySet());
      verifyMapLaneEntrySet(mapLink1.entrySet(), Value.class, Value.class, expected);
      verifyMapLaneValuesSet(mapLink1.values(), Value.class, expected.values());

    } finally {
      kernel.stop();
    }
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
}
