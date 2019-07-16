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
import swim.api.SwimLane;
import swim.api.SwimRoute;
import swim.api.agent.AbstractAgent;
import swim.api.agent.AgentRoute;
import swim.api.downlink.ListDownlink;
import swim.api.downlink.function.DidReceive;
import swim.api.downlink.function.WillReceive;
import swim.api.function.DidCommand;
import swim.api.function.WillCommand;
import swim.api.lane.ListLane;
import swim.api.plane.AbstractPlane;
import swim.codec.Format;
import swim.fabric.FabricDef;
import swim.kernel.Kernel;
import swim.observable.function.DidMoveIndex;
import swim.observable.function.DidRemoveIndex;
import swim.observable.function.DidUpdateIndex;
import swim.observable.function.WillMoveIndex;
import swim.observable.function.WillRemoveIndex;
import swim.observable.function.WillUpdateIndex;
import swim.recon.Recon;
import swim.service.warp.WarpServiceDef;
import swim.structure.Value;
import static org.testng.AssertJUnit.assertEquals;

public class ListLaneSpec {
  static class TestListLaneAgent extends AbstractAgent {
    @SwimLane("list")
    ListLane<String> testList = listLane()
        .valueClass(String.class)
        .observe(new TestListLaneController());

    class TestListLaneController implements WillUpdateIndex<String>, DidUpdateIndex<String>,
        WillMoveIndex<String>, DidMoveIndex<String>, WillRemoveIndex, DidRemoveIndex<String>,
        WillCommand, DidCommand {
      @Override
      public String willUpdate(int index, String newValue) {
        System.out.println("lane willUpdate index " + index + "; newValue: " + Format.debug(newValue));
        return newValue;
      }
      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("lane didUpdate index " + index + "; newValue: " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
      }
      @Override
      public void willMove(int fromIndex, int toIndex, String value) {
        System.out.println("lane willMove fromIndex: " + fromIndex + "; toIndex: " + toIndex + "; value: " + Format.debug(value));
      }
      @Override
      public void didMove(int fromIndex, int toIndex, String value) {
        System.out.println("lane didMove fromIndex: " + fromIndex + "; toIndex: " + toIndex + "; value: " + Format.debug(value));
      }
      @Override
      public void willRemove(int index) {
        System.out.println("lane willRemove index: " + index);
      }
      @Override
      public void didRemove(int index, String oldValue) {
        System.out.println("lane didRemove index: " + index + "; oldValue: " + Format.debug(oldValue));
      }
      @Override
      public void willCommand(Value body) {
        System.out.println("lane willCommand body " + Recon.toString(body));
      }
      @Override
      public void didCommand(Value body) {
        System.out.println("lane didCommand body " + Recon.toString(body));
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
    final TestListPlane plane = kernel.openSpace(FabricDef.fromName("test"))
                                      .openPlane("test", TestListPlane.class);

    final CountDownLatch linkDidReceive = new CountDownLatch(3);
    final CountDownLatch linkDidUpdate = new CountDownLatch(6);
    class ListLinkController implements WillUpdateIndex<String>, DidUpdateIndex<String>,
        WillCommand, DidCommand, WillReceive, DidReceive {
      @Override
      public String willUpdate(int index, String newValue) {
        System.out.println("link willUpdate index: " + index);
        return newValue;
      }
      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("link didUpdate index: " + index + "; newValue " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        linkDidUpdate.countDown();
      }
      @Override
      public void willCommand(Value body) {
        System.out.println("link willCommand body " + Recon.toString(body));
      }
      @Override
      public void didCommand(Value body) {
        System.out.println("link didCommand body " + Recon.toString(body));
      }
      @Override
      public void willReceive(Value body) {
        System.out.println("link willReceive body " + Recon.toString(body));
      }
      @Override
      public void didReceive(Value body) {
        System.out.println("link didReceive body " + Recon.toString(body));
        linkDidReceive.countDown();
      }
    }

    try {
      kernel.openService(WarpServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ListLinkController())
          .open();
      listLink.add(0, "a");
      listLink.add(1, "b");
      listLink.add(2, "c");
      linkDidReceive.await(1, TimeUnit.SECONDS);
      linkDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(linkDidReceive.getCount(), 0);
      assertEquals(linkDidUpdate.getCount(), 0);
      assertEquals(listLink.size(), 3);
      assertEquals(listLink.get(0), "a");
      assertEquals(listLink.get(1), "b");
      assertEquals(listLink.get(2), "c");
    } finally {
      kernel.stop();
    }
  }

  @Test
  public void testUpdate() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestListPlane plane = kernel.openSpace(FabricDef.fromName("test"))
                                      .openPlane("test", TestListPlane.class);

    final CountDownLatch linkDidReceiveLower = new CountDownLatch(3);
    final CountDownLatch linkDidReceiveUpper = new CountDownLatch(3);
    final CountDownLatch linkDidUpdateLower = new CountDownLatch(6);
    final CountDownLatch linkDidUpdateUpper = new CountDownLatch(6);
    class ListLinkController implements WillUpdateIndex<String>, DidUpdateIndex<String>,
        WillCommand, DidCommand, WillReceive, DidReceive {
      @Override
      public String willUpdate(int index, String newValue) {
        System.out.println("link willUpdate index: " + index);
        return newValue;
      }
      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("link didUpdate index: " + index + "; newValue " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        final char letter = newValue.length() > 0 ? newValue.charAt(0) : '\0';
        if (Character.isLowerCase(letter)) {
          linkDidUpdateLower.countDown();
        } else if (Character.isUpperCase(letter)) {
          linkDidUpdateUpper.countDown();
        }
      }
      @Override
      public void willCommand(Value body) {
        System.out.println("link willCommand body " + Recon.toString(body));
      }
      @Override
      public void didCommand(Value body) {
        System.out.println("link didCommand body " + Recon.toString(body));
      }
      @Override
      public void willReceive(Value body) {
        System.out.println("link willReceive body " + Recon.toString(body));
      }
      @Override
      public void didReceive(Value body) {
        System.out.println("link didReceive body " + Recon.toString(body));
        final String value = body.target().stringValue("");
        final char letter = value.length() > 0 ? value.charAt(0) : '\0';
        if (Character.isLowerCase(letter)) {
          linkDidReceiveLower.countDown();
        } else if (Character.isUpperCase(letter)) {
          linkDidReceiveUpper.countDown();
        }
      }
    }

    try {
      kernel.openService(WarpServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ListLinkController())
          .open();
      listLink.add(0, "a");
      listLink.add(1, "b");
      listLink.add(2, "c");
      linkDidReceiveLower.await(1, TimeUnit.SECONDS);
      linkDidUpdateLower.await(1, TimeUnit.SECONDS);
      assertEquals(linkDidReceiveLower.getCount(), 0);
      assertEquals(linkDidUpdateLower.getCount(), 0);
      listLink.add(0, "A");
      listLink.add(1, "B");
      listLink.add(2, "C");
      linkDidReceiveUpper.await(1, TimeUnit.SECONDS);
      linkDidUpdateUpper.await(1, TimeUnit.SECONDS);
      assertEquals(linkDidReceiveUpper.getCount(), 0);
      assertEquals(linkDidUpdateUpper.getCount(), 0);
      assertEquals(listLink.size(), 3);
      assertEquals(listLink.get(0), "A");
      assertEquals(listLink.get(1), "B");
      assertEquals(listLink.get(2), "C");
    } finally {
      kernel.stop();
    }
  }

  @Test
  public void testMove() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestListPlane plane = kernel.openSpace(FabricDef.fromName("test"))
                                      .openPlane("test", TestListPlane.class);

    final CountDownLatch linkDidReceive = new CountDownLatch(5);
    final CountDownLatch linkDidUpdate = new CountDownLatch(6);
    final CountDownLatch linkDidMove = new CountDownLatch(2);
    class ListLinkController implements WillUpdateIndex<String>, DidUpdateIndex<String>,
        WillMoveIndex<String>, DidMoveIndex<String>, WillCommand, DidCommand, WillReceive, DidReceive {
      @Override
      public String willUpdate(int index, String newValue) {
        System.out.println("link willUpdate index: " + index);
        return newValue;
      }
      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("link didUpdate index: " + index + "; newValue " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        linkDidUpdate.countDown();
      }
      @Override
      public void willMove(int fromIndex, int toIndex, String value) {
        System.out.println("link willMove fromIndex: " + fromIndex + "; toIndex: " + toIndex + "; value: " + Format.debug(value));
      }
      @Override
      public void didMove(int fromIndex, int toIndex, String value) {
        System.out.println("link didMove fromIndex: " + fromIndex + "; toIndex: " + toIndex + "; value: " + Format.debug(value));
        linkDidMove.countDown();
      }
      @Override
      public void willCommand(Value body) {
        System.out.println("link willCommand body " + Recon.toString(body));
      }
      @Override
      public void didCommand(Value body) {
        System.out.println("link didCommand body " + Recon.toString(body));
      }
      @Override
      public void willReceive(Value body) {
        System.out.println("link willReceive body " + Recon.toString(body));
      }
      @Override
      public void didReceive(Value body) {
        System.out.println("link didReceive body " + Recon.toString(body));
        linkDidReceive.countDown();
      }
    }

    try {
      kernel.openService(WarpServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ListLinkController())
          .open();
      listLink.add(0, "a");
      listLink.add(1, "b");
      listLink.add(2, "c");
      listLink.move(1, 0);
      listLink.move(2, 1);
      linkDidReceive.await(1, TimeUnit.SECONDS);
      linkDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(listLink.size(), 3);
      assertEquals(listLink.get(0), "b");
      assertEquals(listLink.get(1), "c");
      assertEquals(listLink.get(2), "a");
    } finally {
      kernel.stop();
    }
  }

  @Test
  public void testRemove() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestListPlane plane = kernel.openSpace(FabricDef.fromName("test"))
                                      .openPlane("test", TestListPlane.class);

    final CountDownLatch linkDidReceive = new CountDownLatch(4);
    final CountDownLatch linkDidUpdate = new CountDownLatch(6);
    final CountDownLatch linkDidRemove = new CountDownLatch(1);
    class ListLinkController implements WillUpdateIndex<String>, DidUpdateIndex<String>,
        WillRemoveIndex, DidRemoveIndex<String>, WillCommand, DidCommand, WillReceive, DidReceive {
      @Override
      public String willUpdate(int index, String newValue) {
        System.out.println("link willUpdate index: " + index);
        return newValue;
      }
      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("link didUpdate index: " + index + "; newValue " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        linkDidUpdate.countDown();
      }
      @Override
      public void willRemove(int index) {
        System.out.println("link willRemove index: " + index);
      }
      @Override
      public void didRemove(int index, String oldValue) {
        System.out.println("link didRemove index: " + index + "; oldValue: " + Format.debug(oldValue));
        linkDidRemove.countDown();
      }
      @Override
      public void willCommand(Value body) {
        System.out.println("link willCommand body " + Recon.toString(body));
      }
      @Override
      public void didCommand(Value body) {
        System.out.println("link didCommand body " + Recon.toString(body));
      }
      @Override
      public void willReceive(Value body) {
        System.out.println("link willReceive body " + Recon.toString(body));
      }
      @Override
      public void didReceive(Value body) {
        System.out.println("link didReceive body " + Recon.toString(body));
        linkDidReceive.countDown();
      }
    }

    try {
      kernel.openService(WarpServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ListLinkController())
          .open();
      listLink.add(0, "a");
      listLink.add(1, "b");
      listLink.add(2, "c");
      listLink.remove(1);
      linkDidReceive.await(1, TimeUnit.SECONDS);
      linkDidUpdate.await(1, TimeUnit.SECONDS);
      linkDidRemove.await(1, TimeUnit.SECONDS);
      assertEquals(linkDidReceive.getCount(), 0);
      assertEquals(linkDidUpdate.getCount(), 0);
      assertEquals(linkDidRemove.getCount(), 0);
      assertEquals(listLink.size(), 2);
      assertEquals(listLink.get(0), "a");
      assertEquals(listLink.get(1), "c");
    } finally {
      kernel.stop();
    }
  }
}
