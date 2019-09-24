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
import swim.codec.Format;
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
import swim.service.web.WebServiceDef;
import swim.util.OrderedMap;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertNotNull;

public class MapLaneSpec {

  private static final int DEF_LATCH_COUNT = 100;
  private static CountDownLatch laneWillUpdate = new CountDownLatch(DEF_LATCH_COUNT);
  private static CountDownLatch laneDidUpdate = new CountDownLatch(DEF_LATCH_COUNT);

  private static CountDownLatch laneWillRemove = new CountDownLatch(DEF_LATCH_COUNT);
  private static CountDownLatch laneDidRemove = new CountDownLatch(DEF_LATCH_COUNT);

  private static CountDownLatch laneWillDrop = new CountDownLatch(DEF_LATCH_COUNT);
  private static CountDownLatch laneDidDrop = new CountDownLatch(DEF_LATCH_COUNT);

  private static CountDownLatch laneWillTake = new CountDownLatch(DEF_LATCH_COUNT);
  private static CountDownLatch laneDidTake = new CountDownLatch(DEF_LATCH_COUNT);

  private static CountDownLatch laneWillClear = new CountDownLatch(DEF_LATCH_COUNT);
  private static CountDownLatch laneDidClear = new CountDownLatch(DEF_LATCH_COUNT);

  private static OrderedMap<String, String> mapLaneCopy;
  private static OrderedMap<String, String> mapLane1Copy;

  private static class TestMapLaneAgent extends AbstractAgent {
    @SwimLane("map")
    MapLane<String, String> testMap = this.<String, String>mapLane()
        .keyClass(String.class)
        .valueClass(String.class)
        .observe(new TestMapLaneController());

    @SwimLane("map1")
    MapLane<String, String> testMap1 = this.<String, String>mapLane().keyClass(String.class).valueClass(String.class)
        .didUpdate((key, newValue, oldValue) -> {
          assertNotNull(newValue);
          mapLane1Copy = this.testMap1.snapshot();
        })
        .didRemove((key, oldValue) -> {
          assertNotNull(oldValue);
          mapLane1Copy = this.testMap1.snapshot();
        })
        .didDrop((lower) -> mapLane1Copy = this.testMap1.snapshot())
        .didTake((upper) -> mapLane1Copy = this.testMap1.snapshot())
        .didClear(() -> mapLane1Copy = this.testMap1.snapshot());

    class TestMapLaneController implements WillUpdateKey<String, String>,
        DidUpdateKey<String, String>, WillRemoveKey<String>, DidRemoveKey<String, String>,
        WillClear, DidClear, WillDrop, DidDrop, WillTake, DidTake {
      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println("lane willUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue));
        laneWillUpdate.countDown();
        return newValue;
      }

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println("lane didUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        mapLaneCopy = testMap.snapshot();
        testMap1.put(key, newValue);
        laneDidUpdate.countDown();
      }

      @Override
      public void willRemove(String key) {
        System.out.println("lane willRemove key: " + Format.debug(key));
        laneWillRemove.countDown();
      }

      @Override
      public void didRemove(String key, String oldValue) {
        System.out.println("lane didRemove key: " + Format.debug(key) + "; oldValue: " + Format.debug(oldValue));
        mapLaneCopy = testMap.snapshot();
        testMap1.remove(key);
        laneDidRemove.countDown();
      }

      @Override
      public void willClear() {
        System.out.println("lane willClear");
        laneWillClear.countDown();
      }

      @Override
      public void didClear() {
        System.out.println("lane didClear");
        mapLaneCopy = testMap.snapshot();
        testMap1.clear();
        laneDidClear.countDown();
      }

      @Override
      public void willDrop(int lower) {
        System.out.println("lane willDrop " + lower);
        laneWillDrop.countDown();
      }

      @Override
      public void didDrop(int lower) {
        System.out.println("lane didDrop " + lower);
        mapLaneCopy = testMap.snapshot();
        testMap1.drop(lower);
        laneDidDrop.countDown();
      }

      @Override
      public void willTake(int upper) {
        System.out.println("lane willTake " + upper);
        laneWillTake.countDown();
      }

      @Override
      public void didTake(int upper) {
        System.out.println("lane didTake " + upper);
        mapLaneCopy = testMap.snapshot();
        testMap1.take(upper);
        laneDidTake.countDown();
      }
    }
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

    laneWillUpdate = new CountDownLatch(3);
    laneDidUpdate = new CountDownLatch(3);
    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final MapDownlink<String, String> mapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .open();
      mapLink.put("a", "indefinite article");
      mapLink.put("the", "definite article");
      laneDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(laneWillUpdate.getCount(), 1);
      assertEquals(laneDidUpdate.getCount(), 1);
      assertEquals(mapLaneCopy.size(), 2);
      assertEquals(mapLaneCopy.get("a"), "indefinite article");
      assertEquals(mapLaneCopy.get("the"), "definite article");

      assertEquals(mapLane1Copy.size(), 2);
      assertEquals(mapLane1Copy.get("a"), "indefinite article");
      assertEquals(mapLane1Copy.get("the"), "definite article");

      mapLink.put("a", "article");
      laneDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(laneWillUpdate.getCount(), 0);
      assertEquals(laneDidUpdate.getCount(), 0);
      assertEquals(mapLaneCopy.size(), 2);
      assertEquals(mapLaneCopy.get("a"), "article");
      assertEquals(mapLaneCopy.get("the"), "definite article");

      assertEquals(mapLane1Copy.size(), 2);
      assertEquals(mapLane1Copy.get("a"), "article");
      assertEquals(mapLane1Copy.get("the"), "definite article");
    } finally {
      kernel.stop();
    }
  }

  @Test
  void testRemove() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestMapPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestMapPlane.class);

    laneDidUpdate = new CountDownLatch(2);
    laneWillRemove = new CountDownLatch(1);
    laneDidRemove = new CountDownLatch(1);
    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final MapDownlink<String, String> mapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .open();

      mapLink.put("a", "indefinite article");
      mapLink.put("the", "definite article");
      laneDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(laneDidUpdate.getCount(), 0);
      assertEquals(mapLaneCopy.size(), 2);
      assertEquals(mapLane1Copy.size(), 2);

      mapLink.remove("the");
      laneDidRemove.await(1, TimeUnit.SECONDS);
      assertEquals(laneDidRemove.getCount(), 0);
      assertEquals(mapLaneCopy.size(), 1);
      assertEquals(mapLaneCopy.get("a"), "indefinite article");

      assertEquals(mapLane1Copy.size(), 1);
      assertEquals(mapLane1Copy.get("a"), "indefinite article");
    } finally {
      kernel.stop();
    }
  }

  @Test
  void testClear() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestMapPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestMapPlane.class);

    laneDidUpdate = new CountDownLatch(2);
    laneWillClear = new CountDownLatch(1);
    laneDidClear = new CountDownLatch(1);
    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final MapDownlink<String, String> mapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .open();

      mapLink.put("a", "indefinite article");
      mapLink.put("the", "definite article");
      laneDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(laneDidUpdate.getCount(), 0);
      assertEquals(mapLaneCopy.size(), 2);
      assertEquals(mapLane1Copy.size(), 2);

      mapLink.clear();
      laneWillClear.await(1, TimeUnit.SECONDS);
      laneDidClear.await(1, TimeUnit.SECONDS);
      assertEquals(laneWillClear.getCount(), 0);
      assertEquals(laneDidClear.getCount(), 0);
      assertEquals(mapLaneCopy.size(), 0);
      assertEquals(mapLane1Copy.size(), 0);
    } finally {
      kernel.stop();
    }
  }

  @Test
  void testDrop() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestMapPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestMapPlane.class);

    laneDidUpdate = new CountDownLatch(5);
    laneWillDrop = new CountDownLatch(1);
    laneDidDrop = new CountDownLatch(1);
    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final MapDownlink<String, String> mapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .open();

      mapLink.put("a", "alpha");
      mapLink.put("b", "bravo");
      mapLink.put("c", "charlie");
      mapLink.put("d", "delta");
      mapLink.put("e", "echo");
      laneDidUpdate.await(2, TimeUnit.SECONDS);
      assertEquals(laneDidUpdate.getCount(), 0);
      assertEquals(mapLaneCopy.size(), 5);
      assertEquals(mapLane1Copy.size(), 5);

      mapLink.drop(2);
      laneWillDrop.await(1, TimeUnit.SECONDS);
      laneDidDrop.await(1, TimeUnit.SECONDS);
      assertEquals(laneWillDrop.getCount(), 0);
      assertEquals(laneDidDrop.getCount(), 0);
      assertEquals(mapLaneCopy.size(), 3);
      assertEquals(mapLaneCopy.get("c"), "charlie");
      assertEquals(mapLaneCopy.get("d"), "delta");
      assertEquals(mapLaneCopy.get("e"), "echo");

      assertEquals(mapLane1Copy.size(), 3);
      assertEquals(mapLane1Copy.get("c"), "charlie");
      assertEquals(mapLane1Copy.get("d"), "delta");
      assertEquals(mapLane1Copy.get("e"), "echo");
    } finally {
      kernel.stop();
    }
  }

  @Test
  void testTake() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestMapPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestMapPlane.class);

    laneDidUpdate = new CountDownLatch(5);
    laneWillTake = new CountDownLatch(1);
    laneDidTake = new CountDownLatch(1);
    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final MapDownlink<String, String> mapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .open();

      mapLink.put("a", "alpha");
      mapLink.put("b", "bravo");
      mapLink.put("c", "charlie");
      mapLink.put("d", "delta");
      mapLink.put("e", "echo");
      laneDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(laneDidUpdate.getCount(), 0);
      assertEquals(mapLaneCopy.size(), 5);
      assertEquals(mapLane1Copy.size(), 5);

      mapLink.take(2);
      laneWillTake.await(1, TimeUnit.SECONDS);
      laneDidTake.await(1, TimeUnit.SECONDS);
      assertEquals(laneWillTake.getCount(), 0);
      assertEquals(laneDidTake.getCount(), 0);
      assertEquals(mapLaneCopy.size(), 2);
      assertEquals(mapLaneCopy.get("a"), "alpha");
      assertEquals(mapLaneCopy.get("b"), "bravo");

      assertEquals(mapLane1Copy.size(), 2);
      assertEquals(mapLane1Copy.get("a"), "alpha");
      assertEquals(mapLane1Copy.get("b"), "bravo");
    } finally {
      kernel.stop();
    }
  }
}
