// Copyright 2015-2022 Swim.inc
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

package swim.service.web;

import swim.kernel.KernelProxy;
import swim.structure.Value;
import swim.uri.UriPath;
import swim.web.WebRequest;
import swim.web.WebResponse;
import swim.web.WebRoute;
import swim.web.route.ResourceDirectoryRoute;

/**
 * SwimOS kernel module for routing HTTP requests for the bundled UI.
 */
public class UiRouter extends KernelProxy {
  final double kernelPriority;
  final WebRoute uiRoute;

  public UiRouter(double kernelPriority) {
    this.kernelPriority = kernelPriority;
    this.uiRoute = new ResourceDirectoryRoute(getClass().getClassLoader(), UriPath.parse("ui/"), "index.html");
  }

  public UiRouter() {
    this(KERNEL_PRIORITY);
  }

  @Override
  public final double kernelPriority() {
    return this.kernelPriority;
  }

  @Override
  public WebResponse routeRequest(WebRequest request) {
    final WebResponse response = this.uiRoute.routeRequest(request);
    if (response.isAccepted()) {
      return response;
    } else {
      return super.routeRequest(request);
    }
  }

  @Override
  public void trace(Object message) {
    // Use this hook to intercept and forward trace log messages
  }

  @Override
  public void debug(Object message) {
    // Use this hook to intercept and forward debug log messages
  }

  @Override
  public void info(Object message) {
    super.info(message);
    // Use this hook to intercept and forward info log messages
  }

  @Override
  public void warn(Object message) {
    super.warn(message);
    // Use this hook to intercept and forward warning log messages
  }

  @Override
  public void error(Object message) {
    super.error(message);
    // Use this hook to intercept and forward error log messages
  }

  @Override
  public void fail(Object message) {
    super.fail(message);
    // Use this hook to intercept and forward failure log messages
  }

  private static final double KERNEL_PRIORITY = 100.0;

  public static UiRouter fromValue(Value moduleConfig) {
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName == null || UiRouter.class.getName().equals(kernelClassName)) {
      final double kernelPriority = header.get("priority").doubleValue(KERNEL_PRIORITY);
      return new UiRouter(kernelPriority);
    }
    return null;
  }
}
