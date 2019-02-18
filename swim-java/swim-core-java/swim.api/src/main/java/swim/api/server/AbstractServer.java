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

package swim.api.server;

import swim.api.SwimContext;
import swim.api.plane.Plane;
import swim.api.router.Router;
import swim.util.Log;

public abstract class AbstractServer implements Server, Log {
  protected final ServerContext context;

  public AbstractServer(ServerContext context) {
    this.context = context;
  }

  public AbstractServer() {
    this(SwimContext.getServerContext());
  }

  @Override
  public ServerContext serverContext() {
    return this.context;
  }

  //@Override
  //public Credentials getCredentials(Uri hostUri) {
  //  return null;
  //}

  @Override
  public void willAddPlane(String name, Plane plane) {
    // stub
  }

  @Override
  public void didAddPlane(String name, Plane plane) {
    // stub
  }

  @Override
  public void willRemovePlane(String name, Plane plane) {
    // stub
  }

  @Override
  public void didRemovePlane(String name, Plane plane) {
    // stub
  }

  @Override
  public void willStart() {
    // stub
  }

  @Override
  public void didStart() {
    // stub
  }

  @Override
  public void willStop() {
    // stub
  }

  @Override
  public void didStop() {
    // stub
  }

  @Override
  public void didFail(Throwable error) {
    error.printStackTrace();
  }

  public final Router router() {
    return this.context.router();
  }

  public final Plane getPlane(String name) {
    return this.context.getPlane(name);
  }

  //public void addPlane(String name, Plane plane) {
  //  this.context.addPlane(name, plane);
  //}

  //public void removePlane(String plane) {
  //  this.context.removePlane(name);
  //}

  public void start() {
    this.context.start();
  }

  public void stop() {
    this.context.stop();
  }

  public void run() {
    this.context.run();
  }

  @Override
  public void trace(Object message) {
    this.context.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.context.debug(message);
  }

  @Override
  public void info(Object message) {
    this.context.info(message);
  }

  @Override
  public void warn(Object message) {
    this.context.warn(message);
  }

  @Override
  public void error(Object message) {
    this.context.error(message);
  }
}
