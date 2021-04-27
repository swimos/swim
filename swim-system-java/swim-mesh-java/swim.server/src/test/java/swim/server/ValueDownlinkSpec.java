// Copyright 2015-2020 SWIM.AI inc.
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
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import org.testng.Assert;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;
import swim.actor.ActorSpaceDef;
import swim.api.SwimLane;
import swim.api.SwimRoute;
import swim.api.agent.AbstractAgent;
import swim.api.agent.AgentRoute;
import swim.api.downlink.ValueDownlink;
import swim.api.lane.ValueLane;
import swim.api.plane.AbstractPlane;
import swim.kernel.Kernel;
import swim.service.web.WebServiceDef;
import swim.structure.Form;

public class ValueDownlinkSpec {

  private Kernel kernel = null;
  private ValueDlTestPlane plane = null;

  public static final String AGENT_NAME = "test_agent";
  public static final String VALUE_LANE_NAME = "value";
  public static final String SPACE_NAME = "test";
  public static final String PLANE_NAME = "test";
  public static final int PORT = 53556;

  public static final String HOST_URI = String.format("warp://localhost:%d", PORT);
  public static final String NODE_URI = "/" + AGENT_NAME;

  @BeforeTest
  public void startServer() {

    kernel = ServerLoader.loadServerStack();
    plane = kernel.openSpace(ActorSpaceDef.fromName(SPACE_NAME))
        .openPlane(PLANE_NAME, ValueDlTestPlane.class);
    kernel.openService(WebServiceDef.standard().port(PORT).spaceName(SPACE_NAME));
    kernel.start();
  }

  @AfterTest
  public void stopServer() {
    if(kernel != null) {
      kernel.stop();
    }
  }

  @Test
  public void singleSet() throws Exception {

    final Form<Integer> intForm = Form.forInteger();
    final AtomicInteger latest = new AtomicInteger(-1);
    final AtomicBoolean received = new AtomicBoolean(false);
    final AtomicBoolean multiple = new AtomicBoolean(false);
    final CountDownLatch latch = new CountDownLatch(1);

    final ValueDownlink<Integer> valueLink = plane.downlinkValue()
        .valueForm(Form.forInteger())
        .hostUri(HOST_URI)
        .nodeUri(NODE_URI)
        .laneUri(VALUE_LANE_NAME)
        .didReceive(v -> {
          Integer n = intForm.cast(v);
          if (n != null) {
            latest.set(n);
            if (received.getAndSet(true)) {
              multiple.set(true);
            } else {
              latch.countDown();
            }
          }
        })
        .open();

    valueLink.set(42);

    latch.await(5, TimeUnit.SECONDS);

    Assert.assertEquals(latest.get(), 42);
    Assert.assertFalse(multiple.get());
  }

  @Test
  public void multipleSet() throws Exception {

    final int count = 100000;

    final Form<Integer> intForm = Form.forInteger();

    final AtomicInteger latest = new AtomicInteger(-1);
    final CountDownLatch latch = new CountDownLatch(1);
    final AtomicInteger outOfOrder = new AtomicInteger(0);

    final ValueDownlink<Integer> valueLink = plane.downlinkValue()
        .valueForm(Form.forInteger())
        .hostUri(HOST_URI)
        .nodeUri(NODE_URI)
        .laneUri(VALUE_LANE_NAME)
        .didReceive(v -> {
          Integer num = intForm.cast(v);
          if (num != null) {
            int n = num;
            int prev = latest.getAndSet(n);
            if (n < prev) {
              outOfOrder.incrementAndGet();
            }
            if (n == count) {
              latch.countDown();
            }
          }
        })
        .open();

    for (int i = 1; i <= count; ++i) {
      valueLink.set(i);
    }

    latch.await(5, TimeUnit.SECONDS);
    Assert.assertEquals(latest.get(), count);
    final double outOfOrderFrac = (double) outOfOrder.get() / (double) count;
    System.out.println(outOfOrderFrac);
    Assert.assertTrue(outOfOrderFrac < 0.005);
  }

  static class ValueDlTestAgent extends AbstractAgent {

    @SwimLane(ValueDownlinkSpec.VALUE_LANE_NAME)
    public ValueLane<Integer> testValue = valueLane()
        .valueForm(Form.forInteger());

  }

  static class ValueDlTestPlane extends AbstractPlane {

    @SwimRoute(ValueDownlinkSpec.NODE_URI)
    public AgentRoute<ValueDlTestAgent> valueRoute;

  }

}


