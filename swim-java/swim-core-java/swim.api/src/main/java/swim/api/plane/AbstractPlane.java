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

package swim.api.plane;

import swim.api.SwimContext;
import swim.api.agent.Agent;
import swim.api.agent.AgentType;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.util.Log;

public class AbstractPlane implements Plane, Log {
  protected final PlaneContext context;

  public AbstractPlane(PlaneContext context) {
    this.context = context;
  }

  public AbstractPlane() {
    this(SwimContext.getPlaneContext());
  }

  @Override
  public PlaneContext planeContext() {
    return context;
  }

  public Schedule schedule() {
    return context.schedule();
  }

  public Stage stage() {
    return context.stage();
  }

  public <A extends Agent> AgentType<A> agentClass(Class<? extends A> agentClass) {
    return context.agentClass(agentClass);
  }

  @Override
  public void trace(Object message) {
    context.trace(message);
  }

  @Override
  public void debug(Object message) {
    context.debug(message);
  }

  @Override
  public void info(Object message) {
    context.info(message);
  }

  @Override
  public void warn(Object message) {
    context.warn(message);
  }

  @Override
  public void error(Object message) {
    context.error(message);
  }

  public void close() {
    context.close();
  }

  @Override
  public void willStart() { }

  @Override
  public void didStart() { }

  @Override
  public void willStop() { }

  @Override
  public void didStop() { }

  @Override
  public void willClose() { }

  @Override
  public void didClose() { }

  @Override
  public void didFail(Throwable error) { }
}
