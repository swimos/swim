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

package swim.runtime.agent;

import swim.api.Downlink;
import swim.api.auth.Identity;
import swim.api.lane.SupplyLane;
import swim.api.policy.Policy;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.LaneAddress;
import swim.runtime.LaneBinding;
import swim.runtime.LaneContext;
import swim.runtime.LinkBinding;
import swim.runtime.Metric;
import swim.runtime.NodeBinding;
import swim.runtime.PushRequest;
import swim.runtime.reflect.LogEntry;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;

public class AgentLane implements LaneContext {
  protected final AgentNode node;
  protected final LaneBinding lane;
  protected final LaneAddress laneAddress;

  SupplyLane<LogEntry> metaTraceLog;
  SupplyLane<LogEntry> metaDebugLog;
  SupplyLane<LogEntry> metaInfoLog;
  SupplyLane<LogEntry> metaWarnLog;
  SupplyLane<LogEntry> metaErrorLog;
  SupplyLane<LogEntry> metaFailLog;

  public AgentLane(AgentNode node, LaneBinding lane, LaneAddress laneAddress) {
    this.node = node;
    this.lane = lane;
    this.laneAddress = laneAddress;
  }

  @Override
  public final NodeBinding node() {
    return this.node;
  }

  @Override
  public final LaneBinding laneWrapper() {
    return this.lane.laneWrapper();
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapLane(Class<T> laneClass) {
    if (laneClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public final LaneAddress cellAddress() {
    return this.laneAddress;
  }

  @Override
  public final String edgeName() {
    return this.laneAddress.edgeName();
  }

  @Override
  public final Uri meshUri() {
    return this.laneAddress.meshUri();
  }

  @Override
  public final Value partKey() {
    return this.laneAddress.partKey();
  }

  @Override
  public final Uri hostUri() {
    return this.laneAddress.hostUri();
  }

  @Override
  public final Uri nodeUri() {
    return this.laneAddress.nodeUri();
  }

  @Override
  public final Uri laneUri() {
    return this.laneAddress.laneUri();
  }

  @Override
  public final Identity identity() {
    return this.node.identity();
  }

  @Override
  public Policy policy() {
    return this.node.policy();
  }

  @Override
  public Schedule schedule() {
    return this.node;
  }

  @Override
  public Stage stage() {
    return this.node;
  }

  @Override
  public StoreBinding store() {
    return this.node.store();
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    openMetaLanes(lane, (AgentNode) metaLane);
    this.node.openMetaLane(lane, metaLane);
  }

  protected void openMetaLanes(LaneBinding lane, AgentNode metaLane) {
    openLogLanes(lane, metaLane);
  }

  protected void openLogLanes(LaneBinding lane, AgentNode metaLane) {
    this.metaTraceLog = metaLane.supplyLane()
        .valueForm(LogEntry.form());
    metaLane.openLane(LogEntry.TRACE_LOG_URI, this.metaTraceLog);

    this.metaDebugLog = metaLane.supplyLane()
        .valueForm(LogEntry.form());
    metaLane.openLane(LogEntry.DEBUG_LOG_URI, this.metaDebugLog);

    this.metaInfoLog = metaLane.supplyLane()
        .valueForm(LogEntry.form());
    metaLane.openLane(LogEntry.INFO_LOG_URI, this.metaInfoLog);

    this.metaWarnLog = metaLane.supplyLane()
        .valueForm(LogEntry.form());
    metaLane.openLane(LogEntry.WARN_LOG_URI, this.metaWarnLog);

    this.metaErrorLog = metaLane.supplyLane()
        .valueForm(LogEntry.form());
    metaLane.openLane(LogEntry.ERROR_LOG_URI, this.metaErrorLog);

    this.metaFailLog = metaLane.supplyLane()
        .valueForm(LogEntry.form());
    metaLane.openLane(LogEntry.FAIL_LOG_URI, this.metaFailLog);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.node.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.node.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.node.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.node.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    // nop
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.node.pushDown(pushRequest);
  }

  @Override
  public void reportDown(Metric metric) {
    this.node.reportDown(metric);
  }

  @Override
  public void trace(Object message) {
    final SupplyLane<LogEntry> metaTraceLog = this.metaTraceLog;
    if (metaTraceLog != null) {
      metaTraceLog.push(LogEntry.trace(message));
    }
    this.node.trace(message);
  }

  @Override
  public void debug(Object message) {
    final SupplyLane<LogEntry> metaDebugLog = this.metaDebugLog;
    if (metaDebugLog != null) {
      metaDebugLog.push(LogEntry.debug(message));
    }
    this.node.debug(message);
  }

  @Override
  public void info(Object message) {
    final SupplyLane<LogEntry> metaInfoLog = this.metaInfoLog;
    if (metaInfoLog != null) {
      metaInfoLog.push(LogEntry.info(message));
    }
    this.node.info(message);
  }

  @Override
  public void warn(Object message) {
    final SupplyLane<LogEntry> metaWarnLog = this.metaWarnLog;
    if (metaWarnLog != null) {
      metaWarnLog.push(LogEntry.warn(message));
    }
    this.node.warn(message);
  }

  @Override
  public void error(Object message) {
    final SupplyLane<LogEntry> metaErrorLog = this.metaErrorLog;
    if (metaErrorLog != null) {
      metaErrorLog.push(LogEntry.error(message));
    }
    this.node.error(message);
  }

  @Override
  public void fail(Object message) {
    final SupplyLane<LogEntry> metaFailLog = this.metaFailLog;
    if (metaFailLog != null) {
      metaFailLog.push(LogEntry.fail(message));
    }
    this.node.fail(message);
  }

  @Override
  public void close() {
    this.node.closeLane(this.laneAddress.laneUri());
  }

  @Override
  public void willOpen() {
    this.lane.open();
  }

  @Override
  public void didOpen() {
    // nop
  }

  @Override
  public void willLoad() {
    this.lane.load();
  }

  @Override
  public void didLoad() {
    // nop
  }

  @Override
  public void willStart() {
    this.lane.start();
  }

  @Override
  public void didStart() {
    // nop
  }

  @Override
  public void willStop() {
    this.lane.stop();
  }

  @Override
  public void didStop() {
    // nop
  }

  @Override
  public void willUnload() {
    this.lane.unload();
  }

  @Override
  public void didUnload() {
    // nop
  }

  @Override
  public void willClose() {
    this.lane.close();
  }
}
