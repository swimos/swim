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

package swim.api.downlink;

import swim.api.Downlink;
import swim.api.ref.SwimRef;
import swim.dataflow.AbstractRecordStreamlet;
import swim.dataflow.Transmuter;
import swim.streamlet.Inout;
import swim.streamlet.Inoutlet;
import swim.streamlet.Out;
import swim.streamlet.Outlet;
import swim.streamlet.StreamletScope;
import swim.structure.Form;
import swim.structure.Value;

public class DownlinkStreamlet extends AbstractRecordStreamlet<Value, Value> {
  protected final SwimRef swim;
  protected Downlink downlink;
  protected DownlinkRecord downlinkRecord;
  protected String inputHostUri;
  protected String inputNodeUri;
  protected String inputLaneUri;
  protected float inputPrio;
  protected float inputRate;
  protected Value inputBody;
  protected String inputType;

  public DownlinkStreamlet(SwimRef swim, StreamletScope<? extends Value> scope) {
    super(scope);
    this.swim = swim;
  }

  public DownlinkStreamlet(SwimRef swim) {
    this(swim, null);
  }

  @Inout
  public final Inoutlet<Value, Value> hostUri = inoutlet();

  @Inout
  public final Inoutlet<Value, Value> nodeUri = inoutlet();

  @Inout
  public final Inoutlet<Value, Value> laneUri = inoutlet();

  @Inout
  public final Inoutlet<Value, Value> prio = inoutlet();

  @Inout
  public final Inoutlet<Value, Value> rate = inoutlet();

  @Inout
  public final Inoutlet<Value, Value> body = inoutlet();

  @Inout
  public final Inoutlet<Value, Value> type = inoutlet();

  @SuppressWarnings("checkstyle:VisibilityModifier")
  @Out
  public Outlet<Value> state;

  @SuppressWarnings("unchecked")
  @Override
  public Value getOutput(Outlet<? super Value> outlet) {
    if (outlet == this.state) {
      if (this.downlink instanceof ValueDownlink) {
        return ((ValueDownlink<Value>) this.downlink).get();
      } else if (this.downlinkRecord != null) {
        return this.downlinkRecord;
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  protected void onReconcile(int version) {
    final String hostUri = this.castInput(this.hostUri, Form.forString());
    final String nodeUri = this.castInput(this.nodeUri, Form.forString());
    final String laneUri = this.castInput(this.laneUri, Form.forString());
    final float prio = this.castInput(this.prio, Form.forFloat(), 0f);
    final float rate = this.castInput(this.rate, Form.forFloat(), 0f);
    final Value body = this.getInput(this.body);
    final String type = this.castInput(this.type, Form.forString());
    if ((hostUri == null ? this.inputHostUri != null : !hostUri.equals(this.inputHostUri))
        || (nodeUri == null ? this.inputNodeUri != null : !nodeUri.equals(this.inputNodeUri))
        || (laneUri == null ? this.inputLaneUri != null : !laneUri.equals(this.inputLaneUri))
        || prio != this.inputPrio || rate != this.inputRate
        || (body == null ? this.inputBody != null : !body.equals(this.inputBody))
        || (type == null ? this.inputType != null : !type.equals(this.inputType))) {
      if (this.downlink != null) {
        this.downlink.close();
        this.downlink = null;
        this.downlinkRecord = null;
      }
      this.inputHostUri = hostUri;
      this.inputNodeUri = nodeUri;
      this.inputLaneUri = laneUri;
      this.inputPrio = prio;
      this.inputRate = rate;
      this.inputBody = body;
      this.inputType = type;
      final SwimRef swim = this.swim;
      if ("map".equals(type)) {
        MapDownlink<Value, Value> downlink = swim.downlinkMap();
        if (hostUri != null) {
          downlink = downlink.hostUri(hostUri);
        }
        if (nodeUri != null) {
          downlink = downlink.nodeUri(nodeUri);
        }
        if (laneUri != null) {
          downlink = downlink.laneUri(laneUri);
        }
        if (prio != 0f) {
          downlink = downlink.prio(prio);
        }
        if (rate != 0f) {
          downlink = downlink.rate(rate);
        }
        if (body != null) {
          downlink = downlink.body(body);
        }
        downlink = downlink.open();
        this.state = (Outlet<Value>) (Outlet<?>) downlink;
        this.downlink = downlink;
        this.downlinkRecord = new MapDownlinkRecord(downlink);
      } else if ("value".equals(type)) {
        ValueDownlink<Value> downlink = swim.downlinkValue();
        if (hostUri != null) {
          downlink = downlink.hostUri(hostUri);
        }
        if (nodeUri != null) {
          downlink = downlink.nodeUri(nodeUri);
        }
        if (laneUri != null) {
          downlink = downlink.laneUri(laneUri);
        }
        if (prio != 0f) {
          downlink = downlink.prio(prio);
        }
        if (rate != 0f) {
          downlink = downlink.rate(rate);
        }
        if (body != null) {
          downlink = downlink.body(body);
        }
        downlink = downlink.open();
        this.state = downlink;
        this.downlink = downlink;
      }
    }
  }

  public static Transmuter transmuter(SwimRef swim) {
    return new DownlinkTransmuter(swim);
  }
}
