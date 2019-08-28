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

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.testng.annotations.Test;
import swim.actor.ActorSpaceDef;
import swim.api.SwimLane;
import swim.api.SwimRoute;
import swim.api.agent.AbstractAgent;
import swim.api.agent.AgentRoute;
import swim.api.downlink.ListDownlink;
import swim.api.lane.ListLane;
import swim.api.plane.AbstractPlane;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.WillCommand;
import swim.codec.Format;
import swim.kernel.Kernel;
import swim.observable.function.DidClear;
import swim.observable.function.DidDrop;
import swim.observable.function.DidMoveIndex;
import swim.observable.function.DidRemoveIndex;
import swim.observable.function.DidTake;
import swim.observable.function.DidUpdateIndex;
import swim.observable.function.WillClear;
import swim.observable.function.WillDrop;
import swim.observable.function.WillMoveIndex;
import swim.observable.function.WillRemoveIndex;
import swim.observable.function.WillTake;
import swim.observable.function.WillUpdateIndex;
import swim.recon.Recon;
import swim.service.web.WebServiceDef;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertNotNull;

public class ListLaneSpec {

  private static final int DEF_LATCH_COUNT = 100;
  private static CountDownLatch laneWillUpdate = new CountDownLatch(DEF_LATCH_COUNT);
  private static CountDownLatch laneDidUpdate  = new CountDownLatch(DEF_LATCH_COUNT);
  private static CountDownLatch laneDidUpdateLower  = new CountDownLatch(DEF_LATCH_COUNT);
  private static CountDownLatch laneDidUpdateUpper  = new CountDownLatch(DEF_LATCH_COUNT);

  private static CountDownLatch laneWillMove = new CountDownLatch(DEF_LATCH_COUNT);
  private static CountDownLatch laneDidMove = new CountDownLatch(DEF_LATCH_COUNT);

  private static CountDownLatch laneWillRemove = new CountDownLatch(DEF_LATCH_COUNT);
  private static CountDownLatch laneDidRemove = new CountDownLatch(DEF_LATCH_COUNT);

  private static CountDownLatch laneWillDrop = new CountDownLatch(DEF_LATCH_COUNT);
  private static CountDownLatch laneDidDrop = new CountDownLatch(DEF_LATCH_COUNT);

  private static CountDownLatch laneWillTake = new CountDownLatch(DEF_LATCH_COUNT);
  private static CountDownLatch laneDidTake = new CountDownLatch(DEF_LATCH_COUNT);

  private static CountDownLatch laneWillClear = new CountDownLatch(DEF_LATCH_COUNT);
  private static CountDownLatch laneDidClear = new CountDownLatch(DEF_LATCH_COUNT);

  private static CountDownLatch laneWillCommand = new CountDownLatch(DEF_LATCH_COUNT);
  private static CountDownLatch laneDidCommand = new CountDownLatch(DEF_LATCH_COUNT);

  private static List<String> listLaneCopy = new ArrayList<String>();
  private static List<String> listLane1Copy = new ArrayList<String>();
  private static List<String> commandList = new ArrayList<String>();

  static class TestListLaneAgent extends AbstractAgent {
    @SwimLane("list")
    ListLane<String> testList = listLane()
        .valueClass(String.class)
        .observe(new TestListLaneController());

    @SwimLane("list1")
    ListLane<String> testList1 = listLane().valueClass(String.class)
        .didUpdate((index, newValue, oldValue) -> {
          assertNotNull(newValue);
          listLane1Copy = this.testList1.snapshot();
        })
        .didMove((index, newValue, oldValue) -> {
          assertNotNull(newValue);
          assertNotNull(oldValue);
          listLane1Copy = this.testList1.snapshot();
        })
        .didRemove((index, oldValue) -> {
          assertNotNull(oldValue);
          listLane1Copy = this.testList1.snapshot();
        })
        .didDrop((lower) -> listLane1Copy = this.testList1.snapshot())
        .didTake((upper) -> listLane1Copy = this.testList1.snapshot())
        .didClear(() -> listLane1Copy = this.testList1.snapshot());

    class TestListLaneController implements WillUpdateIndex<String>, DidUpdateIndex<String>,
        WillMoveIndex<String>, DidMoveIndex<String>, WillRemoveIndex, DidRemoveIndex<String>,
        WillDrop, DidDrop, WillTake, DidTake, WillClear, DidClear,
        WillCommand, DidCommand {
      @Override
      public String willUpdate(int index, String newValue) {
        System.out.println("lane willUpdate index " + index + "; newValue: " + Format.debug(newValue));
        laneWillUpdate.countDown();
        return newValue;
      }
      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("lane didUpdate index " + index + "; newValue: " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        listLaneCopy = testList.snapshot();
        testList1.add(index, newValue);
        laneDidUpdate.countDown();

        final char letter = newValue.length() > 0 ? newValue.charAt(0) : '\0';
        if (Character.isLowerCase(letter)) {
          laneDidUpdateLower.countDown();
        } else if (Character.isUpperCase(letter)) {
          laneDidUpdateUpper.countDown();
        }
      }
      @Override
      public void willMove(int fromIndex, int toIndex, String value) {
        System.out.println("lane willMove fromIndex: " + fromIndex + "; toIndex: " + toIndex + "; value: " + Format.debug(value));
        laneWillMove.countDown();
      }
      @Override
      public void didMove(int fromIndex, int toIndex, String value) {
        System.out.println("lane didMove fromIndex: " + fromIndex + "; toIndex: " + toIndex + "; value: " + Format.debug(value));
        listLaneCopy = testList.snapshot();
        testList1.move(fromIndex, toIndex);
        laneDidMove.countDown();
      }
      @Override
      public void willRemove(int index) {
        System.out.println("lane willRemove index: " + index);
        laneWillRemove.countDown();
      }
      @Override
      public void didRemove(int index, String oldValue) {
        System.out.println("lane didRemove index: " + index + "; oldValue: " + Format.debug(oldValue));
        listLaneCopy = testList.snapshot();
        testList1.remove(index);
        laneDidRemove.countDown();
      }
      @Override
      public void willCommand(Value body) {
        System.out.println("lane willCommand body " + Recon.toString(body));
        laneWillCommand.countDown();
      }
      @Override
      public void didCommand(Value body) {
        System.out.println("lane didCommand body " + Recon.toString(body));
        commandList.add(body.stringValue());
        laneDidCommand.countDown();
      }

      @Override
      public void willDrop(int lower) {
        System.out.println("lane willDrop lower: " + lower);
        laneWillDrop.countDown();
      }

      @Override
      public void didDrop(int lower) {
        System.out.println("lane didDrop lower : " + lower);
        listLaneCopy = testList.snapshot();
        testList1.drop(lower);
        laneDidDrop.countDown();
      }

      @Override
      public void willTake(int upper) {
        System.out.println("lane willTake upper: " + upper);
        laneWillTake.countDown();
      }

      @Override
      public void didTake(int upper) {
        System.out.println("lane didTake upper: " + upper);
        listLaneCopy = testList.snapshot();
        testList1.take(upper);
        laneDidTake.countDown();
      }

      @Override
      public void willClear() {
        System.out.println("lane willClear");
        laneWillClear.countDown();
      }

      @Override
      public void didClear() {
        System.out.println("lane didClear");
        listLaneCopy = testList.snapshot();
        testList1.clear();
        laneDidClear.countDown();
      }

    }
  }

  static class TestListPlane extends AbstractPlane {
    @SwimRoute("/list/:name")
    AgentRoute<TestListLaneAgent> listRoute;
  }

  @Test
  public void testInsert() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestListPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestListPlane.class);

    laneWillUpdate = new CountDownLatch(3);
    laneDidUpdate = new CountDownLatch(3);
    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/insert")
          .laneUri("list")
          .open();

      listLink.add(0, "a");
      listLink.add(1, "b");
      listLink.add(2, "c");
      laneDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(laneWillUpdate.getCount(), 0);
      assertEquals(laneDidUpdate.getCount(), 0);
      assertEquals(listLaneCopy.size(), 3);
      assertEquals(listLaneCopy.get(0), "a");
      assertEquals(listLaneCopy.get(1), "b");
      assertEquals(listLaneCopy.get(2), "c");

      assertEquals(listLane1Copy.size(), 3);
      assertEquals(listLane1Copy.get(0), "a");
      assertEquals(listLane1Copy.get(1), "b");
      assertEquals(listLane1Copy.get(2), "c");
    } finally {
      kernel.stop();
    }
  }

  @Test
  public void testUpdate() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestListPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestListPlane.class);
    laneDidUpdateLower = new CountDownLatch(3);
    laneDidUpdateUpper = new CountDownLatch(3);
    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/update")
          .laneUri("list")
          .open();
      listLink.add(0, "a");
      listLink.add(1, "b");
      listLink.add(2, "c");
      laneDidUpdateLower.await(1, TimeUnit.SECONDS);
      assertEquals(laneDidUpdateLower.getCount(), 0);
      assertEquals(listLaneCopy.size(), 3);
      assertEquals(listLaneCopy.get(0), "a");
      assertEquals(listLaneCopy.get(1), "b");
      assertEquals(listLaneCopy.get(2), "c");

      assertEquals(listLane1Copy.size(), 3);
      assertEquals(listLane1Copy.get(0), "a");
      assertEquals(listLane1Copy.get(1), "b");
      assertEquals(listLane1Copy.get(2), "c");


      listLink.add(0, "A");
      listLink.add(1, "B");
      listLink.add(2, "C");
      laneDidUpdateUpper.await(1, TimeUnit.SECONDS);
      assertEquals(laneDidUpdateUpper.getCount(), 0);
      assertEquals(listLaneCopy.size(), 3);
      assertEquals(listLaneCopy.get(0), "A");
      assertEquals(listLaneCopy.get(1), "B");
      assertEquals(listLaneCopy.get(2), "C");

      assertEquals(listLane1Copy.size(), 3);
      assertEquals(listLane1Copy.get(0), "A");
      assertEquals(listLane1Copy.get(1), "B");
      assertEquals(listLane1Copy.get(2), "C");
    } finally {
      kernel.stop();
    }
  }


  @Test
  public void testMove() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestListPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestListPlane.class);

    laneDidUpdate = new CountDownLatch(3);
    laneDidMove = new CountDownLatch(2);
    laneWillMove = new CountDownLatch(2);
    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/move")
          .laneUri("list")
          .open();
      listLink.add(0, "a");
      listLink.add(1, "b");
      listLink.add(2, "c");
      laneDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(listLaneCopy.size(), 3);
      assertEquals(listLaneCopy.get(0), "a");
      assertEquals(listLaneCopy.get(1), "b");
      assertEquals(listLaneCopy.get(2), "c");

      assertEquals(listLane1Copy.size(), 3);
      assertEquals(listLane1Copy.get(0), "a");
      assertEquals(listLane1Copy.get(1), "b");
      assertEquals(listLane1Copy.get(2), "c");

      listLink.move(1, 0);
      listLink.move(2, 1);
      laneDidMove.await(1, TimeUnit.SECONDS);
      assertEquals(laneDidUpdate.getCount(), 0);
      assertEquals(laneWillMove.getCount(), 0);
      assertEquals(laneDidMove.getCount(), 0);
      assertEquals(listLaneCopy.size(), 3);
      assertEquals(listLaneCopy.get(0), "b");
      assertEquals(listLaneCopy.get(1), "c");
      assertEquals(listLaneCopy.get(2), "a");

      assertEquals(listLane1Copy.size(), 3);
      assertEquals(listLane1Copy.get(0), "b");
      assertEquals(listLane1Copy.get(1), "c");
      assertEquals(listLane1Copy.get(2), "a");
    } finally {
      kernel.stop();
    }
  }

  @Test
  public void testRemove() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestListPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestListPlane.class);

    laneDidUpdate = new CountDownLatch(3);
    laneDidRemove = new CountDownLatch(1);
    laneWillRemove = new CountDownLatch(1);

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/remove")
          .laneUri("list")
          .open();

      listLink.add(0, "a");
      listLink.add(1, "b");
      listLink.add(2, "c");
      laneDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(laneDidUpdate.getCount(), 0);
      assertEquals(listLaneCopy.size(), 3);
      assertEquals(listLaneCopy.get(0), "a");
      assertEquals(listLaneCopy.get(1), "b");
      assertEquals(listLaneCopy.get(2), "c");

      assertEquals(listLane1Copy.size(), 3);
      assertEquals(listLane1Copy.get(0), "a");
      assertEquals(listLane1Copy.get(1), "b");
      assertEquals(listLane1Copy.get(2), "c");

      listLink.remove(1);
      laneWillRemove.await(1, TimeUnit.SECONDS);
      laneDidRemove.await(1, TimeUnit.SECONDS);
      assertEquals(laneWillRemove.getCount(), 0);
      assertEquals(laneDidRemove.getCount(), 0);
      assertEquals(listLaneCopy.size(), 2);
      assertEquals(listLaneCopy.get(0), "a");
      assertEquals(listLaneCopy.get(1), "c");

      assertEquals(listLane1Copy.size(), 2);
      assertEquals(listLane1Copy.get(0), "a");
      assertEquals(listLane1Copy.get(1), "c");
    } finally {
      kernel.stop();
    }
  }

  @Test
  public void testDrop() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestListPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestListPlane.class);
    final int total = 5;

    laneDidUpdate = new CountDownLatch(total);
    laneDidDrop = new CountDownLatch(1);
    laneWillDrop = new CountDownLatch(1);

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/drop")
          .laneUri("list")
          .open();

      for (int i = 0; i < total; i++) {
        listLink.add(i, Integer.toString(i));
      }
      laneDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(laneDidUpdate.getCount(), 0);
      assertEquals(listLaneCopy.size(), total);
      assertEquals(listLane1Copy.size(), total);
      for (int i = 0; i < total; i++) {
        assertEquals(listLaneCopy.get(i), Integer.toString(i));
        assertEquals(listLane1Copy.get(i), Integer.toString(i));
      }

      listLink.drop(2);
      laneWillDrop.await(2, TimeUnit.SECONDS);
      laneDidDrop.await(2, TimeUnit.SECONDS);
      assertEquals(laneDidDrop.getCount(), 0);
      assertEquals(listLaneCopy.size(), 3);
      assertEquals(listLaneCopy.get(0), "2");
      assertEquals(listLaneCopy.get(1), "3");
      assertEquals(listLaneCopy.get(2), "4");

      assertEquals(listLane1Copy.size(), 3);
      assertEquals(listLane1Copy.get(0), "2");
      assertEquals(listLane1Copy.get(1), "3");
      assertEquals(listLane1Copy.get(2), "4");
    } finally {
      kernel.stop();
    }
  }

  @Test
  public void testTake() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestListPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestListPlane.class);
    final int total = 5;
    laneDidUpdate = new CountDownLatch(total);
    laneDidTake = new CountDownLatch(1);
    laneWillTake = new CountDownLatch(1);

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/take")
          .laneUri("list")
          .open();

      for (int i = 0; i < total; i++) {
        listLink.add(i, Integer.toString(i));
      }
      laneDidUpdate.await(2, TimeUnit.SECONDS);
      assertEquals(laneDidUpdate.getCount(), 0);
      assertEquals(listLaneCopy.size(), 5);
      assertEquals(listLane1Copy.size(), 5);
      for (int i = 0; i < total; i++) {
        assertEquals(listLaneCopy.get(i), Integer.toString(i));
        assertEquals(listLane1Copy.get(i), Integer.toString(i));
      }

      listLink.take(2);
      laneWillTake.await(2, TimeUnit.SECONDS);
      laneDidTake.await(2, TimeUnit.SECONDS);
      assertEquals(laneDidTake.getCount(), 0);
      assertEquals(listLaneCopy.size(), 2);
      assertEquals(listLaneCopy.get(0), "0");
      assertEquals(listLaneCopy.get(1), "1");

      assertEquals(listLane1Copy.size(), 2);
      assertEquals(listLane1Copy.get(0), "0");
      assertEquals(listLane1Copy.get(1), "1");
    } finally {
      kernel.stop();
    }
  }

  @Test
  public void testClear() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestListPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestListPlane.class);
    final int total = 3;
    laneDidUpdate = new CountDownLatch(total);
    laneDidClear = new CountDownLatch(1);
    laneWillClear = new CountDownLatch(1);

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/clear")
          .laneUri("list")
          .open();

      for (int i = 0; i < total; i++) {
        listLink.add(i, Integer.toString(i));
      }

      laneDidUpdate.await(2, TimeUnit.SECONDS);
      assertEquals(laneDidUpdate.getCount(), 0);
      assertEquals(listLaneCopy.size(), total);
      assertEquals(listLane1Copy.size(), total);
      for (int i = 0; i < total; i++) {
        assertEquals(listLaneCopy.get(i), Integer.toString(i));
        assertEquals(listLane1Copy.get(i), Integer.toString(i));
      }

      listLink.clear();
      laneDidClear.await(1, TimeUnit.SECONDS);
      assertEquals(laneWillClear.getCount(), 0);
      assertEquals(laneDidClear.getCount(), 0);
      assertEquals(listLaneCopy.size(), 0);
      assertEquals(listLane1Copy.size(), 0);
    } finally {
      kernel.stop();
    }
  }

}
