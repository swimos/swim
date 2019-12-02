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
import swim.api.downlink.ListDownlink;
import swim.api.lane.ListLane;
import swim.api.plane.AbstractPlane;
import swim.api.warp.function.DidReceive;
import swim.api.warp.function.WillReceive;
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

public class ListDownlinkSpec {
  static class TestListLaneAgent extends AbstractAgent {
    @SwimLane("list")
    ListLane<String> testList = listLane()
        .valueClass(String.class);
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
  
    final CountDownLatch didSyncListLinkLatch = new CountDownLatch(1);
    final CountDownLatch didSyncReadOnlyListLinkLatch = new CountDownLatch(1);
    final CountDownLatch linkDidReceive = new CountDownLatch(3);
    final CountDownLatch linkWillUpdate = new CountDownLatch(6);
    final CountDownLatch linkDidUpdate = new CountDownLatch(3);
    final CountDownLatch readOnlyLinkDidUpdate = new CountDownLatch(3);
    class ListLinkController implements WillUpdateIndex<String>, DidUpdateIndex<String>, WillReceive, DidReceive {
      @Override
      public String willUpdate(int index, String newValue) {
        System.out.println("link willUpdate index: " + index);
        linkWillUpdate.countDown();
        return newValue;
      }
      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController- link didUpdate index: " + index + "; newValue " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        linkDidUpdate.countDown();
      }
      public void willReceive(Value body) {
        System.out.println("ListLinkController- link willReceive body " + Recon.toString(body));
      }
      @Override
      public void didReceive(Value body) {
        System.out.println("ListLinkController- link didReceive body " + Recon.toString(body));
        linkDidReceive.countDown();
      }
    }

    class ReadOnlyListLinkController implements DidUpdateIndex<String> {
      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ReadOnlyListLinkController- link didUpdate index: " + index + "; newValue " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        readOnlyLinkDidUpdate.countDown();
      }
    }

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ListLinkController())
          .didSync(didSyncListLinkLatch::countDown)
          .open();
      final ListDownlink<String> readOnlyListLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ReadOnlyListLinkController())
          .didSync(didSyncReadOnlyListLinkLatch::countDown)
          .open();
      
      didSyncListLinkLatch.await();
      didSyncReadOnlyListLinkLatch.await();
      
      listLink.add(0, "a");
      listLink.add(1, "b");
      listLink.add(2, "c");
      linkDidReceive.await();
      linkDidUpdate.await();
      assertEquals(linkDidReceive.getCount(), 0);
      assertEquals(linkWillUpdate.getCount(), 0);
      assertEquals(linkDidUpdate.getCount(), 0);
      assertEquals(listLink.size(), 3);
      assertEquals(listLink.get(0), "a");
      assertEquals(listLink.get(1), "b");
      assertEquals(listLink.get(2), "c");
      readOnlyLinkDidUpdate.await();
      assertEquals(readOnlyListLink.size(), 3);
      assertEquals(readOnlyListLink.get(0), "a");
      assertEquals(readOnlyListLink.get(1), "b");
      assertEquals(readOnlyListLink.get(2), "c");
    } finally {
      kernel.stop();
    }
  }

  @Test
  public void testUpdate() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestListPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestListPlane.class);

    final CountDownLatch linkDidReceiveLower = new CountDownLatch(3);
    final CountDownLatch linkDidReceiveUpper = new CountDownLatch(3);
    final CountDownLatch linkDidUpdateLower = new CountDownLatch(6);
    final CountDownLatch linkDidUpdateUpper = new CountDownLatch(6);
    final CountDownLatch readOnlyLinkDidUpdate = new CountDownLatch(6);

    class ListLinkController implements WillUpdateIndex<String>, DidUpdateIndex<String>, WillReceive, DidReceive {
      @Override
      public String willUpdate(int index, String newValue) {
        System.out.println("ListLinkController- link willUpdate index: " + index);
        return newValue;
      }
      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController- link didUpdate index: " + index + "; newValue " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        final char letter = newValue.length() > 0 ? newValue.charAt(0) : '\0';
        if (Character.isLowerCase(letter)) {
          linkDidUpdateLower.countDown();
        } else if (Character.isUpperCase(letter)) {
          linkDidUpdateUpper.countDown();
        }
      }
      @Override
      public void willReceive(Value body) {
        System.out.println("link willReceive body " + Recon.toString(body));
      }
      @Override
      public void didReceive(Value body) {
        System.out.println("ListLinkController- link didReceive body " + Recon.toString(body));
        final String value = body.target().stringValue("");
        final char letter = value.length() > 0 ? value.charAt(0) : '\0';
        if (Character.isLowerCase(letter)) {
          linkDidReceiveLower.countDown();
        } else if (Character.isUpperCase(letter)) {
          linkDidReceiveUpper.countDown();
        }
      }
    }

    class ReadOnlyListLinkController implements DidUpdateIndex<String> {
      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ReadOnlyListLinkController- link didUpdate index: " + index + "; newValue " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        readOnlyLinkDidUpdate.countDown();
      }
    }

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ListLinkController())
          .open();
      final ListDownlink<String> readOnlyListLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ReadOnlyListLinkController())
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
      readOnlyLinkDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(readOnlyLinkDidUpdate.getCount(), 0);
      assertEquals(readOnlyListLink.size(), 3);
      assertEquals(readOnlyListLink.get(0), "A");
      assertEquals(readOnlyListLink.get(1), "B");
      assertEquals(readOnlyListLink.get(2), "C");
    } finally {
      kernel.stop();
    }
  }

  @Test
  public void testMove() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestListPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestListPlane.class);

    final CountDownLatch linkDidUpdate = new CountDownLatch(6);
    final CountDownLatch linkWillMove = new CountDownLatch(4);
    final CountDownLatch linkDidMove = new CountDownLatch(4);
    final CountDownLatch readOnlyLinkDidUpdate = new CountDownLatch(3);
    final CountDownLatch readOnlyLinkDidMove = new CountDownLatch(2);

    class ListLinkController implements DidUpdateIndex<String>, WillMoveIndex<String>, DidMoveIndex<String> {
      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController- link didUpdate index: " + index + "; newValue " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        linkDidUpdate.countDown();
      }
      @Override
      public void willMove(int fromIndex, int toIndex, String value) {
        System.out.println("ListLinkController- link willMove fromIndex: " + fromIndex + "; toIndex: " + toIndex + "; value: " + Format.debug(value));
        linkWillMove.countDown();
      }
      @Override
      public void didMove(int fromIndex, int toIndex, String value) {
        System.out.println("ListLinkController- link didMove fromIndex: " + fromIndex + "; toIndex: " + toIndex + "; value: " + Format.debug(value));
        linkDidMove.countDown();
      }
    }

    class ReadOnlyListLinkController implements DidUpdateIndex<String>, DidMoveIndex<String> {
      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ReadOnlyListLinkController- link didUpdate index: " + index + "; newValue " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        readOnlyLinkDidUpdate.countDown();
      }
      @Override
      public void didMove(int fromIndex, int toIndex, String value) {
        System.out.println("ReadOnlyListLinkController- link didMove fromIndex: " + fromIndex + "; toIndex: " + toIndex + "; value: " + Format.debug(value));
        readOnlyLinkDidMove.countDown();
      }
    }

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ListLinkController())
          .open();
      final ListDownlink<String> readOnlyListLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ReadOnlyListLinkController())
          .open();

      listLink.add(0, "a");
      listLink.add(1, "b");
      listLink.add(2, "c");
      linkDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(linkDidUpdate.getCount(), 0);
      assertEquals(listLink.size(), 3);
      readOnlyLinkDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(readOnlyLinkDidUpdate.getCount(), 0);
      assertEquals(readOnlyListLink.size(), 3);

      listLink.move(1, 0);
      listLink.move(2, 1);
      linkDidMove.await(1, TimeUnit.SECONDS);
      assertEquals(linkWillMove.getCount(), 0);
      assertEquals(linkDidMove.getCount(), 0);
      assertEquals(listLink.size(), 3);
      assertEquals(listLink.get(0), "b");
      assertEquals(listLink.get(1), "c");
      assertEquals(listLink.get(2), "a");

      readOnlyLinkDidMove.await(1, TimeUnit.SECONDS);
      assertEquals(readOnlyLinkDidMove.getCount(), 0);
      assertEquals(readOnlyListLink.size(), 3);
      assertEquals(readOnlyListLink.get(0), "b");
      assertEquals(readOnlyListLink.get(1), "c");
      assertEquals(readOnlyListLink.get(2), "a");
    } finally {
      kernel.stop();
    }
  }

  @Test
  public void testRemove() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestListPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestListPlane.class);

    final CountDownLatch linkDidUpdate = new CountDownLatch(6);
    final CountDownLatch linkWillRemove = new CountDownLatch(2);
    final CountDownLatch linkDidRemove = new CountDownLatch(2);
    final CountDownLatch readOnlyLinkDidUpdate = new CountDownLatch(3);
    final CountDownLatch readOnlyLinkDidRemove = new CountDownLatch(1);

    class ListLinkController implements DidUpdateIndex<String>, WillRemoveIndex, DidRemoveIndex<String> {
      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController- link didUpdate index: " + index + "; newValue " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        linkDidUpdate.countDown();
      }
      @Override
      public void willRemove(int index) {
        System.out.println("ListLinkController- link willRemove index: " + index);
        linkWillRemove.countDown();
      }
      @Override
      public void didRemove(int index, String oldValue) {
        System.out.println("ListLinkController- link didRemove index: " + index + "; oldValue: " + Format.debug(oldValue));
        linkDidRemove.countDown();
      }
    }

    class ReadOnlyListLinkController implements DidUpdateIndex<String>, DidRemoveIndex<String> {
      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ReadOnlyListLinkController- link didUpdate index: " + index + "; newValue " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        readOnlyLinkDidUpdate.countDown();
      }
      @Override
      public void didRemove(int index, String oldValue) {
        System.out.println("ReadOnlyListLinkController- link didRemove index: " + index + "; oldValue: " + Format.debug(oldValue));
        readOnlyLinkDidRemove.countDown();
      }
    }

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ListLinkController())
          .open();
      final ListDownlink<String> readOnlyListLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ReadOnlyListLinkController())
          .open();
      listLink.add(0, "a");
      listLink.add(1, "b");
      listLink.add(2, "c");
      linkDidUpdate.await(2, TimeUnit.SECONDS);
      assertEquals(linkDidUpdate.getCount(), 0);
      assertEquals(listLink.size(), 3);
      readOnlyLinkDidUpdate.await(2, TimeUnit.SECONDS);
      assertEquals(readOnlyLinkDidUpdate.getCount(), 0);
      assertEquals(readOnlyListLink.size(), 3);

      listLink.remove(1);
      linkDidRemove.await(2, TimeUnit.SECONDS);
      assertEquals(linkWillRemove.getCount(), 0);
      assertEquals(linkDidRemove.getCount(), 0);
      assertEquals(listLink.size(), 2);
      assertEquals(listLink.get(0), "a");
      assertEquals(listLink.get(1), "c");

      readOnlyLinkDidRemove.await(1, TimeUnit.SECONDS);
      assertEquals(readOnlyListLink.size(), 2);
      assertEquals(readOnlyListLink.get(0), "a");
      assertEquals(readOnlyListLink.get(1), "c");
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
    final CountDownLatch didUpdate = new CountDownLatch(2 * total);
    final CountDownLatch willDrop = new CountDownLatch(2);
    final CountDownLatch didDrop = new CountDownLatch(2);
    final CountDownLatch readOnlyDidDrop = new CountDownLatch(1);
    final CountDownLatch readOnlyDidUpdate = new CountDownLatch(total);

    class ListLinkController implements DidUpdateIndex<String>, WillDrop, DidDrop {
      @Override
      public void willDrop(int lower) {
        System.out.println("ListLinkController- willDrop lower " + lower);
        willDrop.countDown();
      }

      @Override
      public void didDrop(int lower) {
        System.out.println("ListLinkController- didDrop lower " + lower);
        didDrop.countDown();
      }

      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController- didUpdate at index " + index + " newValue " + newValue);
        didUpdate.countDown();
      }
    }

    class ReadOnlyListLinkController implements DidUpdateIndex<String>, DidDrop {
      @Override
      public void didDrop(int lower) {
        System.out.println("ListLinkController- didDrop lower " + lower);
        readOnlyDidDrop.countDown();
      }

      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController- didUpdate at index " + index + " newValue " + newValue);
        readOnlyDidUpdate.countDown();
      }
    }

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ListLinkController())
          .open();

      final ListDownlink<String> readOnlyListLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ReadOnlyListLinkController())
          .open();

      listLink.observe(new ListLinkController()).open();
      for (int i = 0; i < total; i++) {
        listLink.add(i, Integer.toString(i));
      }
      didUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(didUpdate.getCount(), 0);
      assertEquals(listLink.size(), total);
      readOnlyDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(readOnlyDidUpdate.getCount(), 0);
      assertEquals(readOnlyListLink.size(), total);

      listLink.drop(2);
      didDrop.await(2, TimeUnit.SECONDS);
      assertEquals(willDrop.getCount(), 0);
      assertEquals(didDrop.getCount(), 0);
      assertEquals(listLink.size(), 3);
      assertEquals(listLink.get(0), "2");
      assertEquals(listLink.get(1), "3");
      assertEquals(listLink.get(2), "4");

      readOnlyDidDrop.await(2, TimeUnit.SECONDS);
      assertEquals(readOnlyListLink.size(), 3);
      assertEquals(readOnlyListLink.get(0), "2");
      assertEquals(readOnlyListLink.get(1), "3");
      assertEquals(readOnlyListLink.get(2), "4");
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
    final CountDownLatch didUpdate = new CountDownLatch(2 * total);
    final CountDownLatch willTake = new CountDownLatch(2);
    final CountDownLatch didTake = new CountDownLatch(2);
    final CountDownLatch readOnlyDidUpdate = new CountDownLatch(total);
    final CountDownLatch readOnlyDidTake = new CountDownLatch(1);

    class ListLinkController implements DidUpdateIndex<String>, WillTake, DidTake {
      @Override
      public void willTake(int upper) {
        System.out.println("ListLinkController- willTake upper " + upper);
        willTake.countDown();
      }

      @Override
      public void didTake(int upper) {
        System.out.println("ListLinkController- didTake upper " + upper);
        didTake.countDown();
      }

      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController- didUpdate at index " + index + " newValue " + newValue);
        didUpdate.countDown();
      }
    }

    class ReadOnlyListLinkController implements DidUpdateIndex<String>, DidTake {
      @Override
      public void didTake(int upper) {
        System.out.println("ListLinkController- didTake upper " + upper);
        readOnlyDidTake.countDown();
      }

      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController- didUpdate at index " + index + " newValue " + newValue);
        readOnlyDidUpdate.countDown();
      }
    }

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ListLinkController())
          .open();
      final ListDownlink<String> readOnlyListLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ReadOnlyListLinkController())
          .open();
      listLink.observe(new ListLinkController()).open();
      for (int i = 0; i < total; i++) {
        listLink.add(i, Integer.toString(i));
      }

      didUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(didUpdate.getCount(), 0);
      assertEquals(listLink.size(), total);
      readOnlyDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(readOnlyDidUpdate.getCount(), 0);
      assertEquals(readOnlyListLink.size(), total);

      listLink.take(2);
      didTake.await(2, TimeUnit.SECONDS);
      assertEquals(willTake.getCount(), 0);
      assertEquals(didTake.getCount(), 0);
      assertEquals(listLink.size(), 2);
      assertEquals(listLink.get(0), "0");
      assertEquals(listLink.get(1), "1");

      readOnlyDidTake.await(2, TimeUnit.SECONDS);
      assertEquals(readOnlyListLink.size(), 2);
      assertEquals(readOnlyListLink.get(0), "0");
      assertEquals(readOnlyListLink.get(1), "1");
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
  
  
    final CountDownLatch didSyncListLinkLatch = new CountDownLatch(1);
    final CountDownLatch didSyncReadOnlyListLinkLatch = new CountDownLatch(1);
    final CountDownLatch didUpdate = new CountDownLatch(2 * total);
    final CountDownLatch willClear = new CountDownLatch(2);
    final CountDownLatch didClear = new CountDownLatch(2);
    final CountDownLatch readOnlyDidUpdate = new CountDownLatch(total);
    final CountDownLatch readOnlyDidClear = new CountDownLatch(1);

    class ListLinkController implements DidUpdateIndex<String>, WillClear, DidClear {
      @Override
      public void willClear() {
        System.out.println("ListLinkController- willClear");
        willClear.countDown();
      }

      @Override
      public void didClear() {
        System.out.println("ListLinkController- didClear");
        didClear.countDown();
      }

      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController- didUpdate at index " + index + " newValue " + newValue);
        didUpdate.countDown();
      }

    }

    class ReadOnlyListLinkController implements DidUpdateIndex<String>, DidClear {
      @Override
      public void didClear() {
        System.out.println("ListLinkController- didClear");
        readOnlyDidClear.countDown();
      }

      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController- didUpdate at index " + index + " newValue " + newValue);
        readOnlyDidUpdate.countDown();
      }

    }

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ListDownlink<String> listLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ListLinkController())
          .didSync(didSyncListLinkLatch::countDown)
          .open();
      final ListDownlink<String> readOnlyListLink = plane.downlinkList()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/list/todo")
          .laneUri("list")
          .observe(new ReadOnlyListLinkController())
          .didSync(didSyncReadOnlyListLinkLatch::countDown)
          .open();
      listLink.observe(new ListLinkController()).open();
  
      didSyncListLinkLatch.await();
      didSyncReadOnlyListLinkLatch.await();
      
      for (int i = 0; i < total; i++) {
        listLink.add(i, Integer.toString(i));
      }
      
      didUpdate.await();
      assertEquals(didUpdate.getCount(), 0);
      assertEquals(listLink.size(), total);
      readOnlyDidUpdate.await();
      assertEquals(didUpdate.getCount(), 0);
      assertEquals(readOnlyListLink.size(), total);

      listLink.clear();
      didClear.await();
      assertEquals(willClear.getCount(), 0);
      assertEquals(didClear.getCount(), 0);
      assertEquals(listLink.size(), 0);

      readOnlyDidClear.await();
      assertEquals(readOnlyListLink.size(), 0);
    } finally {
      kernel.stop();
    }
  }
}
