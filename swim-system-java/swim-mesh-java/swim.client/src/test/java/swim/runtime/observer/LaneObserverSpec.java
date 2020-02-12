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
package swim.runtime.observer;

import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import swim.api.downlink.MapDownlink;
import swim.api.downlink.ValueDownlink;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.api.http.function.DecodeRequestHttp;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRespondHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;
import swim.api.lane.function.DidDownlinkMap;
import swim.api.lane.function.DidDownlinkValue;
import swim.api.lane.function.WillDownlinkMap;
import swim.api.lane.function.WillDownlinkValue;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidEnter;
import swim.api.warp.function.DidLeave;
import swim.api.warp.function.DidLink;
import swim.api.warp.function.DidReceive;
import swim.api.warp.function.DidSync;
import swim.api.warp.function.DidUnlink;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.OnCommand;
import swim.api.warp.function.OnEvent;
import swim.api.warp.function.OnEventMessage;
import swim.api.warp.function.OnLinkRequest;
import swim.api.warp.function.OnLinkedResponse;
import swim.api.warp.function.OnSyncRequest;
import swim.api.warp.function.OnSyncedResponse;
import swim.api.warp.function.OnUnlinkRequest;
import swim.api.warp.function.OnUnlinkedResponse;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillEnter;
import swim.api.warp.function.WillLeave;
import swim.api.warp.function.WillLink;
import swim.api.warp.function.WillReceive;
import swim.api.warp.function.WillSync;
import swim.api.warp.function.WillUnlink;
import swim.api.warp.function.WillUplink;
import swim.codec.Decoder;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.observable.function.DidClear;
import swim.observable.function.DidDrop;
import swim.observable.function.DidMoveIndex;
import swim.observable.function.DidRemoveIndex;
import swim.observable.function.DidRemoveKey;
import swim.observable.function.DidSet;
import swim.observable.function.DidTake;
import swim.observable.function.DidUpdateIndex;
import swim.observable.function.DidUpdateKey;
import swim.observable.function.WillClear;
import swim.observable.function.WillDrop;
import swim.observable.function.WillMoveIndex;
import swim.observable.function.WillRemoveIndex;
import swim.observable.function.WillRemoveKey;
import swim.observable.function.WillSet;
import swim.observable.function.WillTake;
import swim.observable.function.WillUpdateIndex;
import swim.observable.function.WillUpdateKey;
import swim.remote.Unauthenticated;
import swim.runtime.lane.ValueLaneUplink;
import swim.structure.Text;
import swim.structure.Value;
import swim.warp.EventMessage;
import swim.warp.LinkRequest;
import swim.warp.LinkedResponse;
import swim.warp.SyncRequest;
import swim.warp.SyncedResponse;
import swim.warp.UnlinkRequest;
import swim.warp.UnlinkedResponse;
import java.util.AbstractMap;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertNotNull;
import static org.testng.Assert.assertTrue;

public class LaneObserverSpec {

  private CountDownLatch willReceiveLatch;
  private CountDownLatch willClearLatch;
  private CountDownLatch willUpdateLatch;

  @BeforeMethod
  public void init() {
    willReceiveLatch = new CountDownLatch(1);
    willClearLatch = new CountDownLatch(1);
    willUpdateLatch = new CountDownLatch(1);
  }

  class TestObserver implements WillClear, WillUpdateKey<String, String>, WillReceive {

    @Override
    public void willReceive(Value body) {
      willReceiveLatch.countDown();
      System.out.println("Will receive: " + body);
    }

    @Override
    public void willClear() {
      willClearLatch.countDown();
      System.out.println("Will clear");
    }

    @Override
    public String willUpdate(String key, String newValue) {
      willUpdateLatch.countDown();
      System.out.println("Will update: key: " + key + " value: " + newValue);
      return newValue;
    }

    public boolean isDone() {
      return willReceiveLatch.getCount() == 0 &&
          willClearLatch.getCount() == 0 &&
          willUpdateLatch.getCount() == 0;
    }

  }

  @Test
  public void testMultipleObservers() {
    final int count = 10;
    final CountDownLatch latch = new CountDownLatch(count);
    final LaneObserver laneObserver = new LaneObserver();

    for (int i = 0; i < count; i++) {
      laneObserver.observe((DidSync) latch::countDown);
    }

    laneObserver.dispatchDidSync(null, true);
    assertEquals(latch.getCount(), count);

    laneObserver.dispatchDidSync(null, false);
    assertEquals(latch.getCount(), 0);
  }

  @Test
  public void testObserve() {
    final LaneObserver laneObserver = new LaneObserver();
    TestObserver testObserver = new TestObserver();
    laneObserver.observe(testObserver);

    assertTrue(laneObserver.dispatchWillReceive(null, false, Value.fromObject("hello")));
    assertTrue(laneObserver.dispatchWillClear(null, false));

    Map.Entry<Boolean, String> result = laneObserver.dispatchWillUpdateKey(null, false, "key", "value");
    assertTrue(result.getKey());
    assertEquals(result.getValue(), "value");

    assertTrue(testObserver.isDone());
  }

  @Test
  public void testLaneDidFail() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidFail) error -> {
      assertNotNull(error);
      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchDidFail(null, false, new RuntimeException("test"));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidUpdateKey() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidUpdateKey<String, String>) (key, newValue, oldValue) -> {
      assertEquals(key, "key");
      assertEquals(newValue, "newValue");
      assertEquals(oldValue, "oldValue");

      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchDidUpdateKey(null, false, "key", "newValue", "oldValue");

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidRemoveKey() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidRemoveKey<String, String>) (key, oldValue) -> {
      assertEquals(key, "key");
      assertEquals(oldValue, "oldValue");

      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchDidRemoveKey(null, false, "key", "oldValue");

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillRemoveKey() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillRemoveKey<String>) (key) -> {
      assertEquals(key, "key");

      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchWillRemoveKey(null, false, "key");

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillReceive() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillReceive) (value) -> {
      assertNotNull(value);

      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchWillReceive(null, false, Value.fromObject("test"));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidConnect() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidConnect) countDownLatch::countDown);

    boolean success = laneObserver.dispatchDidConnect(null, false);

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidClose() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidClose) countDownLatch::countDown);

    boolean success = laneObserver.dispatchDidClose(null, false);

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidFail() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidFail) error -> {
      assertNotNull(error);
      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchDidFail(null, false, new RuntimeException("test"));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidDisconnect() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidDisconnect) countDownLatch::countDown);

    boolean success = laneObserver.dispatchDidDisconnect(null, false);

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidReceive() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidReceive) v -> {
      assertEquals(v.stringValue(), "test");
      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchDidReceive(null, false, Value.fromObject("test"));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillCommand() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillCommand) v -> {
      assertEquals(v.stringValue(), "test");
      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchWillCommand(null, false, Value.fromObject("test"));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidCommand() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidCommand) v -> {
      assertEquals(v.stringValue(), "test");
      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchDidCommand(null, false, Value.fromObject("test"));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchOnCommand() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((OnCommand<Text>) v -> {
      assertEquals(v, Value.fromObject("test"));
      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchOnCommand(null, false, Value.fromObject("test"));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillLink() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillLink) countDownLatch::countDown);

    boolean success = laneObserver.dispatchWillLink(null, false);

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchOnLinkRequest() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((OnLinkRequest) r -> {
      assertNotNull(r);
      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchOnLinkRequest(null, false, new LinkRequest("a", "b"));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchOnSyncRequest() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((OnSyncRequest) r -> {
      assertNotNull(r);
      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchOnSyncRequest(null, false, new SyncRequest("a", "b"));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchOnUnlinkRequest() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((OnUnlinkRequest) r -> {
      assertNotNull(r);
      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchOnUnlinkRequest(null, false, new UnlinkRequest("a", "b"));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidLink() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidLink) countDownLatch::countDown);

    boolean success = laneObserver.dispatchDidLink(null, false);

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillClear() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillClear) countDownLatch::countDown);

    boolean success = laneObserver.dispatchWillClear(null, false);

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidClear() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidClear) countDownLatch::countDown);

    boolean success = laneObserver.dispatchDidClear(null, false);

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidSync() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidSync) countDownLatch::countDown);

    boolean success = laneObserver.dispatchDidSync(null, false);

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillSync() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillSync) countDownLatch::countDown);

    boolean success = laneObserver.dispatchWillSync(null, false);

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillUnlink() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillUnlink) countDownLatch::countDown);

    boolean success = laneObserver.dispatchWillUnlink(null, false);

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidUnlink() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidUnlink) countDownLatch::countDown);

    boolean success = laneObserver.dispatchDidUnlink(null, false);

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchOnUnlinkedResponse() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((OnUnlinkedResponse) r -> {
      assertNotNull(r);
      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchOnUnlinkedResponse(null, false, new UnlinkedResponse("a", "b"));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchOnSyncedResponse() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((OnSyncedResponse) r -> {
      assertNotNull(r);
      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchOnSyncedResponse(null, false, new SyncedResponse("a", "b"));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchOnLinkedResponse() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((OnLinkedResponse) r -> {
      assertNotNull(r);
      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchOnLinkedResponse(null, false, new LinkedResponse("a", "b"));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchOnEventMessage() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((OnEventMessage) r -> {
      assertNotNull(r);
      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchOnEventMessage(null, false, new EventMessage("a", "b"));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchOnEvent() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((OnEvent<String>) r -> {
      assertEquals(r, "test");
      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchOnEvent(null, false, "test");

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillUpdateKey() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillUpdateKey<String, String>) (k, v) -> {
      assertEquals(k, "key");
      assertEquals(v, "value");

      countDownLatch.countDown();

      return "newValue";
    });

    Map.Entry<Boolean, String> result = laneObserver.dispatchWillUpdateKey(null, false, "key", "value");

    assertTrue(result.getKey());
    assertEquals(result.getValue(), "newValue");
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillDownlinkMap() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillDownlinkMap<Boolean>) (k, d) -> {
      assertTrue(k);
      countDownLatch.countDown();

      return d;
    });

    Map.Entry<Boolean, MapDownlink<?, ?>> result = laneObserver.dispatchWillDownlinkMap(null, true, null, false);

    assertTrue(result.getKey());
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillDownlinkValue() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillDownlinkValue<Boolean>) (k, d) -> {
      assertTrue(k);
      countDownLatch.countDown();

      return d;
    });

    Map.Entry<Boolean, ValueDownlink<?>> result = laneObserver.dispatchWillDownlinkValue(null, true, null, false);

    assertTrue(result.getKey());
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidDownlinkValue() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidDownlinkValue<Boolean>) (k, d) -> {
      assertTrue(k);
      countDownLatch.countDown();
    });

    boolean result = laneObserver.dispatchDidDownlinkValue(null, true, null, false);

    assertTrue(result);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidDownlinkMap() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidDownlinkMap<Boolean>) (k, d) -> {
      assertTrue(k);
      countDownLatch.countDown();
    });

    boolean result = laneObserver.dispatchDidDownlinkMap(null, true, null, false);

    assertTrue(result);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillDrop() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillDrop) (v) -> {
      assertEquals(v, 13);
      countDownLatch.countDown();
    });

    boolean result = laneObserver.dispatchWillDrop(null, false, 13);

    assertTrue(result);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillTake() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillTake) (v) -> {
      assertEquals(v, 13);
      countDownLatch.countDown();
    });

    boolean result = laneObserver.dispatchWillTake(null, false, 13);

    assertTrue(result);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidTake() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidTake) (v) -> {
      assertEquals(v, 13);
      countDownLatch.countDown();
    });

    boolean result = laneObserver.dispatchDidTake(null, false, 13);

    assertTrue(result);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidDrop() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidDrop) (v) -> {
      assertEquals(v, 13);
      countDownLatch.countDown();
    });

    boolean result = laneObserver.dispatchDidDrop(null, false, 13);

    assertTrue(result);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidRemoveIndex() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidRemoveIndex<String>) (i, v) -> {
      assertEquals(i, 13);
      assertEquals(v, "test");
      countDownLatch.countDown();
    });

    boolean result = laneObserver.dispatchDidRemoveIndex(null, 13, "test", false);

    assertTrue(result);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillRemoveIndex() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillRemoveIndex) (i) -> {
      assertEquals(i, 13);
      countDownLatch.countDown();
    });

    boolean result = laneObserver.dispatchWillRemoveIndex(null, 13, false);

    assertTrue(result);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidMoveIndex() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidMoveIndex<String>) (f, t, o) -> {
      assertEquals(f, 1);
      assertEquals(t, 13);
      assertEquals(o, "test");

      countDownLatch.countDown();
    });

    boolean result = laneObserver.dispatchDidMoveIndex(null, 1, 13, "test", false);

    assertTrue(result);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillMoveIndex() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillMoveIndex<String>) (f, t, o) -> {
      assertEquals(f, 1);
      assertEquals(t, 13);
      assertEquals(o, "test");

      countDownLatch.countDown();
    });

    boolean result = laneObserver.dispatchWillMoveIndex(null, 1, 13, "test", false);

    assertTrue(result);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidUpdateIndex() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidUpdateIndex<String>) (i, n, o) -> {
      assertEquals(i, 13);
      assertEquals(n, "newValue");
      assertEquals(o, "oldValue");

      countDownLatch.countDown();
    });

    boolean result = laneObserver.dispatchDidUpdateIndex(null, 13, "newValue", "oldValue", false);

    assertTrue(result);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillUpdateIndex() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillUpdateIndex<String>) (i, n) -> {
      assertEquals(i, 13);
      assertEquals(n, "newValue");

      countDownLatch.countDown();

      return "no";
    });

    AbstractMap.SimpleImmutableEntry<Boolean, String> result = laneObserver.dispatchWillUpdateIndex(null, 13, "newValue", false);

    assertTrue(result.getKey());
    assertEquals(result.getValue(), "no");
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillSet() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillSet<String>) (v) -> {
      assertEquals(v, "newValue");

      countDownLatch.countDown();

      return "no";
    });

    AbstractMap.SimpleImmutableEntry<Boolean, String> result = laneObserver.dispatchWillSet(null, "newValue", false);

    assertTrue(result.getKey());
    assertEquals(result.getValue(), "no");
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidSet() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidSet<String>) (n, o) -> {
      assertEquals(n, "newValue");
      assertEquals(o, "oldValue");

      countDownLatch.countDown();
    });

    boolean result = laneObserver.dispatchDidSet(null, "newValue", "oldValue", false);

    assertTrue(result);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillRespondHttp() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillRespondHttp<String>) (i) -> {
      assertNotNull(i);

      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchWillRespondHttp(null, HttpResponse.from(HttpStatus.ACCEPTED), false);

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidRespondHttp() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidRespondHttp<String>) (i) -> {
      assertNotNull(i);

      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchDidRespondHttp(null, HttpResponse.from(HttpStatus.ACCEPTED), false);

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillRequestHttp() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillRequestHttp<String>) (i) -> {
      assertNotNull(i);

      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchWillRequestHttp(null, HttpRequest.from(null, null, null), false);

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDoRespondHttp() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DoRespondHttp<String>) (i) -> {
      assertNotNull(i);

      countDownLatch.countDown();

      return HttpResponse.from(HttpStatus.ACCEPTED);
    });

    Object result = laneObserver.dispatchDoRespondHttp(null, HttpRequest.from(null, null, null), false);

    assertEquals(result, HttpResponse.from(HttpStatus.ACCEPTED));
    assertEquals(countDownLatch.getCount(), 0);

    result = laneObserver.dispatchDoRespondHttp(null, HttpRequest.from(null, null, null), true);
    assertFalse((Boolean) result);
  }

  @Test
  public void testDispatchDidRequestHttp() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidRequestHttp<String>) (i) -> {
      assertNotNull(i);

      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchDidRequestHttp(null, HttpRequest.from(null, null, null), false);

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDecodeRequestHttp() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DecodeRequestHttp<String>) (i) -> {
      assertNotNull(i);

      countDownLatch.countDown();

      return Decoder.done();
    });

    Decoder<Object> decoder = laneObserver.dispatchDecodeRequestHttp(null, HttpRequest.from(null, null, null));

    assertEquals(decoder, Decoder.done());
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillUplink() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillUplink) (i) -> {
      assertNotNull(i);

      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchWillUplink(null, false, new ValueLaneUplink(null, null, null));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidUplink() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidUplink) (i) -> {
      assertNotNull(i);

      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchDidUplink(null, false, new ValueLaneUplink(null, null, null));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillEnter() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillEnter) (i) -> {
      assertNotNull(i);

      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchWillEnter(null, false, new Unauthenticated(null, null, null));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidEnter() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidEnter) (i) -> {
      assertNotNull(i);

      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchDidEnter(null, false, new Unauthenticated(null, null, null));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchWillLeave() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((WillLeave) (i) -> {
      assertNotNull(i);

      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchWillLeave(null, false, new Unauthenticated(null, null, null));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

  @Test
  public void testDispatchDidLeave() {
    final LaneObserver laneObserver = new LaneObserver();
    final CountDownLatch countDownLatch = new CountDownLatch(1);

    laneObserver.observe((DidLeave) identity -> {
      assertNotNull(identity);
      countDownLatch.countDown();
    });

    boolean success = laneObserver.dispatchDidLeave(null, false, new Unauthenticated(null, null, null));

    assertTrue(success);
    assertEquals(countDownLatch.getCount(), 0);
  }

}