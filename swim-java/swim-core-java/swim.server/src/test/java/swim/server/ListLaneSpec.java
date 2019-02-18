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
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import swim.api.SwimLane;
import swim.api.SwimRoute;
import swim.api.agent.AbstractAgent;
import swim.api.agent.AgentType;
import swim.api.downlink.ListDownlink;
import swim.api.downlink.function.DidReceive;
import swim.api.lane.ListLane;
import swim.api.lane.function.DidCommand;
import swim.api.plane.AbstractPlane;
import swim.linker.StoreDef;
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
import swim.structure.Value;
import static org.testng.AssertJUnit.assertEquals;

public class ListLaneSpec {
  @SwimRoute("/list/:name")
  static class TestListLaneAgent extends AbstractAgent {
    @SwimLane("list")
    ListLane<String> testList = listLane()
        .valueClass(String.class)
        .observe(new TestListLaneController());

    class TestListLaneController implements  WillUpdateIndex<String>, DidUpdateIndex<String> {
      @Override
      public String willUpdate(int index, String newValue) {
        System.out.println(testList.nodeUri().toString() + " willUpdate index " + index + "; newValue: " + newValue);
        return newValue;
      }

      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println(testList.nodeUri().toString() + " didUpdate index " + index + "; newValue: " + newValue);
      }
    }
  }

  static class TestListPlane extends AbstractPlane {
    final AgentType<?> listAgent = agentClass(TestListLaneAgent.class);
  }

  private static final String PLANE_NAME = "list";
  private ServerRuntime server;
  private ServerPlane plane;
  private ListDownlink<String> listLink;

  @BeforeMethod
  private void startServer() {
    server = new ServerRuntime();
    plane = server.materializePlane(PLANE_NAME, TestListPlane.class, storeDef(PLANE_NAME));
    plane.bind("localhost", 53556);
    server.start();
    listLink = plane.downlinkList()
        .valueClass(String.class)
        .hostUri("swim://localhost:53556/")
        .nodeUri("/list/todo")
        .laneUri("list");
  }

  @AfterMethod
  private void stopServer() throws InterruptedException {
    Thread.sleep(2000);
    listLink.close();
    server.stop();
    delete(PLANE_NAME);
  }

  @Test
  public void testInsert() throws InterruptedException {
    final int total = 3;
    final CountDownLatch didUpdate = new CountDownLatch(2 * total);
    final CountDownLatch didReceive = new CountDownLatch(total);

    class ListLinkController implements DidUpdateIndex<String>, WillUpdateIndex<String>, DidReceive {
      @Override
      public String willUpdate(int index, String newValue) {
        System.out.println("ListLinkController: willUpdate at index " + index);
        return newValue;
      }

      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController: didUpdate at index " + index + " newValue " + newValue);
        didUpdate.countDown();
      }

      @Override
      public void didReceive(Value body) {
        System.out.println("ListLinkController: didReceive newValue " + Recon.toString(body));
        didReceive.countDown();
      }
    }
    listLink.observe(new ListLinkController()).open();
    for (int i = 0; i < total; i++) {
      listLink.add(i, Integer.toString(i));
    }
    didUpdate.await(2, TimeUnit.SECONDS);
    didReceive.await(2, TimeUnit.SECONDS);
    assertEquals(total, listLink.size());
    assertEquals("0", listLink.get(0));
    assertEquals("1", listLink.get(1));
    assertEquals("2", listLink.get(2));

  }

  @Test
  public void testUpdate() throws InterruptedException {
    final int total = 3;
    final CountDownLatch didUpdate = new CountDownLatch(4 * total); // 2 for insert and 2 for update
    final CountDownLatch didReceive = new CountDownLatch(total);

    class ListLinkController implements WillUpdateIndex<String>, DidUpdateIndex<String>, DidReceive {
      @Override
      public String willUpdate(int index, String newValue) {
        System.out.println("ListLinkController: willUpdate at index " + index);
        return newValue;
      }

      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController: didUpdate at index " + index);
        assertEquals("New" + oldValue, newValue);
        didUpdate.countDown();
      }

      @Override
      public void didReceive(Value body) {
        System.out.println("ListLinkController: didReceive newValue " + Recon.toString(body));
        didReceive.countDown();
      }
    }

    listLink.observe(new ListLinkController()).open();
    for (int i = 0; i < total; i++) {
      listLink.add(i, Integer.toString(i));
    }
    for (int i = 0; i < total; i++) {
      listLink.set(i, "New" + i);
    }
    didUpdate.await(2, TimeUnit.SECONDS);
    didReceive.await(2, TimeUnit.SECONDS);
    assertEquals(total, listLink.size());
    assertEquals("New0", listLink.get(0));
    assertEquals("New1", listLink.get(1));
    assertEquals("New2", listLink.get(2));
  }

  @Test
  public void testMove() throws InterruptedException {
    final int total = 3;
    final CountDownLatch didUpdate = new CountDownLatch(2 * total);
    final CountDownLatch didReceive = new CountDownLatch(total);
    final CountDownLatch didMove = new CountDownLatch(1);
    final CountDownLatch didMove1 = new CountDownLatch(2);
    final CountDownLatch didReceiveMove1 = new CountDownLatch(total + 1); // 1 for move + total for inserts
    final CountDownLatch didReceiveMove2 = new CountDownLatch(total + 2); // 1 for move + total for inserts

    class ListLinkController implements DidUpdateIndex<String>, DidReceive, WillMoveIndex<String>, DidMoveIndex<String> {
      @Override
      public void willMove(int fromIndex, int toIndex, String value) {
        System.out.println("ListLinkController: willMove from index " + fromIndex + " to index " + toIndex);
      }

      @Override
      public void didMove(int fromIndex, int toIndex, String value) {
        System.out.println("ListLinkController: didMove from index " + fromIndex + " to index " + toIndex);
        didMove.countDown();
        didMove1.countDown();
      }

      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController: didUpdate at index " + index + " newValue " + newValue);
        didUpdate.countDown();
      }

      @Override
      public void didReceive(Value body) {
        System.out.println("ListLinkController: didReceive newValue " + Recon.toString(body));
        didReceive.countDown();
        didReceiveMove1.countDown();
        didReceiveMove2.countDown();
      }
    }

    listLink.observe(new ListLinkController()).open();
    for (int i = 0; i < total; i++) {
      listLink.add(i, Integer.toString(i));
    }
    didUpdate.await(2, TimeUnit.SECONDS);
    didReceive.await(2, TimeUnit.SECONDS);
    assertEquals(total, listLink.size());
    assertEquals("0", listLink.get(0));
    assertEquals("1", listLink.get(1));
    assertEquals("2", listLink.get(2));

    listLink.move(1, 0);
    didMove.await(2, TimeUnit.SECONDS);
    didReceiveMove1.await(2, TimeUnit.SECONDS);
    assertEquals("1", listLink.get(0));
    assertEquals("0", listLink.get(1));
    assertEquals("2", listLink.get(2));

    listLink.move(2, 0);
    didMove1.await(2, TimeUnit.SECONDS);
    didReceiveMove2.await(2, TimeUnit.SECONDS);
    assertEquals("2", listLink.get(0));
    assertEquals("1", listLink.get(1));
    assertEquals("0", listLink.get(2));
  }

  @Test
  public void testRemove() throws InterruptedException {
    final int total = 3;
    final CountDownLatch didUpdate = new CountDownLatch(2 * total);
    final CountDownLatch didReceive = new CountDownLatch(total);
    final CountDownLatch didRemove1 = new CountDownLatch(2); // 2 for 1st remove
    final CountDownLatch didRemove2 = new CountDownLatch(4); // 2 each for 1st 2 removes
    final CountDownLatch didRemove3 = new CountDownLatch(6); // 2 each for 1st 3 removes
    final CountDownLatch didReceiveRemove1 = new CountDownLatch(total + 1);
    final CountDownLatch didReceiveRemove2 = new CountDownLatch(total + 2);
    final CountDownLatch didReceiveRemove3 = new CountDownLatch(total + 3);

    class ListLinkController implements DidUpdateIndex<String>, DidReceive, WillRemoveIndex, DidRemoveIndex<String> {
      @Override
      public void willRemove(int index) {
        System.out.println("ListLinkController: willRemove index " + index);
      }

      @Override
      public void didRemove(int index, String value) {
        System.out.println("ListLinkController: didRemove index " + index);
        didRemove1.countDown();
        didRemove2.countDown();
        didRemove3.countDown();
      }


      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController: didUpdate at index " + index + " newValue " + newValue);
        didUpdate.countDown();
      }

      @Override
      public void didReceive(Value body) {
        System.out.println("ListLinkController: didReceive newValue " + Recon.toString(body));
        didReceive.countDown();
        didReceiveRemove1.countDown();
        didReceiveRemove2.countDown();
        didReceiveRemove3.countDown();
      }
    }

    listLink.observe(new ListLinkController()).open();
    for (int i = 0; i < total; i++) {
      listLink.add(i, Integer.toString(i));
    }
    didUpdate.await(2, TimeUnit.SECONDS);
    didReceive.await(2, TimeUnit.SECONDS);
    assertEquals(total, listLink.size());

    listLink.remove(0);
    didRemove1.await(2, TimeUnit.SECONDS);
    didReceiveRemove1.await(2, TimeUnit.SECONDS);
    assertEquals(2, listLink.size());

    listLink.remove(0);
    didRemove2.await(2, TimeUnit.SECONDS);
    didReceiveRemove2.await(2, TimeUnit.SECONDS);
    assertEquals(1, listLink.size());

    listLink.remove(0);
    didRemove3.await(2, TimeUnit.SECONDS);
    didReceiveRemove3.await(2, TimeUnit.SECONDS);
    assertEquals(0, listLink.size());
  }

  @Test
  public void testDrop() throws InterruptedException {
    final int total = 5;
    final CountDownLatch didUpdate = new CountDownLatch(2 * total);
    final CountDownLatch didReceive = new CountDownLatch(total);
    final CountDownLatch didCommand = new CountDownLatch(1);
    final CountDownLatch didDrop = new CountDownLatch(2);

    class ListLinkController implements DidUpdateIndex<String>, DidReceive, WillDrop, DidDrop, DidCommand {
      @Override
      public void willDrop(int lower) {
        System.out.println("ListLinkController: willDrop lower " + lower);
      }

      @Override
      public void didDrop(int lower) {
        System.out.println("ListLinkController: didDrop lower " + lower);
        didDrop.countDown();
      }

      @Override
      public void didCommand(Value body) {
        System.out.println("ListLinkController: didCommand body " + Recon.toString(body));
        didCommand.countDown();
      }

      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController: didUpdate at index " + index + " newValue " + newValue);
        didUpdate.countDown();
      }

      @Override
      public void didReceive(Value body) {
        System.out.println("ListLinkController: didReceive newValue " + Recon.toString(body));
        didReceive.countDown();
      }
    }

    listLink.observe(new ListLinkController()).open();
    for (int i = 0; i < total; i++) {
      listLink.add(i, Integer.toString(i));
    }
    didUpdate.await(2, TimeUnit.SECONDS);
    didReceive.await(2, TimeUnit.SECONDS);
    assertEquals(total, listLink.size());

    listLink.drop(2);
    didDrop.await(2, TimeUnit.SECONDS);
    didCommand.await(2, TimeUnit.SECONDS);
    assertEquals(3, listLink.size());
    assertEquals("2", listLink.get(0));
    assertEquals("3", listLink.get(1));
    assertEquals("4", listLink.get(2));
  }

  @Test
  public void testTake() throws InterruptedException {
    final int total = 5;
    final CountDownLatch didUpdate = new CountDownLatch(2 * total);
    final CountDownLatch didReceive = new CountDownLatch(2 * total);
    final CountDownLatch didTake = new CountDownLatch(2);
    final CountDownLatch didCommand = new CountDownLatch(1);

    class ListLinkController implements DidUpdateIndex<String>, DidReceive, WillTake, DidTake, DidCommand {
      @Override
      public void willTake(int upper) {
        System.out.println("ListLinkController: willTake upper " + upper);
      }

      @Override
      public void didTake(int upper) {
        System.out.println("ListLinkController: didTake upper " + upper);
        didTake.countDown();
      }

      @Override
      public void didCommand(Value body) {
        System.out.println("ListLinkController: didCommand " + Recon.toString(body));
        didCommand.countDown();
      }

      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController: didUpdate at index " + index + " newValue " + newValue);
        didUpdate.countDown();
      }

      @Override
      public void didReceive(Value body) {
        System.out.println("ListLinkController: didReceive newValue " + Recon.toString(body));
        didReceive.countDown();
      }
    }

    listLink.observe(new ListLinkController()).open();
    for (int i = 0; i < total; i++) {
      listLink.add(i, Integer.toString(i));
    }
    didUpdate.await(2, TimeUnit.SECONDS);
    didReceive.await(2, TimeUnit.SECONDS);
    assertEquals(total, listLink.size());

    listLink.take(2);
    didTake.await(2, TimeUnit.SECONDS);
    didCommand.await(2, TimeUnit.SECONDS);
    assertEquals(2, listLink.size());
    assertEquals("0", listLink.get(0));
    assertEquals("1", listLink.get(1));
  }

  @Test
  public void testClear() throws InterruptedException {
    final int total = 3;
    final CountDownLatch didUpdate = new CountDownLatch(2 * total);
    final CountDownLatch didReceive = new CountDownLatch(total);
    final CountDownLatch didClear = new CountDownLatch(1);

    class ListLinkController implements DidUpdateIndex<String>, DidReceive, WillClear, DidClear {
      @Override
      public void willClear() {
        System.out.println("ListLinkController: willClear");
      }

      @Override
      public void didClear() {
        System.out.println("ListLinkController: didClear");
        didClear.countDown();
      }

      @Override
      public void didUpdate(int index, String newValue, String oldValue) {
        System.out.println("ListLinkController: didUpdate at index " + index + " newValue " + newValue);
        didUpdate.countDown();
      }

      @Override
      public void didReceive(Value body) {
        System.out.println("ListLinkController: didReceive newValue " + Recon.toString(body));
        didReceive.countDown();
      }
    }

    listLink.observe(new ListLinkController()).open();
    for (int i = 0; i < total; i++) {
      listLink.add(i, Integer.toString(i));
    }
    didUpdate.await(total, TimeUnit.SECONDS);
    didReceive.await(total, TimeUnit.SECONDS);
    listLink.clear();
    didClear.await(2, TimeUnit.SECONDS);
    assertEquals(0, listLink.size());
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
