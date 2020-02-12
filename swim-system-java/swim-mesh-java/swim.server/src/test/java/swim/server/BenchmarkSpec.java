package swim.server;

import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import swim.actor.ActorSpaceDef;
import swim.api.downlink.ListDownlink;
import swim.api.downlink.MapDownlink;
import swim.kernel.Kernel;
import swim.service.web.WebServiceDef;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import static org.testng.Assert.assertEquals;

public class BenchmarkSpec {

  @Test
  public void list_benchmarkLargeInserts() throws InterruptedException {
    System.out.println("Warming up...");
    for (int i = 0; i < 300; i++) {
      if (i % 100 == 0) {
        System.out.println("Warm up: " + i);
      }
      if (i != 0) {
        setTestPlane();
      }

      runList(10000);
      stop();
      System.gc();
    }

    System.out.println("Warmed up...");
    System.out.println("Benchmarking...");

    for (int i = 1; i < 101; i++) {
      setTestPlane();
      final long t0 = System.currentTimeMillis();
      runList(1_000_000);
      final long t1 = System.currentTimeMillis();
      stop();

      System.gc();
      final long dt = t1 - t0;
      System.out.println("Run " + i + ": " + dt);
    }
  }

  @Test
  public void map_benchmarkLargeInserts() throws InterruptedException {
    System.out.println("Warming up...");
    int count = 10000;

    for (int i = 0; i < 300; i++) {
      if (i % 100 == 0) {
        System.out.println("Warm up: " + i);
      }
      if (i != 0) {
        setTestPlane();
      }

      runJoinMap(count);
      stop();
      System.gc();
    }

    System.out.println("Warmed up...");
    System.out.println("Benchmarking...");

    for (int i = 1; i < 101; i++) {
      setTestPlane();
      final long t0 = System.currentTimeMillis();
      runJoinMap(count);
      final long t1 = System.currentTimeMillis();
      stop();

      System.gc();
      final long dt = t1 - t0;
      System.out.println("Run " + i + ": " + dt);
    }
  }

  private void runJoinMap(int insertionCount) throws InterruptedException {
    final CountDownLatch downlinksDidSync = new CountDownLatch(2);
    final CountDownLatch joinDidReceive = new CountDownLatch(insertionCount);
    final CountDownLatch joinDidUpdate = new CountDownLatch(insertionCount);

    final MapDownlink<String, String> xs = plane.downlinkMap()
        .keyClass(String.class)
        .valueClass(String.class)
        .hostUri("warp://localhost:53556/")
        .nodeUri("/map/xs")
        .laneUri("map")
        .didSync(downlinksDidSync::countDown)
        .open();
    final MapDownlink<String, String> ys = plane.downlinkMap()
        .keyClass(String.class)
        .valueClass(String.class)
        .hostUri("warp://localhost:53556/")
        .nodeUri("/map/ys")
        .laneUri("map")
        .didSync(downlinksDidSync::countDown)
        .open();

    downlinksDidSync.await(5, TimeUnit.SECONDS);

    final MapDownlink<String, String> join = plane.downlinkMap()
        .keyClass(String.class)
        .valueClass(String.class)
        .hostUri("warp://localhost:53556/")
        .nodeUri("/join/map/all")
        .laneUri("join")
        .didUpdate((key, newValue, oldValue) -> joinDidUpdate.countDown())
        .didReceive(body -> joinDidReceive.countDown())
        .open();

    for (int i = 0; i < insertionCount; i++) {
      String s = Integer.toString(i);
      join.put(s, s);
    }

    joinDidReceive.await(5, TimeUnit.SECONDS);
    joinDidUpdate.await(5, TimeUnit.SECONDS);
    assertEquals(joinDidReceive.getCount(), 0);
    assertEquals(joinDidUpdate.getCount(), 0);
  }

  private void runList(int insertionCount) throws InterruptedException {
    final CountDownLatch linkDidSync = new CountDownLatch(1);
    final CountDownLatch linkDidUpdate = new CountDownLatch(insertionCount);

    final ListDownlink<Integer> listLink = plane.downlinkList()
        .valueClass(Integer.class)
        .hostUri("warp://localhost:53556")
        .nodeUri("/list/insert")
        .laneUri("list")
        .didSync(linkDidSync::countDown)
        .didUpdate((index, newValue, oldValue) -> linkDidUpdate.countDown())
        .open();

    linkDidSync.await(5, TimeUnit.SECONDS);

    for (int i = 0; i < insertionCount; i++) {
      listLink.add(i);
    }

    linkDidUpdate.await(10, TimeUnit.SECONDS);
  }

  private Kernel kernel;
  private ListDownlinkSpec.TestListPlane plane;

  @BeforeMethod
  public void setTestPlane() {
    kernel = ServerLoader.loadServerStack();
    plane = kernel.openSpace(ActorSpaceDef.fromName("test")).openPlane("test", ListDownlinkSpec.TestListPlane.class);

    kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
    kernel.start();
  }

  @AfterMethod
  public void stop() {
    if (kernel != null && kernel.isStarted()) {
      kernel.stop();
    }
  }

}
